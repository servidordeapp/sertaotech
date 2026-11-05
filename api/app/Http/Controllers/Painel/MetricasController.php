<?php

declare(strict_types=1);

namespace App\Http\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WaitlistEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Números do painel, todos recortados pelo papel de quem pede. Uma chamada só:
 * é um punhado de agregados sobre centenas de linhas, e um endpoint por card
 * custaria mais requisição do que consulta.
 */
class MetricasController extends Controller
{
    /** O evento é em Parnaíba; o banco grava em UTC, e "ontem" aqui é o de lá. */
    private const FUSO = 'America/Fortaleza';

    private const DIAS = 30;

    /**
     * Distribuições que cada tipo de inscrição oferece: a chave dentro de
     * `dados` e o rótulo do gráfico.
     *
     * @var array<string, list<array{chave: string, titulo: string, limite: int}>>
     */
    private const DISTRIBUICOES = [
        'participante' => [
            ['chave' => 'cidade', 'titulo' => 'Cidades', 'limite' => 10],
            ['chave' => 'perfil', 'titulo' => 'Perfil', 'limite' => 10],
        ],
        'palestrante' => [
            ['chave' => 'experiencia', 'titulo' => 'Experiência em palco', 'limite' => 10],
        ],
        'patrocinador' => [
            ['chave' => 'cota', 'titulo' => 'Cota pretendida', 'limite' => 10],
        ],
    ];

    public function index(Request $request): JsonResponse
    {
        /** @var User $usuario */
        $usuario = $request->user();
        $tipos   = $usuario->tiposVisiveis();

        $inscricoes = WaitlistEntry::query()->whereIn('tipo', $tipos);

        return response()->json([
            'tipos'    => $tipos,
            'total'    => (clone $inscricoes)->count(),
            'por_tipo' => (clone $inscricoes)->groupBy('tipo')->pluck(DB::raw('count(*)'), 'tipo'),
            // updated_at depois de created_at = a pessoa reenviou o formulário.
            'reinscricoes'  => (clone $inscricoes)->whereColumn('updated_at', '>', 'created_at')->count(),
            'por_dia'       => $this->porDia($tipos),
            'distribuicoes' => $this->distribuicoes($tipos),
            // Volume de e-mail é operação do evento inteiro, não de um tipo:
            // só o admin vê.
            'emails' => $usuario->ehAdmin() ? $this->emails() : null,
        ]);
    }

    /**
     * Série diária por tipo, com os dias vazios preenchidos — sem isso o
     * gráfico encosta duas semanas distantes uma na outra.
     *
     * @param  list<string>  $tipos
     * @return list<array<string, mixed>>
     */
    private function porDia(array $tipos): array
    {
        $inicio = Carbon::now(self::FUSO)->subDays(self::DIAS - 1)->startOfDay();

        $contagem = WaitlistEntry::query()
            ->whereIn('tipo', $tipos)
            ->where('created_at', '>=', $inicio->copy()->utc())
            ->get(['tipo', 'created_at'])
            // ponytail: agrupado em PHP para o dia sair no fuso de Parnaíba sem
            // depender das tabelas de fuso do MySQL. Vira SQL se passar de ~10k linhas.
            ->groupBy(fn (WaitlistEntry $linha): string => $linha->created_at?->timezone(self::FUSO)->toDateString() ?? '')
            ->map(fn (Collection $doDia): Collection => $doDia->countBy('tipo'));

        $dias = [];
        for ($dia = $inicio->copy(); $dia->lessThanOrEqualTo(Carbon::now(self::FUSO)); $dia->addDay()) {
            $data  = $dia->toDateString();
            $doDia = ['dia' => $data];

            foreach ($tipos as $tipo) {
                $doDia[$tipo] = (int) ($contagem[$data][$tipo] ?? 0);
            }

            $dias[] = $doDia;
        }

        return $dias;
    }

    /**
     * Contagem por valor de uma chave de `dados` (cidade, perfil, cota...).
     *
     * @param  list<string>  $tipos
     * @return list<array<string, mixed>>
     */
    private function distribuicoes(array $tipos): array
    {
        $saida = [];

        foreach ($tipos as $tipo) {
            $dados = WaitlistEntry::query()->where('tipo', $tipo)->pluck('dados');

            foreach (self::DISTRIBUICOES[$tipo] ?? [] as $distribuicao) {
                $itens = $dados
                    ->map(function (mixed $linha) use ($distribuicao): string {
                        $valor = is_array($linha) ? ($linha[$distribuicao['chave']] ?? '') : '';

                        return is_scalar($valor) ? trim((string) $valor) : '';
                    })
                    ->filter()
                    ->countBy()
                    ->sortDesc()
                    ->take($distribuicao['limite'])
                    ->map(fn (int $total, string $rotulo): array => ['rotulo' => $rotulo, 'total' => $total])
                    ->values()
                    ->all();

                if ($itens !== []) {
                    $saida[] = ['tipo' => $tipo, 'titulo' => $distribuicao['titulo'], 'itens' => $itens];
                }
            }
        }

        return $saida;
    }

    /** Dia (no fuso do evento) de um timestamp que veio do banco como texto. */
    private function diaLocal(mixed $quando): string
    {
        return Carbon::parse(is_scalar($quando) ? (string) $quando : 'now', 'UTC')
            ->timezone(self::FUSO)
            ->toDateString();
    }

    /**
     * Volume de e-mail: o número do dia contra o teto do plano de SMTP, e a
     * série para ver se um disparo saiu do normal.
     *
     * @return array<string, mixed>
     */
    private function emails(): array
    {
        $inicio = Carbon::now(self::FUSO)->subDays(self::DIAS - 1)->startOfDay();

        $porDia = DB::table('emails_enviados')
            ->where('enviado_em', '>=', $inicio->copy()->utc())
            ->pluck('enviado_em')
            ->countBy($this->diaLocal(...));

        $dias = [];
        for ($dia = $inicio->copy(); $dia->lessThanOrEqualTo(Carbon::now(self::FUSO)); $dia->addDay()) {
            $data   = $dia->toDateString();
            $dias[] = ['dia' => $data, 'total' => (int) ($porDia[$data] ?? 0)];
        }

        return [
            'hoje'          => (int) ($porDia[Carbon::now(self::FUSO)->toDateString()] ?? 0),
            'limite_diario' => config()->integer('mail.limite_diario'),
            'total'         => DB::table('emails_enviados')->count(),
            'por_dia'       => $dias,
        ];
    }
}
