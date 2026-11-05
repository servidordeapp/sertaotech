<?php

declare(strict_types=1);

// Quem pode falar com a API pelo navegador: o site (POST da lista de espera) e
// o painel (GET/POST autenticados). Em dev, ALLOWED_ORIGINS leva
// http://localhost:4321 (Astro) e http://localhost:5173 (painel).
return [
    // sanctum/csrf-cookie é a primeira chamada do painel no login; fora desta
    // lista o navegador barra antes de a sessão existir.
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    // DELETE é o pedido de exclusão da LGPD, e PATCH é a edição no orçamento. Sem
    // eles o navegador barra no preflight e a tela recebe um "Failed to fetch" sem
    // explicação.
    'allowed_methods'          => ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins'          => array_filter(explode(',', (string) env('CORS_ALLOWED_ORIGINS', 'https://osertaotech.com.br,https://www.osertaotech.com.br'))),
    'allowed_origins_patterns' => [],
    // X-XSRF-TOKEN é o cabeçalho que o painel devolve a partir do cookie de CSRF.
    'allowed_headers' => ['Content-Type', 'Accept', 'X-XSRF-TOKEN', 'X-Requested-With'],
    'exposed_headers' => [],
    'max_age'         => 600,
    // O painel manda cookie de sessão. Seguro aqui porque a lista de origens é
    // explícita: credenciais com origem '*' o navegador recusaria de qualquer forma.
    'supports_credentials' => true,
];
