<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Receita;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Receita */
class ReceitaResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'waitlist_entry_id'  => $this->waitlist_entry_id,
            'patrocinador'       => $this->patrocinador,
            'cota'               => $this->cota,
            'valor_centavos'     => $this->valor_centavos,
            'status'             => $this->status,
            'pagamento_previsto' => $this->pagamento_previsto?->toDateString(),
            'recebido_em'        => $this->recebido_em?->toDateString(),
            'anexo_nome'         => $this->anexo_nome,
            'anexo_url'          => $this->anexoUrl(),
        ];
    }
}
