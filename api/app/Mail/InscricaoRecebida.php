<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\WaitlistEntry;
use DateTimeInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Queue\SerializesModels;

/** Confirmação para quem se inscreveu. */
class InscricaoRecebida extends Mailable implements ShouldQueue
{
    use Queueable;
    use SerializesModels;

    /** Completa "lista de espera ..." no texto. */
    private const LISTAS = [
        'participante' => 'de participantes',
        'palestrante'  => 'de palestrantes',
        'patrocinador' => 'de patrocinadores',
    ];

    /** Release do rate limit conta como tentativa, então quem limita a retentativa é o retryUntil; $tries não serve aqui. */
    public int $maxExceptions = 3;

    public function __construct(public WaitlistEntry $entry)
    {
    }

    /** @return list<object> */
    public function middleware(): array
    {
        return [new RateLimited('smtp')];
    }

    public function retryUntil(): DateTimeInterface
    {
        return now()->addDays(7);
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Recebemos sua inscrição — Sertão Tech 2027');
    }

    public function content(): Content
    {
        return new Content(
            html: 'mail.inscricao-recebida',
            text: 'mail.inscricao-recebida-texto',
            with: ['lista' => self::LISTAS[$this->entry->tipo] ?? 'do evento'],
        );
    }
}
