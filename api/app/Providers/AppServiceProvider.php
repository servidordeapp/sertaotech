<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
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
        // E-mail, LGPD e auditoria são do evento inteiro, não do recorte de um
        // tipo de inscrição: só admin.
        Gate::define('painel-admin', fn (User $usuario): bool => $usuario->ehAdmin());

        // Financeiro mexe em valor e não vê dado pessoal de inscrito.
        Gate::define('painel-inscricoes', fn (User $usuario): bool => $usuario->tiposVisiveis() !== []);

        // Saldo, margem e despesa ficam com quem cuida do dinheiro.
        Gate::define('painel-orcamento', fn (User $usuario): bool => in_array($usuario->papel, ['admin', 'financeiro'], true));

        // O comercial toca o funil: o valor da cota já é público no kit de patrocínio.
        Gate::define('painel-receitas', fn (User $usuario): bool => in_array($usuario->papel, ['admin', 'financeiro', 'comercial'], true));

        // Feedback fica com quem cuida do patrocinador. Depoimento pode trazer nome e cargo.
        Gate::define('painel-feedbacks', fn (User $usuario): bool => in_array('patrocinador', $usuario->tiposVisiveis(), true));

        RateLimiter::for('smtp', fn () => Limit::perDay(config()->integer('mail.limite_diario')));

        // Login do painel: a chave é e-mail + IP. Só IP juntaria todo mundo
        // atrás de um NAT; só e-mail deixaria qualquer um trancar a conta
        // alheia tentando senha errada cinco vezes.
        RateLimiter::for('login-painel', fn (Request $request) => Limit::perMinute(5)->by(
            Str::lower($request->string('email')->toString()).'|'.$request->ip(),
        ));
    }
}
