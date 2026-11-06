<?php

declare(strict_types=1);

use App\Models\Edicao;
use App\Models\FeedbackPatrocinador;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function respostaDeFeedback(array $extra = []): array
{
    return [
        'empresa'    => 'ParaDevs',
        'nota'       => 9,
        'retorno'    => 'Sim',
        'mais_valor' => ['Menção no palco', 'Outro'],
        'interesse'  => 'Sim, em uma cota maior',
        ...$extra,
    ];
}

test('patrocinador envia o feedback da edição, sem campos opcionais', function () {
    $this->postJson('/api/feedback-patrocinador/2026', respostaDeFeedback())->assertCreated();

    $resposta = FeedbackPatrocinador::sole();

    expect($resposta->edicao_id)->toBe(Edicao::query()->where('ano', 2026)->value('id'))
        ->and($resposta->nota)->toBe(9)
        ->and($resposta->mais_valor)->toBe(['Menção no palco', 'Outro'])
        ->and($resposta->melhorias)->toBeNull()
        ->and($resposta->depoimento)->toBeNull();
});

test('nota zero é uma resposta válida', function () {
    $this->postJson('/api/feedback-patrocinador/2026', respostaDeFeedback(['nota' => 0]))->assertCreated();

    expect(FeedbackPatrocinador::sole()->nota)->toBe(0);
});

test('resposta inválida é recusada', function (string $campo, mixed $valor) {
    $this->postJson('/api/feedback-patrocinador/2026', respostaDeFeedback([$campo => $valor]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors($campo);

    expect(FeedbackPatrocinador::count())->toBe(0);
})->with([
    'empresa de fora da lista' => ['empresa', 'ACME'],
    'nota acima de 10'         => ['nota', 11],
    'nota vazia'               => ['nota', null],
    'retorno desconhecido'     => ['retorno', 'Talvez'],
    'nenhum item de valor'     => ['mais_valor', []],
    'interesse desconhecido'   => ['interesse', 'Quem sabe'],
    'depoimento longo demais'  => ['depoimento', str_repeat('a', 2001)],
]);

test('item de valor fora da lista é recusado', function () {
    $this->postJson('/api/feedback-patrocinador/2026', respostaDeFeedback(['mais_valor' => ['Inventado']]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('mais_valor.0');
});

test('edição sem lista de patrocinadores não recebe feedback', function () {
    $this->postJson('/api/feedback-patrocinador/2027', respostaDeFeedback())->assertNotFound();
    $this->postJson('/api/feedback-patrocinador/1999', respostaDeFeedback())->assertNotFound();
});

test('novo envio da mesma empresa não apaga o anterior', function () {
    $this->postJson('/api/feedback-patrocinador/2026', respostaDeFeedback(['nota' => 10]))->assertCreated();
    $this->postJson('/api/feedback-patrocinador/2026', respostaDeFeedback(['nota' => 0]))->assertCreated();

    expect(FeedbackPatrocinador::query()->orderBy('id')->pluck('nota')->all())->toBe([10, 0]);
});

test('painel só abre para admin e comercial', function (string $papel, int $status) {
    $this->withHeader('Origin', 'http://localhost:5173')
        ->actingAs(User::factory()->papel($papel)->create())
        ->getJson('/api/painel/feedbacks/2026')
        ->assertStatus($status);
})->with([
    ['admin', 200],
    ['comercial', 200],
    ['curadoria', 403],
    ['financeiro', 403],
]);

test('sem login o painel não mostra as respostas', function () {
    $this->withHeader('Origin', 'http://localhost:5173')
        ->getJson('/api/painel/feedbacks/2026')
        ->assertUnauthorized();
});

test('painel resume as respostas da edição', function () {
    FeedbackPatrocinador::factory()->create(['empresa' => 'ParaDevs', 'nota' => 10, 'interesse' => 'Sim, na mesma cota']);
    FeedbackPatrocinador::factory()->create(['empresa' => 'ParaDevs', 'nota' => 9, 'interesse' => 'Sim, em uma cota maior']);
    FeedbackPatrocinador::factory()->create(['empresa' => 'Exa', 'nota' => 7, 'interesse' => 'Talvez, quero conversar']);
    FeedbackPatrocinador::factory()->create(['empresa' => 'Cod3r', 'nota' => 2, 'interesse' => 'Não', 'depoimento' => 'Ana, CEO']);

    $this->withHeader('Origin', 'http://localhost:5173')
        ->actingAs(User::factory()->create())
        ->getJson('/api/painel/feedbacks/2026')
        ->assertOk()
        ->assertJsonCount(4, 'data')
        ->assertJsonPath('data.0.empresa', 'Cod3r')
        ->assertJsonPath('data.0.depoimento', 'Ana, CEO')
        ->assertJsonPath('resumo', [
            'respostas'      => 4,
            'empresas'       => 3,
            'patrocinadores' => 7,
            'nota_media'     => 7,
            'nps'            => 25,
            'querem_voltar'  => 2,
        ]);
});

test('edição sem respostas não tem média nem NPS', function () {
    FeedbackPatrocinador::factory()->create();

    $this->withHeader('Origin', 'http://localhost:5173')
        ->actingAs(User::factory()->create())
        ->getJson('/api/painel/feedbacks/2027')
        ->assertOk()
        ->assertJsonCount(0, 'data')
        ->assertJsonPath('resumo.nota_media', null)
        ->assertJsonPath('resumo.nps', null)
        ->assertJsonPath('resumo.patrocinadores', 0);
});
