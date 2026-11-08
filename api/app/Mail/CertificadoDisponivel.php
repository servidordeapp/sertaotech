<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Certificado;
use App\Models\Edicao;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Collection;

/**
 * Um e-mail por endereço, com um botão por certificado: o mesmo e-mail pode
 * ter certificado de participante e de palestrante, ou de duas pessoas que
 * compraram ingresso com o mesmo endereço.
 *
 * Não é ShouldQueue de propósito: quem enfileira e garante o envio único é o
 * AvisaCertificado, e um Mailable enfileirável iria para a fila de novo.
 */
class CertificadoDisponivel extends Mailable
{
    public const TIPOS = [
        'participante' => 'participação',
        'palestrante'  => 'palestrante',
        'ministrante'  => 'ministrante',
        'organizacao'  => 'organização',
    ];

    /** @param  Collection<int, Certificado>  $certificados */
    public function __construct(public Edicao $edicao, public Collection $certificados)
    {
    }

    public function envelope(): Envelope
    {
        $assunto = $this->certificados->count() > 1
            ? 'Seus certificados do Sertão Tech %d estão disponíveis'
            : 'Seu certificado do Sertão Tech %d está disponível';

        return new Envelope(subject: sprintf($assunto, $this->edicao->ano));
    }

    public function content(): Content
    {
        /** @var Collection<int, string> $nomes */
        $nomes = $this->certificados->pluck('nome')->unique();

        return new Content(
            html: 'mail.certificado-disponivel',
            text: 'mail.certificado-disponivel-texto',
            with: [
                // Nomes diferentes no mesmo e-mail: a saudação não escolhe um.
                'saudacao' => $nomes->count() === 1 ? 'Olá, '.$nomes->first().'!' : 'Olá!',
                'numero'   => config('certificados.edicoes.'.$this->edicao->ano.'.edicao'),
                'botoes'   => $this->certificados->map(fn (Certificado $certificado): array => [
                    'rotulo' => 'Certificado de '.self::TIPOS[$certificado->tipo]
                        .($nomes->count() > 1 ? ' — '.$certificado->nome : ''),
                    'url' => config()->string('certificados.url_pagina').'?codigo='.$certificado->codigo,
                ])->values()->all(),
            ],
        );
    }
}
