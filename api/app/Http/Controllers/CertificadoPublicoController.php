<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Certificado;
use Illuminate\Http\JsonResponse;

/**
 * O que o site mostra em /certificado e /certificado/validar. Sem login: quem
 * tem o código tem o certificado, como no PDF impresso. Nunca sai o e-mail.
 * Rascunho não existe para fora, mesmo que já tenha código.
 */
class CertificadoPublicoController extends Controller
{
    public function show(string $codigo): JsonResponse
    {
        $certificado = Certificado::query()
            ->with('edicao')
            ->where('codigo', strtoupper(trim($codigo)))
            ->whereNotNull('emitido_em')
            ->firstOr(fn () => abort(404, 'Certificado não encontrado.'));

        // Cancelado pela LGPD: nem nome nem data do pedido. O hash fica, e a
        // conferência do arquivo continua provando que o PDF é original.
        if ($certificado->anonimizado_em !== null) {
            return response()->json(['data' => [
                'codigo'     => $certificado->codigo,
                'situacao'   => 'cancelado',
                'pdf_sha256' => $certificado->pdf_sha256,
            ]]);
        }

        $ano = $certificado->edicao->ano;
        /** @var array{edicao: string, data: string, atividades: array<string, array{nome: string}>} $edicao */
        $edicao   = config('certificados.edicoes.'.$ano);
        $revogado = $certificado->revogado_em !== null;

        return response()->json(['data' => [
            'codigo'        => $certificado->codigo,
            'situacao'      => $revogado ? 'revogado' : 'valido',
            'nome'          => $certificado->nome,
            'tipo'          => $certificado->tipo,
            'titulo'        => $certificado->titulo,
            'carga_horaria' => $certificado->carga_horaria,
            'atividades'    => array_map(fn (string $chave): string => $edicao['atividades'][$chave]['nome'], $certificado->atividades),
            'edicao'        => ['ano' => $ano, 'numero' => $edicao['edicao'], 'data' => $edicao['data']],
            'emitido_em'    => $certificado->emitido_em?->toIso8601String(),
            'revogado_em'   => $certificado->revogado_em?->toIso8601String(),
            // Revogado não se baixa como se valesse. O hash fica: o arquivo
            // antigo ainda pode ser conferido como "original, mas revogado".
            'pdf_url'    => $revogado ? null : $certificado->pdfUrl(),
            'pdf_sha256' => $certificado->pdf_sha256,
        ]]);
    }
}
