<?php

declare(strict_types=1);

namespace App\Http\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Models\Auditoria;
use App\Models\Certificado;
use App\Models\Participante;
use App\Models\WaitlistEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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
            'email'         => $email,
            'inscricoes'    => WaitlistEntry::query()->where('email', $email)->get(),
            'participantes' => Participante::query()->where('email', $email)->get(),
            // A tela avisa antes de excluir: o certificado emitido sai da página
            // de validação, e a pessoa precisa guardar o PDF.
            'certificados' => Certificado::query()->with('edicao')->where('email', $email)->orderBy('id')->get()
                ->map(fn (Certificado $certificado): array => [
                    'id'       => $certificado->id,
                    'ano'      => $certificado->edicao->ano,
                    'tipo'     => $certificado->tipo,
                    'codigo'   => $certificado->codigo,
                    'situacao' => $certificado->situacao(),
                ]),
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

        $pdfs = [];

        $resultado = DB::transaction(function () use ($email, &$pdfs): array {
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

            $participantes = Participante::query()->where('email', $email)->get();

            foreach ($participantes as $participante) {
                $marca = sprintf('%s+%d', WaitlistEntry::ANONIMO, $participante->id);

                $participante->update([
                    'nome'     => WaitlistEntry::ANONIMO,
                    'email'    => $marca.'@anonimizado.invalid',
                    'telefone' => null,
                    // Ingresso e pedido levam à pessoa na plataforma de venda.
                    'ingresso' => $marca,
                    'pedido'   => WaitlistEntry::ANONIMO,
                    // Edição, cupom e presença ficam: sem identificar ninguém,
                    // mantêm os totais do evento de pé.
                    'anonimizado_em' => now(),
                ]);
            }

            // Rascunho ainda não é documento: sai inteiro. Emitido é cancelado:
            // nome, e-mail e PDF saem; código e hash ficam, sem dado pessoal, e o
            // validador responde "cancelado a pedido do titular".
            $certificados = Certificado::query()->where('email', $email)->get();

            foreach ($certificados as $certificado) {
                if ($certificado->emitido_em === null) {
                    $certificado->delete();

                    continue;
                }

                if ($certificado->anonimizado_em !== null) {
                    continue;
                }

                if ($certificado->pdf_caminho !== null) {
                    $pdfs[] = $certificado->pdf_caminho;
                }

                $certificado->update([
                    'nome'           => WaitlistEntry::ANONIMO,
                    'email'          => sprintf('%s+c%d@anonimizado.invalid', WaitlistEntry::ANONIMO, $certificado->id),
                    'pdf_caminho'    => null,
                    'anonimizado_em' => now(),
                ]);
            }

            // O aviso por e-mail fica, para o disparo não voltar a esta pessoa:
            // o endereço vira hash, como no log de envio.
            DB::table('avisos_certificado')->where('email', $email)->update(['email' => 'sha256:'.hash('sha256', $email)]);

            // O log de envio não some — ele é a prova do que foi enviado e
            // quando. O endereço vira hash: dá para confirmar um envio quando
            // a pessoa apresenta o próprio e-mail, mas o endereço não fica
            // mais legível aqui.
            $emails = DB::table('emails_enviados')
                ->where('para', 'like', '%'.$email.'%')
                ->update(['para' => 'sha256:'.hash('sha256', $email)]);

            return [
                'inscricoes'    => $inscricoes->count(),
                'participantes' => $participantes->count(),
                'certificados'  => $certificados->count(),
                'emails'        => $emails,
            ];
        });

        // Depois do commit: se o banco desfizesse, o PDF apagado não voltaria.
        Storage::disk('s3')->delete($pdfs);

        Auditoria::registra($request, 'lgpd.anonimizacao', $email);

        return response()->json($resultado);
    }

    private function email(Request $request): string
    {
        $request->validate(['email' => ['required', 'email:rfc', 'max:254']]);

        return $request->string('email')->lower()->toString();
    }
}
