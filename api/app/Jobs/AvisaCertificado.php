<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\CertificadoDisponivel;
use App\Models\Certificado;
use App\Models\Edicao;
use DateTimeInterface;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Um aviso de `avisos_certificado`. Marca `enviado_em` antes de enviar, com
 * UPDATE ... WHERE enviado_em IS NULL: retentativa ou job duplicado encontram
 * a marca e saem sem reenviar. Se o envio falhar, desmarca e deixa a fila
 * tentar de novo.
 *
 * Limites conhecidos: processo morto entre marcar e enviar deixa a pessoa sem
 * e-mail (aparece no cruzamento com `emails_enviados`); timeout depois de o
 * provedor aceitar pode duplicar, raro.
 */
class AvisaCertificado implements ShouldQueue
{
    use Queueable;

    /** Release do rate limit conta como tentativa: quem limita a retentativa é o retryUntil, como em InscricaoRecebida. */
    public int $maxExceptions = 3;

    public function __construct(public int $avisoId)
    {
    }

    /**
     * O limitador dos certificados vem primeiro: se ele segurar o job, o do
     * `smtp` nem é tocado, e a cota da lista de espera fica intacta.
     *
     * @return list<object>
     */
    public function middleware(): array
    {
        return [new RateLimited('certificados'), new RateLimited('smtp')];
    }

    public function retryUntil(): DateTimeInterface
    {
        return now()->addDays(7);
    }

    public function handle(): void
    {
        $avisos = DB::table('avisos_certificado')->where('id', $this->avisoId);

        $marcou = (clone $avisos)->whereNull('enviado_em')->update(['enviado_em' => now(), 'updated_at' => now()]);
        if ($marcou === 0) {
            return;
        }

        try {
            /** @var object{edicao_id: int, email: string} $aviso */
            $aviso = (clone $avisos)->first();

            $certificados = Certificado::query()
                ->where('edicao_id', $aviso->edicao_id)
                ->where('email', $aviso->email)
                ->whereNotNull('emitido_em')
                ->whereNull('revogado_em')
                ->orderBy('nome')
                ->orderBy('id')
                ->get();

            // Revogado entre o disparo e o envio: não há o que avisar, e a marca fica.
            if ($certificados->isEmpty()) {
                return;
            }

            Mail::to($aviso->email)->send(new CertificadoDisponivel(Edicao::query()->findOrFail($aviso->edicao_id), $certificados));
        } catch (Throwable $e) {
            (clone $avisos)->update(['enviado_em' => null, 'updated_at' => now()]);

            throw $e;
        }
    }
}
