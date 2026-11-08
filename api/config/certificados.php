<?php

declare(strict_types=1);

/*
 * O que vai impresso em cada edição. Edição nova ganha uma entrada aqui e um
 * modelo Blade. Edição sem entrada não prepara certificado.
 *
 * Atividades com o mesmo `horario` aconteceram ao mesmo tempo: o certificado
 * recusa as duas juntas.
 */
return [
    'edicoes' => [
        2025 => [
            'edicao'            => '1ª',
            'data'              => '2025-08-22',
            'local'             => 'Uninassau Parnaíba',
            'carga_evento'      => 4,
            'carga_organizacao' => 4,
            'atividades'        => [],
        ],
        2026 => [
            'edicao'            => '2ª',
            'data'              => '2026-10-09',
            'local'             => 'Universidade Federal do Delta do Parnaíba (UFDPar), Parnaíba - PI',
            'carga_evento'      => 8,
            'carga_organizacao' => 18,
            // Fonte: grade de site/src/pages/2026/index.astro.
            'atividades' => [
                'minicurso-cardinal' => [
                    'nome'          => 'Cardinal — um simulador de mundos para desenvolvedores de jogos',
                    'ministrante'   => 'Germano Gomes',
                    'carga_horaria' => 2,
                    'horario'       => '15:00-17:00',
                ],
                'minicurso-freelancer' => [
                    'nome'          => 'O Kit do Freelancer Ágil: MVP do zero com Laravel, Flutter, Cockpit e IA',
                    'ministrante'   => 'Rodrigo Castro',
                    'carga_horaria' => 2,
                    'horario'       => '15:00-17:00',
                ],
            ],
        ],
    ],
];
