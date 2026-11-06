<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\FeedbackPatrocinadorFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Uma resposta ao formulário de feedback de quem patrocinou uma edição. As opções
 * abaixo são o contrato com a página em site/src/pages/2026/patrocinio/feedback.astro.
 *
 * @property int $nota
 * @property string $empresa
 * @property string $interesse
 * @property string $retorno
 * @property list<string> $mais_valor
 * @property string|null $melhorias
 * @property string|null $depoimento
 * @property Carbon $created_at
 */
class FeedbackPatrocinador extends Model
{
    /** @use HasFactory<FeedbackPatrocinadorFactory> */
    use HasFactory;

    /** Edição sem lista aqui não recebe feedback. */
    public const PATROCINADORES = [
        2026 => ['ParaDevs', 'Programe Studio', 'Exa', 'Retake Brasil', 'Bruno Neves Advogado', 'Cajutec', 'Cod3r'],
    ];

    public const RETORNOS = ['Sim', 'Em parte', 'Não'];

    public const MAIS_VALOR = [
        'Logo no site e nos materiais digitais',
        'Divulgação nas redes sociais',
        'Logo no banner, no palco ou nos impressos',
        'Menção no palco',
        'Brindes ou materiais entregues ao público',
        'Estande ou sorteio',
        'Sertão Tech After',
        'Outro',
    ];

    public const QUEREM_VOLTAR = ['Sim, na mesma cota', 'Sim, em uma cota maior', 'Sim, em uma cota menor'];

    public const INTERESSES = [...self::QUEREM_VOLTAR, 'Talvez, quero conversar', 'Não'];

    protected $table = 'feedbacks_patrocinadores';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['mais_valor' => 'array'];
    }
}
