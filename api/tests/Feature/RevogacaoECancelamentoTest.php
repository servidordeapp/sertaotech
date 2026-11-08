<?php

declare(strict_types=1);

use App\Models\Auditoria;
use App\Models\Certificado;
use App\Models\Edicao;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    test()->withHeader('Origin', 'http://localhost:5173');
    Storage::fake('s3');
});

/** Emitido de verdade: PDF no storage, no caminho que o banco guarda. */
function emitidoComPdf(array $atributos = []): Certificado
{
    $certificado = Certificado::factory()->emitido()->create($atributos);
    $caminho     = "certificados/2026/{$certificado->codigo}.pdf";
    Storage::disk('s3')->put($caminho, '%PDF-teste');
    DB::table('certificados')->where('id', $certificado->id)->update(['pdf_caminho' => $caminho, 'pdf_sha256' => hash('sha256', '%PDF-teste')]);

    return $certificado->refresh();
}

test('revogar guarda o motivo e o painel passa a mostrar revogado', function () {
    $certificado = Certificado::factory()->emitido()->create();

    $this->actingAs(User::factory()->create())
        ->postJson("/api/painel/certificados/{$certificado->id}/revogar", ['motivo' => 'Nome com erro de digitação'])
        ->assertOk()
        ->assertJsonPath('data.situacao', 'revogado')
        ->assertJsonPath('data.motivo_revogacao', 'Nome com erro de digitação')
        ->assertJsonPath('data.link', null);

    expect(Auditoria::query()->where('acao', 'certificados.revogou')->exists())->toBeTrue();
});

test('só revoga certificado emitido e válido, e com motivo', function () {
    $rascunho = Certificado::factory()->create();
    $revogado = Certificado::factory()->emitido()->create();
    $revogado->update(['revogado_em' => now(), 'motivo_revogacao' => 'Antes']);
    $emitido = Certificado::factory()->emitido()->create();
    $admin   = User::factory()->create();

    $this->actingAs($admin)->postJson("/api/painel/certificados/{$rascunho->id}/revogar", ['motivo' => 'X'])->assertStatus(409);
    $this->actingAs($admin)->postJson("/api/painel/certificados/{$revogado->id}/revogar", ['motivo' => 'X'])->assertStatus(409);
    $this->actingAs($admin)->postJson("/api/painel/certificados/{$emitido->id}/revogar")->assertJsonValidationErrors('motivo');
    $this->actingAs(User::factory()->papel('financeiro')->create())
        ->postJson("/api/painel/certificados/{$emitido->id}/revogar", ['motivo' => 'X'])
        ->assertForbidden();
});

test('o painel traz o link do certificado emitido para copiar', function () {
    $certificado = Certificado::factory()->emitido()->create();

    $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/certificados/2026')
        ->assertJsonPath('data.0.link', "https://osertaotech.com.br/certificado?codigo={$certificado->codigo}");
});

test('a consulta de LGPD lista os certificados da pessoa', function () {
    $certificado = Certificado::factory()->emitido()->create(['email' => 'ana@example.com', 'tipo' => 'palestrante']);

    $this->actingAs(User::factory()->create())
        ->getJson('/api/painel/lgpd?email=ana@example.com')
        ->assertOk()
        ->assertJsonPath('certificados.0.codigo', $certificado->codigo)
        ->assertJsonPath('certificados.0.tipo', 'palestrante')
        ->assertJsonPath('certificados.0.situacao', 'emitido')
        ->assertJsonPath('certificados.0.ano', 2026);
});

test('exclusão pela LGPD apaga o PDF, anonimiza e cancela; rascunho sai inteiro', function () {
    $emitido  = emitidoComPdf(['nome' => 'Ana Lima', 'email' => 'ana@example.com']);
    $rascunho = Certificado::factory()->create([
        'email'     => 'ana@example.com',
        'tipo'      => 'organizacao',
        'edicao_id' => Edicao::query()->where('ano', 2025)->value('id'),
    ]);
    DB::table('avisos_certificado')->insert(['edicao_id' => $emitido->edicao_id, 'email' => 'ana@example.com', 'enviado_em' => now()]);
    $hashDoPdf = $emitido->pdf_sha256;
    $caminho   = (string) $emitido->pdf_caminho;

    $this->actingAs(User::factory()->create())
        ->deleteJson('/api/painel/lgpd', ['email' => 'ana@example.com'])
        ->assertOk()
        ->assertJsonPath('certificados', 2);

    $emitido->refresh();

    expect(Storage::disk('s3')->exists($caminho))->toBeFalse()
        ->and($emitido->situacao())->toBe('cancelado')
        ->and($emitido->nome)->not->toContain('Ana')
        ->and($emitido->email)->not->toContain('ana@example.com')
        ->and($emitido->pdf_caminho)->toBeNull()
        ->and($emitido->pdf_sha256)->toBe($hashDoPdf)
        ->and($emitido->codigo)->not->toBeNull()
        ->and(Certificado::query()->find($rascunho->id))->toBeNull()
        ->and(DB::table('avisos_certificado')->where('email', 'ana@example.com')->exists())->toBeFalse();
});

test('certificado cancelado não aceita mais nada, nem revogação', function () {
    $certificado = emitidoComPdf(['email' => 'ana@example.com']);
    $this->actingAs(User::factory()->create())->deleteJson('/api/painel/lgpd', ['email' => 'ana@example.com']);

    expect(fn () => $certificado->refresh()->update(['revogado_em' => now(), 'motivo_revogacao' => 'X']))
        ->toThrow(LogicException::class);
});

test('a trava só deixa a LGPD tocar nome, e-mail e PDF', function () {
    $certificado = Certificado::factory()->emitido()->create();

    expect(fn () => $certificado->update(['anonimizado_em' => now(), 'carga_horaria' => 1]))->toThrow(LogicException::class);
});

test('o validador responde o cancelamento sem nome e ainda confere o arquivo', function () {
    $certificado = emitidoComPdf(['nome' => 'Ana Lima', 'email' => 'ana@example.com']);
    $this->actingAs(User::factory()->create())->deleteJson('/api/painel/lgpd', ['email' => 'ana@example.com']);

    $resposta = $this->getJson("/api/certificados/{$certificado->codigo}")
        ->assertOk()
        ->assertExactJson(['data' => [
            'codigo'     => $certificado->codigo,
            'situacao'   => 'cancelado',
            'pdf_sha256' => hash('sha256', '%PDF-teste'),
        ]]);

    expect($resposta->getContent())->not->toContain('Ana');
});
