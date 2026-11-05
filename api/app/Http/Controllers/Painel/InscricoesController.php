<?php

declare(strict_types=1);

namespace App\Http\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Http\Resources\InscricaoResource;
use App\Models\Auditoria;
use App\Models\User;
use App\Models\WaitlistEntry;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InscricoesController extends Controller
{
    /** Colunas do CSV, na ordem. */
    private const COLUNAS = ['tipo', 'nome', 'email', 'whatsapp', 'inscrito_em', 'dados'];

    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate($this->regrasDeFiltro() + [
            'por_pagina' => ['sometimes', 'integer', 'min:1', 'max:200'],
        ]);

        return InscricaoResource::collection(
            $this->consulta($request)->with('presencas.edicao')->paginate($request->integer('por_pagina') ?: 25)->withQueryString(),
        );
    }

    public function export(Request $request): StreamedResponse
    {
        $request->validate($this->regrasDeFiltro());
        $consulta = $this->consulta($request);

        // Baixar a lista é levar dado pessoal para fora do painel; fica
        // registrado quem levou e com que filtro.
        Auditoria::registra($request, 'inscricoes.export', http_build_query($request->only(['tipo', 'busca'])) ?: null);

        return response()->streamDownload(function () use ($consulta): void {
            $saida = fopen('php://output', 'w');
            if ($saida === false) {
                return;
            }

            // BOM: sem ele o Excel em pt-BR abre o UTF-8 como latin1 e "João" vira "JoÃ£o".
            fwrite($saida, "\xEF\xBB\xBF");
            // Ponto e vírgula: é o separador que o Excel em pt-BR espera.
            fputcsv($saida, self::COLUNAS, separator: ';', escape: '');

            $consulta->chunk(500, function (Collection $linhas) use ($saida): void {
                foreach ($linhas as $linha) {
                    fputcsv($saida, [
                        $this->celulaSegura($linha->tipo),
                        $this->celulaSegura($linha->nome),
                        $this->celulaSegura($linha->email),
                        $this->celulaSegura($linha->whatsapp),
                        $linha->created_at?->format('d/m/Y H:i') ?? '',
                        // ponytail: `dados` sai como JSON porque as chaves mudam por tipo.
                        // Vira coluna por chave quando alguém precisar ordenar por cidade.
                        $this->celulaSegura((string) json_encode($linha->dados, JSON_UNESCAPED_UNICODE)),
                    ], separator: ';', escape: '');
                }
            });

            fclose($saida);
        }, 'inscricoes-'.now()->format('Y-m-d-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /** @return array<string, list<mixed>> */
    private function regrasDeFiltro(): array
    {
        return [
            'tipo'  => ['sometimes', Rule::in(WaitlistEntry::TIPOS)],
            'busca' => ['sometimes', 'string', 'max:120'],
        ];
    }

    /**
     * Consulta já recortada pelo papel de quem pediu: o comercial não enxerga
     * participante nem palestrante, mesmo mandando ?tipo= na mão.
     *
     * @return Builder<WaitlistEntry>
     */
    private function consulta(Request $request): Builder
    {
        /** @var User $usuario */
        $usuario = $request->user();

        $consulta = WaitlistEntry::query()
            ->whereIn('tipo', $usuario->tiposVisiveis())
            ->latest();

        $tipo = $request->string('tipo')->toString();
        if ($tipo !== '') {
            $consulta->where('tipo', $tipo);
        }

        $busca = trim($request->string('busca')->toString());
        if ($busca !== '') {
            $digitos = preg_replace('/\D/', '', $busca) ?? '';

            $consulta->where(function (Builder $filtro) use ($busca, $digitos): void {
                $filtro->where('nome', 'like', '%'.$busca.'%')
                    ->orWhere('email', 'like', '%'.$busca.'%');

                // Sem este guarda, uma busca sem dígito viraria whatsapp LIKE '%%'.
                if ($digitos !== '') {
                    $filtro->orWhere('whatsapp', 'like', '%'.$digitos.'%');
                }
            });
        }

        return $consulta;
    }

    /**
     * Neutraliza fórmula no CSV: célula começada por = + - @ é executada ao
     * abrir a planilha, e o conteúdo aqui vem de formulário público.
     */
    private function celulaSegura(string $valor): string
    {
        return str_starts_with($valor, '=')
            || str_starts_with($valor, '+')
            || str_starts_with($valor, '-')
            || str_starts_with($valor, '@')
                ? "'".$valor
                : $valor;
    }
}
