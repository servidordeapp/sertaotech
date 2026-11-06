<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Edicao;
use App\Models\FeedbackPatrocinador;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FeedbackPatrocinador>
 */
class FeedbackPatrocinadorFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            // A edição de 2026 vem da migration do orçamento.
            'edicao_id'  => fn (): mixed => Edicao::query()->where('ano', 2026)->value('id'),
            'empresa'    => fake()->randomElement(FeedbackPatrocinador::PATROCINADORES[2026]),
            'nota'       => fake()->numberBetween(0, 10),
            'retorno'    => fake()->randomElement(FeedbackPatrocinador::RETORNOS),
            'mais_valor' => [fake()->randomElement(FeedbackPatrocinador::MAIS_VALOR)],
            'interesse'  => fake()->randomElement(FeedbackPatrocinador::INTERESSES),
        ];
    }
}
