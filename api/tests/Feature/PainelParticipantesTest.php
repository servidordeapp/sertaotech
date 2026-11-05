<?php

declare(strict_types=1);

use App\Models\Edicao;
use App\Models\Participante;
use App\Models\User;
use App\Models\WaitlistEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(fn () => test()->withHeader('Origin', 'http://localhost:5173'));

function edicaoDe(int $ano): int
{
    return Edicao::query()->where('ano', $ano)->sole()->id;
}

test('só o admin vê os participantes', function (string $papel) {
    Participante::factory()->create();

    $this->actingAs(User::factory()->papel($papel)->create())
        ->getJson('/api/painel/participantes/2026')
        ->assertForbidden();
})->with(['comercial', 'curadoria', 'financeiro']);

test('sem login não entra', function () {
    $this->getJson('/api/painel/participantes/2026')->assertUnauthorized();
});

test('edição que não existe responde 404', function () {
    $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/participantes/1999')
        ->assertNotFound();
});

test('lista só a edição pedida, em ordem de nome', function () {
    Participante::factory()->create(['nome' => 'Bia']);
    Participante::factory()->create(['nome' => 'Ana']);
    Participante::factory()->create(['nome' => 'Caio', 'edicao_id' => edicaoDe(2025)]);

    $resposta = $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/participantes/2026')
        ->assertOk();

    expect(collect($resposta->json('data'))->pluck('nome')->all())->toBe(['Ana', 'Bia']);
});

test('filtra quem compareceu e quem faltou', function (string $presenca, string $nome) {
    Participante::factory()->create(['nome' => 'Presente']);
    Participante::factory()->create(['nome' => 'Faltou', 'compareceu' => false, 'check_in_em' => null]);

    $this->actingAs(User::factory()->create())
        ->getJson("/api/painel/participantes/2026?presenca={$presenca}")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.nome', $nome);
})->with([
    ['compareceu', 'Presente'],
    ['faltou', 'Faltou'],
]);

test('filtra por cupom e separa o público de palestrantes e organização', function (string $cupom, array $nomes) {
    Participante::factory()->create(['nome' => 'A Sem cupom']);
    Participante::factory()->create(['nome' => 'B Caravana', 'cupom' => 'UFDPAR']);
    Participante::factory()->create(['nome' => 'C Palestrante', 'cupom' => 'PALESTRANTE']);
    Participante::factory()->create(['nome' => 'D Organização', 'cupom' => 'ORGANIZACAO']);

    $resposta = $this->actingAs(User::factory()->create())
        ->getJson("/api/painel/participantes/2026?cupom={$cupom}")
        ->assertOk();

    expect(collect($resposta->json('data'))->pluck('nome')->all())->toBe($nomes);
})->with([
    'público'     => ['publico', ['A Sem cupom', 'B Caravana']],
    'sem cupom'   => ['sem-cupom', ['A Sem cupom']],
    'palestrante' => ['PALESTRANTE', ['C Palestrante']],
]);

test('busca por nome e e-mail', function (string $termo) {
    Participante::factory()->create(['nome' => 'Ana Lima', 'email' => 'ana@ex.com']);
    Participante::factory()->create(['nome' => 'Outro', 'email' => 'outro@ex.com']);

    $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/participantes/2026?busca='.urlencode($termo))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.email', 'ana@ex.com');
})->with(['nome' => ['Lima'], 'e-mail' => ['ana@ex']]);

test('o resumo e os cupons são da edição inteira, mesmo com filtro', function () {
    Participante::factory()->create(['cupom' => 'PALESTRANTE']);
    Participante::factory()->create(['cupom' => 'ORGANIZACAO']);
    Participante::factory()->create(['cupom' => 'UFDPAR']);
    Participante::factory()->create(['cupom' => 'UFDPAR', 'compareceu' => false, 'check_in_em' => null]);
    Participante::factory()->create(['cupom' => 'OUTRA', 'edicao_id' => edicaoDe(2025)]);

    $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/participantes/2026?presenca=faltou')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('resumo', ['ingressos' => 4, 'compareceram' => 3, 'da_equipe' => 2])
        ->assertJsonPath('cupons', ['ORGANIZACAO', 'PALESTRANTE', 'UFDPAR']);
});

test('quem foi anonimizado continua na lista, sem o endereço interno', function () {
    Participante::factory()->create([
        'nome'           => WaitlistEntry::ANONIMO,
        'email'          => 'anonimizado+1@anonimizado.invalid',
        'anonimizado_em' => now(),
    ]);

    $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/participantes/2026')
        ->assertOk()
        ->assertJsonPath('data.0.nome', WaitlistEntry::ANONIMO)
        ->assertJsonPath('data.0.email', null);
});

test('filtro de presença inválido é rejeitado', function () {
    $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/participantes/2026?presenca=talvez')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('presenca');
});

describe('selo na lista de espera', function () {
    test('mostra as edições em que a pessoa esteve, sem contar a que faltou', function () {
        WaitlistEntry::factory()->create(['email' => 'ana@ex.com']);
        Participante::factory()->create(['email' => 'ana@ex.com']);
        Participante::factory()->create(['email' => 'ana@ex.com', 'edicao_id' => edicaoDe(2025)]);
        // Segundo ingresso na mesma edição não repete o ano.
        Participante::factory()->create(['email' => 'ana@ex.com']);

        WaitlistEntry::factory()->create(['email' => 'bia@ex.com']);
        Participante::factory()->create(['email' => 'bia@ex.com', 'compareceu' => false, 'check_in_em' => null]);

        $resposta = $this->actingAs(User::factory()->create())->getJson('/api/painel/inscricoes')->assertOk();
        $porEmail = collect($resposta->json('data'))->pluck('participou_em', 'email');

        expect($porEmail['ana@ex.com'])->toBe([2025, 2026])
            ->and($porEmail['bia@ex.com'])->toBe([]);
    });

    test('não vaza presença para quem não pode ver participantes', function () {
        WaitlistEntry::factory()->patrocinador()->create(['email' => 'ana@ex.com']);
        Participante::factory()->create(['email' => 'ana@ex.com']);

        $this->actingAs(User::factory()->papel('comercial')->create())
            ->getJson('/api/painel/inscricoes')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.participou_em', []);
    });
});
