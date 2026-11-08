<?php

declare(strict_types=1);

use App\Models\Auditoria;
use App\Models\Certificado;
use App\Models\Edicao;
use App\Models\Participante;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(fn () => test()->withHeader('Origin', 'http://localhost:5173'));


test('só o admin mexe nos certificados', function (string $papel) {
    $usuario     = User::factory()->papel($papel)->create();
    $certificado = Certificado::factory()->create();

    $this->actingAs($usuario)->getJson('/api/painel/certificados/2026')->assertForbidden();
    $this->actingAs($usuario)->postJson('/api/painel/certificados/2026/preparar')->assertForbidden();
    $this->actingAs($usuario)->patchJson("/api/painel/certificados/{$certificado->id}", ['nome' => 'X'])->assertForbidden();
})->with(['comercial', 'curadoria', 'financeiro']);

test('certificado emitido recusa alteração e exclusão', function () {
    $certificado = Certificado::factory()->emitido()->create(['nome' => 'Ana']);

    expect(fn () => $certificado->update(['nome' => 'Outra']))->toThrow(LogicException::class)
        ->and(fn () => $certificado->fresh()?->delete())->toThrow(LogicException::class)
        ->and($certificado->fresh()?->nome)->toBe('Ana');
});

test('certificado emitido aceita a revogação, uma vez só', function () {
    $certificado = Certificado::factory()->emitido()->create();

    $certificado->update(['revogado_em' => now(), 'motivo_revogacao' => 'Nome errado']);

    expect($certificado->fresh()?->situacao())->toBe('revogado')
        ->and(fn () => $certificado->update(['motivo_revogacao' => 'Outro motivo']))->toThrow(LogicException::class);
});

test('revogação não leva outra alteração junto', function () {
    $certificado = Certificado::factory()->emitido()->create();

    expect(fn () => $certificado->update(['revogado_em' => now(), 'nome' => 'Outra']))->toThrow(LogicException::class);
});

test('o painel responde 409 ao tentar mudar certificado emitido', function () {
    $certificado = Certificado::factory()->emitido()->create();

    $this->actingAs(User::factory()->create())->patchJson("/api/painel/certificados/{$certificado->id}", ['nome' => 'X'])->assertStatus(409);
    $this->actingAs(User::factory()->create())->deleteJson("/api/painel/certificados/{$certificado->id}")->assertStatus(409);
});

test('preparar tira o tipo do cupom e ignora faltante e anonimizado', function () {
    Participante::factory()->create(['nome' => 'Público']);
    Participante::factory()->create(['nome' => 'Palestrante', 'cupom' => 'PALESTRANTE']);
    Participante::factory()->create(['nome' => 'Org sem check-in', 'cupom' => 'ORGANIZACAO', 'compareceu' => false, 'check_in_em' => null]);
    Participante::factory()->create(['nome' => 'Faltou', 'compareceu' => false, 'check_in_em' => null]);
    Participante::factory()->create(['nome' => 'Anônimo', 'anonimizado_em' => now()]);
    Participante::factory()->create(['nome' => 'De 2025', 'edicao_id' => Edicao::query()->where('ano', 2025)->value('id')]);

    $this->actingAs(User::factory()->create())->postJson('/api/painel/certificados/2026/preparar')
        ->assertOk()
        ->assertJsonPath('criados', 4);

    $criados = Certificado::query()->orderBy('nome')->orderBy('tipo')->get()
        ->map(fn (Certificado $c): array => [$c->nome, $c->tipo, $c->carga_horaria])
        ->all();

    expect($criados)->toBe([
        ['Org sem check-in', 'organizacao', 18],
        ['Palestrante', 'palestrante', 8],
        ['Palestrante', 'participante', 8],
        ['Público', 'participante', 8],
    ]);
    expect(Auditoria::query()->where('acao', 'certificados.preparou')->value('alvo'))->toBe('4 em 2026');
});

test('preparar duas vezes não duplica e não recria o descartado', function () {
    Participante::factory()->count(2)->create();

    $this->actingAs(User::factory()->create())->postJson('/api/painel/certificados/2026/preparar')->assertJsonPath('criados', 2);

    $descartado = Certificado::query()->firstOrFail();
    $this->actingAs(User::factory()->create())->deleteJson("/api/painel/certificados/{$descartado->id}")
        ->assertOk()
        ->assertJsonPath('data.situacao', 'descartado');

    $this->actingAs(User::factory()->create())->postJson('/api/painel/certificados/2026/preparar')->assertJsonPath('criados', 0);

    expect(Certificado::query()->count())->toBe(2);
});

test('edição sem configuração não prepara', function () {
    config()->set('certificados.edicoes.2026', null);

    $this->actingAs(User::factory()->create())->postJson('/api/painel/certificados/2026/preparar')->assertStatus(422);
});

test('marcar minicurso para quem faltou ao check-in cria certificado de participante com 2 h', function () {
    $faltou = Participante::factory()->create(['compareceu' => false, 'check_in_em' => null]);

    $this->actingAs(User::factory()->create())->postJson('/api/painel/certificados/2026', [
        'participante_id' => $faltou->id,
        'tipo'            => 'participante',
        'atividades'      => ['minicurso-cardinal'],
    ])->assertCreated()
        ->assertJsonPath('data.nome', $faltou->nome)
        ->assertJsonPath('data.carga_horaria', 2)
        ->assertJsonPath('data.atividades', ['minicurso-cardinal'])
        ->assertJsonPath('data.situacao', 'rascunho');
});

test('quem esteve no evento e fez minicurso fica com a carga do evento', function () {
    $presente = Participante::factory()->create();

    $this->actingAs(User::factory()->create())->postJson('/api/painel/certificados/2026', [
        'participante_id' => $presente->id,
        'tipo'            => 'participante',
        'atividades'      => ['minicurso-freelancer'],
    ])->assertCreated()->assertJsonPath('data.carga_horaria', 8);
});

test('adiciona quem não tem ingresso', function () {
    $this->actingAs(User::factory()->create())->postJson('/api/painel/certificados/2026', [
        'nome'  => 'Voluntária Sem Ingresso',
        'email' => 'voluntaria@example.com',
        'tipo'  => 'organizacao',
    ])->assertCreated()
        ->assertJsonPath('data.participante_id', null)
        ->assertJsonPath('data.carga_horaria', 18);

    expect(Auditoria::query()->where('acao', 'certificados.adicionou')->exists())->toBeTrue();
});

test('não cria um segundo certificado do mesmo tipo para o mesmo ingresso', function () {
    $participante = Participante::factory()->create();
    Certificado::factory()->create(['participante_id' => $participante->id, 'tipo' => 'participante']);

    $this->actingAs(User::factory()->create())->postJson('/api/painel/certificados/2026', [
        'participante_id' => $participante->id,
        'tipo'            => 'participante',
    ])->assertJsonValidationErrors('participante_id');
});

test('recusa os dois minicursos juntos e atividade que não existe na edição', function (array $atividades) {
    $certificado = Certificado::factory()->create();

    $this->actingAs(User::factory()->create())->patchJson("/api/painel/certificados/{$certificado->id}", ['atividades' => $atividades])
        ->assertUnprocessable();
})->with([
    'mesmo horário' => [['minicurso-cardinal', 'minicurso-freelancer']],
    'inexistente'   => [['minicurso-fantasma']],
]);

test('2025 não tem atividade para marcar', function () {
    $certificado = Certificado::factory()->create(['edicao_id' => Edicao::query()->where('ano', 2025)->value('id')]);

    $this->actingAs(User::factory()->create())->patchJson("/api/painel/certificados/{$certificado->id}", ['atividades' => ['minicurso-cardinal']])
        ->assertJsonValidationErrors('atividades.0');
});

test('a revisão corrige nome, tipo, título e carga horária', function () {
    $participante = Participante::factory()->create(['cupom' => 'PALESTRANTE']);
    $certificado  = Certificado::factory()->create(['participante_id' => $participante->id, 'tipo' => 'palestrante']);

    $this->actingAs(User::factory()->create())->patchJson("/api/painel/certificados/{$certificado->id}", [
        'nome'          => 'Germano Gomes',
        'tipo'          => 'ministrante',
        'titulo'        => 'Cardinal — um simulador de mundos para desenvolvedores de jogos',
        'carga_horaria' => 2,
    ])->assertOk()
        ->assertJsonPath('data.tipo', 'ministrante')
        ->assertJsonPath('data.carga_horaria', 2)
        ->assertJsonPath('data.cupom', 'PALESTRANTE');

    expect(Auditoria::query()->where('acao', 'certificados.alterou')->value('alvo'))->toBe("#{$certificado->id} Germano Gomes");
});

test('trocar o tipo não colide com outro certificado da mesma pessoa', function () {
    $participante = Participante::factory()->create();
    Certificado::factory()->create(['participante_id' => $participante->id, 'tipo' => 'participante']);
    $palestrante = Certificado::factory()->create(['participante_id' => $participante->id, 'tipo' => 'palestrante']);

    $this->actingAs(User::factory()->create())->patchJson("/api/painel/certificados/{$palestrante->id}", ['tipo' => 'participante'])
        ->assertJsonValidationErrors('tipo');
});

test('lista filtra por minicurso e traz o resumo da edição', function () {
    Certificado::factory()->create(['nome' => 'Ana', 'atividades' => ['minicurso-cardinal']]);
    Certificado::factory()->create(['nome' => 'Bia', 'atividades' => ['minicurso-freelancer']]);
    Certificado::factory()->emitido()->create(['nome' => 'Caio']);
    Certificado::factory()->create(['nome' => 'Duda', 'descartado_em' => now()]);

    $this->actingAs(User::factory()->create())->getJson('/api/painel/certificados/2026?atividade=minicurso-cardinal')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.nome', 'Ana')
        ->assertJsonPath('resumo', ['rascunhos' => 2, 'emitidos' => 1, 'descartados' => 1, 'revogados' => 0, 'avisados' => 0, 'avisos_na_fila' => 0]);
});
