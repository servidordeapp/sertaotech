<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Contrato ou nota de um lançamento, no S3 (R2 em produção, RustFS em dev). Nada
 * fica no disco do servidor. O painel baixa pela rota autenticada, mas o bucket de
 * produção é público por decisão do projeto: quem tiver o caminho abre, e o que
 * protege é o nome aleatório e a api nunca devolver o caminho.
 */
trait TemAnexo
{
    private static string $discoDeAnexos = 's3';

    public function guardaAnexo(UploadedFile $arquivo): void
    {
        $caminho = $arquivo->store('orcamento', self::$discoDeAnexos);
        abort_if($caminho === false, 500, 'Não deu para guardar o anexo.');

        $anterior = $this->anexo_caminho;

        $this->update(['anexo_caminho' => $caminho, 'anexo_nome' => $arquivo->getClientOriginalName()]);

        if ($anterior !== null) {
            Storage::disk(self::$discoDeAnexos)->delete($anterior);
        }
    }

    public function apagaAnexo(): void
    {
        if ($this->anexo_caminho === null) {
            return;
        }

        Storage::disk(self::$discoDeAnexos)->delete($this->anexo_caminho);

        $this->update(['anexo_caminho' => null, 'anexo_nome' => null]);
    }

    public function baixaAnexo(): StreamedResponse
    {
        abort_if($this->anexo_caminho === null, 404);

        return Storage::disk(self::$discoDeAnexos)->download($this->anexo_caminho, $this->anexo_nome);
    }
}
