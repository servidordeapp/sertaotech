<?php

declare(strict_types=1);

namespace App\Http\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Login do painel por sessão (Sanctum em modo SPA): o navegador guarda o
 * cookie, não há token no JavaScript. `painel.osertaotech.com.br` e
 * `api.osertaotech.com.br` são o mesmo domínio registrável, então o cookie
 * cruza os dois com SESSION_DOMAIN=.osertaotech.com.br.
 */
class SessaoController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($request->only('email', 'password'))) {
            // Mensagem única para e-mail inexistente e senha errada: não conta
            // a quem tentar se aquele e-mail tem conta no painel.
            throw ValidationException::withMessages(['email' => __('auth.failed')]);
        }

        // Troca o ID da sessão depois do login, contra fixation.
        $request->session()->regenerate();

        return response()->json($this->usuario($request));
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($this->usuario($request));
    }

    public function destroy(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['ok' => true]);
    }

    /** @return array<string, mixed> */
    private function usuario(Request $request): array
    {
        /** @var User $usuario */
        $usuario = $request->user();

        return [
            'nome'           => $usuario->name,
            'email'          => $usuario->email,
            'papel'          => $usuario->papel,
            'tipos_visiveis' => $usuario->tiposVisiveis(),
        ];
    }
}
