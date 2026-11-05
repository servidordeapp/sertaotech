<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// O painel é um SPA em outra origem: é o cabeçalho Origin que faz o Sanctum
// tratar a requisição como sessão (statefulApi), e sem ele nem o login grava
// cookie. Mandar o mesmo que o navegador manda é o que torna o teste honesto.
beforeEach(fn () => test()->withHeader('Origin', 'http://localhost:5173'));

test('login devolve o papel e os tipos que o usuário enxerga', function () {
    User::factory()->papel('comercial')->create(['email' => 'joana@ex.com']);

    $this->postJson('/api/painel/login', ['email' => 'joana@ex.com', 'password' => 'password'])
        ->assertOk()
        ->assertJson(['papel' => 'comercial', 'tipos_visiveis' => ['patrocinador']]);
});

test('senha errada não entra e não diz se o e-mail existe', function () {
    User::factory()->create(['email' => 'joana@ex.com']);

    $this->postJson('/api/painel/login', ['email' => 'joana@ex.com', 'password' => 'errada'])
        ->assertUnprocessable()->assertJsonValidationErrors('email');

    $this->postJson('/api/painel/login', ['email' => 'ninguem@ex.com', 'password' => 'errada'])
        ->assertUnprocessable()->assertJsonValidationErrors('email');
});

test('sem sessão as rotas do painel respondem 401', function () {
    $this->getJson('/api/painel/me')->assertUnauthorized();
    $this->getJson('/api/painel/inscricoes')->assertUnauthorized();
    $this->getJson('/api/painel/inscricoes/export')->assertUnauthorized();
    $this->postJson('/api/painel/logout')->assertUnauthorized();

    // Navegador pedindo html (o link de export): 401, não redirect para uma
    // rota `login` que não existe neste backend — isso virava 500.
    $this->get('/api/painel/inscricoes/export')->assertUnauthorized();
});

test('papel desconhecido não enxerga inscrição nenhuma', function () {
    $usuario = User::factory()->papel('')->create();

    expect($usuario->tiposVisiveis())->toBe([]);
});

// O efeito do logout é tudo framework (logout + invalidate + regenerateToken) e
// SESSION_DRIVER=array não guarda sessão entre requisições do teste, então o que
// vale checar aqui é o contrato da rota: ela existe, exige sessão (teste acima)
// e responde ok.
test('logout responde ok para quem está logado', function () {
    $this->actingAs(User::factory()->create())
        ->postJson('/api/painel/logout')
        ->assertOk()
        ->assertJson(['ok' => true]);
});
