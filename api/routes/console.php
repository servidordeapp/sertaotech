<?php

declare(strict_types=1);

use App\Jobs\BackupBanco;
use App\Jobs\LimpaBackups;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
 * Hospedagem compartilhada não mantém processo vivo: o cron do cPanel chama
 * `schedule:run` a cada minuto, e daqui sai todo o resto. Linha do cPanel:
 *
 *   * * * * * cd /home2/osertaotech/apps/api && /usr/local/bin/php artisan schedule:run >> /dev/null 2>&1
 *
 * O worker esvazia a fila e sai antes do próximo minuto. `withoutOverlapping`
 * segura um segundo worker se um job passar do tempo; a trava expira em 10
 * minutos para um processo morto não parar a fila por um dia.
 */
Schedule::command('queue:work --stop-when-empty --max-time=50')
    ->everyMinute()
    ->withoutOverlapping(10)
    ->appendOutputTo(storage_path('logs/cron-queue.log'));

// Backup às 4h; a limpeza vem depois para nunca apagar o arquivo recém-criado.
// Os jobs vão para a fila, e quem a esvazia é o cron do cPanel via schedule:run.
// O app roda em UTC; as 4h são de Brasília.
Schedule::job(new BackupBanco())->dailyAt('04:00')->timezone('America/Sao_Paulo');
Schedule::job(new LimpaBackups())->dailyAt('04:30')->timezone('America/Sao_Paulo');
