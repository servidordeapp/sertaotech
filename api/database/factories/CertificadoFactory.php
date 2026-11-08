<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Certificado;
use App\Models\Edicao;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Certificado>
 */
class CertificadoFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            // A edição de 2026 vem da migration do orçamento.
            'edicao_id'     => fn (): mixed => Edicao::query()->where('ano', 2026)->value('id'),
            'nome'          => fake()->name(),
            'email'         => fake()->unique()->safeEmail(),
            'tipo'          => 'participante',
            'carga_horaria' => 8,
            'atividades'    => [],
        ];
    }

    /** O que a emissão da fase 2 grava. */
    public function emitido(): static
    {
        return $this->state(fn (): array => [
            'codigo'      => 'ST26-'.Str::upper(Str::random(4)).'-'.Str::upper(Str::random(4)).'-'.Str::upper(Str::random(4)),
            'pdf_caminho' => 'certificados/2026/teste.pdf',
            'pdf_sha256'  => hash('sha256', 'teste'),
            'emitido_em'  => now(),
        ]);
    }
}
