<?php

declare(strict_types=1);

use App\Models\Auditoria;
use App\Models\Participante;
use App\Models\User;
use App\Models\WaitlistEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

beforeEach(fn () => test()->withHeader('Origin', 'http://localhost:5173'));

test('só admin alcança e-mails, LGPD e auditoria', function (string $papel) {
    $this->actingAs(User::factory()->papel($papel)->create());

    $this->getJson('/api/painel/emails')->assertForbidden();
    $this->getJson('/api/painel/lgpd?email=ana@ex.com')->assertForbidden();
    $this->deleteJson('/api/painel/lgpd', ['email' => 'ana@ex.com'])->assertForbidden();
    $this->getJson('/api/painel/auditorias')->assertForbidden();
})->with(['comercial', 'curadoria']);

test('a consulta devolve tudo que temos da pessoa e fica registrada', function () {
    WaitlistEntry::factory()->create(['email' => 'ana@ex.com']);
    WaitlistEntry::factory()->palestrante()->create(['email' => 'ana@ex.com']);
    WaitlistEntry::factory()->create(['email' => 'outra@ex.com']);
    DB::table('emails_enviados')->insert([
        ['para' => 'ana@ex.com', 'assunto' => 'Inscrição recebida', 'enviado_em' => now()],
        ['para' => 'outra@ex.com', 'assunto' => 'Inscrição recebida', 'enviado_em' => now()],
    ]);

    $usuario  = User::factory()->create();
    $resposta = $this->actingAs($usuario)->getJson('/api/painel/lgpd?email=ANA@ex.com')->assertOk();

    expect($resposta->json('inscricoes'))->toHaveCount(2)
        ->and($resposta->json('emails'))->toHaveCount(1);

    $registro = Auditoria::sole();
    expect($registro->acao)->toBe('lgpd.consulta')
        ->and($registro->alvo)->toBe('ana@ex.com')
        ->and($registro->user_id)->toBe($usuario->id);
});

test('anonimizar apaga quem era e guarda a prova do consentimento', function () {
    $inscricao = WaitlistEntry::factory()->create([
        'email' => 'ana@ex.com', 'nome' => 'Ana', 'whatsapp' => '86999998888',
    ]);
    DB::table('emails_enviados')->insert(['para' => 'ana@ex.com', 'assunto' => 'Oi', 'enviado_em' => now()]);

    $this->actingAs(User::factory()->create())
        ->deleteJson('/api/painel/lgpd', ['email' => 'ana@ex.com'])
        ->assertOk()
        ->assertJson(['inscricoes' => 1, 'emails' => 1]);

    $inscricao->refresh();
    expect($inscricao->nome)->toBe(WaitlistEntry::ANONIMO)
        ->and($inscricao->email)->not->toContain('ana@ex.com')
        ->and($inscricao->whatsapp)->toBe('')
        ->and($inscricao->dados)->toBe([])
        ->and($inscricao->anonimizado_em)->not->toBeNull()
        // A prova de que houve consentimento continua de pé.
        ->and($inscricao->lgpd_versao)->toBe(WaitlistEntry::LGPD_VERSAO)
        ->and($inscricao->lgpd_aceito_em)->not->toBeNull();

    $registro = DB::table('emails_enviados')->sole();
    expect($registro->para)->toBe('sha256:'.hash('sha256', 'ana@ex.com'))
        ->and($registro->assunto)->toBe('Oi');

    expect(Auditoria::sole()->acao)->toBe('lgpd.anonimizacao');
});

test('anonimizar as duas inscrições da mesma pessoa não colide no índice único', function () {
    WaitlistEntry::factory()->create(['email' => 'ana@ex.com']);
    WaitlistEntry::factory()->palestrante()->create(['email' => 'ana@ex.com']);

    $this->actingAs(User::factory()->create())
        ->deleteJson('/api/painel/lgpd', ['email' => 'ana@ex.com'])
        ->assertOk()
        ->assertJson(['inscricoes' => 2]);

    expect(WaitlistEntry::query()->whereNotNull('anonimizado_em')->count())->toBe(2);
});

test('a consulta inclui os ingressos da pessoa nas edições', function () {
    Participante::factory()->create(['email' => 'ana@ex.com']);
    Participante::factory()->create(['email' => 'outra@ex.com']);

    $resposta = $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/lgpd?email=ana@ex.com')
        ->assertOk();

    expect($resposta->json('participantes'))->toHaveCount(1)
        ->and($resposta->json('participantes.0.email'))->toBe('ana@ex.com');
});

test('anonimizar tira quem era do ingresso e mantém a presença na conta do evento', function () {
    $participante = Participante::factory()->create([
        'email'    => 'ana@ex.com',
        'nome'     => 'Ana',
        'telefone' => '86999998888',
        'ingresso' => 'AAAA-01-0001',
        'pedido'   => 'PED1',
        'cupom'    => 'PALESTRANTE',
    ]);
    $outro = Participante::factory()->create(['email' => 'outra@ex.com']);

    $this->actingAs(User::factory()->create())
        ->deleteJson('/api/painel/lgpd', ['email' => 'ana@ex.com'])
        ->assertOk()
        ->assertJson(['inscricoes' => 0, 'participantes' => 1]);

    $participante->refresh();
    expect($participante->nome)->toBe(WaitlistEntry::ANONIMO)
        ->and($participante->email)->not->toContain('ana@ex.com')
        ->and($participante->telefone)->toBeNull()
        ->and($participante->ingresso)->not->toBe('AAAA-01-0001')
        ->and($participante->pedido)->not->toBe('PED1')
        ->and($participante->anonimizado_em)->not->toBeNull()
        ->and($participante->compareceu)->toBeTrue()
        ->and($participante->cupom)->toBe('PALESTRANTE');

    expect($outro->fresh()->email)->toBe('outra@ex.com');
});

test('anonimizar dois ingressos do mesmo e-mail não colide no índice único', function () {
    Participante::factory()->count(2)->create(['email' => 'ana@ex.com']);

    $this->actingAs(User::factory()->create())
        ->deleteJson('/api/painel/lgpd', ['email' => 'ana@ex.com'])
        ->assertOk()
        ->assertJson(['participantes' => 2]);

    expect(Participante::query()->whereNotNull('anonimizado_em')->count())->toBe(2);
});

test('e-mail inválido não passa', function () {
    $this->actingAs(User::factory()->create())
        ->deleteJson('/api/painel/lgpd', ['email' => 'nao-e-email'])
        ->assertUnprocessable()->assertJsonValidationErrors('email');

    expect(Auditoria::count())->toBe(0);
});

test('o export da lista vira linha de auditoria', function () {
    WaitlistEntry::factory()->create();

    $this->actingAs(User::factory()->create())
        ->get('/api/painel/inscricoes/export?tipo=participante')
        ->assertOk();

    $registro = Auditoria::sole();
    expect($registro->acao)->toBe('inscricoes.export')
        ->and($registro->alvo)->toBe('tipo=participante');
});

test('a auditoria lista do mais novo para o mais velho, com quem fez', function () {
    $usuario = User::factory()->create(['name' => 'Joana']);

    $this->actingAs($usuario)->getJson('/api/painel/lgpd?email=ana@ex.com')->assertOk();
    $this->getJson('/api/painel/lgpd?email=bia@ex.com')->assertOk();

    $resposta = $this->getJson('/api/painel/auditorias')->assertOk();

    expect($resposta->json('data.0.alvo'))->toBe('bia@ex.com')
        ->and($resposta->json('data.0.user.name'))->toBe('Joana')
        ->and($resposta->json('total'))->toBe(2);
});
