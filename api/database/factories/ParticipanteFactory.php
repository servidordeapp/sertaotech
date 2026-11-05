<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Edicao;
use App\Models\Participante;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Participante>
 */
class ParticipanteFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            // A edição de 2026 vem da migration do orçamento.
            'edicao_id'      => fn (): mixed => Edicao::query()->where('ano', 2026)->value('id'),
            'ingresso'       => fake()->unique()->bothify('????-##-####'),
            'pedido'         => fake()->bothify('##??##???#'),
            'nome'           => fake()->name(),
            'email'          => fake()->unique()->safeEmail(),
            'tipo_ingresso'  => 'Ingresso Individual',
            'valor_centavos' => 2000,
            'compareceu'     => true,
            'check_in_em'    => '2026-10-09 18:00:00',
            'comprado_em'    => '2026-09-01 12:00:00',
        ];
    }
}
