<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ParticipanteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Um ingresso aprovado em uma edição. `compareceu` é o que separa quem esteve lá de quem faltou.
 *
 * @property Carbon|null $check_in_em
 * @property-read Edicao $edicao
 */
class Participante extends Model
{
    /** @use HasFactory<ParticipanteFactory> */
    use HasFactory;

    /** Cupons de quem trabalhou no evento: contam como participantes, e o filtro os separa do público. */
    public const CUPONS_DA_EQUIPE = ['PALESTRANTE', 'ORGANIZACAO'];

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'compareceu'     => 'boolean',
            'check_in_em'    => 'datetime',
            'comprado_em'    => 'datetime',
            'anonimizado_em' => 'datetime',
        ];
    }

    /** @return BelongsTo<Edicao, $this> */
    public function edicao(): BelongsTo
    {
        return $this->belongsTo(Edicao::class);
    }
}
