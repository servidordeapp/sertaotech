<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Certificado;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Transforma um rascunho em documento: código, PDF gerado uma vez, gravado no
 * R2 em certificados/{ano}/{codigo}.pdf, SHA-256 no banco e a trava do model.
 *
 * O código é gravado antes do PDF. Se o processo morrer depois de subir o
 * arquivo, a retentativa encontra o PDF no mesmo caminho e para com erro em vez
 * de sobrescrever: alguém confere o arquivo e decide.
 */
class EmiteCertificado implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public function __construct(public Certificado $certificado)
    {
    }

    /** Dois cliques em "Emitir" não enfileiram o mesmo certificado duas vezes. */
    public function uniqueId(): string
    {
        return (string) $this->certificado->id;
    }

    public function handle(): void
    {
        $certificado = DB::transaction(function (): ?Certificado {
            $certificado = Certificado::query()->lockForUpdate()->find($this->certificado->id);

            if ($certificado === null || ! $certificado->ehRascunho()) {
                return null;
            }

            if ($certificado->codigo === null) {
                $certificado->update(['codigo' => Certificado::novoCodigo($certificado->edicao->ano)]);
            }

            return $certificado;
        });

        if ($certificado === null) {
            return;
        }

        $disco   = Storage::disk('s3');
        $caminho = $certificado->caminhoDoPdf();

        if ($disco->exists($caminho)) {
            throw new RuntimeException("O PDF {$caminho} já existe. A emissão parou para não sobrescrever o certificado #{$certificado->id}.");
        }

        $pdf = $certificado->renderizaPdf();

        if (! $disco->put($caminho, $pdf)) {
            throw new RuntimeException("Não deu para gravar {$caminho}.");
        }

        $certificado->update([
            'pdf_caminho' => $caminho,
            'pdf_sha256'  => hash('sha256', $pdf),
            'emitido_em'  => now(),
        ]);
    }
}
