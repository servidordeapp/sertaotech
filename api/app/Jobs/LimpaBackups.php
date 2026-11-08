<?php

declare(strict_types=1);

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;

/** Apaga do bucket os backups criados há mais de 30 dias. */
class LimpaBackups implements ShouldQueue
{
    use Queueable;

    public const DIAS = 30;

    public function handle(): void
    {
        $disco  = Storage::disk(BackupBanco::DISCO);
        $limite = now()->subDays(self::DIAS)->getTimestamp();

        foreach ($disco->files(BackupBanco::PASTA) as $arquivo) {
            if ($disco->lastModified($arquivo) < $limite) {
                $disco->delete($arquivo);
            }
        }
    }
}
