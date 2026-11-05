<?php

declare(strict_types=1);

use App\Http\Controllers\Painel\InscricoesController;
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

        // Antes de `inscricoes/{id}`, que ainda virá: /export casaria com {id}.
        Route::get('inscricoes/export', [InscricoesController::class, 'export']);
        Route::get('inscricoes', [InscricoesController::class, 'index']);
    });
});
