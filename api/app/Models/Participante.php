<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ParticipanteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/** Um ingresso aprovado em uma edição. `compareceu` é o que separa quem esteve lá de quem faltou. */
class Participante extends Model
{
    /** @use HasFactory<ParticipanteFactory> */
    use HasFactory;

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
}
