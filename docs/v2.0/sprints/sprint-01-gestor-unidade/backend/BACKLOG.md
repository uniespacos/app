# Sprint 1 — Backend Backlog (S1-BE-01 a S1-BE-13)

## S1-BE-01 — Migration: Criar Tabela `unidade_gestores`

- **Objetivo:** Criar a tabela de relacionamento N:N entre Unidades e Usuários para representar a atribuição de
  Gestores de Unidade.
- **Caso de uso:** UC-19 (Atribuir Gestor de Unidade a uma Unidade)
- **Atores envolvidos:** Institucional (realiza atribuição); Gestor de Unidade (é atribuído)
- **Partes afetadas:**
  - `database/migrations/YYYY_MM_DD_HHMMSS_create_unidade_gestores_table.php` (nova)
- **Depende de:** Nenhuma
- **Riscos relacionados:** R-18, R-01
- **Casos de teste obrigatórios:**
  - `test_migration_creates_unidade_gestores_table` — valida que a tabela foi criada com as colunas corretas
  - `test_unidade_gestores_unique_constraint` — valida que `UNIQUE(unidade_id, user_id)` previne duplicação
  - `test_unidade_gestores_cascade_delete_on_user` — valida que `ON DELETE CASCADE` em `user_id` remove vínculo quando
    usuário é deletado
  - `test_unidade_gestores_cascade_delete_on_unidade` — valida que `ON DELETE CASCADE` em `unidade_id` remove vínculo
    quando unidade é deletada
- **Critérios de aceite:**
  - [ ] Migration cria tabela `unidade_gestores` com campos `id`, `unidade_id`, `user_id`, `created_at`, `updated_at`
  - [ ] `unidade_id` é `BIGINT NOT NULL`, FK referenciando `unidades(id)` com `ON DELETE CASCADE`
  - [ ] `user_id` é `BIGINT NOT NULL`, FK referenciando `users(id)` com `ON DELETE CASCADE`
  - [ ] Constraint `UNIQUE(unidade_id, user_id)` previne dupla atribuição do mesmo gestor à mesma unidade
  - [ ] `php artisan migrate` (incremental, nunca `migrate:fresh` — comando banido) executa sem erro
  - [ ] `php artisan migrate:rollback` executa sem erro (método `down()` implementado com `dropIfExists`)

---

## S1-BE-02 — Migration + Seeder: Criar Role `gestor_unidade`

- **Objetivo:** Criar o role `gestor_unidade` no seeder de roles, registrando-o como sistema (`is_system = true`) sem
  nenhuma permission pré-atribuída.
- **Caso de uso:** UC-13 (Criar novo ator: Gestor de Unidade), UC-19 (Atribuir Gestor de Unidade)
- **Atores envolvidos:** Sistema (bootstrap), Institucional (atribui o role a usuários)
- **Partes afetadas:**
  - `database/seeders/RoleSeeder.php` (estendida) — adiciona linha do role `gestor_unidade`
  - `database/migrations/YYYY_MM_DD_HHMMSS_create_gestor_unidade_role.php` (alternativa: migration de dados)
- **Depende de:** S1-BE-01
- **Riscos relacionados:** R-18 (este role ainda não tem nenhuma permission — o risco só materializa em S1-BE-13)
- **Casos de teste obrigatórios:**
  - `test_role_gestor_unidade_exists` — valida que o role foi criado com `is_system = true`
  - `test_role_gestor_unidade_has_no_permissions_initially` — valida que o role não tem permissions atribuídas antes
    de S1-BE-13
  - `test_user_can_be_assigned_gestor_unidade_role` — valida que um usuário consegue receber o role sem erro
- **Critérios de aceite:**
  - [ ] Seeder `RoleSeeder` cria linha com `name = 'gestor_unidade'`, `guard_name = 'web'`, `is_system = true`
  - [ ] Query `Role::where('name', 'gestor_unidade')->first()` retorna a role criada
  - [ ] Nenhuma permission é pré-atribuída ao role nesta task (será feito em S1-BE-13)
  - [ ] `php artisan db:seed --class=RoleSeeder` executa sem erro
  - [ ] A role é imediatamente atribuível a usuários via Spatie (`$user->assignRole('gestor_unidade')`)

---

## S1-BE-03 — Migration: Adicionar Coluna `label_gestor` em `unidades`

- **Objetivo:** Adicionar coluna `label_gestor` (VARCHAR(100) NULL) na tabela `unidades` para permitir customização
  do rótulo do cargo "Gestor de Unidade" por campus (ex.: "Prefeitura do Campus", "Assessoria Acadêmica").
- **Caso de uso:** P-13 (Customização de rótulo)
- **Atores envolvidos:** Gestor de Unidade (edita o rótulo via endpoint dedicado), Institucional
- **Partes afetadas:**
  - `database/migrations/YYYY_MM_DD_HHMMSS_add_label_gestor_to_unidades_table.php` (nova)
- **Depende de:** Nenhuma (pode ser executada independentemente, mas S1-BE-03 é apenas schema)
- **Riscos relacionados:** Nenhum específico; coluna é puramente cosmética, nunca usada em lógica de autorização
- **Casos de teste obrigatórios:**
  - `test_migration_adds_label_gestor_column` — valida que a coluna foi criada e é nullable
  - `test_unidade_label_gestor_defaults_null` — valida que registros existentes não quebram (default NULL)
- **Critérios de aceite:**
  - [ ] Migration adiciona coluna `label_gestor` como `VARCHAR(100) NULL` em `unidades`
  - [ ] Coluna tem default NULL, não foi criada como NOT NULL
  - [ ] `php artisan migrate` (incremental, nunca `migrate:fresh` — comando banido) executa sem erro
  - [ ] `php artisan migrate:rollback` executa sem erro

---

## S1-BE-04 — Relations Eloquent: Métodos `gestores()` e `unidadesGeridas()`

- **Objetivo:** Implementar as relações bidirecionais `BelongsToMany` entre `Unidade` e `User`, permitindo consultas
  eficientes como `$unidade->gestores()` e `$user->unidadesGeridas()`.
- **Caso de uso:** UC-19 (Listar gestores de uma Unidade), UC-15 (Gestor de Unidade lista/edita recursos)
- **Atores envolvidos:** Gestor de Unidade, Institucional
- **Partes afetadas:**
  - `app/Models/Unidade.php` — adiciona método `gestores()` retornando `BelongsToMany`
  - `app/Models/User.php` — adiciona método `unidadesGeridas()` retornando `BelongsToMany`
- **Depende de:** S1-BE-01
- **Riscos relacionados:** Nenhum específico
- **Casos de teste obrigatórios:**
  - `test_unidade_has_gestores_relation` — valida que `$unidade->gestores()` retorna `BelongsToMany`
  - `test_user_has_unidades_geridas_relation` — valida que `$user->unidadesGeridas()` retorna `BelongsToMany`
  - `test_attach_user_as_gestor_unidade` — valida que é possível fazer `$unidade->gestores()->attach($userId)`
  - `test_eager_load_gestores_via_with` — valida que `Unidade::with('gestores')->find()` funciona
  - `test_lazy_eager_load_gestores_via_load` — valida que `$unidade->load('gestores')` funciona
- **Critérios de aceite:**
  - [ ] `Unidade::find($id)->gestores()` retorna `BelongsToMany` sobre tabela `unidade_gestores`
  - [ ] `User::find($id)->unidadesGeridas()` retorna `BelongsToMany` sobre tabela `unidade_gestores`
  - [ ] Eager loading via `with('gestores')` e `with('unidadesGeridas')` funciona sem N+1
  - [ ] Relação é simétrica: se A é gestor de B, então B tem A em seus gestores

---

## S1-BE-05 — Repository: `UnidadeRepositoryInterface::getUnidadesGeridasPor()`

- **Objetivo:** Implementar método em `UnidadeRepositoryInterface` que retorna as Unidades geridas por um usuário
  específico; vincular implementação Eloquent no `AppServiceProvider`.
- **Caso de uso:** UC-15 (Filtrar recursos do usuário), UC-19 (Validar escopo em atribuição)
- **Atores envolvidos:** Gestor de Unidade, Institucional
- **Partes afetadas:**
  - `app/Contracts/UnidadeRepositoryInterface.php` — adiciona assinatura do método
  - `app/Repositories/UnidadeRepositoryEloquent.php` — implementação Eloquent
  - `app/Providers/AppServiceProvider.php` — confirmação de binding (já existe)
- **Depende de:** S1-BE-04
- **Riscos relacionados:** R-01 (escopo vazando), R-07 (alto volume de Policies que dependem deste)
- **Casos de teste obrigatórios:**
  - `test_get_unidades_geridas_por_user_returns_collection` — valida que retorna `Collection`
  - `test_get_unidades_geridas_por_user_filters_correctly` — valida que um gestor de U1 e U2 recebe só essas duas
  - `test_get_unidades_geridas_por_user_returns_empty_for_user_without_unidades` — usuário sem vínculo retorna
    `Collection` vazia
  - `test_get_unidades_geridas_por_user_respects_cascade_delete` — quando vínculo é deletado, user não mais aparece
- **Critérios de aceite:**
  - [ ] Método assinado em `UnidadeRepositoryInterface` com tipo `Collection`
  - [ ] Implementação em `UnidadeRepositoryEloquent` usa `$user->unidadesGeridas()` ou query equiv.
  - [ ] Método aceita `int $userId` como parâmetro
  - [ ] Retorna `Collection` vazia se o usuário não é gestor de nenhuma unidade
  - [ ] Retorna exatamente as unidades para as quais o usuário foi atribuído via `unidade_gestores`
  - [ ] Binding em `AppServiceProvider` está em vigor

---

## S1-BE-06 — Extensão de `RelatorioService::aplicarEscopo()` para `gestor_unidade`

- **Objetivo:** Estender o método `aplicarEscopo()` em `app/Services/Relatorio/RelatorioService.php` para filtrar
  queries de relatório quando o usuário autenticado é `gestor_unidade`, restringindo a `unidade_id` nas unidades
  geridas.
- **Caso de uso:** UC-15 (Relatórios escopados), UC-18 (Dashboard do Gestor de Unidade)
- **Atores envolvidos:** Gestor de Unidade, Institucional
- **Partes afetadas:**
  - `app/Services/Relatorio/RelatorioService.php` — método `aplicarEscopo()` estendido
- **Depende de:** S1-BE-05
- **Riscos relacionados:** R-01 (escopo vazando de relatório)
- **Casos de teste obrigatórios:**
  - `test_aplicar_escopo_passes_through_for_institucional` — gestor institucional não tem filtro
  - `test_aplicar_escopo_filters_by_unidade_id_for_gestor_unidade` — gestor de U1 vê só U1 em relatório
  - `test_aplicar_escopo_returns_empty_for_gestor_without_unidades` — se não é gestor de nada, retorna filtro
    impossível
- **Critérios de aceite:**
  - [ ] Método `aplicarEscopo()` verifica `$usuario->hasRole('gestor_unidade')`
  - [ ] Se sim, carrega unidades via `UnidadeRepositoryInterface::getUnidadesGeridasPor()` e adiciona
    `whereIn('unidade_id', $unidadeIds)` ao filtro
  - [ ] Se não, comportamento já existente é preservado
  - [ ] Testes cobrindo ambos os casos (tem unidades / não tem unidades)

---

## S1-BE-07 — Policy: Estender `UnidadePolicy` para Aceitar `gestor_unidade`

- **Objetivo:** Estender `UnidadePolicy` para permitir que `gestor_unidade` **edite apenas o campo `label_gestor` de
  sua(s) própria(s) Unidade(s)**, nunca **crie** ou **delete** Unidades, e nunca edite `nome`/`sigla`.
- **Caso de uso:** UC-15 (Gestor de Unidade edita configurações), P-33 (Gestor de Unidade pode editar a própria
  Unidade, mas com restrições), D-8 (Limitar a `label_gestor`)
- **Atores envolvidos:** Gestor de Unidade, Institucional
- **Partes afetadas:**
  - `app/Policies/UnidadePolicy.php` — métodos `create()`, `update()`, `delete()` estendidos ou restritos
- **Depende de:** S1-BE-05, S1-BE-01
- **Riscos relacionados:** R-01 (escopo vazando)
- **Casos de teste obrigatórios:**
  - `test_gestor_unidade_cannot_create_unidade` — blocked sempre
  - `test_gestor_unidade_cannot_delete_unidade` — blocked sempre
  - `test_gestor_unidade_can_edit_label_gestor_of_own_unidade` — edita `label_gestor` de U1 se é gestor de U1
  - `test_gestor_unidade_cannot_edit_label_gestor_of_other_unidade` — blocked se não é gestor de U2
  - `test_gestor_unidade_cannot_edit_nome_or_sigla` — blocked para alteração de identidade do campus
  - `test_institucional_can_create_update_delete_unidade` — super-role preservado
  - `test_unidade_policy_uses_or_not_xor` — valida que é `OR` (institucional **ou** gestor de unidade), não `XOR`
    (P-22)
- **Critérios de aceite:**
  - [ ] `create()` retorna `false` para `gestor_unidade` (qualquer validação); `true` para `institucional`
  - [ ] `update()` verifica:
    - Se ator é `institucional` → sempre `true`
    - Se ator é `gestor_unidade` → `true` **somente se** `unidade_id IN getUnidadesGeridasPor($user)` **E** request
      contém **apenas** campos de `label_gestor` (validar no middleware/request, não na Policy)
    - Nenhum outro ator consegue atualizar
  - [ ] `delete()` retorna `false` para `gestor_unidade`; `true` para `institucional`
  - [ ] Usar `OR` com `institucional`, nunca `XOR` (preservar capacidade técnica do super-role)

---

## S1-BE-08 — Policies: Estender `ModuloPolicy`, `SetorPolicy`, `EspacoPolicy` com Escopo `gestor_unidade`

- **Objetivo:** Estender `ModuloPolicy`, `SetorPolicy` e `EspacoPolicy` para aceitar `gestor_unidade` em métodos
  `viewAny()`, `view()`, `create()`, `update()`, `delete()` — validando obrigatoriamente `unidade_id IN
  unidadesGeridas($user)` em cada checagem. **Esta é a tarefa mais crítica do Sprint (coração do risco R-18).**
- **Caso de uso:** UC-15 (Gestor de Unidade lista/edita Módulos/Setores/Espaços), UC-15-B (Bootstrap de Unidade)
- **Atores envolvidos:** Gestor de Unidade, Institucional
- **Partes afetadas:**
  - `app/Policies/ModuloPolicy.php` — estendida com validação de escopo
  - `app/Policies/SetorPolicy.php` — estendida com validação de escopo
  - `app/Policies/EspacoPolicy.php` — estendida com validação de escopo
- **Depende de:** S1-BE-05
- **Riscos relacionados:** **R-18** (sequenciamento de permissions — ⚠️ este é o ponto crítico), R-01 (escopo
  vazando), R-07 (alto volume de Policies)
- **Casos de teste obrigatórios (CROSS-CAMPUS — 2 campi, 2 gestores):**
  - `test_gestor_unidade_can_view_modulos_of_own_unidade` — Gestor de U1 vê módulos de U1
  - `test_gestor_unidade_cannot_view_modulos_of_other_unidade` — Gestor de U1 **bloqueado** em módulos de U2
  - `test_gestor_unidade_can_create_modulo_in_own_unidade` — Gestor de U1 cria em U1
  - `test_gestor_unidade_cannot_create_modulo_in_other_unidade` — Gestor de U1 **bloqueado** em U2
  - `test_gestor_unidade_can_update_modulo_of_own_unidade` — Gestor de U1 edita módulo de U1
  - `test_gestor_unidade_cannot_update_modulo_of_other_unidade` — Gestor de U1 **bloqueado** em módulo de U2
  - `test_gestor_unidade_can_delete_modulo_of_own_unidade` — Gestor de U1 deleta em U1
  - `test_gestor_unidade_cannot_delete_modulo_of_other_unidade` — Gestor de U1 **bloqueado** em U2
  - (Repetir para Setor e Espaço com mesmos padrões)
  - `test_institucional_can_view_edit_delete_all_modulos_setores_espacos` — super-role preservado
  - `test_modulo_policy_andar_covered_by_transitividade` — Andar não tem Policy própria; sua autorização vem de
    `ModuloPolicy`
- **Critérios de aceite:**
  - [ ] Cada método (`viewAny`, `view`, `create`, `update`, `delete`) em cada Policy valida: ator é
    `institucional` **OR** ator é `gestor_unidade` **E** `$resource->unidade_id IN
    unidadesGeridas($user)`
  - [ ] Validação é feita via `$this->unidadeRepository->getUnidadesGeridasPor($user->id)->contains($modeloUnidadeId)`
    ou query explícita (nunca confiar só em permission genérica)
  - [ ] Nenhuma "falha silenciosa" — unauthorized retorna 403, não 404
  - [ ] Usar `OR`, nunca `XOR` (preservar `institucional`)
  - [ ] Testes cobrem cross-campus (2+ campi, 2+ gestores) — validando que escopo não vaza
  - [ ] Andar é coberto por transitividade de Módulo (sem Policy própria)

---

## S1-BE-09 — Repositories: Aplicar Escopo em Queries de Listagem/Edição

- **Objetivo:** Adicionar escopo nos repositórios de `Modulo`, `Setor` e `Espaco` para filtrar automaticamente por
  `unidade_id` quando o usuário é `gestor_unidade`, garantindo defesa em profundidade (validação ocorre em query,
  não só em Policy).
- **Caso de uso:** UC-15 (Listagem/edição de recursos escopados)
- **Atores envolvidos:** Gestor de Unidade, Institucional
- **Partes afetadas:**
  - `app/Repositories/ModuloRepositoryEloquent.php` — query de listagem/edição estendida
  - `app/Repositories/SetorRepositoryEloquent.php` — query de listagem/edição estendida
  - `app/Repositories/EspacoRepositoryEloquent.php` — query de listagem/edição estendida
- **Depende de:** S1-BE-05
- **Riscos relacionados:** R-01 (escopo vazando), defesa em profundidade
- **Casos de teste obrigatórios:**
  - `test_modulo_repository_list_filters_by_unidade_for_gestor_unidade` — listagem retorna só módulos de U1
  - `test_setor_repository_list_filters_by_unidade_for_gestor_unidade` — listagem retorna só setores de U1
  - `test_espaco_repository_list_filters_by_unidade_for_gestor_unidade` — listagem retorna só espaços de U1
  - `test_repository_list_includes_all_unidades_for_institucional` — super-role não tem filtro
  - `test_repository_edit_respects_escopo` — ao tentar editar recurso de U2, query retorna 0 registros
- **Critérios de aceite:**
  - [ ] Repositório de `Modulo::where()` aplica `whereIn('unidade_id', $unidadeIdsGeridas)` quando
    `Auth::user()->hasRole('gestor_unidade')`
  - [ ] Mesmo para `Setor` e `Espaco` (espaço é acessado via `andar.modulo.unidade_id`)
  - [ ] Filtro é aplicado **no repositório**, não no controller (separação de camadas)
  - [ ] Institucional não tem nenhum filtro aplicado
  - [ ] Testes cobrem cenário de gestor de U1 não conseguindo tocar U2

---

## S1-BE-10 — Controller + Service + Request: Atribuição de Gestores de Unidade

- **Objetivo:** Implementar novo método `InstitucionalUnidadeController::alterarGestores()` + `AlterarGestoresUnidadeRequest`
  + `UnidadeService::syncGestores()` para adicionar/remover Gestores de Unidade de uma Unidade. Criar nova permission
  `unidades.gerenciar-gestores`.
- **Caso de uso:** UC-19 (Atribuir Gestor de Unidade a uma Unidade), UC-13 (Criar novo ator)
- **Atores envolvidos:** Institucional (realiza atribuição)
- **Partes afetadas:**
  - `app/Http/Controllers/Institucional/InstitucionalUnidadeController.php` — novo método `alterarGestores()`
  - `app/Http/Requests/AlterarGestoresUnidadeRequest.php` (nova)
  - `app/Services/UnidadeService.php` — novo método `syncGestores()`
  - `database/seeders/PermissionSeeder.php` — adiciona `unidades.gerenciar-gestores`
  - `resources/js/constants/permission-labels.ts` — rótulo i18n da nova permission
- **Depende de:** S1-BE-02, S1-BE-04
- **Riscos relacionados:** R-05 (notificação sem `ShouldQueue`)
- **Casos de teste obrigatórios:**
  - `test_institucional_can_assign_gestor_to_unidade` — POST/PATCH para atribuir sucede
  - `test_institucional_can_remove_gestor_from_unidade` — remoção de gestor sucede
  - `test_alter_gestores_requires_permission` — sem permission falha com 403
  - `test_alter_gestores_request_validates_user_ids_exist` — user_id inválido falha em validação
  - `test_alter_gestores_request_validates_unidade_exists` — unidade_id inválido falha
  - `test_sync_gestores_sends_notifications` — notificações são despachadas (verifica call a `notify()`)
- **Critérios de aceite:**
  - [ ] Rota criada (ex.: `PATCH /institucional/unidades/{unidade}/gestores`)
  - [ ] Controller aceita array de `user_id`s (sync/replace)
  - [ ] `AlterarGestoresUnidadeRequest` valida que `user_id` existe e que Unidade existe
  - [ ] `UnidadeService::syncGestores()` usa `$unidade->gestores()->sync($userIds)`
  - [ ] Permission `unidades.gerenciar-gestores` é criada e atribuída apenas a `institucional`
  - [ ] Notificações são disparadas (verá em S1-BE-12)

---

## S1-BE-11 — Endpoint Estreito: `PATCH /unidades/{unidade}/label-gestor`

- **Objetivo:** Criar endpoint isolado e estreito para editar **somente** o campo `label_gestor` de uma Unidade,
  acessível ao `gestor_unidade` da Unidade (via Policy) e ao `institucional`. Isolado do `update()` genérico para
  evitar `UpdateUnidadeRequest` com regras condicionais por papel.
- **Caso de uso:** UC-15 (Gestor de Unidade customiza rótulo), P-13, D-8
- **Atores envolvidos:** Gestor de Unidade, Institucional
- **Partes afetadas:**
  - `app/Http/Controllers/Institucional/InstitucionalUnidadeController.php` — novo método `atualizarLabelGestor()`
  - `app/Http/Requests/AtualizarLabelGestorUnidadeRequest.php` (nova)
- **Depende de:** S1-BE-07
- **Riscos relacionados:** Nenhum específico (escopo já é garantido por S1-BE-07)
- **Casos de teste obrigatórios:**
  - `test_gestor_unidade_can_update_label_gestor_of_own_unidade` — PATCH sucede para Gestor de U1 editando U1
  - `test_gestor_unidade_cannot_update_label_gestor_of_other_unidade` — PATCH falha com 403 para Gestor de U1 em U2
  - `test_update_label_gestor_request_validates_input` — request valida string máx 100 caracteres
  - `test_update_label_gestor_only_updates_label_field` — verificar que `nome`/`sigla` NÃO mudam
  - `test_institucional_can_update_any_label_gestor` — super-role pode editar qualquer uma
- **Critérios de aceite:**
  - [ ] Rota criada (ex.: `PATCH /institucional/unidades/{unidade}/label-gestor`)
  - [ ] Controller aceita apenas `label_gestor` no payload (strict input)
  - [ ] `AtualizarLabelGestorUnidadeRequest` valida `label_gestor` como string nullable, máx 100 chars
  - [ ] Update afeta **somente** `label_gestor`, nunca toca `nome`/`sigla`/outros campos
  - [ ] Policy retorna 403 se o usuário não é Institucional e não é gestor da Unidade

---

## S1-BE-12 — Notifications: Atribuição e Remoção de Gestor de Unidade

- **Objetivo:** Criar duas Notifications: `UserAssignedAsUnidadeManagerNotification` (quando um usuário é atribuído
  como Gestor de Unidade) e `UserRemovedAsUnidadeManagerNotification` (quando é removido). Ambas devem implementar
  `ShouldQueue` (regra inviolável 3), e os jobs que as despacharem devem ter `try-catch` (regra inviolável 4).
- **Caso de uso:** UC-19 (Atribuir Gestor de Unidade), comunicação com novo ator
- **Atores envolvidos:** Usuário atribuído (destinatário)
- **Partes afetadas:**
  - `app/Notifications/UserAssignedAsUnidadeManagerNotification.php` (nova)
  - `app/Notifications/UserRemovedAsUnidadeManagerNotification.php` (nova)
  - `app/Services/UnidadeService.php` — método `syncGestores()` estendido para disparar notifications
- **Depende de:** S1-BE-10
- **Riscos relacionados:** R-05 (notificação sem `ShouldQueue`), R-04 (violação de PBAC — verificar que nenhuma
  notificação filtra por `role` em vez de `permission`)
- **Casos de teste obrigatórios:**
  - `test_user_assigned_as_unidade_manager_notification_implements_should_queue` — verifica `ShouldQueue`
  - `test_user_assigned_notification_sent_to_user` — email é disparado (mock)
  - `test_user_removed_as_unidade_manager_notification_implements_should_queue` — verifica `ShouldQueue`
  - `test_user_removed_notification_sent_to_user` — email é disparado (mock)
  - `test_sync_gestores_catches_notification_errors` — `try-catch` em `UnidadeService::syncGestores()` previne erro
    fatal se e-mail falhar
- **Critérios de aceite:**
  - [ ] Ambas as Notifications implementam `ShouldQueue`
  - [ ] Ambas têm método `via()` retornando `['mail']`
  - [ ] Subject/body em português, claro, indicando a ação (atribuição ou remoção)
  - [ ] `UnidadeService::syncGestores()` envolve disparo de notifications em `try-catch`, logando falha de envio
  - [ ] Sem `role ===` — usar sempre `hasPermissionTo()` se precisar de guarding adicional
  - [ ] Notifications seguem o padrão de `UserAssignedAsManagerNotification` (já existente para Agenda)

---

## S1-BE-13 — Gate Final: Concessão das Permissions ao Role `gestor_unidade`

- **Objetivo:** ⚠️ **Task final de gate.** Conceder as permissions `secao.gestao-modulos`, `secao.gestao-setores`,
  `secao.gestao-espacos`, `unidades.listar`, `unidades.visualizar`, `unidades.atualizar`, `unidades.gerenciar-gestores`
  ao role `gestor_unidade` no seeder — **mas APENAS depois** que todas as Policies (S1-BE-07 a S1-BE-09) estão
  testadas, verdes e implementadas. Esta task **não pode ser mergeada antes de S1-BE-08 e S1-BE-09** (risco R-18).
- **Caso de uso:** UC-15 (Gestor de Unidade acessa suas seções), UC-19 (Atribuição de gestores)
- **Atores envolvidos:** Gestor de Unidade (recebe permissions), Institucional (mantém super-role)
- **Partes afetadas:**
  - `database/seeders/RoleSeeder.php` — adiciona atribuição de permissions ao role `gestor_unidade`
  - Notificação ao revisor: verificar que S1-BE-08 está pronto **antes** de mergear esta task
- **Depende de:** **S1-BE-07, S1-BE-08, S1-BE-09** (todas as Policies com escopo). Bloqueador explícito: não
  mergear sem estes.
- **Riscos relacionados:** **R-18** (risco máximo — se permissions forem concedidas antes do escopo estar pronto,
  Gestor de Unidade vê os 3 campi)
- **Casos de teste obrigatórios (CROSS-CAMPUS OBRIGATÓRIO — 2+ campi, 2+ gestores):**
  - `test_gestor_unidade_has_permission_secao_gestao_modulos` — permission está atribuída ao role
  - `test_gestor_unidade_with_unidade_a_cannot_access_modulos_of_unidade_b` — 🚨 **Validação cross-campus:** Gestor
    de U1 não consegue listar módulos de U2, apesar de ter `secao.gestao-modulos`
  - `test_gestor_unidade_with_unidade_a_cannot_edit_modulo_of_unidade_b` — 🚨 Gestor de U1 não consegue atualizar
    módulo de U2, apesar de ter permission genérica
  - `test_gestor_unidade_with_unidade_a_cannot_delete_modulo_of_unidade_b` — 🚨 Gestor de U1 não consegue deletar
    módulo de U2
  - (Repetir para Setor, Espaço)
  - `test_gestor_unidade_cannot_create_modulo` — bloqueado em create() (exclusive do Institucional)
  - `test_gestor_unidade_cannot_delete_modulo` — bloqueado em delete() (exclusive do Institucional)
  - `test_institucional_still_has_all_permissions` — super-role continua operacional
  - `test_gestor_unidade_without_unidade_cannot_access_anything` — usuário sem atribuição é bloqueado por Policy
    mesmo tendo permission
- **Critérios de aceite (TODOS OBRIGATÓRIOS — nenhum pode ficar pendente):**
  - [ ] Seeder adiciona 7 permissões ao role `gestor_unidade`: `secao.gestao-modulos`, `secao.gestao-setores`,
    `secao.gestao-espacos`, `unidades.listar`, `unidades.visualizar`, `unidades.atualizar`,
    `unidades.gerenciar-gestores`
  - [ ] **BLOQUEADOR DE MERGE:** PR review checklist inclui: "S1-BE-08 e S1-BE-09 estão 100% testados e verdes?"
  - [ ] Testes de autorização cross-campus (2 campi mínimo, 2 gestores distintos) todos verdes
  - [ ] Nenhum teste que valida escopo pode ser `.skip()` ou `markIncomplete()`
  - [ ] `php artisan test` passa **100%** antes de mergear
  - [ ] Usuário com `gestor_unidade` designado para Unidades A e B consegue ver/editar A e B, **nunca** C
  - [ ] Usuário com `gestor_unidade` designado para Unidade A **não consegue** criar/deletar Módulo (exclusive do
    Institucional, via P-22)
  - [ ] Permission é atribuída ao role **no seeder**, não em migration de dados (reutilizar padrão)

---

## Checklist de Pronto para o Sprint 1

- [ ] Todas as 13 tasks acima foram executadas e testadas
- [ ] S1-BE-01 a S1-BE-12 estão 100% verde
- [ ] S1-BE-13 **não foi mergeado sozinho** — entrou junto com S1-BE-08 e S1-BE-09 em uma única PR
- [ ] Testes de autorização cross-campus (2+ campi, 2+ gestores) cobrem todas as Policies
- [ ] `php artisan test` retorna 100% verde
- [ ] `npx tsc --noEmit` retorna 0 (nenhuma regressão de tipos)
- [ ] `npx eslint resources/js --suppressions-location <(echo '{}')` sem novas supressões
- [ ] `docker exec uniespacos-workspace-1 vendor/bin/pint` foi aplicado em todo código PHP novo
- [ ] Nenhuma notificação omitiu `ShouldQueue` ou `try-catch`
- [ ] Nenhuma Policy ou autorização usa `role ===` — apenas `hasPermissionTo()` ou `hasRole()` em cases explícitos
- [ ] Nenhuma regra de `REGRAS_INVIOLAVEIS_E_PADROES.md` foi violada
- [ ] Documentação atualizada (este BACKLOG, README.md do sprint)
- [ ] Branch pronta para PR (commit graph limpo, mensagens em português, sem WIP)
