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

Falha conhecida e **não relacionada** a mudanças recentes: `ErrorHandlingTest > inertia request does
not receive the envelope` — espera 403, recebe 409, só passa quando `public/build/manifest.json`
não existe. Confirme com `git stash` antes de assumir que foi você.

**Armadilha: `fake()->unique()` não garante unicidade entre testes, só dentro de um.** O
`TestCase` do Laravel recria a aplicação (e o container) a cada método de teste, o que reseta o
rastreamento interno do `Faker::unique()`. Com ~170 testes cada um criando vários usuários, dois
métodos diferentes podem gerar o mesmo e-mail por puro paradoxo do aniversário —
`UniqueConstraintViolationException` em `users_email_unique`, intermitente (passa na maioria das
vezes, falha de vez em quando). Já quebrou o CI/CD Staging mais de uma vez sem nenhuma relação com
o PR que disparou o build — antes de culpar sua mudança, rode o teste isolado 3-5 vezes; se ele
falhar só às vezes e usar `fake()->unique()->safeEmail()` (ou similar) em algum factory, é isso.
Correção correta: dar entropia real ao valor gerado (ex.: sufixo com `Str::random()`), nunca
`retry()`/`markTestIncomplete()`/capturar a exceção — isso esconde a falha em vez de eliminar a
causa.

## Falha de teste não é para disfarçar

Nunca "conserte" um teste vermelho com `skip()`, `markTestIncomplete()`, `try/catch` engolindo a
exceção, laço de retry, ou afrouxando a asserção até ela passar. Se a causa raiz não está clara ou
foge do escopo da tarefa, pare e reporte ao master em vez de fazer o CI ficar verde por baixo do
pano — um bypass silencioso vira uma armadilha nova para a próxima pessoa (ou para você, na próxima
sessão) e o incidente só reaparece mais tarde, mais caro de rastrear.

Antes de declarar qualquer tarefa "pronta": rode a suíte **completa** relevante (não só
`--filter=<seu teste>`) pelo menos uma vez. O filtro focado serve para iterar rápido; só a suíte
inteira revela regressão cruzada e flakiness pré-existente que o seu filtro nunca veria. Se algo
falhar fora do que você tocou, confirme se é determinístico (mesmo teste falha sempre, ex.:
`ErrorHandlingTest` acima) ou probabilístico (falha intermitente, ex.: a armadilha do `Faker`
acima) antes de rotular como "pré-existente, não é meu" — rodar uma vez só e não reproduzir não é
prova suficiente para falha probabilística.

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

## Lint e análise estática PHP

```bash
docker exec uniespacos-workspace-1 vendor/bin/pint            # aplica
docker exec uniespacos-workspace-1 vendor/bin/pint --test     # só verifica
docker exec uniespacos-workspace-1 composer analyse           # PHPStan nível 9 (--memory-limit=1G)
```

`composer analyse` só passa limpo se o código novo/tocado não tiver erro — a dívida técnica
pré-existente está coberta por `phpstan-baseline.neon` (gerado com `--generate-baseline`, 477 erros
no momento da migração pro nível 9). Não adicione linha nova na baseline para calar o PHPStan;
regenerar a baseline só é aceitável se o usuário pedir explicitamente.

## Lint TypeScript/React

```bash
npx eslint .              # eslint . --fix é o `npm run lint`
npx tsc --noEmit
```

`resources/js/**` roda sob `typescript-eslint` `strict-type-checked` + `stylistic-type-checked`
(type-aware). Dívida técnica pré-existente está suprimida em `eslint-suppressions.json` (gerado com
`--suppress-all`, 315 erros no momento da migração). Mesma regra do PHPStan: não suprima erro novo,
corrija.

**Armadilha: `--fix` desfaz reversão manual de autofix a cada execução.** Quando um autofix de regra
(ex.: `consistent-type-definitions`, `type` → `interface`) precisa ser revertido à mão por causa de
um caso legítimo (ex.: `useForm<T>` do Inertia exige index signature que `interface` não tem), **não
suprima o erro em `eslint-suppressions.json`** — isso não impede o `--fix` de reaplicar a mudança na
próxima execução (suprimir só afeta o relatório, não o fix). Toda vez que alguém rodar
`npm run lint`, o arquivo volta a quebrar e a suppression sobra órfã, o que faz o `eslint` sair com
código 2 num checkout limpo (`--suppress-all` não é idempotente contra `--fix`; já causou falha real
no CI/CD Staging da tag rc.25). A correção certa é `// eslint-disable-next-line <regra> -- motivo`
na linha exata — isso impede o `--fix` de tocar ali. Depois de mexer em suppression/disable,
sempre rode `npm run lint` **duas vezes seguidas** e confira exit code 0 nas duas — simula o que o
CI faz num checkout limpo.

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
