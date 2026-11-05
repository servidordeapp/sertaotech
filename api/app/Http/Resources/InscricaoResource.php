<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Participante;
use App\Models\WaitlistEntry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin WaitlistEntry */
class InscricaoResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'tipo'        => $this->tipo,
            'nome'        => $this->nome,
            'email'       => $this->email,
            'whatsapp'    => $this->whatsapp,
            'dados'       => $this->dados,
            'inscrito_em' => $this->created_at?->toIso8601String(),
            // Diferente de inscrito_em = a pessoa reenviou o formulário.
            'atualizado_em' => $this->updated_at?->toIso8601String(),
            'compartilha'   => $this->compartilhamento_aceito_em !== null,
            // Só na lista de participantes, que só o admin vê: o comercial e a curadoria
            // não têm acesso a quem esteve no evento, nem por este caminho.
            'participou_em' => $this->tipo === 'participante'
                ? $this->presencas->map(fn (Participante $presenca): int => $presenca->edicao->ano)->unique()->sort()->values()
                : [],
        ];
    }
}
