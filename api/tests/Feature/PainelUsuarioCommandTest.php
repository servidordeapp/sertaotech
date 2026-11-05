<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('cria o usuário do painel com papel e senha guardada em hash', function () {
    $this->artisan('painel:usuario', ['--email' => 'joana@ex.com', '--nome' => 'Joana', '--papel' => 'comercial'])
        ->expectsQuestion('Senha', 'senha-bem-comprida')
        ->assertSuccessful();

    $usuario = User::sole();
    expect($usuario->papel)->toBe('comercial')
        ->and($usuario->password)->not->toBe('senha-bem-comprida')
        ->and(Hash::check('senha-bem-comprida', $usuario->password))->toBeTrue();
});

test('rodar de novo com o mesmo e-mail troca papel e senha em vez de duplicar', function () {
    User::factory()->papel('curadoria')->create(['email' => 'joana@ex.com']);

    $this->artisan('painel:usuario', ['--email' => 'joana@ex.com', '--nome' => 'Joana', '--papel' => 'admin'])
        ->expectsQuestion('Senha', 'outra-senha-comprida')
        ->assertSuccessful();

    expect(User::count())->toBe(1)
        ->and(User::sole()->papel)->toBe('admin');
});

test('recusa senha curta e papel que não existe', function (string $papel, string $senha) {
    $this->artisan('painel:usuario', ['--email' => 'joana@ex.com', '--nome' => 'Joana', '--papel' => $papel])
        ->expectsQuestion('Senha', $senha)
        ->assertFailed();

    expect(User::count())->toBe(0);
})->with([
    'senha curta'       => ['admin', 'curta'],
    'papel inexistente' => ['faxineiro', 'senha-bem-comprida'],
]);
