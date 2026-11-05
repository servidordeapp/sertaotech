<?php

declare(strict_types=1);

namespace App\Http\Controllers\Painel;

use App\Http\Controllers\Controller;
use App\Models\Edicao;
use Illuminate\Http\JsonResponse;

class EdicoesController extends Controller
{
    public function index(): JsonResponse
    {
        $edicoes = Edicao::query()->orderByDesc('ano')->get();

        return response()->json($edicoes->values()->map(fn (Edicao $edicao, int $posicao): array => [
            'ano'   => $edicao->ano,
            'atual' => $posicao === 0,
        ]));
    }
}
