<?php

declare(strict_types=1);

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

/*
 * API-only: nao ha UI. A raiz responde JSON com o runtime e o convite para a
 * lista de espera — as inscricoes de 2026 estao encerradas, entao o link e o
 * mesmo CTA que o site usa hoje.
 */
Route::get('/', fn (): JsonResponse => response()->json([
    'service'   => config('app.name'),
    'message'   => 'Ei! Para de ficar olhando a API e vai se inscrever no evento. Bora aprender 🚀',
    'inscricao' => [
        'label' => 'Entrar na lista de espera do Sertão Tech 2027',
        'url'   => 'https://osertaotech.com.br/#lista-de-espera',
    ],
    'runtime' => [
        'php'     => PHP_VERSION,
        'laravel' => app()->version(),
    ],
], options: JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
