#!/usr/bin/env bash
# Roda uma vez, no initdb do container de mysql: cria o banco `testing` que o
# api/phpunit.xml usa (DB_DATABASE=testing) e libera o usuário do app nele.
# Mesmo papel do script homônimo do Laravel Sail, mas versionado aqui para não
# depender de `api/vendor/`.
mysql --user=root --password="$MYSQL_ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS testing;
GRANT ALL PRIVILEGES ON \`testing\`.* TO '$MYSQL_USER'@'%';
SQL
