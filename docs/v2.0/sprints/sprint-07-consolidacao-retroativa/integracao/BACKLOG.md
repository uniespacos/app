# Sprint 7 — Integração: Validação de Rename de Rotas Administrativas

---

## S7-INT-01 — Validação de Exclusão de Rotas Antigas `institucional.*`

- **Objetivo:** Garantir que nenhuma rota nomeada `institucional.*` continua acessível após o rename, detectando qualquer regressão de suporte retroativo indevido.

- **Caso de uso:** P-29 (closed) · D-7 (closed) — validação pós-rename

- **Atores envolvidos:** Executor (testes)

- **Partes afetadas:**
  - `routes/web.php` — bloco renomeado de rotas administrativas
  - `tests/Feature/` — testes de rota ou testes que usavam nomes antigos e falharam como esperado

- **Depende de:** S7-BE-01 (o rename de rotas deve estar completo)

- **Riscos relacionados:** R-15 (semântica de rotas — mitigado por esta task)

- **Casos de teste obrigatórios:**
  1. **Teste de Rota Não-Existente por Nome:** Chamar `route('institucional.modulos.index')` em um teste de backend deve lançar `InvalidArgumentException`, confirmando que o nome antigo foi removido integralmente.
  2. **Teste de Acesso URL Antiga — 404:** GET `/institucional/modulos` (URL antiga) com usuário autenticado e com permissão `secao.gestao-modulos` deve retornar HTTP 404 (não 200, não 403 — a rota não existe).
  3. **Teste de Acesso URL Antiga em Batch:** Amostragem de pelo menos 3 URLs antigas (`/institucional/unidades`, `/institucional/setores`, `/institucional/espacos`) deve todas retornar HTTP 404.

- **Critérios de aceite:**
  - [ ] Teste implementado que tenta gerar `route('institucional.modulos.index')` e captura `InvalidArgumentException`
  - [ ] Teste implementado que acessa GET `/institucional/modulos` e valida HTTP 404
  - [ ] Teste implementado que acessa pelo menos 3 outras URLs antigas (`/institucional/unidades`, `/institucional/setores`, `/institucional/espacos`) e valida HTTP 404 em todas
  - [ ] Todos os testes passam (`php artisan test` exit code 0)
  - [ ] Nenhum comentário ou skipped test relacionado a suporte a rotas antigas sobrevive

---

## S7-INT-02 — Validação de Funcionalidade das Rotas Novas `administrativo.*`

- **Objetivo:** Confirmar que todas as rotas renomeadas para `administrativo.*` são resolvíveis e respondem corretamente, exercitando os paths críticos de cada grupo de rota.

- **Caso de uso:** P-29 (closed) · D-7 (closed) — validação de integridade pós-rename

- **Atores envolvidos:** Executor (testes)

- **Partes afetadas:**
  - `routes/web.php` — todas as 9 rotas do grupo renomeado
  - Controllers: `Administrativo/` (Instituições, Unidades, Módulos, Setores, Espaços, Usuários, Roles, Relatórios)
  - Policies: `InstitucaoPolicy`, `UnidadePolicy`, `ModuloPolicy`, `SetorPolicy`, `EspacoPolicy`, `UsuarioPolicy`, `RolePolicy`

- **Depende de:** S7-BE-01 (o rename de rotas deve estar completo)

- **Riscos relacionados:** R-15 (cobertura de rotas renomeadas)

- **Casos de teste obrigatórios:**
  1. **Teste de Resolução de Rota por Nome:** `route('administrativo.modulos.index')` é resolvível sem exceção.
  2. **Teste de Acesso Físico Institucional:** GET `/administrativo/modulos` com usuário `institucional` autenticado retorna HTTP 200 (não 404, não 403).
  3. **Teste de Acesso Físico Gestor Unidade:** GET `/administrativo/modulos` com usuário `gestor_unidade` autenticado e permissão `secao.gestao-modulos` retorna HTTP 200.
  4. **Smoke Test Representativo:** Um teste por grupo de rota (representante de cada um dos ~9 prefixos renomeados — ex.: `/administrativo/instituicoes`, `/administrativo/unidades`, `/administrativo/modulos`, `/administrativo/setores`, `/administrativo/espacos`, `/administrativo/usuarios`, `/administrativo/roles`, `/administrativo/relatorios`) valida que a resposta é HTTP 200 ou HTTP 403 (autorização negada, mas rota existe) — nunca 404 ou erro de rota não encontrada.

- **Critérios de aceite:**
  - [ ] `route('administrativo.modulos.index')` é resolvível por Ziggy (sem exceção)
  - [ ] GET `/administrativo/modulos` com `institucional` autenticado retorna HTTP 200
  - [ ] GET `/administrativo/modulos` com `gestor_unidade` autenticado + permissão `secao.gestao-modulos` retorna HTTP 200
  - [ ] Teste smoke coverage: pelo menos 1 representante de cada grupo de recurso retorna 2xx ou 403, nunca 404 ou rota não encontrada
  - [ ] Todos os testes passam (`php artisan test` exit code 0)

---

## S7-INT-03 — Smoke Test de Regressão: Navegação Completa em `/administrativo/*`

- **Objetivo:** Validar que todas as telas acessíveis dentro do módulo administrativo (`/administrativo/*`) carregam sem erro 404 ou 500 para um usuário autenticado com permissões, confirmando que nenhuma referência a rota antiga sobreviveu no backend.

- **Caso de uso:** P-29 (closed) · D-7 (closed) — regressão de navegação pós-rename

- **Atores envolvidos:** Usuário `institucional` autenticado

- **Partes afetadas:**
  - Toda a árvore de páginas em `pages/Administrativo/` (Instituições, Unidades, Módulos, Setores, Espaços, Usuários, Roles, Relatórios)
  - Controllers administrativos e suas views/templates (se existirem)
  - HandleInertiaRequests (props globais compartilhadas)
  - Middlewares de autorização

- **Depende de:** S7-BE-01 (rename completo), S7-FE-01 (referências de rota atualizadas no frontend)

- **Riscos relacionados:** R-15 (semântica de rotas — abrangência de cobertura)

- **Casos de teste obrigatórios:**
  1. **Teste de Carregamento de Índice Administrativo:** GET `/administrativo/instituicoes` com `institucional` retorna HTTP 200 (não 404, não 500).
  2. **Teste de Carregamento de Múltiplos Índices:** GET de pelo menos 5 URLs de índice administrativo diferentes (`/administrativo/unidades`, `/administrativo/modulos`, `/administrativo/setores`, `/administrativo/espacos`, `/administrativo/usuarios`) todas retornam HTTP 200 com `institucional` autenticado.
  3. **Teste de Validação de Resposta Inertia:** As respostas HTTP 200 incluem a prop `component` de Inertia (verificar header `X-Inertia-Component` ou body JSON com chave `component`), confirmando que a página foi renderizada, não apenas que a rota existe.
  4. **Teste de Ausência de Erro 404 em Cascade:** Se alguma URL administrativa retornar 404, o teste falha explicitamente com mensagem clara (ex.: "URL `/administrativo/{resource}` retornou 404 — rota renomeada incompleta").

- **Critérios de aceite:**
  - [ ] Teste implementado que acessa `/administrativo/instituicoes` e valida HTTP 200 + Inertia component
  - [ ] Teste implementado que acessa pelo menos 5 URLs administrativas diferentes e valida HTTP 200 em todas
  - [ ] Respostas validam presença de `component` (Inertia), confirmando renderização completa
  - [ ] Nenhuma URL administrativa retorna HTTP 404 ou 5xx
  - [ ] Todos os testes passam (`php artisan test` exit code 0)
  - [ ] Sem logs de erro relacionados a rotas antigas (grep em logs de teste)

---

## S7-INT-04 — Validação de Tipagem TypeScript e Cobertura Completa de Testes Frontend

- **Objetivo:** Assegurar que toda a cadeia de tipagem TypeScript + Ziggy está limpa (nenhuma referência a `route('institucional...')` sobrevive), e que nenhuma regressão foi introduzida no suite de testes frontend.

- **Caso de uso:** P-29 (closed) · D-7 (closed) — validação de contrato frontend-backend pós-rename

- **Atores envolvidos:** Executor (verificação automatizada)

- **Partes afetadas:**
  - `resources/js/` — todos os arquivos TypeScript/TSX
  - Contrato Ziggy (`usePage().props.ziggy.routes`)
  - Suite de testes Jest (`resources/js/**/*.test.ts`, `resources/js/**/*.spec.tsx`)
  - ESLint e Prettier

- **Depende de:** S7-FE-01 (todas as referências de rota atualizadas no frontend)

- **Riscos relacionados:** R-15 (cobertura de referências renomeadas)

- **Casos de teste obrigatórios:**
  1. **Teste de Tipagem:** `npx tsc --noEmit` retorna exit code 0 (Ziggy não reporta nenhuma rota `institucional.*` como válida).
  2. **Teste de Cobertura Léxica (Grep):** `grep -r "'institucional\." resources/js` e `grep -r '"institucional\.'` resources/js` não encontram nada (0 ocorrências).
  3. **Teste de Suite Jest:** `npx jest` executa com 100% de testes passando (exit code 0, nenhum `FAIL`).
  4. **Teste de Linter:** `npx eslint resources/js --suppressions-location <(echo '{}')` retorna exit code 0 (sem novas supressões introduzidas; débito técnico pré-existente não é bloqueante).

- **Critérios de aceite:**
  - [ ] `npx tsc --noEmit` retorna exit code 0
  - [ ] `grep -r "'institucional\." resources/js` retorna 0 linhas
  - [ ] `grep -r '"institucional\.'` resources/js` retorna 0 linhas
  - [ ] `npx jest` — 100% de testes passando (exit code 0)
  - [ ] `npx eslint resources/js --suppressions-location <(echo '{}')` — exit code 0, sem novas supressões
  - [ ] `npx prettier --write resources/js` executado (se houver divergências de formatação em S7-FE-01)
  - [ ] Nenhuma referência a `route_match('institucional`, `route_has('institucional`, ou similar sobrevive

---

## Checklist de Conclusão da Trilha Integração

- [ ] S7-INT-01 implementado e testado — rotas antigas confirmadas inexistentes
- [ ] S7-INT-02 implementado e testado — rotas novas confirmadas funcionais
- [ ] S7-INT-03 implementado e testado — navegação completa validada
- [ ] S7-INT-04 implementado e testado — tipagem e suite limpos
- [ ] `npx tsc --noEmit` — exit code 0
- [ ] `npx jest` — 100% verde
- [ ] `docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test` — 100% verde
- [ ] `npx eslint resources/js --suppressions-location <(echo '{}')` — sem novas supressões
- [ ] Nenhuma regra inviolável violada
