<?php

declare(strict_types=1);

namespace App\Http\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Http\Resources\CertificadoResource;
use App\Jobs\AvisaCertificado;
use App\Jobs\EmiteCertificado;
use App\Models\Auditoria;
use App\Models\Certificado;
use App\Models\Edicao;
use App\Models\Participante;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Preparar e revisar os rascunhos de certificado de uma edição. Emitido não
 * passa por aqui: o model recusa, e este controller responde 409 antes.
 */
class CertificadosController extends Controller
{
    public function index(Request $request, Edicao $edicao): AnonymousResourceCollection
    {
        $request->validate([
            'tipo'       => ['sometimes', Rule::in(Certificado::TIPOS)],
            'situacao'   => ['sometimes', Rule::in(['rascunho', 'emitido', 'descartado', 'revogado', 'cancelado'])],
            'atividade'  => ['sometimes', 'string', 'max:60'],
            'busca'      => ['sometimes', 'string', 'max:120'],
            'por_pagina' => ['sometimes', 'integer', 'min:1', 'max:200'],
        ]);

        $daEdicao = Certificado::query()->where('edicao_id', $edicao->id);

        return CertificadoResource::collection(
            $this->filtra((clone $daEdicao), $request)
                ->with('participante')
                ->orderBy('nome')
                ->orderBy('id')
                ->paginate($request->integer('por_pagina') ?: 25)
                ->withQueryString(),
        )->additional([
            'resumo' => [
                'rascunhos'   => (clone $daEdicao)->whereNull('emitido_em')->whereNull('descartado_em')->count(),
                'emitidos'    => (clone $daEdicao)->whereNotNull('emitido_em')->whereNull('revogado_em')->whereNull('anonimizado_em')->count(),
                'descartados' => (clone $daEdicao)->whereNotNull('descartado_em')->count(),
                'revogados'   => (clone $daEdicao)->whereNotNull('revogado_em')->whereNull('anonimizado_em')->count(),
                'cancelados'  => (clone $daEdicao)->whereNotNull('anonimizado_em')->count(),
                // Por e-mail, não por certificado: um aviso leva todos os do endereço.
                'avisados'       => DB::table('avisos_certificado')->where('edicao_id', $edicao->id)->whereNotNull('enviado_em')->count(),
                'avisos_na_fila' => DB::table('avisos_certificado')->where('edicao_id', $edicao->id)->whereNull('enviado_em')->count(),
            ],
            'atividades' => $this->configDa($edicao)['atividades'],
        ]);
    }

    public function preparar(Request $request, Edicao $edicao): JsonResponse
    {
        $criados = Certificado::prepara($edicao, $this->configDa($edicao));

        Auditoria::registra($request, 'certificados.preparou', $criados.' em '.$edicao->ano);

        return response()->json(['criados' => $criados]);
    }

    /**
     * Enfileira um job por rascunho. Rodar de novo só alcança quem ficou de
     * fora, porque o job ignora o que já foi emitido.
     */
    public function emitir(Request $request, Edicao $edicao): JsonResponse
    {
        $request->validate(['confirmar' => ['accepted']]);
        $this->garanteModelo($edicao);

        $enfileirados = 0;
        $edicao->certificados()->whereNull('emitido_em')->whereNull('descartado_em')
            ->each(function (Certificado $certificado) use (&$enfileirados): void {
                EmiteCertificado::dispatch($certificado);
                $enfileirados++;
            });

        Auditoria::registra($request, 'certificados.emitiu', $enfileirados.' em '.$edicao->ano);

        return response()->json(['enfileirados' => $enfileirados]);
    }

    /**
     * Um aviso por e-mail com certificado emitido e ainda não avisado. Só quem
     * insere a linha enfileira, então disparar de novo alcança só e-mails
     * novos: é como entram os retardatários.
     */
    public function avisar(Request $request, Edicao $edicao): JsonResponse
    {
        $request->validate(['confirmar' => ['accepted']]);

        $emails = $edicao->certificados()
            ->whereNotNull('emitido_em')
            ->whereNull('revogado_em')
            ->whereNull('anonimizado_em')
            ->distinct()
            ->pluck('email');

        $enfileirados = 0;
        foreach ($emails as $email) {
            $inseriu = DB::table('avisos_certificado')->insertOrIgnore([
                'edicao_id'  => $edicao->id,
                'email'      => $email,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if ($inseriu === 1) {
                /** @var int $avisoId */
                $avisoId = DB::table('avisos_certificado')->where('edicao_id', $edicao->id)->where('email', $email)->value('id');
                AvisaCertificado::dispatch($avisoId);
                $enfileirados++;
            }
        }

        Auditoria::registra($request, 'certificados.avisou', $enfileirados.' em '.$edicao->ano);

        return response()->json(['enfileirados' => $enfileirados]);
    }

    /**
     * Erro depois de emitir (nome errado, tipo trocado): o certificado continua
     * no R2 e o validador passa a responder "revogado". O certo entra como
     * certificado novo, sem ingresso, com outro código.
     */
    public function revogar(Request $request, Certificado $certificado): CertificadoResource
    {
        abort_unless($certificado->situacao() === 'emitido', 409, 'Só certificado emitido e válido pode ser revogado.');

        /** @var array{motivo: string} $dados */
        $dados = $request->validate(['motivo' => ['required', 'string', 'max:255']]);

        $certificado->update(['revogado_em' => now(), 'motivo_revogacao' => $dados['motivo']]);

        Auditoria::registra($request, 'certificados.revogou', '#'.$certificado->id.' '.$certificado->codigo.' '.$dados['motivo']);

        return new CertificadoResource($certificado->load('participante'));
    }

    /** Na hora, sem fila: é o certificado de teste, para conferir o PDF antes da edição inteira. */
    public function emitirUm(Request $request, Edicao $edicao, Certificado $certificado): CertificadoResource
    {
        $this->garanteRascunho($certificado);
        $this->garanteModelo($edicao);

        EmiteCertificado::dispatchSync($certificado);

        $certificado->refresh();
        Auditoria::registra($request, 'certificados.emitiu', '#'.$certificado->id.' '.$certificado->nome.' '.$certificado->codigo);

        return new CertificadoResource($certificado->load('participante'));
    }

    /** O modelo com dados de exemplo, sem emitir nada, para ajustar a arte. */
    public function previa(Request $request, Edicao $edicao): Response
    {
        $request->validate([
            'tipo'   => ['sometimes', Rule::in(Certificado::TIPOS)],
            'nome'   => ['sometimes', 'string', 'max:255'],
            'titulo' => ['sometimes', 'string', 'max:255'],
        ]);

        $config = $this->configDa($edicao);
        $this->garanteModelo($edicao);

        $tipo      = $request->string('tipo')->toString() ?: 'participante';
        $comTitulo = in_array($tipo, ['palestrante', 'ministrante'], true);

        $exemplo = new Certificado([
            'nome'          => $request->string('nome')->toString() ?: 'Maria Exemplo da Silva',
            'tipo'          => $tipo,
            'titulo'        => $comTitulo ? ($request->string('titulo')->toString() ?: 'Título de exemplo da apresentação') : null,
            'carga_horaria' => $this->cargaPadrao($config, $tipo, null, []),
            'atividades'    => $tipo === 'participante' ? array_slice(array_keys($config['atividades']), 0, 1) : [],
            'codigo'        => 'ST'.substr((string) $edicao->ano, -2).'-0000-0000-0000',
        ]);
        $exemplo->setRelation('edicao', $edicao);

        return response($exemplo->renderizaPdf(), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'inline; filename="previa-'.$edicao->ano.'-'.$tipo.'.pdf"',
        ]);
    }

    /**
     * Quem faltou ao check-in e fez o minicurso (com `participante_id`), ou quem
     * não tem ingresso (só nome e e-mail). Sem carga horária, vale a padrão.
     */
    public function store(Request $request, Edicao $edicao): JsonResponse
    {
        $config = $this->configDa($edicao);

        /** @var array{participante_id?: int, nome?: string, email?: string, tipo: string, titulo?: string|null, carga_horaria?: int, atividades?: list<string>} $dados */
        $dados = $request->validate([
            'participante_id' => [
                'sometimes',
                'integer',
                Rule::exists('participantes', 'id')->where('edicao_id', $edicao->id)->whereNull('anonimizado_em'),
                Rule::unique('certificados')->where('edicao_id', $edicao->id)->where('tipo', $request->string('tipo')->toString()),
            ],
            'nome'          => ['required_without:participante_id', 'string', 'max:255'],
            'email'         => ['required_without:participante_id', 'email:rfc', 'max:254'],
            'tipo'          => ['required', Rule::in(Certificado::TIPOS)],
            'titulo'        => ['sometimes', 'nullable', 'string', 'max:255'],
            'carga_horaria' => ['required_if:tipo,ministrante', 'integer', 'min:1', 'max:200'],
            'atividades'    => $this->regrasDeAtividades($config),
            'atividades.*'  => ['string', 'distinct', Rule::in(array_keys($config['atividades']))],
        ], [
            'participante_id.unique' => 'Essa pessoa já tem certificado desse tipo nesta edição.',
        ]);

        $participante = isset($dados['participante_id']) ? Participante::query()->findOrFail($dados['participante_id']) : null;
        $atividades   = $dados['atividades'] ?? [];

        $certificado = Certificado::query()->create([
            'edicao_id'       => $edicao->id,
            'participante_id' => $participante?->id,
            'nome'            => $dados['nome'] ?? $participante?->nome,
            'email'           => $dados['email'] ?? $participante?->email,
            'tipo'            => $dados['tipo'],
            'titulo'          => $dados['titulo'] ?? null,
            'carga_horaria'   => $dados['carga_horaria'] ?? $this->cargaPadrao($config, $dados['tipo'], $participante, $atividades),
            'atividades'      => $atividades,
        ]);

        Auditoria::registra($request, 'certificados.adicionou', '#'.$certificado->id.' '.$certificado->nome);

        return (new CertificadoResource($certificado))->response()->setStatusCode(201);
    }

    /** Parcial, como em DespesasController::update. Só rascunho. */
    public function update(Request $request, Certificado $certificado): CertificadoResource
    {
        $this->garanteRascunho($certificado);

        $config = $this->configDa($certificado->edicao);

        /** @var array<string, mixed> $dados */
        $dados = $request->validate([
            'nome'  => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email:rfc', 'max:254'],
            'tipo'  => [
                'sometimes',
                Rule::in(Certificado::TIPOS),
                // Só pesa com ingresso: sem participante_id, NULL não colide na chave única.
                Rule::unique('certificados')
                    ->where('edicao_id', $certificado->edicao_id)
                    ->where('participante_id', $certificado->participante_id)
                    ->ignore($certificado->id),
            ],
            'titulo'        => ['sometimes', 'nullable', 'string', 'max:255'],
            'carga_horaria' => ['sometimes', 'integer', 'min:1', 'max:200'],
            'atividades'    => $this->regrasDeAtividades($config),
            'atividades.*'  => ['string', 'distinct', Rule::in(array_keys($config['atividades']))],
        ], [
            'tipo.unique' => 'Essa pessoa já tem certificado desse tipo nesta edição.',
        ]);

        $certificado->update($dados);

        Auditoria::registra($request, 'certificados.alterou', '#'.$certificado->id.' '.$certificado->nome);

        return new CertificadoResource($certificado->load('participante'));
    }

    /** Descarta em vez de apagar: o "Preparar" vê a linha e não recria o rascunho. */
    public function destroy(Request $request, Certificado $certificado): CertificadoResource
    {
        $this->garanteRascunho($certificado);

        $certificado->update(['descartado_em' => now()]);

        Auditoria::registra($request, 'certificados.descartou', '#'.$certificado->id.' '.$certificado->nome);

        return new CertificadoResource($certificado->load('participante'));
    }

    /**
     * @param  Builder<Certificado>  $consulta
     * @return Builder<Certificado>
     */
    private function filtra(Builder $consulta, Request $request): Builder
    {
        $tipo = $request->string('tipo')->toString();
        if ($tipo !== '') {
            $consulta->where('tipo', $tipo);
        }

        match ($request->string('situacao')->toString()) {
            'rascunho'   => $consulta->whereNull('emitido_em')->whereNull('descartado_em'),
            'emitido'    => $consulta->whereNotNull('emitido_em')->whereNull('revogado_em')->whereNull('anonimizado_em'),
            'descartado' => $consulta->whereNotNull('descartado_em'),
            'revogado'   => $consulta->whereNotNull('revogado_em')->whereNull('anonimizado_em'),
            'cancelado'  => $consulta->whereNotNull('anonimizado_em'),
            default      => null,
        };

        $atividade = $request->string('atividade')->toString();
        if ($atividade !== '') {
            $consulta->whereJsonContains('atividades', $atividade);
        }

        $busca = trim($request->string('busca')->toString());
        if ($busca !== '') {
            $consulta->where(function (Builder $filtro) use ($busca): void {
                $filtro->where('nome', 'like', '%'.$busca.'%')
                    ->orWhere('email', 'like', '%'.$busca.'%');
            });
        }

        return $consulta;
    }

    /**
     * @param  array{atividades: array<string, array{horario: string}>}  $config
     * @return list<mixed>
     */
    private function regrasDeAtividades(array $config): array
    {
        return [
            'sometimes',
            'array',
            function (string $campo, mixed $chaves, Closure $falha) use ($config): void {
                $horarios = collect(is_array($chaves) ? $chaves : [])
                    ->map(fn (mixed $chave): ?string => is_string($chave) ? ($config['atividades'][$chave]['horario'] ?? null) : null)
                    ->filter();

                if ($horarios->count() !== $horarios->unique()->count()) {
                    $falha('Essas atividades foram no mesmo horário: escolha uma.');
                }
            },
        ];
    }

    /**
     * Quem faltou ao check-in, ou nem tem ingresso, e fez atividade leva só as
     * horas dela. Quem esteve no evento leva a carga dele: as atividades ficaram
     * dentro do horário. A revisão pode mandar outra carga.
     *
     * @param  array{carga_evento: int, carga_organizacao: int, atividades: array<string, array{carga_horaria: int}>}  $config
     * @param  list<string>  $atividades
     */
    private function cargaPadrao(array $config, string $tipo, ?Participante $participante, array $atividades): int
    {
        if ($tipo === 'organizacao') {
            return $config['carga_organizacao'];
        }

        if ($tipo === 'participante' && $participante?->compareceu !== true && $atividades !== []) {
            return (int) collect($atividades)->sum(fn (string $chave): int => $config['atividades'][$chave]['carga_horaria']);
        }

        return $config['carga_evento'];
    }

    /** @return array{carga_evento: int, carga_organizacao: int, atividades: array<string, array{nome: string, carga_horaria: int, horario: string}>} */
    private function configDa(Edicao $edicao): array
    {
        $config = config('certificados.edicoes.'.$edicao->ano);
        abort_if(! is_array($config), 422, "A edição {$edicao->ano} não tem certificado configurado.");

        /** @var array{carga_evento: int, carga_organizacao: int, atividades: array<string, array{nome: string, carga_horaria: int, horario: string}>} $config */
        return $config;
    }

    private function garanteModelo(Edicao $edicao): void
    {
        abort_unless(view()->exists('certificados.'.$edicao->ano), 422, "A edição {$edicao->ano} não tem modelo de certificado.");
    }

    private function garanteRascunho(Certificado $certificado): void
    {
        abort_unless($certificado->ehRascunho(), 409, 'Só rascunho muda. Certificado emitido se revoga e se emite outro.');
    }
}
