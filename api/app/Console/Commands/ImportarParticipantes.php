<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Auditoria;
use App\Models\Edicao;
use App\Models\Participante;
use App\Models\User;
use App\Models\WaitlistEntry;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;
use SimpleXMLElement;
use ZipArchive;

/**
 * Carrega a planilha da plataforma de ingressos em `participantes`. Roda por SSH,
 * como `painel:usuario`, porque acontece uma vez por edição. Nunca envia e-mail,
 * e toda mensagem cita o número da linha, nunca o dado da pessoa.
 */
class ImportarParticipantes extends Command
{
    /** Campo interno => título da coluna na planilha. */
    private const COLUNAS = [
        'ingresso'    => 'Nº ingresso',
        'pedido'      => 'Nº pedido',
        'nome'        => 'Nome',
        'sobrenome'   => 'Sobrenome',
        'email'       => 'Email',
        'telefone'    => 'Telefone',
        'tipo'        => 'Tipo de ingresso',
        'valor'       => 'Valor',
        'cupom'       => 'Cupom de Desconto',
        'estado'      => 'Estado de pagamento',
        'check_in'    => 'Check-in',
        'check_in_em' => 'Data Check-in (*)',
        'comprado_em' => 'Data compra',
    ];

    /** Estados que a importação conhece. Estado novo aborta, em vez de sumir com gente. */
    private const APROVADO = 'Aprovado';

    private const DESCARTADOS = ['Não pago', 'Cancelado'];

    /** O rodapé da planilha declara "Horário de Brasília"; o banco grava em UTC. */
    private const FUSO_DA_PLANILHA = 'America/Sao_Paulo';

    private const FORMATO_DE_DATA = 'Y-m-d H:i:s';

    /** A plataforma põe isto no lugar do e-mail de conta anônima: não há como contatar nem localizar a pessoa. */
    private const EMAIL_ANONIMO = 'user-anonymous-';

    /** Grafia errada do mesmo cupom, usada em 2026. */
    private const CUPOM = 'CAJUTEC';

    private const CUPOM_VARIANTE = 'CAJUTECC';

    protected $signature = 'participantes:importar
                            {arquivo : Planilha .xlsx exportada da plataforma de ingressos}
                            {--edicao= : Ano da edição}
                            {--por= : E-mail do admin que responde pela importação}
                            {--dry-run : Valida e mostra os totais sem gravar nada}';

    protected $description = 'Importa os ingressos aprovados de uma edição para a tabela de participantes';

    public function handle(): int
    {
        $edicao  = Edicao::query()->where('ano', $this->option('edicao'))->first();
        $usuario = User::query()->where('email', $this->option('por'))->first();

        if ($edicao === null) {
            $this->error('Edição não encontrada. Edição nova entra por migration.');

            return self::FAILURE;
        }

        // Quem importa dado pessoal precisa constar na auditoria, e user_id é obrigatório lá.
        if ($usuario === null || ! $usuario->ehAdmin()) {
            $this->error('--por precisa ser o e-mail de um admin do painel.');

            return self::FAILURE;
        }

        try {
            ['ingressos' => $ingressos, 'descartados' => $descartados] = $this->interpreta(
                $this->leLinhas((string) $this->argument('arquivo')),
                $edicao,
            );
        } catch (RuntimeException $erro) {
            $this->error($erro->getMessage());

            return self::FAILURE;
        }

        // Quem pediu exclusão não volta: nem reimportando, nem pela planilha de outra edição.
        $anonimizados = Auditoria::query()->where('acao', 'lgpd.anonimizacao')->pluck('alvo')->all();

        $aImportar = collect($ingressos)
            ->reject(fn (array $ingresso): bool => in_array($ingresso['email'], $anonimizados, true));

        $this->table(['Item', 'Total'], [
            ['Ingressos aprovados', $aImportar->count()],
            ['Compareceram', $aImportar->where('compareceu', true)->count()],
            ['Faltaram', $aImportar->where('compareceu', false)->count()],
            ['Valor aprovado', 'R$ '.number_format($aImportar->sum(fn (array $ingresso): int => $ingresso['valor_centavos']) / 100, 2, ',', '.')],
            ['E-mails distintos', $aImportar->whereNull('anonimizado_em')->pluck('email')->unique()->count()],
            ['Anônimos na plataforma', $aImportar->whereNotNull('anonimizado_em')->count()],
            ['Descartados (não pago ou cancelado)', count($descartados)],
            ['Pulados (titular anonimizado)', count($ingressos) - $aImportar->count()],
        ]);

        if ($this->option('dry-run')) {
            $this->info('Simulação: nada foi gravado.');

            return self::SUCCESS;
        }

        DB::transaction(function () use ($aImportar, $descartados, $edicao, $usuario): void {
            foreach ($aImportar as $ingresso) {
                Participante::updateOrCreate(
                    ['edicao_id' => $edicao->id, 'ingresso' => $ingresso['ingresso']],
                    $ingresso,
                );
            }

            // Export novo pode trazer como cancelado quem antes estava aprovado.
            Participante::query()
                ->where('edicao_id', $edicao->id)
                ->whereIn('ingresso', $descartados)
                ->delete();

            Auditoria::create([
                'user_id' => $usuario->id,
                'acao'    => 'participantes.importacao',
                'alvo'    => sprintf('edicao=%d ingressos=%d', $edicao->ano, $aImportar->count()),
            ]);
        });

        $this->info(sprintf('Importação da edição %d concluída.', $edicao->ano));

        return self::SUCCESS;
    }

    /**
     * Lê a primeira folha sem dependência nova. As células ficam por letra de
     * coluna, porque a planilha omite as vazias e a posição no XML não é confiável.
     *
     * @return array<int, array<string, string>> células de cada linha, pelo número da linha
     */
    private function leLinhas(string $caminho): array
    {
        $zip = new ZipArchive();

        if (! is_file($caminho) || $zip->open($caminho, ZipArchive::RDONLY) !== true) {
            throw new RuntimeException('Não consegui abrir a planilha.');
        }

        $folha        = $zip->getFromName('xl/worksheets/sheet1.xml');
        $compartilhas = $zip->getFromName('xl/sharedStrings.xml');
        $zip->close();

        if ($folha === false) {
            throw new RuntimeException('O arquivo não tem a primeira folha de um .xlsx.');
        }

        // O export grava o texto na célula; reabrir e salvar no Excel move para sharedStrings.
        $textos = [];
        if ($compartilhas !== false) {
            foreach ($this->xml($compartilhas)->si as $item) {
                $textos[] = $this->texto($item);
            }
        }

        $linhas = [];
        foreach ($this->xml($folha)->sheetData->row ?? [] as $linha) {
            $celulas = [];

            foreach ($linha->c as $celula) {
                $valor = match ((string) $celula['t']) {
                    's'         => $textos[(int) $celula->v] ?? '',
                    'inlineStr' => $this->texto($celula->is),
                    default     => (string) $celula->v,
                };

                $celulas[(string) preg_replace('/\d+/', '', (string) $celula['r'])] = Str::squish($valor);
            }

            $linhas[(int) $linha['r']] = array_filter($celulas, fn (string $valor): bool => $valor !== '');
        }

        return $linhas;
    }

    private function xml(string $conteudo): SimpleXMLElement
    {
        $xml = simplexml_load_string($conteudo, options: LIBXML_NONET);

        if ($xml === false) {
            throw new RuntimeException('O conteúdo do .xlsx está corrompido.');
        }

        return $xml;
    }

    private function texto(SimpleXMLElement $no): string
    {
        return implode('', array_map(strval(...), $no->xpath('.//*[local-name()="t"]') ?: []));
    }

    /**
     * Valida a planilha inteira antes de qualquer gravação e junta os problemas
     * num erro só: arrumar um por vez em planilha de centenas de linhas não acaba.
     *
     * @param  array<int, array<string, string>>  $linhas
     * @return array{ingressos: list<array{email: string, valor_centavos: int, compareceu: bool, ingresso: string, cupom: ?string, anonimizado_em: ?Carbon}&array<string, mixed>>, descartados: list<string>}
     */
    private function interpreta(array $linhas, Edicao $edicao): array
    {
        $numeroDoCabecalho = null;
        foreach ($linhas as $numero => $celulas) {
            if (in_array(self::COLUNAS['ingresso'], $celulas, true)) {
                $numeroDoCabecalho = $numero;
                break;
            }
        }

        if ($numeroDoCabecalho === null) {
            throw new RuntimeException('Não achei o cabeçalho da lista de participantes.');
        }

        $letras   = array_flip($linhas[$numeroDoCabecalho]);
        $faltando = array_diff(self::COLUNAS, array_keys($letras));

        // Sem Check-in não há como dizer quem esteve no evento: aborta em vez de chutar.
        if ($faltando !== []) {
            throw new RuntimeException('Colunas ausentes: '.implode(', ', $faltando));
        }

        $ingressos   = [];
        $descartados = [];
        $vistos      = [];
        $erros       = [];
        $anterior    = $numeroDoCabecalho;

        foreach ($linhas as $numero => $celulas) {
            if ($numero <= $numeroDoCabecalho) {
                continue;
            }

            // A lista termina na primeira linha vazia ou pulada: depois vêm as
            // camisetas, em outra grade de colunas. O Excel omite as linhas vazias ao salvar.
            if ($numero !== $anterior + 1 || $celulas === []) {
                break;
            }
            $anterior = $numero;

            /** @var array<string, string> $campos */
            $campos = array_map(fn (string $coluna): string => $celulas[$letras[$coluna]] ?? '', self::COLUNAS);

            $problemas = $this->problemas($campos, $vistos);
            if ($problemas !== []) {
                $erros[] = sprintf('linha %d: %s', $numero, implode(', ', $problemas));

                continue;
            }

            $vistos[] = $campos['ingresso'];

            if (in_array($campos['estado'], self::DESCARTADOS, true)) {
                $descartados[] = $campos['ingresso'];

                continue;
            }

            $ingressos[] = $this->ingresso($campos, $edicao);
        }

        if ($erros !== []) {
            throw new RuntimeException("Nada foi gravado. Corrija a planilha:\n".implode("\n", $erros));
        }

        return ['ingressos' => $this->unificaCupons($ingressos), 'descartados' => $descartados];
    }

    /**
     * A variante só é o mesmo cupom quando custa o mesmo: com outro preço, é outro cupom.
     *
     * @param  list<array{email: string, valor_centavos: int, compareceu: bool, ingresso: string, cupom: ?string, anonimizado_em: ?Carbon}&array<string, mixed>>  $ingressos
     * @return list<array{email: string, valor_centavos: int, compareceu: bool, ingresso: string, cupom: ?string, anonimizado_em: ?Carbon}&array<string, mixed>>
     */
    private function unificaCupons(array $ingressos): array
    {
        $precos = array_column(
            array_filter($ingressos, fn (array $ingresso): bool => $ingresso['cupom'] === self::CUPOM),
            'valor_centavos',
        );

        foreach ($ingressos as $posicao => $ingresso) {
            if ($ingresso['cupom'] === self::CUPOM_VARIANTE && in_array($ingresso['valor_centavos'], $precos, true)) {
                $ingressos[$posicao]['cupom'] = self::CUPOM;
            }
        }

        return $ingressos;
    }

    /**
     * @param  array<string, string>  $campos
     * @param  list<string>  $vistos
     * @return list<string>
     */
    private function problemas(array $campos, array $vistos): array
    {
        $compareceu = $campos['check_in'] === 'Sim';
        $aprovado   = $campos['estado'] === self::APROVADO;

        return array_keys(array_filter([
            'ingresso vazio'                    => $campos['ingresso'] === '',
            'ingresso repetido'                 => in_array($campos['ingresso'], $vistos, true),
            'pedido vazio'                      => $campos['pedido'] === '',
            'nome vazio'                        => $campos['nome'] === '',
            'e-mail inválido'                   => ! $this->ehAnonimo($campos) && filter_var($campos['email'], FILTER_VALIDATE_EMAIL) === false,
            'valor inválido'                    => preg_match('/^R\$ ?[\d.]+,\d{2}$/', $campos['valor']) !== 1,
            'estado de pagamento desconhecido'  => ! $aprovado && ! in_array($campos['estado'], self::DESCARTADOS, true),
            'check-in inválido'                 => ! in_array($campos['check_in'], ['Sim', 'Não'], true),
            'check-in em ingresso não aprovado' => $compareceu && ! $aprovado,
            'data de compra inválida'           => ! $this->dataValida($campos['comprado_em']),
            'data de check-in inválida'         => $campos['check_in_em'] !== '' && ! $this->dataValida($campos['check_in_em']),
        ]));
    }

    /**
     * @param  array<string, string>  $campos
     * @return array{email: string, valor_centavos: int, compareceu: bool, ingresso: string, cupom: ?string, anonimizado_em: ?Carbon}&array<string, mixed>
     */
    private function ingresso(array $campos, Edicao $edicao): array
    {
        $compareceu = $campos['check_in'] === 'Sim';

        // Conta anônima entra nos totais, mas sem nome: sem e-mail, a tela de
        // LGPD não acharia essa linha. O ingresso fica para reimportar sem duplicar.
        $anonimo = $this->ehAnonimo($campos);

        return [
            'edicao_id'      => $edicao->id,
            'ingresso'       => $campos['ingresso'],
            'pedido'         => $anonimo ? WaitlistEntry::ANONIMO : $campos['pedido'],
            'nome'           => $anonimo ? WaitlistEntry::ANONIMO : $this->nome($campos['nome'].' '.$campos['sobrenome']),
            'email'          => $anonimo ? sprintf('%s+%s@anonimizado.invalid', WaitlistEntry::ANONIMO, $campos['ingresso']) : Str::lower($campos['email']),
            'telefone'       => $anonimo ? null : (preg_replace('/\D/', '', $campos['telefone']) ?: null),
            'anonimizado_em' => $anonimo ? now() : null,
            'tipo_ingresso'  => $campos['tipo'],
            'valor_centavos' => (int) preg_replace('/\D/', '', $campos['valor']),
            // "100.00% - UFDPAR" vira UFDPAR: o filtro do painel é pelo nome do cupom.
            'cupom'       => Str::upper((string) preg_replace('/^[\d.,]+%\s*-\s*/', '', $campos['cupom'])) ?: null,
            'compareceu'  => $compareceu,
            'check_in_em' => $compareceu && $campos['check_in_em'] !== '' ? $this->data($campos['check_in_em']) : null,
            'comprado_em' => $this->data($campos['comprado_em']),
        ];
    }

    /** @param  array<string, string>  $campos */
    private function ehAnonimo(array $campos): bool
    {
        return str_starts_with($campos['email'], self::EMAIL_ANONIMO);
    }

    /** Só mexe em nome todo em minúsculas ou maiúsculas; o resto fica como a pessoa escreveu. */
    private function nome(string $nome): string
    {
        $nome = Str::squish($nome);

        if ($nome !== mb_strtolower($nome) && $nome !== mb_strtoupper($nome)) {
            return $nome;
        }

        return str_replace(
            [' De ', ' Da ', ' Do ', ' Das ', ' Dos ', ' E '],
            [' de ', ' da ', ' do ', ' das ', ' dos ', ' e '],
            mb_convert_case($nome, MB_CASE_TITLE),
        );
    }

    private function dataValida(string $valor): bool
    {
        return Carbon::canBeCreatedFromFormat($valor, self::FORMATO_DE_DATA);
    }

    private function data(string $valor): Carbon
    {
        return Carbon::createFromFormat(self::FORMATO_DE_DATA, $valor, self::FUSO_DA_PLANILHA)?->utc()
            ?? throw new RuntimeException('Data inválida.');
    }
}
