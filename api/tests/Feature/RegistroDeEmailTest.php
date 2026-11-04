<?php

declare(strict_types=1);

use App\Mail\InscricaoRecebida;
use App\Mail\NovaInscricao;
use App\Models\WaitlistEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

test('todo e-mail que sai vira uma linha em emails_enviados', function () {
    config(['mail.admins' => ['adm@ex.com']]);

    $this->postJson('/api/lista-de-espera/participante', [
        'nome'   => 'Ana', 'email' => 'ana@ex.com', 'whatsapp' => '86999999999',
        'cidade' => 'Parnaíba', 'perfil' => 'Estudante',
        'lgpd'   => true, 'lgpd_versao' => WaitlistEntry::LGPD_VERSAO,
    ])->assertCreated();

    $registros = DB::table('emails_enviados')->orderBy('id')->get();

    expect($registros)->toHaveCount(2)
        ->and($registros[0]->para)->toBe('ana@ex.com')
        ->and($registros[0]->mailable)->toBe(InscricaoRecebida::class)
        ->and($registros[0]->assunto)->toContain('Recebemos sua inscrição')
        ->and($registros[0]->enviado_em)->not->toBeNull()
        ->and($registros[1]->para)->toBe('adm@ex.com')
        ->and($registros[1]->mailable)->toBe(NovaInscricao::class);
});
