<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaitlistEntry extends Model
{
    /** Versões vigentes dos textos de LGPD; mudou o texto no site, muda aqui. */
    public const LGPD_VERSAO = 'lgpd-2027-v1';

    public const COMPARTILHAMENTO_VERSAO = 'compartilhamento-2027-v1';

    public const TIPOS = ['participante', 'palestrante', 'patrocinador'];

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'dados'                      => 'array',
            'lgpd_aceito_em'             => 'datetime',
            'compartilhamento_aceito_em' => 'datetime',
        ];
    }
}
