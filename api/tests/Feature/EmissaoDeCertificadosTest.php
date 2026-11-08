<?php

declare(strict_types=1);

use App\Jobs\EmiteCertificado;
use App\Models\Certificado;
use App\Models\Edicao;
use App\Models\User;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    test()->withHeader('Origin', 'http://localhost:5173');
    Storage::fake('s3');
});

test('emitir gera código, grava o PDF uma vez e guarda o SHA-256', function () {
    $certificado = Certificado::factory()->create(['atividades' => ['minicurso-cardinal']]);

    EmiteCertificado::dispatchSync($certificado);

    $certificado->refresh();
    $pdf = Storage::disk('s3')->get("certificados/2026/{$certificado->codigo}.pdf");

    expect($certificado->codigo)->toMatch('/^ST26-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/')
        ->and($certificado->situacao())->toBe('emitido')
        ->and($certificado->pdf_caminho)->toBe("certificados/2026/{$certificado->codigo}.pdf")
        ->and($pdf)->toStartWith('%PDF')
        ->and($certificado->pdf_sha256)->toBe(hash('sha256', (string) $pdf));
});

test('a 1ª edição também tem modelo', function () {
    $certificado = Certificado::factory()->create([
        'edicao_id'     => Edicao::query()->where('ano', 2025)->value('id'),
        'tipo'          => 'organizacao',
        'carga_horaria' => 4,
    ]);

    EmiteCertificado::dispatchSync($certificado);

    expect($certificado->refresh()->codigo)->toStartWith('ST25-')
        ->and(Storage::disk('s3')->get((string) $certificado->pdf_caminho))->toStartWith('%PDF');
});

test('emitir quando o PDF já existe para sem sobrescrever', function () {
    // O código fica gravado antes do PDF: é a retentativa depois de o processo morrer no meio.
    $certificado = Certificado::factory()->create(['codigo' => 'ST26-AAAA-BBBB-CCCC']);
    Storage::disk('s3')->put('certificados/2026/ST26-AAAA-BBBB-CCCC.pdf', 'o original');

    expect(fn () => EmiteCertificado::dispatchSync($certificado))->toThrow(RuntimeException::class);

    expect(Storage::disk('s3')->get('certificados/2026/ST26-AAAA-BBBB-CCCC.pdf'))->toBe('o original')
        ->and($certificado->refresh()->situacao())->toBe('rascunho');
});

test('o job não mexe em certificado emitido nem descartado', function (array $estado) {
    $certificado = Certificado::factory()->create($estado);
    $antes       = $certificado->refresh()->getAttributes();

    EmiteCertificado::dispatchSync($certificado);

    expect($certificado->refresh()->getAttributes())->toBe($antes)
        ->and(Storage::disk('s3')->allFiles())->toBe([]);
})->with([
    'emitido'    => [['codigo' => 'ST26-AAAA-BBBB-CCCC', 'pdf_caminho' => 'x.pdf', 'pdf_sha256' => str_repeat('a', 64), 'emitido_em' => '2026-11-07 12:00:00']],
    'descartado' => [['descartado_em' => '2026-11-07 12:00:00']],
]);

test('o QR Code aponta para a validação com o código do certificado', function () {
    $certificado = Certificado::factory()->create(['codigo' => 'ST26-7K3M-Q9XP-2TVH']);
    $esperado    = 'https://osertaotech.com.br/certificado/validar?codigo=ST26-7K3M-Q9XP-2TVH';

    $qrDoEsperado = (new QRCode(new QROptions(['addQuietzone' => false, 'drawLightModules' => false, 'connectPaths' => true])))->render($esperado);

    expect($certificado->urlDeValidacao())->toBe($esperado)
        ->and($certificado->qrCode())->toBe($qrDoEsperado);
});

test('emitir a edição enfileira um job por rascunho e pede confirmação', function () {
    Queue::fake();
    Certificado::factory()->count(2)->create();
    Certificado::factory()->create(['descartado_em' => now()]);
    Certificado::factory()->emitido()->create();

    $this->actingAs(User::factory()->create())
        ->postJson('/api/painel/certificados/2026/emitir')
        ->assertJsonValidationErrors('confirmar');

    $this->actingAs(User::factory()->create())
        ->postJson('/api/painel/certificados/2026/emitir', ['confirmar' => true])
        ->assertOk()
        ->assertJsonPath('enfileirados', 2);

    Queue::assertPushed(EmiteCertificado::class, 2);
});

test('edição sem modelo não emite', function () {
    $ano = 2099;
    DB::table('edicoes')->insert(['ano' => $ano, 'created_at' => now(), 'updated_at' => now()]);
    config()->set("certificados.edicoes.{$ano}", config('certificados.edicoes.2026'));

    $this->actingAs(User::factory()->create())
        ->postJson("/api/painel/certificados/{$ano}/emitir", ['confirmar' => true])
        ->assertUnprocessable();
});

test('o certificado de teste sai na hora, com o link do PDF', function () {
    $certificado = Certificado::factory()->create();

    $this->actingAs(User::factory()->create())
        ->postJson("/api/painel/certificados/2026/emitir/{$certificado->id}")
        ->assertOk()
        ->assertJsonPath('data.situacao', 'emitido')
        ->assertJsonPath('data.pdf_url', fn (string $url): bool => str_ends_with($url, $certificado->refresh()->codigo.'.pdf'));
});

test('emitir um certificado pela edição errada responde 404', function () {
    $certificado = Certificado::factory()->create();

    $this->actingAs(User::factory()->create())
        ->postJson("/api/painel/certificados/2025/emitir/{$certificado->id}")
        ->assertNotFound();
});

test('a prévia devolve o PDF sem emitir nada', function (string $tipo) {
    $this->actingAs(User::factory()->create())
        ->get("/api/painel/certificados/2026/previa?tipo={$tipo}")
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf')
        ->assertSee('%PDF', false);

    expect(Certificado::query()->count())->toBe(0)
        ->and(Storage::disk('s3')->allFiles())->toBe([]);
})->with(Certificado::TIPOS);

test('só o admin emite e vê a prévia', function () {
    $usuario     = User::factory()->papel('financeiro')->create();
    $certificado = Certificado::factory()->create();

    $this->actingAs($usuario)->getJson('/api/painel/certificados/2026/previa')->assertForbidden();
    $this->actingAs($usuario)->postJson('/api/painel/certificados/2026/emitir', ['confirmar' => true])->assertForbidden();
    $this->actingAs($usuario)->postJson("/api/painel/certificados/2026/emitir/{$certificado->id}")->assertForbidden();
});
