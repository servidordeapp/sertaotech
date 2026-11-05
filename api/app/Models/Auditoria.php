<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

/**
 * Uma linha por ato sobre dado pessoal (export da lista, consulta de LGPD,
 * anonimização) ou sobre dinheiro (`orcamento.*`). Não tem update nem delete de
 * propósito.
 */
class Auditoria extends Model
{
    public const UPDATED_AT = null;

    protected $guarded = [];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function registra(Request $request, string $acao, ?string $alvo = null): void
    {
        self::create([
            'user_id' => $request->user()?->getAuthIdentifier(),
            'acao'    => $acao,
            'alvo'    => $alvo,
            'ip'      => $request->ip(),
        ]);
    }
}
