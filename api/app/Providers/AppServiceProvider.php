<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('smtp', fn () => Limit::perDay(config()->integer('mail.limite_diario')));

        // Login do painel: a chave é e-mail + IP. Só IP juntaria todo mundo
        // atrás de um NAT; só e-mail deixaria qualquer um trancar a conta
        // alheia tentando senha errada cinco vezes.
        RateLimiter::for('login-painel', fn (Request $request) => Limit::perMinute(5)->by(
            Str::lower($request->string('email')->toString()).'|'.$request->ip(),
        ));
    }
}
