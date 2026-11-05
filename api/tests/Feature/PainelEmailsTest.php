<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(function () {
    test()->withHeader('Origin', 'http://localhost:5173');

    DB::table('emails_enviados')->insert([
        ['para' => 'ana@ex.com', 'assunto' => 'Inscrição recebida', 'enviado_em' => now()->subDay()],
        ['para' => 'bia@ex.com', 'assunto' => 'Nova inscrição', 'enviado_em' => now()],
    ]);
});

test('lista do mais novo para o mais velho', function () {
    $resposta = $this->actingAs(User::factory()->create())->getJson('/api/painel/emails')->assertOk();

    expect($resposta->json('data.0.para'))->toBe('bia@ex.com')
        ->and($resposta->json('total'))->toBe(2);
});

test('busca casa destinatário e assunto', function (string $termo) {
    $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/emails?busca='.urlencode($termo))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.para', 'ana@ex.com');
})->with([
    'destinatário' => ['ana@'],
    'assunto'      => ['recebida'],
]);
