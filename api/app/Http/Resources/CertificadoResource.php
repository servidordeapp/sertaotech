<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Certificado;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Certificado */
class CertificadoResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'participante_id' => $this->participante_id,
            'nome'            => $this->nome,
            'email'           => $this->email,
            'tipo'            => $this->tipo,
            'titulo'          => $this->titulo,
            'carga_horaria'   => $this->carga_horaria,
            'atividades'      => $this->atividades,
            'situacao'        => $this->situacao(),
            'codigo'          => $this->codigo,
            // Cupom sem check-in pode ser de quem cancelou: é o que a revisão olha.
            'cupom'            => $this->participante?->cupom,
            'compareceu'       => $this->participante?->compareceu,
            'emitido_em'       => $this->emitido_em?->toIso8601String(),
            'revogado_em'      => $this->revogado_em?->toIso8601String(),
            'motivo_revogacao' => $this->motivo_revogacao,
        ];
    }
}
