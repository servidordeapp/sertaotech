<?php

declare(strict_types=1);

use App\Jobs\AvisaCertificado;
use App\Mail\CertificadoDisponivel;
use App\Models\Certificado;
use App\Models\Edicao;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\RateLimiter;

uses(RefreshDatabase::class);

beforeEach(fn () => test()->withHeader('Origin', 'http://localhost:5173'));

function avisoDe(string $email): int
{
    return (int) DB::table('avisos_certificado')->insertGetId([
        'edicao_id'  => Edicao::query()->where('ano', 2026)->value('id'),
        'email'      => $email,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

test('disparar duas vezes enfileira um aviso por e-mail', function () {
    Queue::fake();
    Certificado::factory()->emitido()->create(['email' => 'ana@example.com', 'tipo' => 'participante']);
    Certificado::factory()->emitido()->create(['email' => 'ana@example.com', 'tipo' => 'palestrante']);
    Certificado::factory()->emitido()->create(['email' => 'bia@example.com']);

    $admin = User::factory()->create();
    $this->actingAs($admin)->postJson('/api/painel/certificados/2026/avisar', ['confirmar' => true])->assertJsonPath('enfileirados', 2);
    $this->actingAs($admin)->postJson('/api/painel/certificados/2026/avisar', ['confirmar' => true])->assertJsonPath('enfileirados', 0);

    Queue::assertPushed(AvisaCertificado::class, 2);
});

test('disparar de novo alcança só quem ganhou certificado depois', function () {
    Queue::fake();
    Certificado::factory()->emitido()->create(['email' => 'ana@example.com']);
    $admin = User::factory()->create();
    $this->actingAs($admin)->postJson('/api/painel/certificados/2026/avisar', ['confirmar' => true]);

    Certificado::factory()->emitido()->create(['email' => 'retardatario@example.com']);

    $this->actingAs($admin)->postJson('/api/painel/certificados/2026/avisar', ['confirmar' => true])->assertJsonPath('enfileirados', 1);
});

test('rascunho, descartado e revogado não geram aviso', function () {
    Queue::fake();
    Certificado::factory()->create(['email' => 'rascunho@example.com']);
    Certificado::factory()->create(['email' => 'descartado@example.com', 'descartado_em' => now()]);
    $revogado = Certificado::factory()->emitido()->create(['email' => 'revogado@example.com']);
    $revogado->update(['revogado_em' => now(), 'motivo_revogacao' => 'Teste']);

    $this->actingAs(User::factory()->create())
        ->postJson('/api/painel/certificados/2026/avisar', ['confirmar' => true])
        ->assertJsonPath('enfileirados', 0);

    Queue::assertNothingPushed();
});

test('disparo pede confirmação e é só do admin', function () {
    $this->actingAs(User::factory()->create())
        ->postJson('/api/painel/certificados/2026/avisar')
        ->assertJsonValidationErrors('confirmar');

    $this->actingAs(User::factory()->papel('financeiro')->create())
        ->postJson('/api/painel/certificados/2026/avisar', ['confirmar' => true])
        ->assertForbidden();
});

test('rodar o job duas vezes envia um e-mail', function () {
    Mail::fake();
    Certificado::factory()->emitido()->create(['email' => 'ana@example.com']);
    $aviso = avisoDe('ana@example.com');

    (new AvisaCertificado($aviso))->handle();
    (new AvisaCertificado($aviso))->handle();

    Mail::assertSent(CertificadoDisponivel::class, 1);
    expect(DB::table('avisos_certificado')->where('id', $aviso)->value('enviado_em'))->not->toBeNull();
});

test('dois certificados no mesmo e-mail viram um e-mail com dois botões', function () {
    Mail::fake();
    $participante = Certificado::factory()->emitido()->create(['nome' => 'Ana Lima', 'email' => 'ana@example.com', 'tipo' => 'participante']);
    $palestrante  = Certificado::factory()->emitido()->create(['nome' => 'Ana Lima', 'email' => 'ana@example.com', 'tipo' => 'palestrante']);

    (new AvisaCertificado(avisoDe('ana@example.com')))->handle();

    Mail::assertSent(CertificadoDisponivel::class, function (CertificadoDisponivel $email) use ($participante, $palestrante): bool {
        $email->assertHasSubject('Seus certificados do Sertão Tech 2026 estão disponíveis')
            ->assertSeeInHtml('Olá, Ana Lima!')
            ->assertSeeInHtml("https://osertaotech.com.br/certificado?codigo={$participante->codigo}", false)
            ->assertSeeInHtml("https://osertaotech.com.br/certificado?codigo={$palestrante->codigo}", false)
            ->assertSeeInText('Certificado de participação')
            ->assertSeeInText('Certificado de palestrante');

        return $email->hasTo('ana@example.com');
    });
});

test('nomes diferentes no mesmo e-mail: saudação neutra e o nome em cada botão', function () {
    Mail::fake();
    Certificado::factory()->emitido()->create(['nome' => 'Ana Lima', 'email' => 'familia@example.com']);
    Certificado::factory()->emitido()->create(['nome' => 'Caio Lima', 'email' => 'familia@example.com']);

    (new AvisaCertificado(avisoDe('familia@example.com')))->handle();

    Mail::assertSent(CertificadoDisponivel::class, function (CertificadoDisponivel $email): bool {
        $email->assertSeeInText('Olá!')
            ->assertSeeInText('Certificado de participação — Ana Lima')
            ->assertSeeInText('Certificado de participação — Caio Lima');

        return true;
    });
});

test('falha no envio desmarca o aviso para a fila tentar de novo', function () {
    Certificado::factory()->emitido()->create(['email' => 'ana@example.com']);
    $aviso = avisoDe('ana@example.com');
    Mail::shouldReceive('to')->andThrow(new RuntimeException('SMTP fora do ar'));

    expect(fn () => (new AvisaCertificado($aviso))->handle())->toThrow(RuntimeException::class, 'SMTP fora do ar');

    expect(DB::table('avisos_certificado')->where('id', $aviso)->value('enviado_em'))->toBeNull();
});

test('o limitador dos certificados reserva 30 por dia para a lista de espera', function () {
    config(['mail.limite_diario' => 100]);

    $limite = RateLimiter::limiter('certificados');

    expect($limite)->not->toBeNull()
        ->and($limite?->__invoke()->maxAttempts)->toBe(70);
});

test('o resumo do painel conta avisados e avisos na fila', function () {
    DB::table('avisos_certificado')->where('id', avisoDe('a@example.com'))->update(['enviado_em' => now()]);
    avisoDe('b@example.com');

    $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/certificados/2026')
        ->assertJsonPath('resumo.avisados', 1)
        ->assertJsonPath('resumo.avisos_na_fila', 1);
});
