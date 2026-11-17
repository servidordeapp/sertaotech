<?php

declare(strict_types=1);

use App\Models\Certificado;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('mostra o certificado emitido sem o e-mail', function () {
    $certificado = Certificado::factory()->emitido()->create([
        'nome'       => 'Ana Lima',
        'email'      => 'ana@example.com',
        'atividades' => ['minicurso-cardinal'],
    ]);

    $resposta = $this->getJson("/api/certificados/{$certificado->codigo}")
        ->assertOk()
        ->assertJsonPath('data.situacao', 'valido')
        ->assertJsonPath('data.nome', 'Ana Lima')
        ->assertJsonPath('data.edicao', ['ano' => 2026, 'numero' => '2ª', 'data' => '2026-10-09'])
        ->assertJsonPath('data.atividades', ['Cardinal — um simulador de mundos para desenvolvedores de jogos'])
        ->assertJsonPath('data.pdf_sha256', $certificado->pdf_sha256)
        ->assertJsonPath('data.pdf_url', fn (string $url): bool => str_ends_with($url, 'certificados/2026/teste.pdf'));

    expect($resposta->getContent())->not->toContain('ana@example.com')
        ->and(array_keys($resposta->json('data')))->not->toContain('email');
});

test('aceita o código digitado em minúsculas', function () {
    $certificado = Certificado::factory()->emitido()->create();

    $this->getJson('/api/certificados/'.strtolower((string) $certificado->codigo))->assertOk();
});

test('revogado responde como revogado e sem link do PDF', function () {
    $certificado = Certificado::factory()->emitido()->create();
    $certificado->update(['revogado_em' => now(), 'motivo_revogacao' => 'Nome errado']);

    $resposta = $this->getJson("/api/certificados/{$certificado->codigo}")
        ->assertOk()
        ->assertJsonPath('data.situacao', 'revogado')
        ->assertJsonPath('data.pdf_url', null)
        ->assertJsonPath('data.pdf_sha256', $certificado->pdf_sha256);

    // O motivo é anotação interna: pode citar dado da pessoa.
    expect($resposta->getContent())->not->toContain('Nome errado');
});

test('código inválido ou de rascunho responde 404', function (?string $codigo) {
    Certificado::factory()->create(['codigo' => 'ST26-AAAA-BBBB-CCCC']);

    $this->getJson('/api/certificados/'.($codigo ?? 'ST26-AAAA-BBBB-CCCC'))->assertNotFound();
})->with([
    'rascunho com código' => [null],
    'não existe'          => ['ST26-ZZZZ-ZZZZ-ZZZZ'],
    'formato estranho'    => ['nao.existe'],
]);

test('limita as consultas por minuto', function () {
    foreach (range(1, 30) as $tentativa) {
        $this->getJson('/api/certificados/ST26-ZZZZ-ZZZZ-ZZZZ')->assertNotFound();
    }

    $this->getJson('/api/certificados/ST26-ZZZZ-ZZZZ-ZZZZ')->assertTooManyRequests();
});

test('registra só o primeiro acesso pela página do e-mail', function () {
    $certificado = Certificado::factory()->emitido()->create();

    $this->travelTo(now()->subDay());
    $this->postJson("/api/certificados/{$certificado->codigo}/acesso")->assertNoContent();
    $primeiro = $certificado->fresh()->acessado_em;
    $this->travelBack();
    $this->postJson("/api/certificados/{$certificado->codigo}/acesso")->assertNoContent();

    expect($primeiro)->not->toBeNull()
        ->and($certificado->fresh()->acessado_em->equalTo($primeiro))->toBeTrue();
});

test('consultar ou validar não conta como acesso, e revogado não registra', function () {
    $certificado = Certificado::factory()->emitido()->create();
    $this->getJson("/api/certificados/{$certificado->codigo}")->assertOk();
    expect($certificado->fresh()->acessado_em)->toBeNull();

    $certificado->update(['revogado_em' => now()]);
    $this->postJson("/api/certificados/{$certificado->codigo}/acesso")->assertNoContent();
    expect($certificado->fresh()->acessado_em)->toBeNull();
});
