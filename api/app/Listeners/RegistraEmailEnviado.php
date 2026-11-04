<?php

declare(strict_types=1);

namespace App\Listeners;

use Illuminate\Mail\Events\MessageSent;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Mime\Address;
use Throwable;

/** Guarda em `emails_enviados` todo e-mail que o provedor aceitou. */
class RegistraEmailEnviado
{
    public function handle(MessageSent $event): void
    {
        // O e-mail já saiu. Falha de registro não pode derrubar o job: o worker
        // retentaria e a pessoa receberia o mesmo e-mail de novo.
        try {
            DB::table('emails_enviados')->insert([
                'para' => implode(', ', array_map(
                    fn (Address $destinatario): string => $destinatario->getAddress(),
                    $event->message->getTo(),
                )),
                'assunto'    => (string) $event->message->getSubject(),
                'mailable'   => $event->data['__laravel_mailable'] ?? null,
                'message_id' => $event->sent->getMessageId(),
                'enviado_em' => now(),
            ]);
        } catch (Throwable $e) {
            report($e);
        }
    }
}
