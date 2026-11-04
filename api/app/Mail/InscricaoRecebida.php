<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\WaitlistEntry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Confirmação para quem se inscreveu. */
class InscricaoRecebida extends Mailable implements ShouldQueue
{
    use Queueable;
    use SerializesModels;

    public int $tries = 3;

    public function __construct(public WaitlistEntry $entry)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Recebemos sua inscrição — Sertão Tech 2027');
    }

    public function content(): Content
    {
        return new Content(text: 'mail.inscricao-recebida');
    }
}
