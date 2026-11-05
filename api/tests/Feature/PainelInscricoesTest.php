<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\WaitlistEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;

uses(RefreshDatabase::class);

// O painel é um SPA em outra origem: é o cabeçalho Origin que faz o Sanctum
// tratar a requisição como sessão (statefulApi), e sem ele nem o login grava
// cookie. Mandar o mesmo que o navegador manda é o que torna o teste honesto.
beforeEach(fn () => test()->withHeader('Origin', 'http://localhost:5173'));

test('lista só os tipos do papel, mesmo pedindo outro tipo na mão', function (string $papel, string $tipoVisivel) {
    WaitlistEntry::factory()->create(['nome' => 'Participante Ana']);
    WaitlistEntry::factory()->palestrante()->create(['nome' => 'Palestrante Bia']);
    WaitlistEntry::factory()->patrocinador()->create(['nome' => 'Patrocinador Caio']);

    $resposta = $this->actingAs(User::factory()->papel($papel)->create())
        ->getJson('/api/painel/inscricoes')
        ->assertOk();

    expect(collect($resposta->json('data'))->pluck('tipo')->unique()->all())->toBe([$tipoVisivel]);

    // O filtro não é um atalho para ver o que o papel não alcança.
    $this->getJson('/api/painel/inscricoes?tipo=participante')
        ->assertOk()
        ->assertJsonCount($tipoVisivel === 'participante' ? 1 : 0, 'data');
})->with([
    'comercial vê patrocinador' => ['comercial', 'patrocinador'],
    'curadoria vê palestrante'  => ['curadoria', 'palestrante'],
]);

test('admin vê os três tipos', function () {
    WaitlistEntry::factory()->create();
    WaitlistEntry::factory()->palestrante()->create();
    WaitlistEntry::factory()->patrocinador()->create();

    $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/inscricoes')
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

test('busca casa nome, e-mail e whatsapp', function (string $termo) {
    WaitlistEntry::factory()->create(['nome' => 'Ana Lima', 'email' => 'ana@ex.com', 'whatsapp' => '86988887777']);
    WaitlistEntry::factory()->create(['nome' => 'Outro', 'email' => 'outro@ex.com', 'whatsapp' => '11999996666']);

    $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/inscricoes?busca='.urlencode($termo))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.email', 'ana@ex.com');
})->with([
    'nome'               => ['Ana'],
    'e-mail'             => ['ana@ex'],
    'whatsapp formatado' => ['(86) 98888-7777'],
]);

test('tipo fora da lista é rejeitado', function () {
    $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/inscricoes?tipo=curioso')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('tipo');
});

test('export devolve CSV com cabeçalho e só o que o papel enxerga', function () {
    WaitlistEntry::factory()->create(['nome' => 'Participante Ana']);
    WaitlistEntry::factory()->patrocinador()->create(['nome' => 'Patrocinador Caio']);

    $csv = conteudo($this->actingAs(User::factory()->papel('comercial')->create())
        ->get('/api/painel/inscricoes/export')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8'));

    expect($csv)->toStartWith("\xEF\xBB\xBF".'tipo;nome;email')
        ->and($csv)->toContain('Patrocinador Caio')
        ->and($csv)->not->toContain('Participante Ana');
});

test('export neutraliza fórmula vinda do formulário', function () {
    WaitlistEntry::factory()->create(['nome' => '=1+1']);

    $csv = conteudo($this->actingAs(User::factory()->create())->get('/api/painel/inscricoes/export'));

    expect($csv)->toContain("'=1+1")->not->toContain(';=1+1;');
});

test('por_pagina limita o retorno', function () {
    WaitlistEntry::factory()->count(3)->create();

    $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/inscricoes?por_pagina=2')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.total', 3);
});

/** O corpo de um streamDownload só existe depois de rodar o callback. */
function conteudo(TestResponse $resposta): string
{
    ob_start();
    $resposta->sendContent();

    return (string) ob_get_clean();
}
