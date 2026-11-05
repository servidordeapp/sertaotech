<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\WaitlistEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(fn () => test()->withHeader('Origin', 'http://localhost:5173'));

test('sem sessão não há métrica', function () {
    $this->getJson('/api/painel/metricas')->assertUnauthorized();
});

test('admin vê total, reinscrições e as distribuições dos três tipos', function () {
    WaitlistEntry::factory()->create(['dados' => ['cidade' => 'Parnaíba', 'perfil' => 'Estudante']]);
    WaitlistEntry::factory()->create(['dados' => ['cidade' => 'Parnaíba', 'perfil' => 'Curioso(a)']]);
    WaitlistEntry::factory()->palestrante()->create();
    WaitlistEntry::factory()->patrocinador()->create();

    // Reenvio do formulário: mesma linha, updated_at depois do created_at.
    WaitlistEntry::query()->where('tipo', 'palestrante')->update(['updated_at' => now()->addMinute()]);

    $resposta = $this->actingAs(User::factory()->create())->getJson('/api/painel/metricas')->assertOk();

    expect($resposta->json('total'))->toBe(4)
        ->and($resposta->json('por_tipo.participante'))->toBe(2)
        ->and($resposta->json('reinscricoes'))->toBe(1);

    $titulos = collect($resposta->json('distribuicoes'))->pluck('titulo');
    expect($titulos)->toContain('Cidades', 'Perfil', 'Experiência em palco', 'Cota pretendida');

    $cidades = collect($resposta->json('distribuicoes'))->firstWhere('titulo', 'Cidades');
    expect($cidades['itens'][0])->toBe(['rotulo' => 'Parnaíba', 'total' => 2]);
});

test('o papel recorta número e distribuição, e só o admin vê volume de e-mail', function () {
    WaitlistEntry::factory()->count(2)->create();
    WaitlistEntry::factory()->patrocinador()->create();

    $resposta = $this->actingAs(User::factory()->papel('comercial')->create())
        ->getJson('/api/painel/metricas')->assertOk();

    expect($resposta->json('total'))->toBe(1)
        ->and($resposta->json('por_tipo'))->toBe(['patrocinador' => 1])
        ->and($resposta->json('emails'))->toBeNull()
        ->and(collect($resposta->json('distribuicoes'))->pluck('titulo')->all())->toBe(['Cota pretendida']);
});

test('a série diária tem 30 dias, com os vazios zerados', function () {
    $this->freezeTime();
    WaitlistEntry::factory()->create();
    // Fora da janela: não entra na série, mas continua no total.
    WaitlistEntry::factory()->create(['created_at' => now()->subDays(45)]);

    $serie = $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/metricas')->assertOk()->json('por_dia');

    expect($serie)->toHaveCount(30)
        ->and(collect($serie)->sum('participante'))->toBe(1)
        ->and($serie[0])->toHaveKeys(['dia', 'participante', 'palestrante', 'patrocinador']);
});

test('volume de e-mail traz o do dia contra o teto do plano', function () {
    DB::table('emails_enviados')->insert([
        ['para' => 'a@b.co', 'assunto' => 'Oi', 'enviado_em' => now()],
        ['para' => 'c@d.co', 'assunto' => 'Oi', 'enviado_em' => now()],
        ['para' => 'e@f.co', 'assunto' => 'Antigo', 'enviado_em' => now()->subDays(45)],
    ]);

    $emails = $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/metricas')->assertOk()->json('emails');

    expect($emails['hoje'])->toBe(2)
        ->and($emails['total'])->toBe(3)
        ->and($emails['limite_diario'])->toBe(config('mail.limite_diario'))
        ->and($emails['por_dia'])->toHaveCount(30);
});
