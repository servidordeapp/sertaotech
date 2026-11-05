<?php

declare(strict_types=1);

use App\Models\Auditoria;
use App\Models\Despesa;
use App\Models\Edicao;
use App\Models\Receita;
use App\Models\User;
use App\Models\WaitlistEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\HttpException;

uses(RefreshDatabase::class);

beforeEach(function () {
    test()->withHeader('Origin', 'http://localhost:5173');
    Carbon::setTestNow('2026-11-05 12:00:00');
});

function edicao(int $ano = 2027): Edicao
{
    return Edicao::query()->where('ano', $ano)->firstOrFail();
}

function usuario(string $papel = 'admin'): User
{
    return User::factory()->papel($papel)->create();
}

/** @param array<string, mixed> $campos */
function receita(array $campos = [], int $ano = 2027): Receita
{
    return edicao($ano)->receitas()->create([
        'patrocinador'   => 'Carnaúba Labs',
        'cota'           => 'Ouro',
        'valor_centavos' => 500_000,
        ...$campos,
    ]);
}

/** @param array<string, mixed> $campos */
function despesa(array $campos = [], int $ano = 2027): Despesa
{
    return edicao($ano)->despesas()->create([
        'categoria'       => 'Audiovisual',
        'descricao'       => 'Som e telão',
        'orcado_centavos' => 900_000,
        ...$campos,
    ]);
}

test('as edições vêm da mais nova para a mais velha, e a atual é a de maior ano', function () {
    $this->actingAs(usuario('curadoria'))->getJson('/api/painel/edicoes')
        ->assertOk()
        ->assertExactJson([['ano' => 2027, 'atual' => true], ['ano' => 2026, 'atual' => false], ['ano' => 2025, 'atual' => false]]);
});

describe('papéis', function () {
    test('quem vê o quê', function (string $papel, int $inscricoes, int $receitas, int $despesas) {
        $this->actingAs(usuario($papel));

        $this->getJson('/api/painel/inscricoes')->assertStatus($inscricoes);
        $this->getJson('/api/painel/metricas')->assertStatus($inscricoes);
        $this->getJson('/api/painel/orcamento/2027/receitas')->assertStatus($receitas);
        $this->getJson('/api/painel/orcamento/2027/lista-de-espera')->assertStatus($receitas);
        $this->getJson('/api/painel/orcamento/2027/despesas')->assertStatus($despesas);
        $this->getJson('/api/painel/orcamento/2027/resumo')->assertStatus($despesas);
    })->with([
        'admin'      => ['admin', 200, 200, 200],
        'financeiro' => ['financeiro', 403, 200, 200],
        'comercial'  => ['comercial', 200, 200, 403],
        'curadoria'  => ['curadoria', 200, 403, 403],
    ]);

    test('sem papel conhecido, nada abre', function () {
        $this->actingAs(usuario(''));

        $this->getJson('/api/painel/inscricoes')->assertForbidden();
        $this->getJson('/api/painel/orcamento/2027/receitas')->assertForbidden();
    });

    test('sem sessão é 401', function () {
        $this->getJson('/api/painel/orcamento/2027/receitas')->assertUnauthorized();
    });

    test('o comercial não mexe em despesa nem pelo id', function () {
        $item = despesa();

        $this->actingAs(usuario('comercial'))
            ->patchJson('/api/painel/orcamento/despesas/'.$item->id, ['descricao' => 'x'])
            ->assertForbidden();
    });
});

describe('edição encerrada', function () {
    test('é só leitura para quem não é admin', function (string $papel) {
        $item = receita(ano: 2026);

        $this->actingAs(usuario($papel));

        $this->getJson('/api/painel/orcamento/2026/receitas')->assertOk()->assertJsonCount(1, 'data');
        $this->postJson('/api/painel/orcamento/2026/receitas', ['patrocinador' => 'X', 'cota' => 'Ouro', 'valor_centavos' => 100])->assertForbidden();
        $this->patchJson('/api/painel/orcamento/receitas/'.$item->id, ['status' => 'pago'])->assertForbidden();
        $this->deleteJson('/api/painel/orcamento/receitas/'.$item->id)->assertForbidden();
    })->with(['financeiro', 'comercial']);

    test('o admin lança o histórico dela', function () {
        $this->actingAs(usuario())
            ->postJson('/api/painel/orcamento/2026/despesas', ['categoria' => 'Espaço', 'descricao' => 'Local', 'orcado_centavos' => 100])
            ->assertCreated();
    });
});

describe('receitas', function () {
    test('cria em prospecção, guarda centavos e registra quem fez', function () {
        $quem = usuario('comercial');

        $this->actingAs($quem)
            ->postJson('/api/painel/orcamento/2027/receitas', ['patrocinador' => 'Litoral Dev', 'cota' => 'Prata', 'valor_centavos' => 250_000])
            ->assertCreated()
            ->assertJsonPath('data.status', 'prospeccao')
            ->assertJsonPath('data.valor_centavos', 250_000);

        expect(Auditoria::query()->where('acao', 'orcamento.receita.criou')->where('user_id', $quem->id)->exists())->toBeTrue();
    });

    test('valor inválido não passa', function (mixed $valor) {
        $this->actingAs(usuario())
            ->postJson('/api/painel/orcamento/2027/receitas', ['patrocinador' => 'X', 'cota' => 'Ouro', 'valor_centavos' => $valor])
            ->assertJsonValidationErrors('valor_centavos');
    })->with([-1, 12.5, 'muito', null]);

    test('virar pago carimba hoje, em Parnaíba', function () {
        // 01:00 UTC ainda é o dia anterior em America/Fortaleza.
        Carbon::setTestNow('2026-11-06 01:00:00');
        $item = receita();

        $this->actingAs(usuario())
            ->patchJson('/api/painel/orcamento/receitas/'.$item->id, ['status' => 'pago'])
            ->assertOk()
            ->assertJsonPath('data.recebido_em', '2026-11-05');
    });

    test('pago guarda a data informada', function () {
        $item = receita();

        $this->actingAs(usuario())
            ->patchJson('/api/painel/orcamento/receitas/'.$item->id, ['status' => 'pago', 'recebido_em' => '2026-10-02'])
            ->assertJsonPath('data.recebido_em', '2026-10-02');
    });

    test('mudar outro campo de uma receita paga não apaga o recebimento', function () {
        $item = receita(['status' => 'pago', 'recebido_em' => '2026-10-02']);

        $this->actingAs(usuario())
            ->patchJson('/api/painel/orcamento/receitas/'.$item->id, ['cota' => 'Prata'])
            ->assertJsonPath('data.recebido_em', '2026-10-02');
    });

    test('sair de pago tira a data de recebimento', function () {
        $item = receita(['status' => 'pago', 'recebido_em' => '2026-10-02']);

        $this->actingAs(usuario())
            ->patchJson('/api/painel/orcamento/receitas/'.$item->id, ['status' => 'assinado'])
            ->assertJsonPath('data.recebido_em', null);
    });

    test('etapa fora do funil não passa', function () {
        $this->actingAs(usuario())
            ->patchJson('/api/painel/orcamento/receitas/'.receita()->id, ['status' => 'talvez'])
            ->assertJsonValidationErrors('status');
    });

    test('apagar remove o lançamento e o anexo', function () {
        Storage::fake('s3');
        $item = receita();
        $item->guardaAnexo(UploadedFile::fake()->create('contrato.pdf', 10, 'application/pdf'));
        $caminho = $item->anexo_caminho;

        $this->actingAs(usuario())->deleteJson('/api/painel/orcamento/receitas/'.$item->id)->assertOk();

        expect(Receita::query()->find($item->id))->toBeNull();
        Storage::disk('s3')->assertMissing((string) $caminho);
    });
});

describe('lista de espera no funil', function () {
    beforeEach(function () {
        $this->inscricao = WaitlistEntry::factory()->create([
            'tipo'  => 'patrocinador',
            'nome'  => 'Fulana de Tal',
            'email' => 'fulana@ex.com',
            'dados' => ['empresa' => 'Oeste Digital', 'contato' => 'Fulana', 'cota' => 'Ouro'],
        ]);
    });

    test('financeiro recebe empresa e cota, sem contato', function () {
        $resposta = $this->actingAs(usuario('financeiro'))->getJson('/api/painel/orcamento/2027/lista-de-espera')->assertOk();

        expect($resposta->json('data.0'))->toBe(['id' => $this->inscricao->id, 'empresa' => 'Oeste Digital', 'cota' => 'Ouro', 'etapa' => null])
            ->and($resposta->getContent())->not->toContain('fulana@ex.com');
    });

    test('quem já está no funil vem com a etapa', function () {
        receita(['waitlist_entry_id' => $this->inscricao->id, 'status' => 'negociacao']);

        $this->actingAs(usuario())->getJson('/api/painel/orcamento/2027/lista-de-espera')
            ->assertJsonPath('data.0.etapa', 'negociacao');
    });

    test('a mesma inscrição não entra duas vezes na mesma edição', function () {
        $corpo = ['waitlist_entry_id' => $this->inscricao->id, 'patrocinador' => 'Oeste Digital', 'cota' => 'Ouro', 'valor_centavos' => 500_000];

        $this->actingAs(usuario());
        $this->postJson('/api/painel/orcamento/2027/receitas', $corpo)->assertCreated();
        $this->postJson('/api/painel/orcamento/2027/receitas', $corpo)->assertJsonValidationErrors('waitlist_entry_id');
    });

    test('só inscrição de patrocinador entra', function () {
        $participante = WaitlistEntry::factory()->create(['tipo' => 'participante']);

        $this->actingAs(usuario())
            ->postJson('/api/painel/orcamento/2027/receitas', ['waitlist_entry_id' => $participante->id, 'patrocinador' => 'X', 'cota' => 'Ouro', 'valor_centavos' => 1])
            ->assertJsonValidationErrors('waitlist_entry_id');
    });

    test('edição passada e titular anonimizado não aparecem', function () {
        $this->actingAs(usuario());

        $this->getJson('/api/painel/orcamento/2026/lista-de-espera')->assertJsonCount(0, 'data');

        $this->inscricao->update(['anonimizado_em' => now()]);
        $this->getJson('/api/painel/orcamento/2027/lista-de-espera')->assertJsonCount(0, 'data');
    });
});

describe('despesas', function () {
    test('a lista traz as categorias válidas', function () {
        despesa();

        $this->actingAs(usuario('financeiro'))->getJson('/api/painel/orcamento/2027/despesas')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('categorias', Despesa::CATEGORIAS);
    });

    test('categoria fora da lista não passa', function () {
        $this->actingAs(usuario())
            ->postJson('/api/painel/orcamento/2027/despesas', ['categoria' => 'Festa', 'descricao' => 'x', 'orcado_centavos' => 1])
            ->assertJsonValidationErrors('categoria');
    });

    test('vencida é compromisso em aberto com data passada', function (string $status, string $vencimento, bool $vencida) {
        despesa(['status' => $status, 'vencimento' => $vencimento]);

        $this->actingAs(usuario())->getJson('/api/painel/orcamento/2027/despesas')
            ->assertJsonPath('data.0.vencida', $vencida);
    })->with([
        'comprometida e passada' => ['comprometido', '2026-11-04', true],
        'vence hoje'             => ['comprometido', '2026-11-05', false],
        'paga e passada'         => ['pago', '2026-11-04', false],
        'planejada e passada'    => ['planejado', '2026-11-04', false],
    ]);

    test('o lote cria tudo ou nada', function () {
        $this->actingAs(usuario());

        $this->postJson('/api/painel/orcamento/2027/despesas/lote', ['linhas' => [
            ['categoria' => 'Espaço', 'descricao' => 'Local', 'orcado_centavos' => 100],
            ['categoria' => 'Festa', 'descricao' => 'Inválida', 'orcado_centavos' => 100],
        ]])->assertJsonValidationErrors('linhas.1.categoria');

        expect(Despesa::query()->count())->toBe(0);

        $this->postJson('/api/painel/orcamento/2027/despesas/lote', ['linhas' => [
            ['categoria' => 'Espaço', 'descricao' => 'Local', 'orcado_centavos' => 100],
            ['categoria' => 'Taxas', 'descricao' => 'Banco', 'orcado_centavos' => 200],
        ]])->assertCreated()->assertJsonPath('criadas', 2);

        expect(Despesa::query()->where('status', 'planejado')->count())->toBe(2);
    });
});

describe('anexos', function () {
    beforeEach(fn () => Storage::fake('s3'));

    test('o arquivo vai para o S3, e nada fica no disco do servidor', function () {
        Storage::fake('local');
        Storage::fake('public');

        $this->actingAs(usuario())->post('/api/painel/orcamento/receitas/'.receita()->id.'/anexo', [
            'arquivo' => UploadedFile::fake()->create('c.pdf', 1, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertOk();

        expect(Storage::disk('s3')->allFiles('orcamento'))->toHaveCount(1)
            ->and(Storage::disk('local')->allFiles())->toBe([])
            ->and(Storage::disk('public')->allFiles())->toBe([]);
    });

    test('se o bucket recusar, é erro e o lançamento segue sem anexo', function () {
        $falha = Mockery::mock(UploadedFile::class);
        $falha->shouldReceive('store')->andReturn(false);
        $item = receita();

        expect(fn () => $item->guardaAnexo($falha))->toThrow(HttpException::class)
            ->and($item->fresh()?->anexo_caminho)->toBeNull();
    });

    test('sobe PDF para o bucket e baixa com o nome original', function () {
        $item = despesa();

        $this->actingAs(usuario('financeiro'));
        $this->post('/api/painel/orcamento/despesas/'.$item->id.'/anexo', [
            'arquivo' => UploadedFile::fake()->create('contrato espaço.pdf', 100, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertOk()->assertJsonPath('data.anexo_nome', 'contrato espaço.pdf');

        $item->refresh();
        Storage::disk('s3')->assertExists((string) $item->anexo_caminho);

        $this->get('/api/painel/orcamento/despesas/'.$item->id.'/anexo')
            ->assertOk()
            // O cabeçalho leva a versão ASCII em `filename` e a original em `filename*`.
            ->assertDownload('contrato espaco.pdf');
    });

    test('a api devolve o link público do anexo', function () {
        Storage::fake('s3', ['url' => 'https://arquivos.test']);
        $item = receita();
        $item->guardaAnexo(UploadedFile::fake()->create('c.pdf', 1, 'application/pdf'));

        $resposta = $this->actingAs(usuario())->getJson('/api/painel/orcamento/2027/receitas');

        expect($resposta->json('data.0'))->not->toHaveKey('anexo_caminho')
            ->and($resposta->json('data.0.anexo_nome'))->toBe('c.pdf')
            ->and($resposta->json('data.0.anexo_url'))->toBe('https://arquivos.test/'.$item->anexo_caminho);
    });

    test('aceita PDF de exatos 20 MB', function () {
        $this->actingAs(usuario())
            ->post('/api/painel/orcamento/receitas/'.receita()->id.'/anexo', [
                'arquivo' => UploadedFile::fake()->create('grande.pdf', 20480, 'application/pdf'),
            ], ['Accept' => 'application/json'])
            ->assertOk();
    });

    test('só PDF de até 20 MB', function (UploadedFile $arquivo) {
        $this->actingAs(usuario())
            ->post('/api/painel/orcamento/receitas/'.receita()->id.'/anexo', ['arquivo' => $arquivo], ['Accept' => 'application/json'])
            ->assertJsonValidationErrors('arquivo');
    })->with([
        'imagem'     => fn () => UploadedFile::fake()->create('foto.png', 1, 'image/png'),
        'html'       => fn () => UploadedFile::fake()->create('x.pdf', 1, 'text/html'),
        'muito peso' => fn () => UploadedFile::fake()->create('grande.pdf', 20481, 'application/pdf'),
    ]);

    test('o anexo novo substitui o antigo', function () {
        $item = receita();
        $item->guardaAnexo(UploadedFile::fake()->create('a.pdf', 1, 'application/pdf'));
        $antigo = (string) $item->anexo_caminho;

        $item->guardaAnexo(UploadedFile::fake()->create('b.pdf', 1, 'application/pdf'));

        Storage::disk('s3')->assertMissing($antigo);
        expect($item->anexo_nome)->toBe('b.pdf');
    });

    test('remover apaga o arquivo; sem anexo, baixar é 404', function () {
        $item = receita();
        $item->guardaAnexo(UploadedFile::fake()->create('a.pdf', 1, 'application/pdf'));
        $caminho = (string) $item->anexo_caminho;

        $this->actingAs(usuario());
        $this->deleteJson('/api/painel/orcamento/receitas/'.$item->id.'/anexo')->assertOk()
            ->assertJsonPath('data.anexo_nome', null)
            ->assertJsonPath('data.anexo_url', null);

        Storage::disk('s3')->assertMissing($caminho);
        $this->get('/api/painel/orcamento/receitas/'.$item->id.'/anexo')->assertNotFound();
    });

    test('o comercial não baixa anexo de despesa', function () {
        $item = despesa();
        $item->guardaAnexo(UploadedFile::fake()->create('a.pdf', 1, 'application/pdf'));

        $this->actingAs(usuario('comercial'))->get('/api/painel/orcamento/despesas/'.$item->id.'/anexo')->assertForbidden();
    });
});

describe('resumo', function () {
    test('soma receita por etapa e despesa por situação', function () {
        receita(['status' => 'prospeccao', 'valor_centavos' => 100_000]);
        receita(['status' => 'assinado', 'valor_centavos' => 200_000]);
        receita(['status' => 'pago', 'valor_centavos' => 400_000, 'recebido_em' => '2026-10-02']);
        despesa(['status' => 'planejado', 'orcado_centavos' => 50_000]);
        despesa(['status' => 'comprometido', 'orcado_centavos' => 90_000, 'realizado_centavos' => 108_000]);
        despesa(['status' => 'pago', 'orcado_centavos' => 30_000, 'realizado_centavos' => 14_500, 'vencimento' => '2026-11-01']);

        $this->actingAs(usuario('financeiro'))->getJson('/api/painel/orcamento/2027/resumo')
            ->assertOk()
            ->assertJsonPath('receita_prevista', 700_000)
            ->assertJsonPath('receita_contratada', 600_000)
            ->assertJsonPath('receita_recebida', 400_000)
            ->assertJsonPath('despesa_orcada', 170_000)
            ->assertJsonPath('despesa_comprometida', 122_500)
            ->assertJsonPath('despesa_paga', 14_500)
            ->assertJsonPath('saldo_projetado', 430_000)
            ->assertJsonPath('margem', 0.7167)
            ->assertJsonPath('caixa', 385_500);
    });

    test('comprometido sem valor fechado conta pelo orçado', function () {
        despesa(['status' => 'comprometido', 'orcado_centavos' => 90_000]);

        $this->actingAs(usuario())->getJson('/api/painel/orcamento/2027/resumo')
            ->assertJsonPath('despesa_comprometida', 90_000)
            ->assertJsonPath('categorias.0.comprometido', 90_000);
    });

    test('edição vazia não divide por zero', function () {
        $this->actingAs(usuario())->getJson('/api/painel/orcamento/2027/resumo')
            ->assertOk()
            ->assertJsonPath('margem', null)
            ->assertJsonPath('evolucao.meses', [])
            ->assertJsonPath('categorias', []);
    });

    test('saldo negativo sai negativo', function () {
        despesa(['orcado_centavos' => 100]);

        $this->actingAs(usuario())->getJson('/api/painel/orcamento/2027/resumo')
            ->assertJsonPath('saldo_projetado', -100);
    });

    test('a evolução acumula o realizado até hoje e o previsto daí em diante', function () {
        receita(['status' => 'pago', 'valor_centavos' => 100, 'recebido_em' => '2026-10-02']);
        receita(['status' => 'assinado', 'valor_centavos' => 200, 'pagamento_previsto' => '2027-01-15']);
        // Atrasada: previsão passada ainda vai acontecer, então cai no mês corrente.
        receita(['status' => 'negociacao', 'valor_centavos' => 50, 'pagamento_previsto' => '2026-09-01']);
        despesa(['status' => 'pago', 'orcado_centavos' => 10, 'vencimento' => '2026-11-01']);
        despesa(['status' => 'planejado', 'orcado_centavos' => 30, 'vencimento' => '2026-12-10']);
        despesa(['status' => 'planejado', 'orcado_centavos' => 999]); // sem data: fora do gráfico.

        $evolucao = $this->actingAs(usuario())->getJson('/api/painel/orcamento/2027/resumo')->json('evolucao');

        expect($evolucao['meses'])->toBe(['2026-10', '2026-11', '2026-12', '2027-01'])
            ->and($evolucao['indice_hoje'])->toBe(1)
            ->and($evolucao['receita'])->toBe([100, 100, null, null])
            ->and($evolucao['receita_prevista'])->toBe([null, 150, 150, 350])
            ->and($evolucao['despesa'])->toBe([0, 10, null, null])
            ->and($evolucao['despesa_prevista'])->toBe([null, 10, 40, 40]);
    });

    test('a edição encerrada não estica o gráfico até hoje', function () {
        receita(['status' => 'pago', 'valor_centavos' => 100, 'recebido_em' => '2026-08-02'], 2026);

        $evolucao = $this->actingAs(usuario())->getJson('/api/painel/orcamento/2026/resumo')->json('evolucao');

        expect($evolucao['meses'])->toBe(['2026-08'])->and($evolucao['indice_hoje'])->toBe(0);
    });

    test('compara com a edição anterior no mesmo ponto do ciclo', function () {
        receita(['status' => 'pago', 'valor_centavos' => 100, 'recebido_em' => '2025-11-05'], 2026);
        receita(['status' => 'pago', 'valor_centavos' => 200, 'recebido_em' => '2026-03-01'], 2026);
        despesa(['categoria' => 'Espaço', 'status' => 'pago', 'orcado_centavos' => 70, 'realizado_centavos' => 60, 'vencimento' => '2026-01-10'], 2026);
        despesa(['categoria' => 'Taxas', 'status' => 'planejado', 'orcado_centavos' => 40], 2026);

        $anterior = $this->actingAs(usuario())->getJson('/api/painel/orcamento/2027/resumo')->json('anterior');

        expect($anterior['ano'])->toBe(2026)
            ->and($anterior['orcado'])->toBe(110)
            ->and($anterior['receita_recebida'])->toBe(300)
            ->and($anterior['despesa_paga'])->toBe(60)
            ->and($anterior['ate_esta_data'])->toBe(['data' => '2025-11-05', 'receita' => 100, 'despesa' => 0])
            // Base da cópia: o que custou; sem custo ainda, o que foi orçado.
            ->and($anterior['por_categoria'])->toBe(['Espaço' => 60, 'Taxas' => 40]);
    });

    test('edição anterior só conta quando tem lançamento', function () {
        receita(['status' => 'pago', 'valor_centavos' => 100, 'recebido_em' => '2025-08-01'], 2025);

        $this->actingAs(usuario())->getJson('/api/painel/orcamento/2026/resumo')->assertJsonPath('anterior.ano', 2025);
    });

    test('a primeira edição não tem anterior', function () {
        $this->actingAs(usuario())->getJson('/api/painel/orcamento/2026/resumo')->assertJsonPath('anterior', null);
    });
});

test('o navegador pode editar um lançamento: o preflight libera PATCH', function () {
    $this->withHeaders([
        'Origin'                        => 'http://localhost:5173',
        'Access-Control-Request-Method' => 'PATCH',
    ])->options('/api/painel/orcamento/receitas/1')
        ->assertNoContent()
        ->assertHeader('Access-Control-Allow-Methods', implode(', ', ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']));
});

test('o histórico da LGPD não mistura lançamento do orçamento', function () {
    $quem = usuario();

    $this->actingAs($quem)->postJson('/api/painel/orcamento/2027/receitas', ['patrocinador' => 'X', 'cota' => 'Ouro', 'valor_centavos' => 1])->assertCreated();
    Auditoria::query()->create(['user_id' => $quem->id, 'acao' => 'lgpd.consulta', 'alvo' => 'a@b.com', 'ip' => '127.0.0.1']);

    $this->getJson('/api/painel/auditorias')
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.acao', 'lgpd.consulta');
});
