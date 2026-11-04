# syntax=docker/dockerfile:1

# Imagem própria da api, e não a do Laravel Sail: a de Sail é construída a
# partir de `api/vendor/laravel/sail/runtimes/...`, ou seja só existe depois de
# um `composer install` no host — justo o que o docker-first evita. Aqui o
# composer roda dentro da imagem.
FROM php:8.5-cli-bookworm AS base
WORKDIR /app
# pdo_mysql é o driver do DB_CONNECTION=mysql. zip + unzip é o que o composer
# usa para instalar pacote a partir de dist, em vez de clonar cada repositório.
# pcov é o driver de cobertura que o `composer coverage` exige (a imagem do Sail
# também o traz; sem ele o script aborta pedindo pcov ou xdebug).
RUN apt-get update \
 && apt-get install -y --no-install-recommends libzip-dev unzip \
 && docker-php-ext-install pdo_mysql zip \
 && pecl install pcov && docker-php-ext-enable pcov \
 && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# --------------------------------------------------------------------------
# deps — vendor instalado a partir do lockfile, numa camada própria para não
# reinstalar tudo a cada alteração de código.
# --------------------------------------------------------------------------
FROM base AS deps
COPY composer.json composer.lock ./
# --no-scripts: o post-autoload-dump do Laravel chama o artisan, que nesta
# camada ainda não foi copiado. O autoload (PSR-4) é gerado normalmente, e o
# manifesto de pacotes o framework reconstrói sozinho no primeiro boot.
RUN composer install --no-interaction --no-scripts

# --------------------------------------------------------------------------
# dev — servidor embutido do PHP. O código chega por bind mount declarado no
# compose; o que a imagem carrega é só o vendor, preservado num volume.
# --------------------------------------------------------------------------
FROM base AS dev
# uid 1000 = dono do repositório no host. /app é bind mount, então o que o
# container escreve (storage/logs, bootstrap/cache) precisa sair com esse dono,
# senão o host perde a escrita nos próprios arquivos.
RUN useradd -u 1000 -m -s /bin/bash app
COPY --from=deps --chown=app:app /app/vendor ./vendor
COPY --chown=app:app . .
USER app
EXPOSE 8000
# ponytail: `artisan serve` atende uma requisição por vez. Vale enquanto é o
# dev server de um endpoint de formulário; se um dia precisar de concorrência,
# trocar por php-fpm + nginx.
CMD ["sh", "-c", "[ -f .env ] || { cp .env.example .env; php artisan key:generate --no-interaction; }; php artisan migrate --force --no-interaction && php artisan serve --host 0.0.0.0 --port 8000"]
