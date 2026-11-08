<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** @property int $ano */
class Edicao extends Model
{
    /** O evento é em Parnaíba: "hoje" e "vencido" são os de lá, não os do UTC do banco. */
    public const FUSO = 'America/Fortaleza';

    protected $table = 'edicoes';

    protected $guarded = [];

    /** @return HasMany<Receita, $this> */
    public function receitas(): HasMany
    {
        return $this->hasMany(Receita::class);
    }

    /** @return HasMany<Certificado, $this> */
    public function certificados(): HasMany
    {
        return $this->hasMany(Certificado::class);
    }

    /** @return HasMany<Despesa, $this> */
    public function despesas(): HasMany
    {
        return $this->hasMany(Despesa::class);
    }

    /** A atual é a de maior ano; edição nova entra por migration, quando o ciclo virar. */
    public function ehAtual(): bool
    {
        return $this->ano === self::query()->max('ano');
    }

    /**
     * Edição encerrada é só leitura. O admin escapa da regra porque é quem lança
     * o histórico da edição passada, de onde saem o comparativo e a cópia.
     */
    public function editavelPor(User $usuario): bool
    {
        return $usuario->ehAdmin() || $this->ehAtual();
    }

    /**
     * A edição anterior a esta, para comparar e copiar. Edição sem nenhum
     * lançamento não conta: compará-la mostraria um ano inteiro zerado.
     */
    public function anterior(): ?self
    {
        return self::query()
            ->where('ano', '<', $this->ano)
            ->where(fn (Builder $edicao): Builder => $edicao->has('receitas')->orHas('despesas'))
            ->orderByDesc('ano')
            ->first();
    }
}
