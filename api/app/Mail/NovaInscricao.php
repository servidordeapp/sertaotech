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

/** Aviso para um administrador; um e-mail (e um job) por administrador. */
class NovaInscricao extends Mailable implements ShouldQueue
{
    use Queueable;
    use SerializesModels;

    public int $tries = 3;

    public function __construct(public WaitlistEntry $entry)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Nova inscrição na lista de espera ({$this->entry->tipo})");
    }

    public function content(): Content
    {
        return new Content(text: 'mail.nova-inscricao');
    }
}
