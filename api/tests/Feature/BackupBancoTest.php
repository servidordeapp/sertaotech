<?php

declare(strict_types=1);

use App\Jobs\BackupBanco;
use App\Jobs\LimpaBackups;
use App\Jobs\RestauraBackup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(fn () => Storage::fake(BackupBanco::DISCO));

it('guarda um CSV com a data no nome, dentro de backup/', function () {
    $this->travelTo(now('America/Sao_Paulo')->setDate(2026, 11, 8)->setTime(4, 0));
    User::factory()->create(['email' => 'ana@exemplo.com']);

    (new BackupBanco())->handle();

    $arquivos = Storage::disk(BackupBanco::DISCO)->files('backup');
    expect($arquivos)->toHaveCount(1)
        ->and($arquivos[0])->toMatch('#^backup/backup-2026-11-08_04-00-00\.csv$#')
        ->and(Storage::disk(BackupBanco::DISCO)->get($arquivos[0]))->not->toContain('ana@exemplo.com')
        ->and(preg_match_all('/^users,/m', Storage::disk(BackupBanco::DISCO)->get($arquivos[0])))->toBe(1);
});

it('recusa e não mexe no banco se uma linha do backup foi adulterada', function () {
    User::factory()->create(['email' => 'ana@exemplo.com']);
    (new BackupBanco())->handle();
    $disco   = Storage::disk(BackupBanco::DISCO);
    $arquivo = $disco->files('backup')[0];
    $disco->put($arquivo, preg_replace('/^(users,.{20})./m', '$1X', $disco->get($arquivo)));

    expect(fn () => (new RestauraBackup($arquivo))->handle())->toThrow(Illuminate\Contracts\Encryption\DecryptException::class)
        ->and(User::pluck('email')->all())->toBe(['ana@exemplo.com']);
});

it('restaura o banco a partir do CSV', function () {
    User::factory()->create(['email' => 'ana@exemplo.com', 'name' => 'Ação, "Ana"']);
    (new BackupBanco())->handle();
    $arquivo = Storage::disk(BackupBanco::DISCO)->files('backup')[0];

    User::query()->delete();
    User::factory()->create(['email' => 'novo@exemplo.com']);

    (new RestauraBackup($arquivo))->handle();

    expect(User::pluck('email')->all())->toBe(['ana@exemplo.com'])
        ->and(User::first()->name)->toBe('Ação, "Ana"');
});

it('leva migrations, fila e jobs falhos, e deixa cache e sessões de fora', function () {
    DB::table('jobs')->insert(['queue' => 'default', 'payload' => '{}', 'attempts' => 0, 'available_at' => 0, 'created_at' => 0]);
    DB::table('failed_jobs')->insert(['uuid' => 'abc', 'connection' => 'x', 'queue' => 'default', 'payload' => '{}', 'exception' => 'boom']);
    DB::table('cache')->insert(['key' => 'k', 'value' => 'v', 'expiration' => 0]);
    (new BackupBanco())->handle();
    $arquivo    = Storage::disk(BackupBanco::DISCO)->files('backup')[0];
    $migrations = DB::table('migrations')->count();

    DB::table('migrations')->delete();
    DB::table('jobs')->delete();
    DB::table('failed_jobs')->delete();

    (new RestauraBackup($arquivo))->handle();

    expect(DB::table('migrations')->count())->toBe($migrations)
        ->and(DB::table('jobs')->count())->toBe(1)
        ->and(DB::table('failed_jobs')->count())->toBe(1)
        ->and(Storage::disk(BackupBanco::DISCO)->get($arquivo))->not->toMatch('/^cache,/m');
});

it('não mexe no banco se o arquivo não for um backup', function () {
    User::factory()->create();
    Storage::disk(BackupBanco::DISCO)->put('backup/ruim.csv', "a,b\n1,2\n");

    expect(fn () => (new RestauraBackup('backup/ruim.csv'))->handle())->toThrow(RuntimeException::class)
        ->and(User::count())->toBe(1);
});

it('apaga só os backups com mais de 30 dias', function () {
    $disco = Storage::disk(BackupBanco::DISCO);
    $disco->put('backup/velho.csv', 'x');
    $disco->put('backup/novo.csv', 'x');
    touch($disco->path('backup/velho.csv'), now()->subDays(31)->getTimestamp());
    touch($disco->path('backup/novo.csv'), now()->subDays(29)->getTimestamp());

    (new LimpaBackups())->handle();

    expect($disco->files('backup'))->toBe(['backup/novo.csv']);
});

it('agenda backup e limpeza às 4h de Brasília', function () {
    $eventos = collect(app(Illuminate\Console\Scheduling\Schedule::class)->events())
        ->mapWithKeys(fn ($e) => [$e->description ?? $e->getSummaryForDisplay() => [$e->expression, $e->timezone]]);

    expect($eventos->filter(fn ($v, $k) => str_contains($k, 'BackupBanco'))->first())->toBe(['0 4 * * *', 'America/Sao_Paulo'])
        ->and($eventos->filter(fn ($v, $k) => str_contains($k, 'LimpaBackups'))->first())->toBe(['30 4 * * *', 'America/Sao_Paulo']);
});
