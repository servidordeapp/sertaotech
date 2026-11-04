<?php

declare(strict_types=1);

// Só o site pode postar na API. Em dev, ALLOWED_ORIGINS=http://localhost:4321 (Astro).
return [
    'paths'                    => ['api/*'],
    'allowed_methods'          => ['POST'],
    'allowed_origins'          => array_filter(explode(',', (string) env('CORS_ALLOWED_ORIGINS', 'https://osertaotech.com.br'))),
    'allowed_origins_patterns' => [],
    'allowed_headers'          => ['Content-Type', 'Accept'],
    'exposed_headers'          => [],
    'max_age'                  => 600,
    'supports_credentials'     => false,
];
