# Backend — Backlog Sprint 0

## S0-BE-01 — Extrair helper de resolução null-safe do escopo institucional

- **Objetivo:** Eliminar o NPE de `Auth::user()->setor->unidade->instituicao_id` criando um ponto único de
  resolução que trata `setor_id` / `setor` / `unidade` nulos sem erro fatal.

- **Caso de uso:** Nenhum (correção técnica sem UC próprio — relacionado ao risco R-12).

- **Atores envolvidos:** Nenhum ator específico (correção de infra).

- **Partes afetadas:**
  - Novo helper ou método em serviço dedicado (nome e local a critério de quem implementar, ex.:
    - `app/Services/UserService.php` (método novo)
    - `app/Helpers/InstitucionalScopeHelper.php` (arquivo novo)
    - Trait dedicado em `app/Traits/`)
  - Nenhuma migration

- **Depende de:** Nenhuma.

- **Riscos relacionados:** R-12.

- **Casos de teste obrigatórios:**
  1. `test_helper_retorna_null_quando_setor_id_e_nulo` — Validar que `getInstituicaoIdDoUsuario($user)` (ou similar) retorna `null` sem exceção quando `user.setor_id` é `null`.
  2. `test_helper_retorna_null_quando_setor_existe_mas_unidade_nula` — Validar que o helper não quebra se `Setor` existe mas `unidade_id` é `null`.
  3. `test_helper_retorna_instituicao_id_quando_encadeamento_completo` — Validar que o helper resolve corretamente para `user.setor.unidade.instituicao_id` quando toda a cadeia está preenchida.

- **Critérios de aceite:**
  - [ ] Helper implementado e testado (3 casos de teste listados acima passando)
  - [ ] Helper nunca lança exceção, mesmo com `null` em qualquer ponto da cadeia
  - [ ] O helper tem documentação clara (DocBlock) explicando o seu comportamento com `null`
  - [ ] Nenhuma regressão nos testes existentes

---

## S0-BE-02 — Aplicar o helper nos 5 controllers institucionais + UserService

- **Objetivo:** Substituir as 6 ocorrências do encadeamento `Auth::user()->setor->unidade->instituicao_id` pelo
  helper null-safe, eliminando o risco de NPE em produção.

- **Caso de uso:** Nenhum (correção técnica — P-24 fechou que R-12 deve ser corrigido dentro desta iniciativa).

- **Atores envolvidos:** Nenhum ator específico (correção de infra).

- **Partes afetadas:**
  - `app/Http/Controllers/Institucional/InstitucionalUnidadeController.php` (linhas 32, 50, 74)
  - `app/Http/Controllers/Institucional/InstitucionalModuloController.php` (linhas 34, 57, 82)
  - `app/Http/Controllers/Institucional/InstitucionalSetorController.php` (linha 36)
  - `app/Http/Controllers/Institucional/InstitucionalEspacoController.php` (linhas 35, 52, 94)
  - `app/Services/UserService.php` (linha 45)

- **Depende de:** S0-BE-01.

- **Riscos relacionados:** R-12.

- **Casos de teste obrigatórios:**
  1. `test_institucional_sem_setor_acessa_unidades_sem_erro_500` — Feature test: usuário `institucional` sem `setor_id` chama `InstitucionalUnidadeController` (GET/POST/PATCH) e retorna 200/formulário/sucesso, nunca 500.
  2. `test_institucional_sem_setor_acessa_modulos_sem_erro_500` — Feature test: mesmo cenário para `InstitucionalModuloController`.
  3. `test_institucional_sem_setor_acessa_setores_sem_erro_500` — Feature test: mesmo cenário para `InstitucionalSetorController`.
  4. `test_institucional_sem_setor_acessa_espacos_sem_erro_500` — Feature test: mesmo cenário para `InstitucionalEspacoController`.
  5. `test_user_service_get_institucao_id_sem_setor_id` — Unit test: `UserService` resolve corretamente `instituicao_id` para usuário sem `setor_id`.

- **Critérios de aceite:**
  - [ ] Todas as 6 ocorrências substituídas pelo helper
  - [ ] Os 5 testes de feature listados acima passando (um por controller)
  - [ ] Teste de `UserService` passando
  - [ ] Nenhuma regressão nos testes de autorização existentes (`ReservaAuthorizationTest`, etc.)
  - [ ] `docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test` — 100% verde
  - [ ] `docker exec uniespacos-workspace-1 vendor/bin/pint` aplicado

---

## S0-BE-03 — Remover permissions órfãs de Andar

- **Objetivo:** Remover `andares.criar` e `andares.atualizar` do `PermissionSeeder` e de qualquer tabela de
  permissões, pois nunca são verificadas em nenhum ponto do backend (Andar é governado por `ModuloPolicy` via
  transitividade).

- **Caso de uso:** Nenhum (correção técnica — P-32 fechou a remoção).

- **Atores envolvidos:** Nenhum ator específico (correção de infra).

- **Partes afetadas:**
  - `database/seeders/Production/PermissionSeeder.php` (remover 2 linhas)
  - Nova migration aditiva `YYYY_MM_DD_HHMMSS_remove_orphan_andares_permissions` (remover dados de `permissions`, não estrutura de tabela)
  - Nenhuma alteração de schema (não é `dropColumn`, é só `DELETE` na tabela `permissions`)

- **Depende de:** Nenhuma.

- **Riscos relacionados:** P-32.

- **Casos de teste obrigatórios:**
  1. `test_migration_remove_andares_criar_permission` — Validar que a migration remove `andares.criar` sem erro, mesmo que roles já tenham essa permission atribuída.
  2. `test_migration_remove_andares_atualizar_permission` — Validar que a migration remove `andares.atualizar` sem erro, mesmo que roles já tenham essa permission atribuída.

- **Critérios de aceite:**
  - [ ] Migration criada (nome seguindo padrão temporal)
  - [ ] `PermissionSeeder` atualizado (remover 2 `create()` de `andares.criar` e `andares.atualizar`)
  - [ ] Após rodar a migration, as 2 permissions não existem mais em `permissions`
  - [ ] Nenhum papel (`roles_has_permissions`) referencia essas 2 permissions
  - [ ] Migration é reversível (para deploy seguro) — `down()` reinsere as permissions
  - [ ] Os 2 testes de migration listados acima passando
  - [ ] `docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test` — 100% verde

