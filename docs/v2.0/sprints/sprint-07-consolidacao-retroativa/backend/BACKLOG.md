# Sprint 7 — Backend: Rename de Rotas Administrativas

---

## S7-BE-01 — Rename atômico do prefixo de rota em `routes/web.php`

- **Objetivo:** Substituir `Route::prefix('institucional')->name('institucional.')` por `Route::prefix('administrativo')->name('administrativo.')` numa única mudança, garantindo que URL e nome de rota permaneçam sincronizados.

- **Caso de uso:** P-29 (closed) · D-7 (closed)

- **Atores envolvidos:** Institucional (supervisor da mudança)

- **Partes afetadas:**
  - `routes/web.php` — bloco de middleware que agrupa todas as rotas administrativas
  - 9 rotas nomeadas em `routes/web.php` que começam com `prefix('institucional')`
  - Possível middleware ou comentários que mencionam "institucional"

- **Depende de:** Nenhuma (mudança isolada de rota)

- **Riscos relacionados:** R-15 (semântica de rotas — cosmético, mitigado por esta task)

- **Casos de teste obrigatórios:**
  1. **Teste de Rota Existente:** Confirmar que `route('administrativo.modulos.index')` existe e é resolvível por Ziggy
  2. **Teste de Rota Não-Existente:** Confirmar que `route('institucional.modulos.index')` lança `InvalidArgumentException` (rota foi removida)
  3. **Teste de Acesso Físico:** GET `/administrativo/modulos` com usuário autenticado + permission `secao.gestao-modulos` retorna HTTP 200 (não 404, não 403)
  4. **Teste de Fallback 404:** GET `/institucional/modulos` retorna HTTP 404 (URL antiga não funciona)

- **Critérios de aceite:**
  - [ ] `Route::prefix('institucional')` **não existe mais** em `routes/web.php`
  - [ ] `Route::prefix('administrativo')` existe e está nomeado como `->name('administrativo.')`
  - [ ] Todas as 9 rotas do grupo podem ser listadas com `php artisan route:list | grep administrativo` (ou equivalente)
  - [ ] Nenhum comentário ou string em `routes/web.php` menciona "institucional" como prefixo (documentação desatualizada)
  - [ ] `vendor/bin/pint` aplicado (formatação PHP)
  - [ ] Nenhuma regra inviolável violada

---

## S7-BE-02 — Auditoria de testes de backend que referenciam rotas por nome

- **Objetivo:** Localizar todos os testes de backend que usam `route('institucional.*')` e atualizá-los para `route('administrativo.*')`, garantindo que o teste suite passe em 100% após o rename de rotas.

- **Caso de uso:** Validação de integridade após P-29

- **Atores envolvidos:** Executor (testes)

- **Partes afetadas:**
  - `tests/` (todos os diretórios)
  - Qualquer `route('institucional.*')` em fixtures, setup, assertions ou mocks
  - Possivelmente `route_match()` ou `route_has()` se existirem em testes

- **Depende de:** S7-BE-01 (o rename de rotas deve estar feito)

- **Riscos relacionados:** Regressão de testes — testes com nomes antigos falham silenciosamente

- **Casos de teste obrigatórios:**
  1. **Teste de Cobertura Completa:** `grep -r "route('institucional\." tests/` retorna 0 ocorrências (100% atualizado)
  2. **Teste de Execução:** `php artisan test` roda com 100% de suites passando, sem erros de rota não encontrada

- **Critérios de aceite:**
  - [ ] `grep -r "route('institucional" tests/` não encontra nada
  - [ ] `grep -r "route_match('institucional" tests/` não encontra nada
  - [ ] Todos os `route('administrativo.*')` usados em testes existem no `routes/web.php` renomeado
  - [ ] `php artisan test` executa com exit code 0
  - [ ] Nenhuma assertion quebrada por causa do rename

---

## S7-BE-03 — Verificação de URLs e rotas hardcoded em e-mails e notificações

- **Objetivo:** Garantir que nenhuma classe `Notification` ou template de e-mail hardcoda URLs antigas `/institucional/*` que deixaria de funcionar após o rename de rotas.

- **Caso de uso:** Regressão de usabilidade — um usuário recebe um e-mail com link antigo que aponta para 404

- **Atores envolvidos:** Qualquer usuário que recebe notificações

- **Partes afetadas:**
  - `app/Notifications/` (todas as classes que geram e-mails)
  - `resources/views/` (templates de e-mail, se houver)
  - Qualquer `helper` ou serviço que monta URLs para notificações

- **Depende de:** S7-BE-01 (o rename deve estar completo)

- **Riscos relacionados:** Regressão de e-mail — links mortos em notificações

- **Casos de teste obrigatórios:**
  1. **Teste de Grep:** `grep -r "/institucional/" app/Notifications/ resources/views/` não encontra URLs completas (apenas comentários históricos são ok)
  2. **Teste de Rota Helper:** Qualquer notificação que usa `route('...')` não usa o nome antigo `institucional.*` (auditoria em tempo de teste via `ReflectionClass` se necessário, ou simplesmente verificação manual)

- **Critérios de aceite:**
  - [ ] Nenhuma string `/institucional/` hardcoded em classes `Notification`
  - [ ] Nenhuma string `/institucional/` hardcoded em templates de e-mail
  - [ ] Qualquer URL gerada via `route()` usa nomes de rota válidos (S7-BE-01 garante que existem)
  - [ ] Verificação manual de e-mails transacionais não aponta para URLs antigas
  - [ ] Se houver comentários históricos com `/institucional/`, marcá-los explicitamente como deprecated (não remover, apenas documentar)

---

## Checklist de Conclusão da Trilha Backend

- [ ] S7-BE-01 implementado e testado
- [ ] S7-BE-02 auditoria concluída, testes passando
- [ ] S7-BE-03 auditoria concluída, nenhuma URL hardcoded encontrada
- [ ] `php artisan test` — 100% verde
- [ ] `vendor/bin/pint` aplicado em todos os arquivos tocados
- [ ] Nenhuma regra inviolável violada
