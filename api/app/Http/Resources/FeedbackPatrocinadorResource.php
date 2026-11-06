<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\FeedbackPatrocinador;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin FeedbackPatrocinador */
class FeedbackPatrocinadorResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'empresa'    => $this->empresa,
            'nota'       => $this->nota,
            'retorno'    => $this->retorno,
            'mais_valor' => $this->mais_valor,
            'melhorias'  => $this->melhorias,
            'interesse'  => $this->interesse,
            'depoimento' => $this->depoimento,
            'enviado_em' => $this->created_at->toIso8601String(),
        ];
    }
}
