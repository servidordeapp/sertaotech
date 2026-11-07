<?php

declare(strict_types=1);

namespace App\Http\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Http\Resources\DespesaResource;
use App\Models\Auditoria;
use App\Models\Despesa;
use App\Models\Edicao;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DespesasController extends Controller
{
    public function index(Edicao $edicao): AnonymousResourceCollection
    {
        return DespesaResource::collection(
            $edicao->despesas()->orderBy('vencimento')->orderBy('id')->get(),
        )->additional(['categorias' => Despesa::CATEGORIAS]);
    }

    public function store(Request $request, Edicao $edicao): JsonResponse
    {
        $this->garanteEditavel($request, $edicao);

        /** @var array<string, mixed> $dados */
        $dados = $request->validate($this->regras('required'));

        $despesa = $edicao->despesas()->create($dados);

        Auditoria::registra($request, 'orcamento.despesa.criou', '#'.$despesa->id.' '.$despesa->descricao);

        return (new DespesaResource($despesa))->response()->setStatusCode(201);
    }

    /** Planejamento inicial ou cópia da edição anterior: tudo entra, ou nada. */
    public function lote(Request $request, Edicao $edicao): JsonResponse
    {
        $this->garanteEditavel($request, $edicao);

        /** @var array{linhas: list<array{categoria: string, descricao: string, orcado_centavos: int}>} $dados */
        $dados = $request->validate([
            'linhas'                   => ['required', 'array', 'min:1', 'max:200'],
            'linhas.*.categoria'       => ['required', Rule::in(Despesa::CATEGORIAS)],
            'linhas.*.descricao'       => ['required', 'string', 'max:200'],
            'linhas.*.orcado_centavos' => ['required', 'integer', 'min:0', 'max:2000000000'],
        ]);

        DB::transaction(function () use ($dados, $edicao): void {
            foreach ($dados['linhas'] as $linha) {
                $edicao->despesas()->create($linha);
            }
        });

        Auditoria::registra($request, 'orcamento.despesa.lote', count($dados['linhas']).' em '.$edicao->ano);

        return response()->json(['criadas' => count($dados['linhas'])], 201);
    }

    /** Parcial, como em ReceitasController::update. */
    public function update(Request $request, Despesa $despesa): DespesaResource
    {
        $this->garanteEditavel($request, $despesa->edicao);

        /** @var array<string, mixed> $dados */
        $dados = $request->validate($this->regras('sometimes'));

        $despesa->update($dados);

        Auditoria::registra($request, 'orcamento.despesa.alterou', '#'.$despesa->id.' '.$despesa->descricao);

        return new DespesaResource($despesa);
    }

    public function destroy(Request $request, Despesa $despesa): JsonResponse
    {
        $this->garanteEditavel($request, $despesa->edicao);

        $despesa->apagaAnexo();
        $despesa->delete();

        Auditoria::registra($request, 'orcamento.despesa.apagou', '#'.$despesa->id.' '.$despesa->descricao);

        return response()->json(['ok' => true]);
    }

    public function anexar(Request $request, Despesa $despesa): DespesaResource
    {
        $this->garanteEditavel($request, $despesa->edicao);

        $request->validate(['arquivo' => ['required', 'file', 'mimes:pdf', 'max:20480']]);

        /** @var UploadedFile $arquivo */
        $arquivo = $request->file('arquivo');

        $despesa->guardaAnexo($arquivo);

        Auditoria::registra($request, 'orcamento.despesa.anexou', '#'.$despesa->id.' '.$despesa->descricao);

        return new DespesaResource($despesa);
    }

    public function baixarAnexo(Despesa $despesa): StreamedResponse
    {
        return $despesa->baixaAnexo();
    }

    public function removerAnexo(Request $request, Despesa $despesa): DespesaResource
    {
        $this->garanteEditavel($request, $despesa->edicao);

        $despesa->apagaAnexo();

        Auditoria::registra($request, 'orcamento.despesa.removeu-anexo', '#'.$despesa->id.' '.$despesa->descricao);

        return new DespesaResource($despesa);
    }

    /** @return array<string, list<mixed>> */
    private function regras(string $presenca): array
    {
        return [
            'categoria'          => [$presenca, Rule::in(Despesa::CATEGORIAS)],
            'descricao'          => [$presenca, 'string', 'max:200'],
            'orcado_centavos'    => [$presenca, 'integer', 'min:0', 'max:2000000000'],
            'realizado_centavos' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:2000000000'],
            'fornecedor'         => ['sometimes', 'nullable', 'string', 'max:160'],
            'responsavel'        => ['sometimes', 'nullable', 'string', 'max:120'],
            'anotacoes'          => ['sometimes', 'nullable', 'string', 'max:5000'],
            'status'             => ['sometimes', Rule::in(Despesa::STATUS)],
            'vencimento'         => ['sometimes', 'nullable', 'date_format:Y-m-d'],
        ];
    }

    private function garanteEditavel(Request $request, Edicao $edicao): void
    {
        /** @var User $usuario */
        $usuario = $request->user();

        abort_unless($edicao->editavelPor($usuario), 403, 'Esta edição está encerrada: só leitura.');
    }
}
