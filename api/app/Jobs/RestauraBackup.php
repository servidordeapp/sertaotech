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
 * Restaura um CSV feito pelo `BackupBanco`: esvazia as tabelas do backup e
 * insere as linhas do arquivo, tudo numa transação. Se o arquivo estiver
 * quebrado ou citar tabela que não existe, nada muda. Os dados mais novos que o
 * backup se perdem — é o que restaurar quer dizer.
 */
class RestauraBackup implements ShouldQueue
{
    use Queueable;

    private const LOTE = 500;

    public function __construct(public readonly string $caminho)
    {
    }

    public function handle(): void
    {
        $origem = Storage::disk(BackupBanco::DISCO)->readStream($this->caminho)
            ?? throw new RuntimeException("Backup {$this->caminho} não encontrado.");

        if (fgetcsv($origem, escape: '') !== ['tabela', 'dados']) {
            throw new RuntimeException("{$this->caminho} não é um backup válido.");
        }

        $tabelas = BackupBanco::tabelas();

        Schema::withoutForeignKeyConstraints(fn () => DB::transaction(function () use ($origem, $tabelas): void {
            foreach ($tabelas as $tabela) {
                DB::table($tabela)->delete();
            }

            $lote  = [];
            $atual = null;

            while (($linha = fgetcsv($origem, escape: '')) !== false) {
                [$tabela, $dados] = $linha + [null, null];

                if (! is_string($tabela) || ! is_string($dados)) {
                    throw new RuntimeException('Linha incompleta no backup.');
                }

                if (! in_array($tabela, $tabelas, true)) {
                    throw new RuntimeException("Tabela desconhecida no backup: {$tabela}.");
                }

                $registro = json_decode(Crypt::decryptString($dados), true, flags: JSON_THROW_ON_ERROR);

                if (! is_array($registro)) {
                    throw new RuntimeException("Linha inválida em {$tabela}.");
                }

                if ($tabela !== $atual || count($lote) >= self::LOTE) {
                    $this->grava($atual, $lote);
                    $lote  = [];
                    $atual = $tabela;
                }

                $lote[] = $registro;
            }

            $this->grava($atual, $lote);
        }));

        fclose($origem);
    }

    /** @param list<array<array-key, mixed>> $lote */
    private function grava(?string $tabela, array $lote): void
    {
        if ($tabela !== null && $lote !== []) {
            DB::table($tabela)->insert($lote);
        }
    }
}
