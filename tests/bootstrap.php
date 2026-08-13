<?php

declare(strict_types=1);

require __DIR__.'/../vendor/autoload.php';

/*
 * O container ja exporta as variaveis do .env para o ambiente do processo, e o
 * <env force="true"> do PHPUnit atualiza apenas $_ENV e putenv() — nao $_SERVER.
 * Como o repositorio de env do Laravel le $_SERVER primeiro, sem esta sincronia
 * a suite ignora phpunit.xml e roda contra o banco de desenvolvimento, que o
 * RefreshDatabase apaga a cada execucao.
 */
foreach ($_ENV as $chave => $valor) {
    if (is_string($valor)) {
        $_SERVER[$chave] = $valor;
    }
}
