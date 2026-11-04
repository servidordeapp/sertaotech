<?php

declare(strict_types=1);

use App\Models\WaitlistEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function participante(array $extra = []): array
{
    return [
        'nome'   => 'Ana', 'email' => 'Ana@Ex.com', 'whatsapp' => '(86) 99999-9999',
        'cidade' => 'Parnaíba', 'perfil' => 'Estudante',
        'lgpd'   => true, 'lgpd_versao' => WaitlistEntry::LGPD_VERSAO,
        ...$extra,
    ];
}

test('participante entra na lista e o aceite da LGPD fica registrado', function () {
    $this->postJson('/api/lista-de-espera/participante', participante())->assertCreated();

    $e = WaitlistEntry::sole();
    expect($e->email)->toBe('ana@ex.com')
        ->and($e->whatsapp)->toBe('86999999999')
        ->and($e->lgpd_versao)->toBe(WaitlistEntry::LGPD_VERSAO)
        ->and($e->compartilhamento_aceito_em)->toBeNull()
        ->and($e->dados)->toBe(['cidade' => 'Parnaíba', 'perfil' => 'Estudante']);
});

test('compartilhamento desmarcado não bloqueia; marcado grava versão e data', function () {
    $this->postJson('/api/lista-de-espera/participante', participante(['compartilhamento' => false]))->assertCreated();
    $this->postJson('/api/lista-de-espera/participante', participante([
        'compartilhamento' => true, 'compartilhamento_versao' => WaitlistEntry::COMPARTILHAMENTO_VERSAO,
    ]))->assertCreated();

    expect(WaitlistEntry::count())->toBe(1)
        ->and(WaitlistEntry::sole()->compartilhamento_versao)->toBe(WaitlistEntry::COMPARTILHAMENTO_VERSAO);
});

test('sem consentimento de LGPD rejeita', function () {
    $this->postJson('/api/lista-de-espera/participante', participante(['lgpd' => false]))
        ->assertUnprocessable()->assertJsonValidationErrors('lgpd');
});

test('palestrante e patrocinador têm campos próprios', function () {
    $base = ['email' => 'a@b.co', 'whatsapp' => '86999999999', 'lgpd' => true, 'lgpd_versao' => WaitlistEntry::LGPD_VERSAO];

    $this->postJson('/api/lista-de-espera/palestrante', $base + [
        'nome' => 'Bia', 'tema' => 'PHP', 'experiencia' => 'Nunca palestrei', 'perfil_online' => 'https://github.com/bia',
    ])->assertCreated();
    $this->postJson('/api/lista-de-espera/patrocinador', $base + [
        'empresa' => 'ACME', 'contato' => 'Caio', 'cota' => 'Ouro',
    ])->assertCreated();

    expect(WaitlistEntry::where('nome', 'Caio')->count())->toBe(1);
});

test('tipo desconhecido dá 404', function () {
    $this->postJson('/api/lista-de-espera/outro', participante())->assertNotFound();
});
