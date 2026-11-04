<?php

declare(strict_types=1);

namespace App\Providers;

use App\Listeners\RegistraEmailEnviado;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Mail\Events\MessageSent;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

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

        Event::listen(MessageSent::class, RegistraEmailEnviado::class);
    }
}
