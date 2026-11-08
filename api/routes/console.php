<?php

declare(strict_types=1);

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
