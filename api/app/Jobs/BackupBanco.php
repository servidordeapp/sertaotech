<?php

declare(strict_types=1);

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Backup diário do banco: um CSV só, `backup/backup-AAAA-MM-DD_HH-MM-SS.csv`, no
 * bucket (R2 em produção). O dia está no nome do arquivo. Cada linha do CSV é uma
 * linha de tabela: `tabela` e `dados` (a linha em JSON, criptografada com a
 * APP_KEY), o que deixa um arquivo só servir para todas as tabelas. O bucket é
 * público, então nada de dado de cliente pode ir em claro. Quem lê é o
 * `RestauraBackup`.
 *
 * Guarde a APP_KEY fora do servidor: sem ela o backup não abre. Ao trocá-la,
 * deixe a antiga em APP_PREVIOUS_KEYS para os backups velhos continuarem lendo.
 */
class BackupBanco implements ShouldQueue
{
    use Queueable;

    public const DISCO = 's3';

    public const PASTA = 'backup';

    /**
     * Estado descartável: não vale guardar nem restaurar. `migrations` e as filas
     * ficam de fora desta lista de propósito: sem a primeira o `migrate` não sabe
     * o que já rodou, e sem as outras se perde o que ainda esperava para executar.
     */
    private const IGNORADAS = ['cache', 'cache_locks', 'sessions'];

    /** @return list<string> */
    public static function tabelas(): array
    {
        // O MySQL lista cada tabela duas vezes; sem o unique o backup sairia em dobro.
        return array_values(array_unique(array_diff(Schema::getTableListing(schemaQualified: false), self::IGNORADAS)));
    }

    public function handle(): void
    {
        $csv = fopen('php://temp', 'w+b') ?: throw new RuntimeException('Não deu para abrir o arquivo temporário do backup.');
        fputcsv($csv, ['tabela', 'dados'], escape: '');

        foreach (self::tabelas() as $tabela) {
            foreach (DB::table($tabela)->cursor() as $linha) {
                $json = json_encode($linha, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
                fputcsv($csv, [$tabela, Crypt::encryptString($json)], escape: '');
            }
        }

        rewind($csv);
        $caminho = self::PASTA.'/backup-'.now('America/Sao_Paulo')->format('Y-m-d_H-i-s').'.csv';

        if (! Storage::disk(self::DISCO)->put($caminho, $csv)) {
            throw new RuntimeException("Não deu para guardar o backup em {$caminho}.");
        }
    }
}
