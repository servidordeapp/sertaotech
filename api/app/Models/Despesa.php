<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\TemAnexo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $orcado_centavos
 * @property int|null $realizado_centavos
 * @property string $status
 * @property string $descricao
 * @property Carbon|null $vencimento
 * @property-read Edicao $edicao
 */
class Despesa extends Model
{
    use TemAnexo;

    public const STATUS = ['planejado', 'comprometido', 'pago'];

    public const CATEGORIAS = [
        'Espaço',
        'Alimentação',
        'Estrutura/palco',
        'Audiovisual',
        'Material gráfico',
        'Brindes',
        'Viagem e hospedagem',
        'Marketing',
        'Taxas',
    ];

    protected $table = 'orcamento_despesas';

    protected $guarded = [];

    protected $attributes = ['status' => 'planejado'];

    protected function casts(): array
    {
        return ['vencimento' => 'date'];
    }

    /** @return BelongsTo<Edicao, $this> */
    public function edicao(): BelongsTo
    {
        return $this->belongsTo(Edicao::class);
    }

    /**
     * Quanto desta despesa já é compromisso. Planejado ainda não é nada;
     * comprometido sem valor fechado conta pelo orçado, senão o estouro de
     * uma categoria só apareceria depois de alguém digitar o realizado.
     */
    public function comprometidoCentavos(): int
    {
        if ($this->status === 'planejado') {
            return 0;
        }

        return $this->realizado_centavos ?? $this->orcado_centavos;
    }

    public function pagoCentavos(): int
    {
        return $this->status === 'pago' ? $this->comprometidoCentavos() : 0;
    }

    /** Vencido não é status gravado: é compromisso em aberto com a data já passada. */
    public function estaVencida(): bool
    {
        return $this->status === 'comprometido'
            && $this->vencimento !== null
            && $this->vencimento->toDateString() < now(Edicao::FUSO)->toDateString();
    }
}
