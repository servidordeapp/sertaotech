<?php

declare(strict_types=1);

use App\Http\Controllers\Painel\AuditoriasController;
use App\Http\Controllers\Painel\DespesasController;
use App\Http\Controllers\Painel\EdicoesController;
use App\Http\Controllers\Painel\EmailsController;
use App\Http\Controllers\Painel\InscricoesController;
use App\Http\Controllers\Painel\LgpdController;
use App\Http\Controllers\Painel\MetricasController;
use App\Http\Controllers\Painel\ReceitasController;
use App\Http\Controllers\Painel\ResumoOrcamentoController;
use App\Http\Controllers\Painel\SessaoController;
use App\Http\Controllers\WaitlistController;
use Illuminate\Support\Facades\Route;

Route::post('lista-de-espera/{tipo}', [WaitlistController::class, 'store'])
    ->middleware('throttle:10,1');

/*
 * Painel (painel.osertaotech.com.br). Sessão por cookie, não token: quem
 * autentica é o navegador do time, e o JavaScript nunca vê credencial. O
 * `statefulApi()` em bootstrap/app.php é o que liga sessão e CSRF nestas rotas.
 */
Route::prefix('painel')->group(function (): void {
    Route::post('login', [SessaoController::class, 'store'])->middleware('throttle:login-painel');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('logout', [SessaoController::class, 'destroy']);
        Route::get('me', [SessaoController::class, 'me']);

        Route::get('edicoes', [EdicoesController::class, 'index']);

        Route::middleware('can:painel-inscricoes')->group(function (): void {
            // Antes de `inscricoes/{id}`, que ainda virá: /export casaria com {id}.
            Route::get('inscricoes/export', [InscricoesController::class, 'export']);
            Route::get('inscricoes', [InscricoesController::class, 'index']);

            Route::get('metricas', [MetricasController::class, 'index']);
        });

        Route::middleware('can:painel-receitas')->prefix('orcamento')->group(function (): void {
            Route::get('{edicao:ano}/receitas', [ReceitasController::class, 'index']);
            Route::post('{edicao:ano}/receitas', [ReceitasController::class, 'store']);
            Route::get('{edicao:ano}/lista-de-espera', [ReceitasController::class, 'listaDeEspera']);

            Route::patch('receitas/{receita}', [ReceitasController::class, 'update']);
            Route::delete('receitas/{receita}', [ReceitasController::class, 'destroy']);
            Route::post('receitas/{receita}/anexo', [ReceitasController::class, 'anexar']);
            Route::get('receitas/{receita}/anexo', [ReceitasController::class, 'baixarAnexo']);
            Route::delete('receitas/{receita}/anexo', [ReceitasController::class, 'removerAnexo']);
        });

        Route::middleware('can:painel-orcamento')->prefix('orcamento')->group(function (): void {
            Route::get('{edicao:ano}/resumo', [ResumoOrcamentoController::class, 'show']);

            Route::get('{edicao:ano}/despesas', [DespesasController::class, 'index']);
            Route::post('{edicao:ano}/despesas', [DespesasController::class, 'store']);
            Route::post('{edicao:ano}/despesas/lote', [DespesasController::class, 'lote']);

            Route::patch('despesas/{despesa}', [DespesasController::class, 'update']);
            Route::delete('despesas/{despesa}', [DespesasController::class, 'destroy']);
            Route::post('despesas/{despesa}/anexo', [DespesasController::class, 'anexar']);
            Route::get('despesas/{despesa}/anexo', [DespesasController::class, 'baixarAnexo']);
            Route::delete('despesas/{despesa}/anexo', [DespesasController::class, 'removerAnexo']);
        });

        Route::middleware('can:painel-admin')->group(function (): void {
            Route::get('emails', [EmailsController::class, 'index']);

            Route::get('lgpd', [LgpdController::class, 'show']);
            Route::delete('lgpd', [LgpdController::class, 'destroy']);

            Route::get('auditorias', [AuditoriasController::class, 'index']);
        });
    });
});
