<?php

declare(strict_types=1);

namespace App\Http\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Models\Despesa;
use App\Models\Edicao;
use App\Models\Receita;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * A visão geral da edição numa chamada só, como em MetricasController: são
 * dezenas de lançamentos, então soma em PHP sai mais legível que seis agregados
 * em SQL e não custa nada.
 */
class ResumoOrcamentoController extends Controller
{
    public function show(Edicao $edicao): JsonResponse
    {
        $receitas = $edicao->receitas()->get();
        $despesas = $edicao->despesas()->get();
        $hoje     = now(Edicao::FUSO)->startOfDay();

        return response()->json([
            ...$this->totais($receitas, $despesas),
            'categorias' => $this->porCategoria($despesas),
            'evolucao'   => $this->evolucao($receitas, $despesas, $hoje),
            'ate_hoje'   => $this->ateData($receitas, $despesas, $hoje),
            'anterior'   => $this->anterior($edicao, $hoje),
        ]);
    }

    /**
     * @param  Collection<int, Receita>  $receitas
     * @param  Collection<int, Despesa>  $despesas
     * @return array<string, int|float|null>
     */
    private function totais(Collection $receitas, Collection $despesas): array
    {
        $contratada = $receitas->whereIn('status', Receita::CONTRATADAS)->sum(fn (Receita $receita): int => $receita->valor_centavos);
        $recebida   = $receitas->where('status', 'pago')->sum(fn (Receita $receita): int => $receita->valor_centavos);
        $orcada     = $despesas->sum(fn (Despesa $despesa): int => $despesa->orcado_centavos);
        $paga       = $despesas->sum(fn (Despesa $despesa): int => $despesa->pagoCentavos());
        $saldo      = $contratada - $orcada;

        return [
            'receita_prevista'     => $receitas->sum(fn (Receita $receita): int => $receita->valor_centavos),
            'receita_contratada'   => $contratada,
            'receita_recebida'     => $recebida,
            'despesa_orcada'       => $orcada,
            'despesa_comprometida' => $despesas->sum(fn (Despesa $despesa): int => $despesa->comprometidoCentavos()),
            'despesa_paga'         => $paga,
            'saldo_projetado'      => $saldo,
            // Null e não zero: sem receita contratada não existe margem.
            'margem' => $contratada > 0 ? round($saldo / $contratada, 4) : null,
            'caixa'  => $recebida - $paga,
        ];
    }

    /**
     * @param  Collection<int, Despesa>  $despesas
     * @return list<array{categoria: string, orcado: int, comprometido: int, pago: int}>
     */
    private function porCategoria(Collection $despesas): array
    {
        $linhas = [];

        foreach (Despesa::CATEGORIAS as $categoria) {
            $itens = $despesas->where('categoria', $categoria);

            if ($itens->isEmpty()) {
                continue;
            }

            $linhas[] = [
                'categoria'    => $categoria,
                'orcado'       => $itens->sum(fn (Despesa $despesa): int => $despesa->orcado_centavos),
                'comprometido' => $itens->sum(fn (Despesa $despesa): int => $despesa->comprometidoCentavos()),
                'pago'         => $itens->sum(fn (Despesa $despesa): int => $despesa->pagoCentavos()),
            ];
        }

        return $linhas;
    }

    /**
     * Acumulado mês a mês. O realizado vai até o mês corrente; o previsto parte
     * dele e soma o que ainda falta entrar ou sair. O que está atrasado cai no
     * mês corrente, porque ainda vai acontecer. Lançamento sem data fica de fora.
     *
     * ponytail: despesa paga usa o vencimento como data de pagamento, por não
     * termos `pago_em`. Vale gravar a data real se o gráfico precisar de precisão.
     *
     * @param  Collection<int, Receita>  $receitas
     * @param  Collection<int, Despesa>  $despesas
     * @return array{meses: list<string>, indice_hoje: int, receita: list<int|null>, despesa: list<int|null>, receita_prevista: list<int|null>, despesa_prevista: list<int|null>}
     */
    private function evolucao(Collection $receitas, Collection $despesas, Carbon $hoje): array
    {
        $mesAtual = $hoje->format('Y-m');

        /** @var array<string, int> $receitaReal */
        $receitaReal = [];
        /** @var array<string, int> $receitaFutura */
        $receitaFutura = [];
        /** @var array<string, int> $despesaReal */
        $despesaReal = [];
        /** @var array<string, int> $despesaFutura */
        $despesaFutura = [];

        foreach ($receitas as $receita) {
            if ($receita->status === 'pago' && $receita->recebido_em !== null) {
                $mes               = $receita->recebido_em->format('Y-m');
                $receitaReal[$mes] = ($receitaReal[$mes] ?? 0) + $receita->valor_centavos;
            } elseif ($receita->status !== 'pago' && $receita->pagamento_previsto !== null) {
                $mes                 = max($receita->pagamento_previsto->format('Y-m'), $mesAtual);
                $receitaFutura[$mes] = ($receitaFutura[$mes] ?? 0) + $receita->valor_centavos;
            }
        }

        foreach ($despesas as $despesa) {
            if ($despesa->vencimento === null) {
                continue;
            }

            if ($despesa->status === 'pago') {
                $mes               = $despesa->vencimento->format('Y-m');
                $despesaReal[$mes] = ($despesaReal[$mes] ?? 0) + $despesa->pagoCentavos();
            } else {
                $mes                 = max($despesa->vencimento->format('Y-m'), $mesAtual);
                $despesaFutura[$mes] = ($despesaFutura[$mes] ?? 0)
                    + ($despesa->status === 'planejado' ? $despesa->orcado_centavos : $despesa->comprometidoCentavos());
            }
        }

        $chaves = [...array_keys($receitaReal), ...array_keys($receitaFutura), ...array_keys($despesaReal), ...array_keys($despesaFutura)];

        if ($chaves === []) {
            return ['meses' => [], 'indice_hoje' => 0, 'receita' => [], 'despesa' => [], 'receita_prevista' => [], 'despesa_prevista' => []];
        }

        // Edição encerrada: tudo no passado, e o gráfico não estica até hoje.
        $ultimo = max($chaves);
        $meses  = [];
        for ($mes = Carbon::createFromFormat('!Y-m', min($chaves)); $mes !== null && $mes->format('Y-m') <= $ultimo; $mes = $mes->addMonth()) {
            $meses[] = $mes->format('Y-m');
        }

        $indiceHoje = array_search($mesAtual, $meses, true);
        $indiceHoje = $indiceHoje === false ? count($meses) - 1 : $indiceHoje;

        $serie       = ['receita' => [], 'despesa' => [], 'receita_prevista' => [], 'despesa_prevista' => []];
        $somaReceita = $somaDespesa = $somaReceitaPrevista = $somaDespesaPrevista = 0;

        foreach ($meses as $indice => $mes) {
            $somaReceita += $receitaReal[$mes] ?? 0;
            $somaDespesa += $despesaReal[$mes] ?? 0;
            $somaReceitaPrevista += ($receitaReal[$mes] ?? 0) + ($receitaFutura[$mes] ?? 0);
            $somaDespesaPrevista += ($despesaReal[$mes] ?? 0) + ($despesaFutura[$mes] ?? 0);

            $serie['receita'][]          = $indice <= $indiceHoje ? $somaReceita : null;
            $serie['despesa'][]          = $indice <= $indiceHoje ? $somaDespesa : null;
            $serie['receita_prevista'][] = $indice >= $indiceHoje ? $somaReceitaPrevista : null;
            $serie['despesa_prevista'][] = $indice >= $indiceHoje ? $somaDespesaPrevista : null;
        }

        return ['meses' => $meses, 'indice_hoje' => $indiceHoje, ...$serie];
    }

    /**
     * Quanto entrou e saiu até uma data: é o "mesmo ponto do ciclo".
     *
     * @param  Collection<int, Receita>  $receitas
     * @param  Collection<int, Despesa>  $despesas
     * @return array{data: string, receita: int, despesa: int}
     */
    private function ateData(Collection $receitas, Collection $despesas, Carbon $data): array
    {
        return [
            'data'    => $data->toDateString(),
            'receita' => $receitas
                ->filter(fn (Receita $receita): bool => $receita->status === 'pago' && $receita->recebido_em !== null && $receita->recebido_em->toDateString() <= $data->toDateString())
                ->sum(fn (Receita $receita): int => $receita->valor_centavos),
            'despesa' => $despesas
                ->filter(fn (Despesa $despesa): bool => $despesa->status === 'pago' && $despesa->vencimento !== null && $despesa->vencimento->toDateString() <= $data->toDateString())
                ->sum(fn (Despesa $despesa): int => $despesa->pagoCentavos()),
        ];
    }

    /** @return array<string, mixed>|null */
    private function anterior(Edicao $edicao, Carbon $hoje): ?array
    {
        $anterior = $edicao->anterior();

        if ($anterior === null) {
            return null;
        }

        $receitas = $anterior->receitas()->get();
        $despesas = $anterior->despesas()->get();

        $referencia = [];
        foreach ($this->porCategoria($despesas) as $linha) {
            // A base da cópia é o que custou de fato; sem isso, o que foi orçado.
            $referencia[$linha['categoria']] = $linha['comprometido'] ?: $linha['orcado'];
        }

        return [
            'ano'              => $anterior->ano,
            'orcado'           => $despesas->sum(fn (Despesa $despesa): int => $despesa->orcado_centavos),
            'receita_recebida' => $receitas->where('status', 'pago')->sum(fn (Receita $receita): int => $receita->valor_centavos),
            'despesa_paga'     => $despesas->sum(fn (Despesa $despesa): int => $despesa->pagoCentavos()),
            'ate_esta_data'    => $this->ateData($receitas, $despesas, $hoje->copy()->subYears($edicao->ano - $anterior->ano)),
            'por_categoria'    => (object) $referencia,
        ];
    }
}
