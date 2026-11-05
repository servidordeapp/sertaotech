<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\WaitlistEntryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WaitlistEntry extends Model
{
    /** @use HasFactory<WaitlistEntryFactory> */
    use HasFactory;

    /** Versões vigentes dos textos de LGPD; mudou o texto no site, muda aqui. */
    public const LGPD_VERSAO = 'lgpd-2027-v1';

    public const COMPARTILHAMENTO_VERSAO = 'compartilhamento-2027-v1';

    public const TIPOS = ['participante', 'palestrante', 'patrocinador'];

    /** Como fica o que era dado pessoal depois do pedido de exclusão. */
    public const ANONIMO = 'anonimizado';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'dados'                      => 'array',
            'lgpd_aceito_em'             => 'datetime',
            'compartilhamento_aceito_em' => 'datetime',
            'anonimizado_em'             => 'datetime',
        ];
    }

    /**
     * As edições em que esta pessoa esteve de fato. O e-mail é o único elo entre a
     * lista de espera e os ingressos, e os dois são gravados em minúsculas.
     *
     * @return HasMany<Participante, $this>
     */
    public function presencas(): HasMany
    {
        return $this->hasMany(Participante::class, 'email', 'email')->where('compareceu', true);
    }
}
