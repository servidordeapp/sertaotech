<?php

declare(strict_types=1);

namespace App\Http\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReceitaResource;
use App\Models\Auditoria;
use App\Models\Edicao;
use App\Models\Receita;
use App\Models\User;
use App\Models\WaitlistEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReceitasController extends Controller
{
    public function index(Edicao $edicao): AnonymousResourceCollection
    {
        return ReceitaResource::collection($edicao->receitas()->orderBy('patrocinador')->get());
    }

    public function store(Request $request, Edicao $edicao): JsonResponse
    {
        $this->garanteEditavel($request, $edicao);

        /** @var array<string, mixed> $dados */
        $dados = $request->validate([
            'waitlist_entry_id' => [
                'nullable',
                'integer',
                Rule::exists('waitlist_entries', 'id')->where('tipo', 'patrocinador'),
                Rule::unique('orcamento_receitas')->where('edicao_id', $edicao->id),
            ],
            ...$this->regras('required'),
        ]);

        $receita = $edicao->receitas()->create($this->comDataDeRecebimento($dados));

        Auditoria::registra($request, 'orcamento.receita.criou', '#'.$receita->id.' '.$receita->patrocinador);

        return (new ReceitaResource($receita))->response()->setStatusCode(201);
    }

    /** Parcial de propósito: mover de etapa no funil manda só o `status`. */
    public function update(Request $request, Receita $receita): ReceitaResource
    {
        $this->garanteEditavel($request, $receita->edicao);

        /** @var array<string, mixed> $dados */
        $dados = $request->validate($this->regras('sometimes'));

        $receita->update($this->comDataDeRecebimento($dados, $receita));

        Auditoria::registra($request, 'orcamento.receita.alterou', '#'.$receita->id.' '.$receita->patrocinador);

        return new ReceitaResource($receita);
    }

    public function destroy(Request $request, Receita $receita): JsonResponse
    {
        $this->garanteEditavel($request, $receita->edicao);

        $receita->apagaAnexo();
        $receita->delete();

        Auditoria::registra($request, 'orcamento.receita.apagou', '#'.$receita->id.' '.$receita->patrocinador);

        return response()->json(['ok' => true]);
    }

    public function anexar(Request $request, Receita $receita): ReceitaResource
    {
        $this->garanteEditavel($request, $receita->edicao);

        $request->validate(['arquivo' => ['required', 'file', 'mimes:pdf', 'max:10240']]);

        /** @var UploadedFile $arquivo */
        $arquivo = $request->file('arquivo');

        $receita->guardaAnexo($arquivo);

        Auditoria::registra($request, 'orcamento.receita.anexou', '#'.$receita->id.' '.$receita->patrocinador);

        return new ReceitaResource($receita);
    }

    public function baixarAnexo(Receita $receita): StreamedResponse
    {
        return $receita->baixaAnexo();
    }

    public function removerAnexo(Request $request, Receita $receita): ReceitaResource
    {
        $this->garanteEditavel($request, $receita->edicao);

        $receita->apagaAnexo();

        Auditoria::registra($request, 'orcamento.receita.removeu-anexo', '#'.$receita->id.' '.$receita->patrocinador);

        return new ReceitaResource($receita);
    }

    /**
     * Patrocinadores do formulário do site, candidatos a entrar no funil. Só
     * empresa e cota: financeiro enxerga isto e não vê contato de inscrito.
     */
    public function listaDeEspera(Edicao $edicao): JsonResponse
    {
        // A lista de espera é a da edição em captação. Passada não tem candidato.
        if (! $edicao->ehAtual()) {
            return response()->json(['data' => []]);
        }

        $noFunil = $edicao->receitas()->whereNotNull('waitlist_entry_id')->pluck('status', 'waitlist_entry_id');

        $candidatos = WaitlistEntry::query()
            ->where('tipo', 'patrocinador')
            ->whereNull('anonimizado_em')
            ->latest()
            ->get()
            ->map(function (WaitlistEntry $inscricao) use ($noFunil): array {
                /** @var array<string, mixed> $dados */
                $dados = $inscricao->dados;

                return [
                    'id'      => $inscricao->id,
                    'empresa' => $dados['empresa'] ?? $inscricao->nome,
                    'cota'    => $dados['cota'] ?? null,
                    'etapa'   => $noFunil[$inscricao->id] ?? null,
                ];
            });

        return response()->json(['data' => $candidatos]);
    }

    /** @return array<string, list<mixed>> */
    private function regras(string $presenca): array
    {
        return [
            'patrocinador'       => [$presenca, 'string', 'max:160'],
            'cota'               => [$presenca, 'string', 'max:80'],
            'valor_centavos'     => [$presenca, 'integer', 'min:0', 'max:2000000000'],
            'status'             => ['sometimes', Rule::in(Receita::ETAPAS)],
            'pagamento_previsto' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
            'recebido_em'        => ['sometimes', 'nullable', 'date_format:Y-m-d'],
        ];
    }

    /**
     * Só o que está pago tem data de recebimento: sem ela no pago, vale hoje;
     * saindo do pago, a data vai embora para não contar no caixa por engano.
     *
     * @param  array<string, mixed>  $dados
     * @return array<string, mixed>
     */
    private function comDataDeRecebimento(array $dados, ?Receita $receita = null): array
    {
        $status = $dados['status'] ?? $receita?->status;

        if ($status !== 'pago') {
            return [...$dados, 'recebido_em' => null];
        }

        $recebidoEm = $dados['recebido_em'] ?? $receita?->recebido_em;

        return [...$dados, 'recebido_em' => $recebidoEm ?? now(Edicao::FUSO)->toDateString()];
    }

    private function garanteEditavel(Request $request, Edicao $edicao): void
    {
        /** @var User $usuario */
        $usuario = $request->user();

        abort_unless($edicao->editavelPor($usuario), 403, 'Esta edição está encerrada: só leitura.');
    }
}
