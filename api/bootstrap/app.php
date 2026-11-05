<?php

declare(strict_types=1);

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Sentry\Laravel\Integration;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Liga sessão + CSRF nas rotas de api para as origens de
        // SANCTUM_STATEFUL_DOMAINS (o painel). O site público não está na
        // lista, então o POST da lista de espera segue sem sessão, como antes.
        $middleware->statefulApi();

        // Sem sessão a resposta é 401. O padrão do Laravel é redirecionar para
        // `route('login')`, que não existe aqui: virava 500 em vez de 401.
        $middleware->redirectGuestsTo(null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        Integration::handles($exceptions);

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
