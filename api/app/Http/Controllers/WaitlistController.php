<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\WaitlistEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class WaitlistController extends Controller
{
    private const WHATSAPP = ['required', 'string', 'regex:/^\D*(\d\D*){10,11}$/'];

    public function store(Request $request, string $tipo): JsonResponse
    {
        abort_unless(in_array($tipo, WaitlistEntry::TIPOS, true), 404);

        $campos = $request->validate([
            'email'       => ['required', 'email:rfc', 'max:254'],
            'whatsapp'    => self::WHATSAPP,
            'lgpd'        => ['accepted'],
            'lgpd_versao' => ['required', Rule::in([WaitlistEntry::LGPD_VERSAO])],
            ...$this->regras($tipo),
        ]);

        // Compartilhamento é opcional e só existe no participante. Desmarcado não pode barrar o envio.
        $compartilha = $tipo === 'participante'
            && $request->boolean('compartilhamento')
            && $request->input('compartilhamento_versao') === WaitlistEntry::COMPARTILHAMENTO_VERSAO;

        $nome  = $campos['nome'] ?? $campos['contato'];
        $dados = collect($campos)->except(['email', 'whatsapp', 'nome', 'lgpd', 'lgpd_versao'])->all();

        // Reenvio atualiza em vez de duplicar, e a resposta é a mesma: não revela se o e-mail já estava na lista.
        WaitlistEntry::updateOrCreate(
            ['tipo' => $tipo, 'email' => mb_strtolower($campos['email'])],
            [
                'nome'                       => $nome,
                'whatsapp'                   => preg_replace('/\D/', '', $campos['whatsapp']),
                'dados'                      => $dados,
                'lgpd_versao'                => WaitlistEntry::LGPD_VERSAO,
                'lgpd_aceito_em'             => now(),
                'compartilhamento_versao'    => $compartilha ? WaitlistEntry::COMPARTILHAMENTO_VERSAO : null,
                'compartilhamento_aceito_em' => $compartilha ? now() : null,
            ],
        );

        return response()->json(['ok' => true], 201);
    }

    /** @return array<string, list<mixed>> */
    private function regras(string $tipo): array
    {
        return match ($tipo) {
            'participante' => [
                'nome'                    => ['required', 'string', 'max:120'],
                'cidade'                  => ['required', 'string', 'max:120'],
                'perfil'                  => ['required', Rule::in(['Estudante', 'Profissional de tecnologia', 'Migrando de carreira', 'Curioso(a)'])],
                'compartilhamento'        => ['sometimes', 'boolean'],
                'compartilhamento_versao' => ['sometimes', 'string', 'max:40'],
            ],
            'palestrante' => [
                'nome'          => ['required', 'string', 'max:120'],
                'tema'          => ['required', 'string', 'max:2000'],
                'perfil_online' => ['nullable', 'url:http,https', 'max:300'],
                'experiencia'   => ['required', Rule::in(['Nunca palestrei', 'Já palestrei em eventos menores', 'Já palestrei em eventos grandes'])],
            ],
            default => [
                'empresa' => ['required', 'string', 'max:160'],
                'contato' => ['required', 'string', 'max:120'],
                'cota'    => ['required', Rule::in(['Ouro', 'Prata', 'Bronze', 'Apoio (espaço, coffee break, brindes)', 'Ainda não sei'])],
            ],
        };
    }
}
