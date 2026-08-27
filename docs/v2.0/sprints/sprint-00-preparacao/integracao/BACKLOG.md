# Integração — Backlog Sprint 0

## S0-INT-01 — Regressão: usuário institucional sem `setor_id` acessa telas administrativas sem erro 500

- **Objetivo:** Prova de ponta a ponta (request HTTP real, `DatabaseTransactions`) de que o bug R-12 foi
  eliminado — nenhuma rota administrativa retorna 500 para usuário `institucional` sem `setor_id`.

- **Caso de uso:** Nenhum (correção técnica — validação de que R-12 não é mais alcançável após S0-BE-02).

- **Atores envolvidos:** Nenhum ator específico (teste de regressão de infra).

- **Partes afetadas:**
  - `tests/Feature/` (nova suíte `InstitucionalSemSetorTest.php` ou adição a suíte existente)
  - Nenhuma alteração de código de produção (teste puro)

- **Depende de:** S0-BE-02 (o helper e as aplicações dele precisam estar prontos).

- **Riscos relacionados:** R-12.

- **Casos de teste obrigatórios:**
  1. `test_institucional_sem_setor_lista_unidades_retorna_200` — GET `/administrativo/unidades` com usuário `institucional` sem `setor_id` retorna 200 e lista.
  2. `test_institucional_sem_setor_visualiza_unidade_retorna_200` — GET `/administrativo/unidades/{id}` retorna 200.
  3. `test_institucional_sem_setor_cria_modulo_retorna_sucesso` — POST `/administrativo/modulos` com dados válidos retorna 201/200, não 500.
  4. `test_institucional_sem_setor_lista_setores_retorna_200` — GET `/administrativo/setores` retorna 200.
  5. `test_institucional_sem_setor_lista_espacos_retorna_200` — GET `/administrativo/espacos` retorna 200.

- **Critérios de aceite:**
  - [ ] Suíte `InstitucionalSemSetorTest` criada (ou casos adicionados a suíte existente)
  - [ ] Os 5 testes listados acima passando — **nenhum retorna 500**
  - [ ] User factory tem suporte a criar usuário com `setor_id = null` (ou usar `forceFill()` para anular após criação)
  - [ ] Testes usam `DatabaseTransactions` (nunca `RefreshDatabase`)
  - [ ] `docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test` — 100% verde
  - [ ] Nenhuma regressão nos testes de autorização existentes

---

## S0-INT-02 — Regressão: permissions órfãs não aparecem em nenhuma tela

- **Objetivo:** Prova de que a remoção do backend (S0-BE-03) e do frontend (S0-FE-01) se refletem corretamente
  — tela de gerenciamento de Roles não lista `andares.criar`/`andares.atualizar` em nenhuma role.

- **Caso de uso:** Nenhum (correção técnica — validação de que P-32 foi aplicado corretamente).

- **Atores envolvidos:** Nenhum ator específico (teste de regressão de infra).

- **Partes afetadas:**
  - `tests/Feature/` (nova suíte `PermissionOrfasTest.php` ou adição a suíte existente)
  - Nenhuma alteração de código de produção (teste puro)

- **Depende de:** S0-BE-03 (migration de remoção), S0-FE-01 (remoção de rótulos).

- **Riscos relacionados:** P-32.

- **Casos de teste obrigatórios:**
  1. `test_andares_criar_permission_nao_existe_no_banco` — Consultar tabela `permissions` e validar que `andares.criar` não existe.
  2. `test_andares_atualizar_permission_nao_existe_no_banco` — Consultar tabela `permissions` e validar que `andares.atualizar` não existe.

- **Critérios de aceite:**
  - [ ] Suíte `PermissionOrfasTest` criada (ou casos adicionados a suíte existente)
  - [ ] Os 2 testes listados acima passando
  - [ ] Nenhuma role em `roles_has_permissions` referencia `andares.criar` ou `andares.atualizar`
  - [ ] Testes usam `DatabaseTransactions`
  - [ ] `docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test` — 100% verde
  - [ ] Frontend (`npx jest`) — 100% verde, sem import de `andares.criar`/`andares.atualizar` em nenhum teste

