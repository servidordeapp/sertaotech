<?php

declare(strict_types=1);

namespace App\Models;

use Barryvdh\DomPDF\Facade\Pdf;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Database\Factories\CertificadoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use LogicException;

/**
 * Um certificado por pessoa e papel em uma edição. Sem `emitido_em` é rascunho
 * e a revisão mexe à vontade. Emitido, é documento: só aceita a revogação, uma
 * vez. A trava vale para o Eloquent; update em massa pelo query builder passa
 * por fora, então nada no projeto altera certificado assim.
 *
 * @property int $id
 * @property int $edicao_id
 * @property int|null $participante_id
 * @property string $nome
 * @property string $tipo
 * @property int $carga_horaria
 * @property list<string> $atividades
 * @property string|null $titulo
 * @property string|null $codigo
 * @property string|null $pdf_caminho
 * @property string|null $pdf_sha256
 * @property Carbon|null $emitido_em
 * @property Carbon|null $descartado_em
 * @property Carbon|null $revogado_em
 * @property-read Edicao $edicao
 * @property-read Participante|null $participante
 */
class Certificado extends Model
{
    /** @use HasFactory<CertificadoFactory> */
    use HasFactory;

    public const TIPOS = ['participante', 'palestrante', 'ministrante', 'organizacao'];

    /** Cupom da planilha que já diz o papel. PALESTRANTE também cobre ministrante: a revisão separa. */
    public const TIPO_DO_CUPOM = ['PALESTRANTE' => 'palestrante', 'ORGANIZACAO' => 'organizacao'];

    /** Crockford base32: sem I, L, O e U, que se confundem ao digitar. 12 letras dão 60 bits. */
    private const ALFABETO_DO_CODIGO = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

    /** O que a revogação pode tocar num certificado emitido. */
    private const CAMPOS_DA_REVOGACAO = ['revogado_em', 'motivo_revogacao', 'updated_at'];

    protected $guarded = [];

    protected $attributes = ['atividades' => '[]'];

    protected function casts(): array
    {
        return [
            'carga_horaria' => 'integer',
            'atividades'    => 'array',
            'emitido_em'    => 'datetime',
            'descartado_em' => 'datetime',
            'revogado_em'   => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::updating(function (Certificado $certificado): void {
            if ($certificado->getOriginal('emitido_em') === null) {
                return;
            }

            $revogacao = $certificado->getOriginal('revogado_em') === null
                && array_diff(array_keys($certificado->getDirty()), self::CAMPOS_DA_REVOGACAO) === [];

            if (! $revogacao) {
                throw new LogicException("Certificado #{$certificado->id} já foi emitido e não muda.");
            }
        });

        static::deleting(function (Certificado $certificado): void {
            if ($certificado->getOriginal('emitido_em') !== null) {
                throw new LogicException("Certificado #{$certificado->id} já foi emitido e não pode ser apagado.");
            }
        });
    }

    /** @return BelongsTo<Edicao, $this> */
    public function edicao(): BelongsTo
    {
        return $this->belongsTo(Edicao::class);
    }

    /** @return BelongsTo<Participante, $this> */
    public function participante(): BelongsTo
    {
        return $this->belongsTo(Participante::class);
    }

    public function ehRascunho(): bool
    {
        return $this->emitido_em === null && $this->descartado_em === null;
    }

    public function situacao(): string
    {
        return match (true) {
            $this->revogado_em !== null   => 'revogado',
            $this->emitido_em !== null    => 'emitido',
            $this->descartado_em !== null => 'descartado',
            default                       => 'rascunho',
        };
    }

    /**
     * Cria os rascunhos que faltam: participante para quem fez check-in, e
     * palestrante ou organização pelo cupom, com ou sem check-in, porque a
     * revisão é quem separa quem cancelou. Rodar de novo não duplica nem recria
     * o que foi descartado: a chave única ignora a linha que já existe.
     *
     * @param  array{carga_evento: int, carga_organizacao: int}  $config
     * @return int quantos rascunhos novos
     */
    public static function prepara(Edicao $edicao, array $config): int
    {
        $agora  = now();
        $linhas = [];

        $participantes = Participante::query()
            ->where('edicao_id', $edicao->id)
            ->whereNull('anonimizado_em')
            ->get();

        foreach ($participantes as $participante) {
            $tipos = [];

            if ($participante->compareceu) {
                $tipos['participante'] = $config['carga_evento'];
            }

            $doCupom = self::TIPO_DO_CUPOM[(string) $participante->cupom] ?? null;
            if ($doCupom !== null) {
                $tipos[$doCupom] = $doCupom === 'organizacao' ? $config['carga_organizacao'] : $config['carga_evento'];
            }

            foreach ($tipos as $tipo => $carga) {
                $linhas[] = [
                    'edicao_id'       => $edicao->id,
                    'participante_id' => $participante->id,
                    'nome'            => $participante->nome,
                    'email'           => $participante->email,
                    'tipo'            => $tipo,
                    'carga_horaria'   => $carga,
                    'atividades'      => '[]',
                    'created_at'      => $agora,
                    'updated_at'      => $agora,
                ];
            }
        }

        return DB::transaction(fn (): int => collect($linhas)
            ->chunk(500)
            ->sum(fn ($lote): int => self::query()->insertOrIgnore($lote->all())));
    }

    /** Formato ST26-7K3M-Q9XP-2TVH: aleatório, não sequencial. */
    public static function novoCodigo(int $ano): string
    {
        $grupos = [];
        for ($g = 0; $g < 3; $g++) {
            $grupo = '';
            for ($i = 0; $i < 4; $i++) {
                $grupo .= self::ALFABETO_DO_CODIGO[random_int(0, 31)];
            }
            $grupos[] = $grupo;
        }

        return 'ST'.substr((string) $ano, -2).'-'.implode('-', $grupos);
    }

    public function caminhoDoPdf(): string
    {
        return 'certificados/'.$this->edicao->ano.'/'.$this->codigo.'.pdf';
    }

    public function urlDeValidacao(): string
    {
        return Config::string('certificados.url_validacao').'?codigo='.$this->codigo;
    }

    public function pdfUrl(): ?string
    {
        return $this->pdf_caminho === null ? null : Storage::disk('s3')->url($this->pdf_caminho);
    }

    /** Data URI do QR Code em SVG: dispensa a extensão GD, que o servidor pode não ter. */
    public function qrCode(): string
    {
        $qrCode = new QRCode(new QROptions([
            'addQuietzone'     => false,
            'drawLightModules' => false,
            'connectPaths'     => true,
        ]));

        $svg = $qrCode->render($this->urlDeValidacao());
        assert(is_string($svg));

        return $svg;
    }

    /** O modelo é o Blade da edição: edição sem modelo não tem certificado. */
    public function temModelo(): bool
    {
        return view()->exists('certificados.'.$this->edicao->ano);
    }

    /** O PDF pronto, em bytes. Quem guarda e trava é o EmiteCertificado. */
    public function renderizaPdf(): string
    {
        $ano = $this->edicao->ano;

        return Pdf::loadView('certificados.'.$ano, [
            'certificado' => $this,
            'edicao'      => config('certificados.edicoes.'.$ano),
            'emissor'     => config('certificados.emissor'),
            'qrCode'      => $this->qrCode(),
        ])->setPaper('a4', 'landscape')
            // Só os glifos usados: o PDF cai de ~290 KB para uma fração disso.
            ->setOption('isFontSubsettingEnabled', true)
            ->output();
    }
}
