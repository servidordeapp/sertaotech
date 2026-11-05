<?php

declare(strict_types=1);

use App\Models\Auditoria;
use App\Models\Edicao;
use App\Models\Participante;
use App\Models\User;
use App\Models\WaitlistEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

const CABECALHO = [
    'Ordem de inscrição', 'Nº ingresso', 'Nome', 'Sobrenome', 'Tipo de ingresso', 'Valor', 'Data compra', 'Nº pedido',
    'Email', 'Estado de pagamento', 'Check-in', 'Data Check-in (*)', 'Cupom de Desconto', 'Telefone',
];

function ingresso(array $campos = []): array
{
    return [
        'Ordem de inscrição'  => '1',
        'Nº ingresso'         => 'AAAA-01-0001',
        'Nome'                => ' Ana',
        'Sobrenome'           => ' Silva',
        'Tipo de ingresso'    => 'Ingresso Individual',
        'Valor'               => 'R$ 20,00',
        'Data compra'         => '2026-09-01 10:00:00',
        'Nº pedido'           => 'PED1',
        'Email'               => 'ana@ex.com',
        'Estado de pagamento' => 'Aprovado',
        'Check-in'            => 'Sim',
        'Data Check-in (*)'   => '2026-10-09 18:30:00',
        'Cupom de Desconto'   => '',
        'Telefone'            => '',
        ...$campos,
    ];
}

function celulas(array $valores, int $numero, array &$textos, bool $compartilhado): string
{
    $saida = '';

    foreach (array_values($valores) as $posicao => $valor) {
        if ($valor === '') {
            continue;
        }

        $referencia = chr(65 + $posicao).$numero;
        $escapado   = htmlspecialchars($valor, ENT_XML1);

        if ($compartilhado) {
            $textos[] = "<si><t xml:space=\"preserve\">{$escapado}</t></si>";
            $saida .= sprintf('<c r="%s" t="s"><v>%d</v></c>', $referencia, count($textos) - 1);
        } else {
            $saida .= "<c r=\"{$referencia}\" t=\"inlineStr\"><is><t>{$escapado}</t></is></c>";
        }
    }

    return "<row r=\"{$numero}\">{$saida}</row>";
}

/**
 * Mesma forma do export real: título antes do cabeçalho e camisetas depois de
 * linhas vazias. `$comoExcel` imita o arquivo salvo de novo no Excel, que move
 * o texto para sharedStrings e omite as linhas vazias.
 *
 * @param  list<array<string, string>>  $ingressos
 * @param  list<string>  $cabecalho
 */
function escrevePlanilha(string $caminho, array $ingressos, array $cabecalho = CABECALHO, bool $comoExcel = false): void
{
    $textos = [];
    $linhas = celulas(['Sertão Tech'], 1, $textos, $comoExcel);
    $linhas .= celulas($cabecalho, 8, $textos, $comoExcel);

    $numero = 9;
    foreach ($ingressos as $valores) {
        $linhas .= celulas(array_intersect_key($valores, array_flip($cabecalho)), $numero++, $textos, $comoExcel);
    }

    if (! $comoExcel) {
        $linhas .= "<row r=\"{$numero}\"></row>";
    }
    $numero += 2;
    $linhas .= celulas(['Nº pedido', 'Nº ingresso', 'Nome', 'Sobrenome', 'Nome do produto', 'Opção'], $numero++, $textos, $comoExcel);
    $linhas .= celulas(['PED9', 'CAMI-01', 'Bia', 'Souza', 'Camiseta', 'TAM P'], $numero, $textos, $comoExcel);

    $esquema = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
    $zip     = new ZipArchive();
    $zip->open($caminho, ZipArchive::CREATE | ZipArchive::OVERWRITE);
    $zip->addFromString('xl/worksheets/sheet1.xml', "<worksheet {$esquema}><sheetData>{$linhas}</sheetData></worksheet>");

    if ($comoExcel) {
        $zip->addFromString('xl/sharedStrings.xml', "<sst {$esquema}>".implode('', $textos).'</sst>');
    }

    $zip->close();
}

beforeEach(function () {
    $this->arquivo = (string) tempnam(sys_get_temp_dir(), 'planilha');
    $this->admin   = User::factory()->create();
    $this->edicao  = Edicao::query()->where('ano', 2026)->sole();
});

afterEach(fn () => @unlink($this->arquivo));

function importa(array $opcoes = []): Illuminate\Testing\PendingCommand
{
    return test()->artisan('participantes:importar', [
        'arquivo'  => test()->arquivo,
        '--edicao' => 2026,
        '--por'    => test()->admin->email,
        ...$opcoes,
    ]);
}

test('importa o ingresso limpo, em UTC, sem enviar e-mail, e registra quem importou', function () {
    Mail::fake();
    escrevePlanilha($this->arquivo, [ingresso([
        'Email'             => ' ANA@ex.com',
        'Nome'              => ' MARIA',
        'Sobrenome'         => ' DE SOUZA',
        'Cupom de Desconto' => '100.00% - Palestrante',
        'Valor'             => 'R$ 1.020,50',
        'Telefone'          => '(86) 99999-8888',
    ])]);

    importa()->assertSuccessful();

    $participante = Participante::sole();
    expect($participante->edicao_id)->toBe($this->edicao->id)
        ->and($participante->ingresso)->toBe('AAAA-01-0001')
        ->and($participante->pedido)->toBe('PED1')
        ->and($participante->nome)->toBe('Maria de Souza')
        ->and($participante->email)->toBe('ana@ex.com')
        ->and($participante->telefone)->toBe('86999998888')
        ->and($participante->valor_centavos)->toBe(102050)
        ->and($participante->cupom)->toBe('PALESTRANTE')
        ->and($participante->compareceu)->toBeTrue()
        ->and($participante->check_in_em->toDateTimeString())->toBe('2026-10-09 21:30:00')
        ->and($participante->comprado_em->toDateTimeString())->toBe('2026-09-01 13:00:00');

    $registro = Auditoria::sole();
    expect($registro->acao)->toBe('participantes.importacao')
        ->and($registro->user_id)->toBe($this->admin->id)
        ->and($registro->alvo)->toBe('edicao=2026 ingressos=1');

    Mail::assertNothingOutgoing();
});

test('nome já escrito em caixa mista fica como a pessoa escreveu', function () {
    escrevePlanilha($this->arquivo, [ingresso(['Nome' => ' Ana', 'Sobrenome' => ' McDonald De Souza'])]);

    importa()->assertSuccessful();

    expect(Participante::sole()->nome)->toBe('Ana McDonald De Souza');
});

test('separa quem compareceu de quem faltou', function () {
    escrevePlanilha($this->arquivo, [
        ingresso(),
        ingresso([
            'Nº ingresso'       => 'AAAA-01-0002',
            'Email'             => 'bia@ex.com',
            'Check-in'          => 'Não',
            'Data Check-in (*)' => '',
        ]),
    ]);

    importa()->assertSuccessful();

    $faltou = Participante::query()->where('email', 'bia@ex.com')->sole();
    expect($faltou->compareceu)->toBeFalse()
        ->and($faltou->check_in_em)->toBeNull()
        ->and(Participante::query()->where('compareceu', true)->count())->toBe(1);
});

test('descarta não pagos e cancelados e não lê as camisetas', function (bool $comoExcel) {
    escrevePlanilha($this->arquivo, [
        ingresso(),
        ingresso(['Nº ingresso' => 'AAAA-01-0002', 'Estado de pagamento' => 'Não pago', 'Check-in' => 'Não', 'Data Check-in (*)' => '']),
        ingresso(['Nº ingresso' => 'AAAA-01-0003', 'Estado de pagamento' => 'Cancelado', 'Check-in' => 'Não', 'Data Check-in (*)' => '']),
    ], comoExcel: $comoExcel);

    importa()->assertSuccessful();

    expect(Participante::sole()->ingresso)->toBe('AAAA-01-0001');
})->with(['export original' => false, 'salvo de novo no Excel' => true]);

test('importar de novo atualiza em vez de duplicar', function () {
    escrevePlanilha($this->arquivo, [ingresso(['Check-in' => 'Não', 'Data Check-in (*)' => ''])]);
    importa()->assertSuccessful();

    // O check-in lançado depois do evento precisa chegar pela reimportação.
    escrevePlanilha($this->arquivo, [ingresso(['Data Check-in (*)' => '2026-10-14 09:00:00'])]);
    importa()->assertSuccessful();

    $participante = Participante::sole();
    expect($participante->compareceu)->toBeTrue()
        ->and($participante->check_in_em->toDateTimeString())->toBe('2026-10-14 12:00:00');
});

test('ingresso que virou cancelado sai da lista ao reimportar', function () {
    Participante::factory()->create(['ingresso' => 'AAAA-01-0001']);
    escrevePlanilha($this->arquivo, [
        ingresso(['Estado de pagamento' => 'Cancelado', 'Check-in' => 'Não', 'Data Check-in (*)' => '']),
    ]);

    importa()->assertSuccessful();

    expect(Participante::count())->toBe(0);
});

test('a simulação mostra os totais e não grava nada', function () {
    escrevePlanilha($this->arquivo, [ingresso()]);

    importa(['--dry-run' => true])
        ->expectsTable(['Item', 'Total'], [
            ['Ingressos aprovados', 1],
            ['Compareceram', 1],
            ['Faltaram', 0],
            ['Valor aprovado', 'R$ 20,00'],
            ['E-mails distintos', 1],
            ['Anônimos na plataforma', 0],
            ['Descartados (não pago ou cancelado)', 0],
            ['Pulados (titular anonimizado)', 0],
        ])
        ->assertSuccessful();

    expect(Participante::count())->toBe(0)
        ->and(Auditoria::count())->toBe(0);
});

test('quem pediu exclusão não volta pela planilha', function () {
    $this->actingAs($this->admin)
        ->withHeader('Origin', 'http://localhost:5173')
        ->deleteJson('/api/painel/lgpd', ['email' => 'ana@ex.com'])
        ->assertOk();
    escrevePlanilha($this->arquivo, [ingresso()]);

    importa()->assertSuccessful();

    expect(Participante::count())->toBe(0);
});

test('conta anônima da plataforma entra nos totais sem identificar a pessoa', function () {
    escrevePlanilha($this->arquivo, [ingresso([
        'Email'             => 'user-anonymous-3a9f',
        'Nome'              => ' Ana',
        'Check-in'          => 'Não',
        'Data Check-in (*)' => '',
    ])]);

    importa()->assertSuccessful();
    importa()->assertSuccessful();

    $participante = Participante::sole();
    expect($participante->nome)->toBe(WaitlistEntry::ANONIMO)
        ->and($participante->email)->toEndWith('@anonimizado.invalid')
        ->and($participante->pedido)->toBe(WaitlistEntry::ANONIMO)
        ->and($participante->ingresso)->toBe('AAAA-01-0001')
        ->and($participante->anonimizado_em)->not->toBeNull()
        ->and($participante->compareceu)->toBeFalse();
});

test('a variante do cupom vira o mesmo cupom quando o preço é igual', function () {
    escrevePlanilha($this->arquivo, [
        ingresso(['Cupom de Desconto' => '100.00% - CAJUTEC', 'Valor' => 'R$ 0,00']),
        ingresso(['Nº ingresso' => 'AAAA-01-0002', 'Cupom de Desconto' => '100.00% - Cajutecc', 'Valor' => 'R$ 0,00']),
    ]);

    importa()->assertSuccessful();

    expect(Participante::query()->pluck('cupom')->all())->toBe(['CAJUTEC', 'CAJUTEC']);
});

test('a variante do cupom continua outro cupom quando o preço é diferente', function () {
    escrevePlanilha($this->arquivo, [
        ingresso(['Cupom de Desconto' => '100.00% - CAJUTEC', 'Valor' => 'R$ 0,00']),
        ingresso(['Nº ingresso' => 'AAAA-01-0002', 'Cupom de Desconto' => '50.00% - Cajutecc', 'Valor' => 'R$ 10,00']),
    ]);

    importa()->assertSuccessful();

    expect(Participante::query()->where('ingresso', 'AAAA-01-0002')->sole()->cupom)->toBe('CAJUTECC');
});

test('linha problemática aborta a importação inteira e aponta o motivo', function (array $campos, string $motivo) {
    escrevePlanilha($this->arquivo, [
        ingresso(),
        ingresso(['Nº ingresso' => 'AAAA-01-0002', ...$campos]),
    ]);

    importa()->expectsOutputToContain("linha 10: {$motivo}")->assertFailed();

    expect(Participante::count())->toBe(0)
        ->and(Auditoria::count())->toBe(0);
})->with([
    'estado desconhecido'    => [['Estado de pagamento' => 'Reembolsado'], 'estado de pagamento desconhecido'],
    'presente sem pagamento' => [['Estado de pagamento' => 'Não pago'], 'check-in em ingresso não aprovado'],
    'ingresso repetido'      => [['Nº ingresso' => 'AAAA-01-0001'], 'ingresso repetido'],
    'e-mail inválido'        => [['Email' => 'nao-e-email'], 'e-mail inválido'],
    'valor inválido'         => [['Valor' => 'TAM P'], 'valor inválido'],
    'check-in inválido'      => [['Check-in' => 'Talvez'], 'check-in inválido'],
    'data de compra'         => [['Data compra' => '46000'], 'data de compra inválida'],
    'data de check-in'       => [['Data Check-in (*)' => 'ontem'], 'data de check-in inválida'],
]);

test('a mensagem de erro não expõe o dado da pessoa', function () {
    escrevePlanilha($this->arquivo, [ingresso(['Email' => 'ana-sem-arroba'])]);

    importa()->doesntExpectOutputToContain('ana-sem-arroba')->assertFailed();
});

test('planilha sem a coluna de check-in é recusada', function () {
    escrevePlanilha($this->arquivo, [ingresso()], array_values(array_diff(CABECALHO, ['Check-in'])));

    importa()->expectsOutputToContain('Colunas ausentes: Check-in')->assertFailed();

    expect(Participante::count())->toBe(0);
});

test('recusa arquivo que não é planilha', function () {
    file_put_contents($this->arquivo, 'isto não é xlsx');

    importa()->expectsOutputToContain('Não consegui abrir a planilha.')->assertFailed();
});

test('recusa edição que não existe', function () {
    escrevePlanilha($this->arquivo, [ingresso()]);

    importa(['--edicao' => 2024])->expectsOutputToContain('Edição não encontrada')->assertFailed();

    expect(Participante::count())->toBe(0);
});

test('só um admin do painel responde pela importação', function (?string $papel) {
    escrevePlanilha($this->arquivo, [ingresso()]);
    $email = $papel === null ? 'ninguem@ex.com' : User::factory()->papel($papel)->create()->email;

    importa(['--por' => $email])->expectsOutputToContain('--por precisa ser')->assertFailed();

    expect(Participante::count())->toBe(0);
})->with(['comercial', 'curadoria', 'financeiro', 'desconhecido' => null]);
