<?php

declare(strict_types=1);

namespace App\Http\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Models\Auditoria;
use App\Models\WaitlistEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Atendimento dos direitos do titular (LGPD art. 18): ver tudo que temos de
 * uma pessoa e apagar. Toda passagem por aqui vira linha em `auditorias` —
 * dado pessoal que alguém olha sem deixar rastro não tem como ser auditado.
 */
class LgpdController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $email = $this->email($request);

        Auditoria::registra($request, 'lgpd.consulta', $email);

        return response()->json([
            'email'      => $email,
            'inscricoes' => WaitlistEntry::query()->where('email', $email)->get(),
            // O registro de envio guarda o destinatário como texto, então a
            // busca é por conteúdo: um envio pode ter ido para mais de um.
            'emails' => DB::table('emails_enviados')
                ->where('para', 'like', '%'.$email.'%')
                ->orderByDesc('enviado_em')
                ->get(),
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $email = $this->email($request);

        $resultado = DB::transaction(function () use ($email): array {
            $inscricoes = WaitlistEntry::query()->where('email', $email)->get();

            foreach ($inscricoes as $inscricao) {
                $inscricao->update([
                    'nome' => WaitlistEntry::ANONIMO,
                    // O índice único é (tipo, email): sem o id no meio, a
                    // segunda inscrição da mesma pessoa colidiria com a primeira.
                    'email'    => sprintf('%s+%d@anonimizado.invalid', WaitlistEntry::ANONIMO, $inscricao->id),
                    'whatsapp' => '',
                    // cidade, tema, empresa — tudo que descreve a pessoa sai.
                    'dados'          => [],
                    'anonimizado_em' => now(),
                    // lgpd_versao e lgpd_aceito_em ficam: são a prova de que o
                    // consentimento existiu, e é a nós que cabe prová-lo.
                ]);
            }

            // O log de envio não some — ele é a prova do que foi enviado e
            // quando. O endereço vira hash: dá para confirmar um envio quando
            // a pessoa apresenta o próprio e-mail, mas o endereço não fica
            // mais legível aqui.
            $emails = DB::table('emails_enviados')
                ->where('para', 'like', '%'.$email.'%')
                ->update(['para' => 'sha256:'.hash('sha256', $email)]);

            return ['inscricoes' => $inscricoes->count(), 'emails' => $emails];
        });

        Auditoria::registra($request, 'lgpd.anonimizacao', $email);

        return response()->json($resultado);
    }

    private function email(Request $request): string
    {
        $request->validate(['email' => ['required', 'email:rfc', 'max:254']]);

        return $request->string('email')->lower()->toString();
    }
}
