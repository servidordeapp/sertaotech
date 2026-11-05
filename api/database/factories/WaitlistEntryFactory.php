<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\WaitlistEntry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WaitlistEntry>
 */
class WaitlistEntryFactory extends Factory
{
    /**
     * Participante é o padrão por ser o tipo mais comum; palestrante e
     * patrocinador têm estado próprio porque `dados` muda de forma com o tipo.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tipo'           => 'participante',
            'nome'           => fake()->name(),
            'email'          => fake()->unique()->safeEmail(),
            'whatsapp'       => (string) fake()->numerify('86#########'),
            'dados'          => ['cidade' => 'Parnaíba', 'perfil' => 'Estudante'],
            'lgpd_versao'    => WaitlistEntry::LGPD_VERSAO,
            'lgpd_aceito_em' => now(),
        ];
    }

    public function palestrante(): static
    {
        return $this->state(fn (array $attributes) => [
            'tipo'  => 'palestrante',
            'dados' => ['tema' => 'PHP moderno', 'experiencia' => 'Nunca palestrei'],
        ]);
    }

    public function patrocinador(): static
    {
        return $this->state(fn (array $attributes) => [
            'tipo'  => 'patrocinador',
            'dados' => ['empresa' => 'ACME', 'cota' => 'Ouro'],
        ]);
    }

    /** Aceitou que o nome apareça na divulgação; só existe no participante. */
    public function compartilha(): static
    {
        return $this->state(fn (array $attributes) => [
            'compartilhamento_versao'    => WaitlistEntry::COMPARTILHAMENTO_VERSAO,
            'compartilhamento_aceito_em' => now(),
        ]);
    }
}
