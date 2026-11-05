<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\TemAnexo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Patrocínio de uma edição, do primeiro contato ao dinheiro na conta.
 *
 * @property int $valor_centavos
 * @property string $status
 * @property string $patrocinador
 * @property Carbon|null $pagamento_previsto
 * @property Carbon|null $recebido_em
 * @property-read Edicao $edicao
 */
class Receita extends Model
{
    use TemAnexo;

    /** Etapas do funil, na ordem. */
    public const ETAPAS = ['prospeccao', 'proposta', 'negociacao', 'fechado', 'assinado', 'pago'];

    /** A partir daqui a receita conta como contratada. */
    public const CONTRATADAS = ['fechado', 'assinado', 'pago'];

    protected $table = 'orcamento_receitas';

    protected $guarded = [];

    protected $attributes = ['status' => 'prospeccao'];

    protected function casts(): array
    {
        return [
            'pagamento_previsto' => 'date',
            'recebido_em'        => 'date',
        ];
    }

    /** @return BelongsTo<Edicao, $this> */
    public function edicao(): BelongsTo
    {
        return $this->belongsTo(Edicao::class);
    }
}
