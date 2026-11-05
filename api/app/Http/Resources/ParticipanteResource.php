<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Participante;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Participante */
class ParticipanteResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id'   => $this->id,
            'nome' => $this->nome,
            // O endereço de quem foi anonimizado é só um marcador interno.
            'email'         => $this->anonimizado_em === null ? $this->email : null,
            'tipo_ingresso' => $this->tipo_ingresso,
            'cupom'         => $this->cupom,
            'compareceu'    => $this->compareceu,
            'check_in_em'   => $this->check_in_em?->toIso8601String(),
        ];
    }
}
