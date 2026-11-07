<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Despesa;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Despesa */
class DespesaResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'categoria'             => $this->categoria,
            'descricao'             => $this->descricao,
            'fornecedor'            => $this->fornecedor,
            'responsavel'           => $this->responsavel,
            'anotacoes'             => $this->anotacoes,
            'orcado_centavos'       => $this->orcado_centavos,
            'realizado_centavos'    => $this->realizado_centavos,
            'comprometido_centavos' => $this->comprometidoCentavos(),
            'status'                => $this->status,
            'vencida'               => $this->estaVencida(),
            'vencimento'            => $this->vencimento?->toDateString(),
            'anexo_nome'            => $this->anexo_nome,
            'anexo_url'             => $this->anexoUrl(),
        ];
    }
}
