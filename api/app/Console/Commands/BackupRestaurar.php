<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Jobs\BackupBanco;
use App\Jobs\RestauraBackup;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/** Restaura o banco a partir de um backup do bucket; sem argumento, o mais recente. */
class BackupRestaurar extends Command
{
    protected $signature = 'backup:restaurar {arquivo? : Caminho no bucket, ex.: backup/backup-2026-11-07_04-00-00.csv}
                            {--force : Não pede confirmação}';

    protected $description = 'Restaura o banco a partir de um backup CSV do bucket';

    public function handle(): int
    {
        // Os nomes têm a data na frente, então a ordem alfabética é a cronológica.
        $arquivo = $this->argument('arquivo')
            ?? collect(Storage::disk(BackupBanco::DISCO)->files(BackupBanco::PASTA))->sort()->last();

        if ($arquivo === null) {
            $this->error('Não há backup no bucket.');

            return self::FAILURE;
        }

        if (! $this->option('force') && ! $this->confirm("Apagar os dados atuais e restaurar {$arquivo}?")) {
            return self::FAILURE;
        }

        RestauraBackup::dispatchSync($arquivo);
        $this->info("Banco restaurado de {$arquivo}.");

        return self::SUCCESS;
    }
}
