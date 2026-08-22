---
name: testing-and-env
description: Como rodar testes e comandos de dev do UniEspaços sem cair nas armadilhas conhecidas do ambiente Docker. Use antes de rodar artisan/testes/build.
---

# Testes e ambiente — UniEspaços

## Tudo roda dentro do container

`php artisan` (e qualquer coisa que toque o banco) no host falha com
`SQLSTATE[08006] could not translate host name "postgres"` — o host `postgres` só resolve na rede
Docker. Sempre:

```bash
docker exec uniespacos-workspace-1 php artisan <comando>
```

Containers relevantes: `uniespacos-workspace-1` (artisan/composer/tests), `uniespacos-app-1`
(php-fpm que serve o site), `uniespacos-postgres-1` (banco; usuário e database são ambos
`uniespacos`).

## Testes backend

```bash
docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test
docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test --filter=NomeDoTeste
```

Sem `-e APP_ENV=testing` o ambiente vaza e a suíte quebra com 419 (CSRF).

**Antes de rodar a suíte inteira**, mova `tests/Feature/ReservaEdicaoBloqueadaTest.php` para fora
do diretório — ele tem um erro de sintaxe pré-existente que derruba a suíte toda na fase de
descoberta. Devolva o arquivo ao lugar depois.

```bash
mv tests/Feature/ReservaEdicaoBloqueadaTest.php /tmp/
# ... rodar a suite ...
mv /tmp/ReservaEdicaoBloqueadaTest.php tests/Feature/
```

Falha conhecida e **não relacionada** a mudanças recentes: `ErrorHandlingTest > inertia request does
not receive the envelope` — espera 403, recebe 409, só passa quando `public/build/manifest.json`
não existe. Confirme com `git stash` antes de assumir que foi você.

## Testes e checagem de frontend (rodam no host)

```bash
npx tsc --noEmit
npx jest
npx jest <caminho-do-arquivo>    # um arquivo específico
npx prettier --write <arquivo>   # só no que você reescreveu de fato
```

## Vite servindo módulo vazio

Depois de reescrever um `.tsx` por completo (ex.: `prettier --write` logo após uma edição grande), o
dev server às vezes passa a servir aquele módulo **vazio** (~167 bytes, `sourcesContent: [""]`)
mesmo com o arquivo íntegro em disco. Sintoma: tela em branco, console mostra
`Element type is invalid ... but got: object` vindo do Inertia.

Diagnóstico rápido:

```bash
curl -s http://localhost:5173/resources/js/<caminho>.tsx | wc -c
```

Se vier bem menor que o esperado, é isso — não é bug de import/export do componente. Resolve com
`touch <arquivo>`.

## Lint PHP

```bash
docker exec uniespacos-workspace-1 vendor/bin/pint            # aplica
docker exec uniespacos-workspace-1 vendor/bin/pint --test     # só verifica
```

## Usuário de teste descartável para verificação manual (CDP/browser)

```bash
docker exec uniespacos-workspace-1 php artisan tinker --execute="
\$u = \App\Models\User::factory()->create(['email' => 'claude-debug@test.local', 'password' => bcrypt('password')]);
\$u->markEmailAsVerified();
\$u->assignRole('institucional');
"
```

Sempre delete o usuário ao final da verificação — nunca deixe credencial de teste no banco de
desenvolvimento.
