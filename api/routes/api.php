<?php

declare(strict_types=1);

use App\Http\Controllers\WaitlistController;
use Illuminate\Support\Facades\Route;

Route::post('lista-de-espera/{tipo}', [WaitlistController::class, 'store'])
    ->middleware('throttle:10,1');
