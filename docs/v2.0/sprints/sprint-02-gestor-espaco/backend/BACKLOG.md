# Sprint 2 — Backend Backlog

## Notas Gerais sobre Anatomia

Toda task segue a anatomia definida em [`../../README.md` § 4.1](../../README.md):

```
### [S2-BE-NN] Título

- **Objetivo:** uma frase
- **Caso de uso:** UC-XX
- **Atores envolvidos:** lista
- **Partes afetadas:** arquivos/camadas
- **Depende de:** S1-BE-01, ... (ou "nenhuma")
- **Riscos relacionados:** R-XX
- **Casos de teste obrigatórios:** lista nomeada
- **Critérios de aceite:** checklist
```

**Convenção:** quando um teste "valida X", significa que há uma asserção que explicitamente prova X (não um mock ou stub que simula o comportamento).

---

## Tasks de Backend (S2-BE-01 a S2-BE-13)

### [S2-BE-01] Criar migration `modulo_gestores_espaco`

- **Objetivo:** estabelecer a tabela que vincula usuários a módulos como gestores de espaço padrão.
- **Caso de uso:** UC-15 (setup estrutural)
- **Atores envolvidos:** nenhum (estrutura de dados)
- **Partes afetadas:** 
  - `database/migrations/YYYY_MM_DD_create_modulo_gestores_espaco_table.php` (novo)
- **Depende de:** nenhuma
- **Riscos relacionados:** nenhum
- **Casos de teste obrigatórios:**
  - `ModuloGestoresEspacoMigrationTest::test_table_created_with_correct_columns` — valida colunas `id`, `modulo_id`, `user_id`, `created_at`, `updated_at`
  - `ModuloGestoresEspacoMigrationTest::test_foreign_keys_onDelete_cascade` — valida `ON DELETE CASCADE` em ambas as FKs
  - `ModuloGestoresEspacoMigrationTest::test_unique_constraint_modulo_user` — valida `UNIQUE(modulo_id, user_id)`
- **Critérios de aceite:**
  - [ ] Migration criada conforme schema exato em `docs/auditoria-gestores-unidade-espaco/03-modelagem-dados-vinculos-precedencia.md` § 2.2
  - [ ] `up()` cria tabela com `BIGINT PRIMARY KEY`, references sem `ON UPDATE`, `ON DELETE CASCADE`
  - [ ] `down()` dropIfExists
  - [ ] Migration roda sem erros: `docker exec uniespacos-workspace-1 php artisan migrate`
  - [ ] Rollback sem erros: `docker exec uniespacos-workspace-1 php artisan migrate:rollback`

---

### [S2-BE-02] Criar migration `espaco_gestores_espaco`

- **Objetivo:** estabelecer a tabela que permite override direto de gestor de espaço por espaço específico.
- **Caso de uso:** UC-15 (setup estrutural)
- **Atores envolvidos:** nenhum (estrutura de dados)
- **Partes afetadas:**
  - `database/migrations/YYYY_MM_DD_create_espaco_gestores_espaco_table.php` (novo)
- **Depende de:** nenhuma
- **Riscos relacionados:** nenhum
- **Casos de teste obrigatórios:**
  - `EspacoGestoresEspacoMigrationTest::test_table_created_with_correct_columns` — valida colunas `id`, `espaco_id`, `user_id`, `created_at`, `updated_at`
  - `EspacoGestoresEspacoMigrationTest::test_foreign_keys_onDelete_cascade` — valida `ON DELETE CASCADE` em ambas as FKs
  - `EspacoGestoresEspacoMigrationTest::test_unique_constraint_espaco_user` — valida `UNIQUE(espaco_id, user_id)`
- **Critérios de aceite:**
  - [ ] Migration criada conforme schema exato em `docs/auditoria-gestores-unidade-espaco/03-modelagem-dados-vinculos-precedencia.md` § 2.3
  - [ ] `up()` cria tabela com `BIGINT PRIMARY KEY`, references sem `ON UPDATE`, `ON DELETE CASCADE`
  - [ ] `down()` dropIfExists
  - [ ] Migration roda sem erros
  - [ ] Rollback sem erros

---

### [S2-BE-03] Criar role `gestor_espaco` via migration + seeder

- **Objetivo:** instanciar o role system `gestor_espaco` com `is_system = true`, sem nenhuma permission ainda.
- **Caso de uso:** UC-14, UC-15 (setup de papéis)
- **Atores envolvidos:** nenhum (estrutura de autorização)
- **Partes afetadas:**
  - `database/migrations/YYYY_MM_DD_add_gestor_espaco_role.php` (novo, ou integrado em migration de dados)
  - `database/seeders/RoleSeeder.php` (modificado, ou método estático chamado pela migration)
- **Depende de:** S2-BE-01, S2-BE-02 (precisam estar aplicadas para que as FKs façam sentido, embora a migração de roles não dependa delas tecnicamente)
- **Riscos relacionados:** nenhum
- **Casos de teste obrigatórios:**
  - `RoleSeederTest::test_gestor_espaco_role_created` — valida que role existe com `name = 'gestor_espaco'`, `guard_name = 'web'`, `is_system = true`
  - `RoleSeederTest::test_gestor_espaco_has_no_permissions_initially` — valida que role foi criado sem nenhuma permission ainda (elas vêm em S2-BE-12/13)
- **Critérios de aceite:**
  - [ ] Migration cria linha em `roles` com `name = 'gestor_espaco'`, `is_system = true`, `guard_name = 'web'`
  - [ ] Sem nenhuma FK para `modulo_gestores_espaco` ou `espaco_gestores_espaco` (as permissions vêm depois)
  - [ ] `php artisan migrate` roda sem erros
  - [ ] Consulta `Role::where('name', 'gestor_espaco')->firstOrFail()` retorna registro
  - [ ] Role não tem nenhuma permission (permissões vazias no início)

---

### [S2-BE-04] Criar relations Eloquent em Models

- **Objetivo:** estabelecer as relações BelongsToMany entre `User`, `Modulo`, `Espaco` para os novos pivots.
- **Caso de uso:** UC-15 (integração de dados)
- **Atores envolvidos:** nenhum (estrutura de modelo)
- **Partes afetadas:**
  - `app/Models/Modulo.php` — adicionar método `gestoresEspacoPadrao(): BelongsToMany`
  - `app/Models/Espaco.php` — adicionar método `gestoresEspacoDireto(): BelongsToMany`
  - `app/Models/User.php` — adicionar métodos `modulosComoGestorEspaco(): BelongsToMany` e `espacosComoGestorEspacoDireto(): BelongsToMany`
- **Depende de:** S2-BE-01, S2-BE-02
- **Riscos relacionados:** nenhum
- **Casos de teste obrigatórios:**
  - `ModuloGestoresEspacoRelationTest::test_modulo_has_gestores_espaco_padrao` — valida que `$modulo->gestoresEspacoPadrao()` retorna `BelongsToMany` instância
  - `ModuloGestoresEspacoRelationTest::test_gestores_espaco_padrao_resolves_users` — cria modulo com 2 usuários no pivot, valida que `$modulo->gestoresEspacoPadrao()->get()` retorna 2 Users
  - `EspacoGestoresEspacoRelationTest::test_espaco_has_gestores_espaco_direto` — valida que `$espaco->gestoresEspacoDireto()` retorna `BelongsToMany`
  - `EspacoGestoresEspacoRelationTest::test_gestores_espaco_direto_resolves_users` — cria espaço com 1 usuário no pivot, valida que `$espaco->gestoresEspacoDireto()->get()` retorna 1 User
  - `UserGestoresEspacoRelationTest::test_user_has_modulos_como_gestor_espaco` — valida relação inversa
  - `UserGestoresEspacoRelationTest::test_user_has_espacos_como_gestor_espaco_direto` — valida relação inversa
- **Critérios de aceite:**
  - [ ] Métodos criados conforme especificação em `docs/auditoria-gestores-unidade-espaco/03-modelagem-dados-vinculos-precedencia.md` § 6
  - [ ] Cada relação usa `->belongsToMany(classe, 'tabela_pivot')`
  - [ ] Nenhuma `pivot` adicional (colunas extras na tabela) — só as FKs
  - [ ] Carregamento eager (`with('gestoresEspacoPadrao')`) funciona sem erro
  - [ ] Soft-delete não interfere (se `User` tiver soft-delete, a relação respeita)

---

### [S2-BE-05] Implementar `EspacoRepositoryInterface::getGestoresDeEspaco()`

- **Objetivo:** implementar o algoritmo de precedência (override > padrão > órfão) para resolver quem gerencia um espaço.
- **Caso de uso:** UC-15-A, UC-16 (fluxos de gestão)
- **Atores envolvidos:** nenhum (operação de repositório)
- **Partes afetadas:**
  - `app/Contracts/Repositories/EspacoRepositoryInterface.php` — adicionar assinatura
  - `app/Repositories/EspacoRepositoryEloquent.php` — implementar método
- **Depende de:** S2-BE-04
- **Riscos relacionados:** nenhum (R-02 vai estar em S2-BE-06)
- **Casos de teste obrigatórios:**
  - `EspacoRepositoryTest::test_getGestoresDeEspaco_returns_override_when_present` — espaço com override, sem padrão de módulo, retorna só override
  - `EspacoRepositoryTest::test_getGestoresDeEspaco_returns_modulo_padrao_when_no_override` — espaço sem override, módulo com padrão, retorna padrão
  - `EspacoRepositoryTest::test_getGestoresDeEspaco_returns_empty_when_orphan` — espaço sem override, módulo sem padrão, retorna Collection vazia
  - `EspacoRepositoryTest::test_getGestoresDeEspaco_override_wins_even_with_modulo_padrao` — espaço com override E módulo com padrão diferente, override vence
- **Critérios de aceite:**
  - [ ] Pseudocódigo do documento 03 § 3 reproduzido exatamente
  - [ ] Retorna `Collection<User>`
  - [ ] Override sempre vence (presença de qualquer linha em `espaco_gestores_espaco` inicia retorno)
  - [ ] Se override vazio, cai para padrão do módulo
  - [ ] Se ambos vazios, retorna Collection vazia
  - [ ] Query é eficiente (máximo 2 selects em sequência, não loop)

---

### [S2-BE-06] Implementar `EspacoRepositoryInterface::getEspacosGeridosPorGestorEspaco()`

- **Objetivo:** implementar o algoritmo inverso com **subtração crítica** para listar espaços que um gestor de espaço gerencia, excluindo aqueles que têm override de outro usuário.
- **Caso de uso:** UC-15-A, UC-16 (dashboard, filtro de listagem)
- **Atores envolvidos:** nenhum (operação de repositório)
- **Partes afetadas:**
  - `app/Contracts/Repositories/EspacoRepositoryInterface.php` — adicionar assinatura
  - `app/Repositories/EspacoRepositoryEloquent.php` — implementar método
- **Depende de:** S2-BE-04, S2-BE-05 (referencia métodos de modelo e entendimento de precedência)
- **Riscos relacionados:** **R-02** (teste de regressão obrigatório para subtração)
- **Casos de teste obrigatórios:**
  - `EspacoRepositoryTest::test_getEspacosGeridosPorGestorEspaco_includes_direct_override` — usuário com override direto em espaço, retorna esse espaço
  - `EspacoRepositoryTest::test_getEspacosGeridosPorGestorEspaco_includes_modulo_padrao_no_override` — usuário é padrão do módulo, espaço não tem override, retorna espaço
  - `EspacoRepositoryTest::test_override_exclui_espaco_do_padrao_do_modulo` — **R-02 TEST**: usuário A é padrão do módulo; usuário B tem override em espaço X do módulo; `getEspacosGeridosPorGestorEspaco(A)` **não** retorna espaço X (mesmo que seja do módulo de A, porque tem override de outro usuário)
  - `EspacoRepositoryTest::test_getEspacosGeridosPorGestorEspaco_excludes_modulo_padrao_if_other_has_override` — variante adicional do teste anterior, com múltiplos espaços
- **Critérios de aceite:**
  - [ ] Query segue pseudocódigo documento 03 § 3.1 exatamente
  - [ ] Subtração `NOT IN (SELECT espaco_id FROM espaco_gestores_espaco)` está presente
  - [ ] Retorna `Collection<Espaco>`
  - [ ] Teste `test_override_exclui_espaco_do_padrao_do_modulo` passa (critério de aceite mais importante para R-02)
  - [ ] Query é eficiente (2-3 selects, sem N+1)
  - [ ] Espaços órfãos não aparecem na listagem (correto, pois nenhum usuário gerencia órfãos via `getEspacosGeridosPorGestorEspaco`)

---

### [S2-BE-07] Implementar `EspacoRepositoryInterface::queryOrfaosDeGestorEspaco()`

- **Objetivo:** implementar query builder que retorna espaços órfãos de um gestor de unidade (sem gestor de espaço em nenhum nível), para reutilização em dois endpoints (lista detalhada vs agregado).
- **Caso de uso:** UC-16-B (painel de órfãos)
- **Atores envolvidos:** nenhum (operação de repositório)
- **Partes afetadas:**
  - `app/Contracts/Repositories/EspacoRepositoryInterface.php` — adicionar assinatura
  - `app/Repositories/EspacoRepositoryEloquent.php` — implementar método
- **Depende de:** S2-BE-04
- **Riscos relacionados:** nenhum
- **Casos de teste obrigatórios:**
  - `EspacoRepositoryTest::test_queryOrfaosDeGestorEspaco_returns_builder` — valida que retorna `Builder`
  - `EspacoRepositoryTest::test_queryOrfaosDeGestorEspaco_finds_space_without_override_or_modulo_padrao` — espaço sem override, módulo sem padrão, contado em órfãos
  - `EspacoRepositoryTest::test_queryOrfaosDeGestorEspaco_excludes_space_with_override` — espaço com override não é órfão
  - `EspacoRepositoryTest::test_queryOrfaosDeGestorEspaco_excludes_space_with_modulo_padrao` — espaço do módulo com padrão não é órfão
- **Critérios de aceite:**
  - [ ] Retorna `\Illuminate\Database\Eloquent\Builder` (não Collection, para permitir agregação e filtros adicionais na camada de Service)
  - [ ] Cláusula `whereDoesntHave('gestoresEspacoDireto')` exclui espaços com override
  - [ ] Cláusula adicional exclui espaços cujo módulo tem `gestoresEspacoPadrao` não vazio (regra de que padrão vale mesmo sem override)
  - [ ] Pode ser encadeada com `->count()`, `->get()`, etc.

---

### [S2-BE-08] Criar Policies `ModuloPolicy::gerenciarGestoresEspaco()` e `EspacoPolicy::gerenciarGestorEspacoDireto()`

- **Objetivo:** autorizar a atribuição/remoção de gestores de espaço, escopando por unidade para o gestor de unidade.
- **Caso de uso:** UC-15-A (atribuição de gestores)
- **Atores envolvidos:** Institucional, Gestor de Unidade
- **Partes afetadas:**
  - `app/Policies/ModuloPolicy.php` — adicionar método `gerenciarGestoresEspaco(User $user, Modulo $modulo): bool`
  - `app/Policies/EspacoPolicy.php` — adicionar método `gerenciarGestorEspacoDireto(User $user, Espaco $espaco): bool`
- **Depende de:** S1-BE-* (Sprint 1 — `getUnidadesGeridasPor()` deve existir)
- **Riscos relacionados:** **R-01** (IDOR / escopo vazando entre campi), **R-18** (sequenciamento — não conceder permission antes do filtro estar pronto)
- **Casos de teste obrigatórios:**
  - `ModuloPolicyTest::test_gerenciar_gestores_espaco_permite_institucional` — `institucional` sempre pode
  - `ModuloPolicyTest::test_gerenciar_gestores_espaco_permite_gestor_unidade_se_modulo_da_unidade` — `gestor_unidade` de unidade A pode, módulo é de unidade A
  - `ModuloPolicyTest::test_gerenciar_gestores_espaco_nega_gestor_unidade_de_outro_campus` — `gestor_unidade` de unidade A não pode, módulo é de unidade B
  - `EspacoPolicyTest::test_gerenciar_gestor_espaco_direto_permite_institucional` — `institucional` sempre pode
  - `EspacoPolicyTest::test_gerenciar_gestor_espaco_direto_permite_gestor_unidade_se_espaco_da_unidade` — `gestor_unidade` de unidade A pode, espaço é de unidade A
  - `EspacoPolicyTest::test_gerenciar_gestor_espaco_direto_nega_outro_campus` — `gestor_unidade` de unidade A não pode, espaço é de unidade B
- **Critérios de aceite:**
  - [ ] `gerenciarGestoresEspaco()`: `institucional` always true; `gestor_unidade` true se `modulo.andar.unidade_id IN getUnidadesGeridasPor(user)`
  - [ ] `gerenciarGestorEspacoDireto()`: `institucional` always true; `gestor_unidade` true se `espaco.andar.modulo.unidade_id IN getUnidadesGeridasPor(user)`
  - [ ] Nenhum outro role pode (gestor, comum, etc.)
  - [ ] Query de `getUnidadesGeridasPor()` é executada uma única vez e reutilizada (performance)
  - [ ] Testes cobrem 2 campi distintos (risco R-01)

---

### [S2-BE-09] Criar endpoints de atribuição: `ModuloController::alterarGestoresEspaco()` e `EspacoController::alterarGestorEspacoDireto()`

- **Objetivo:** fornecer rotas para sincronizar gestores padrão de módulo e gestores diretos de espaço, com validação e autorização.
- **Caso de uso:** UC-15-A (atribuição)
- **Atores envolvidos:** Institucional, Gestor de Unidade
- **Partes afetadas:**
  - `app/Http/Controllers/Institucional/InstitucionalModuloController.php` — adicionar método `alterarGestoresEspaco(Modulo $modulo, AlterarGestoresEspacoModuloRequest $request): JsonResponse`
  - `app/Http/Controllers/Institucional/InstitucionalEspacoController.php` — adicionar método `alterarGestorEspacoDireto(Espaco $espaco, AlterarGestorEspacoDiretoRequest $request): JsonResponse`
  - `app/Http/Requests/AlterarGestoresEspacoModuloRequest.php` (novo)
  - `app/Http/Requests/AlterarGestorEspacoDiretoRequest.php` (novo)
  - `routes/web.php` — adicionar rotas (ex.: `PATCH /institucional/modulos/{modulo}/gestores-espaco`, `PATCH /institucional/espacos/{espaco}/gestor-espaco-direto`)
- **Depende de:** S2-BE-05, S2-BE-08
- **Riscos relacionados:** R-01, R-18
- **Casos de teste obrigatórios:**
  - `ModuloControllerTest::test_alterar_gestores_espaco_sucesso` — institucional atribui 2 usuários, endpoint retorna 200
  - `ModuloControllerTest::test_alterar_gestores_espaco_remove_anterior` — modulo tinha 1 gestor, novo request substitui por 2 diferentes, BD sincroniza
  - `ModuloControllerTest::test_alterar_gestores_espaco_autorizado_gestor_unidade` — gestor_unidade da unidade pode
  - `ModuloControllerTest::test_alterar_gestores_espaco_negado_outro_campus` — gestor_unidade de outro campus retorna 403
  - `EspacoControllerTest::test_alterar_gestor_espaco_direto_sucesso` — institucional atribui override, endpoint retorna 200
  - `EspacoControllerTest::test_alterar_gestor_espaco_direto_autorizado_gestor_unidade` — gestor_unidade da unidade pode
- **Critérios de aceite:**
  - [ ] Request valida que `user_id[]` existem
  - [ ] Request valida que usuários pertencem ao escopo correto (mesmo campus que o gestor atribuidor, validação por `UsuarioDaMesmaUnidade` ou similar)
  - [ ] Controller autoriza via Policy antes de executar (Gate ou Policy call)
  - [ ] Sincroniza pivot (`sync()`) de forma atômica — remove anteriores, adiciona novos em uma transação
  - [ ] Dispara notification de atribuição/remoção (S2-BE-11)
  - [ ] Retorna JSON com status 200 e dados do espaço/módulo atualizado
  - [ ] Defesa em profundidade: query de update refiltra propriedade do recurso (`where modulo_id in (...)`, mesmo que Policy tenha autorizado)

---

### [S2-BE-10] Criar `EspacoOrfaoController` com dois endpoints

- **Objetivo:** fornecer lista detalhada de órfãos para Gestor de Unidade e agregado por campus para Institucional.
- **Caso de uso:** UC-16-B (painel de órfãos)
- **Atores envolvidos:** Institucional, Gestor de Unidade
- **Partes afetadas:**
  - `app/Http/Controllers/Institucional/EspacoOrfaoController.php` (novo)
  - `routes/web.php` — adicionar rotas (ex.: `GET /institucional/espacos-orfaos/detalhado`, `GET /institucional/espacos-orfaos/agregado`)
- **Depende de:** S2-BE-07 (usa `queryOrfaosDeGestorEspaco()`)
- **Riscos relacionados:** nenhum
- **Casos de teste obrigatórios:**
  - `EspacoOrfaoControllerTest::test_listagem_detalhada_gestor_unidade` — Gestor de Unidade da unidade A vê lista completa de órfãos de sua unidade
  - `EspacoOrfaoControllerTest::test_listagem_detalhada_escopada` — lista não inclui órfãos de outra unidade
  - `EspacoOrfaoControllerTest::test_agregado_institucional` — Institucional vê agregação por campus (contadores, não lista)
  - `EspacoOrfaoControllerTest::test_agregado_formato_diferente` — formato de resposta agregado é diferente de detalhado (objeto com `{campus_id: count}` vs array de espaços)
  - `EspacoOrfaoControllerTest::test_gestor_unidade_negado_agregado` — Gestor de Unidade não acessa endpoint agregado
  - `EspacoOrfaoControllerTest::test_institucional_negado_detalhado` — Institucional não acessa endpoint de lista detalhada (só agregado)
- **Critérios de aceite:**
  - [ ] Dois endpoints distintos (não o mesmo com filtro no frontend)
  - [ ] Endpoint detalhado retorna array de `Espaco` com `{ id, nome, modulo: { nome }, andar: { nome }, ... }`
  - [ ] Endpoint agregado retorna objeto `{ campus_1: <count>, campus_2: <count>, ... }` ou estrutura similar
  - [ ] Detalhado escopado por unidades geridas (usa `getUnidadesGeridasPor()`)
  - [ ] Autorização: Gestor de Unidade acessa só detalhado, Institucional acessa só agregado
  - [ ] Performance: agregado usa `count()` direto do builder, não loop

---

### [S2-BE-11] Criar Notifications de atribuição/remoção de Gestor de Espaço

- **Objetivo:** notificar usuários quando são atribuídos ou removidos como Gestor de Espaço, com `ShouldQueue` obrigatório.
- **Caso de uso:** UC-15-A (comunicação)
- **Atores envolvidos:** nenhum (sistema de notificação)
- **Partes afetadas:**
  - `app/Notifications/UserAssignedAsEspacoManagerNotification.php` (novo)
  - `app/Notifications/UserRemovedAsEspacoManagerNotification.php` (novo)
  - Implementação de `ShouldQueue` em ambas
- **Depende de:** S2-BE-09 (chamada pelos controllers)
- **Riscos relacionados:** regra inviolável nº 3 (toda Notification é `ShouldQueue`), regra inviolável nº 4 (`notify()` em Job com `try-catch`)
- **Casos de teste obrigatórios:**
  - `UserAssignedAsEspacoManagerNotificationTest::test_notification_implements_shouldqueue` — valida `implements ShouldQueue`
  - `UserAssignedAsEspacoManagerNotificationTest::test_notification_to_mail_channel` — notificação tem canal `mail` (Mailable)
  - `UserAssignedAsEspacoManagerNotificationTest::test_mail_contains_espaco_names` — e-mail exibe nome(s) do(s) espaço(s)/módulo(s) atribuído(s)
  - `UserRemovedAsEspacoManagerNotificationTest::test_notification_implements_shouldqueue` — valida `implements ShouldQueue`
  - `UserRemovedAsEspacoManagerNotificationTest::test_mail_contains_removal_message` — e-mail informa remoção
- **Critérios de aceite:**
  - [ ] `UserAssignedAsEspacoManagerNotification` implementa `ShouldQueue`
  - [ ] `UserRemovedAsEspacoManagerNotification` implementa `ShouldQueue`
  - [ ] Ambas herdam de `Notification` padrão
  - [ ] Método `via(object $notifiable)` retorna `['mail']`
  - [ ] Método `toMail(object $notifiable)` monta Mailable com dados do espaço/módulo
  - [ ] Não há lógica de erro silencioso — em caso de falha de e-mail, a exception não é engolida (deixa para o Job fazer `try-catch`)
  - [ ] Texto claro diferenciando atribuição de remoção

---

### [S2-BE-12] Criar permissions novas

- **Objetivo:** criar linhas em `permissions` para autorizar ações específicas do Gestor de Espaço e do dashboard.
- **Caso de uso:** UC-14, UC-15, UC-16
- **Atores envolvidos:** nenhum (estrutura de autorização)
- **Partes afetadas:**
  - `database/seeders/PermissionSeeder.php` — adicionar 5 novas permissions
  - `resources/js/constants/permission-labels.ts` — adicionar rótulos para UI
- **Depende de:** nenhuma (não depende de migrations anteriores, apenas de que Spatie já esteja instalado)
- **Riscos relacionados:** nenhum
- **Casos de teste obrigatórios:**
  - `PermissionSeederTest::test_permission_espacos_visualizar_inventario_proprio_exists` — permission criada
  - `PermissionSeederTest::test_permission_secao_dashboard_gestor_espaco_exists` — permission criada
  - `PermissionSeederTest::test_permission_secao_gestao_orfaos_espaco_exists` — permission criada
  - `PermissionSeederTest::test_permission_modulos_gerenciar_gestores_espaco_exists` — permission criada
  - `PermissionSeederTest::test_permission_espacos_gerenciar_gestor_espaco_direto_exists` — permission criada
  - `PermissionSeederTest::test_all_permissions_have_labels` — cada permission tem rótulo em TypeScript
- **Critérios de aceite:**
  - [ ] Permission `espacos.visualizar-inventario-proprio` criada (`name`, `guard_name = 'web'`)
  - [ ] Permission `secao.dashboard-gestor-espaco` criada
  - [ ] Permission `secao.gestao-orfaos-espaco` criada
  - [ ] Permission `modulos.gerenciar-gestores-espaco` criada
  - [ ] Permission `espacos.gerenciar-gestor-espaco-direto` criada
  - [ ] Todos os rótulos adicionados a `permission-labels.ts` com chaves em português
  - [ ] Seeder é idempotente (pode rodar múltiplas vezes sem duplicar)
  - [ ] `php artisan db:seed --class=PermissionSeeder` roda sem erro

---

### [S2-BE-13] Conceder permissions ao role `gestor_espaco` (Gate Final)

- **Objetivo:** atribuir as permissions novas ao role `gestor_espaco` e acrescentar `reservas.avaliar-urgencia` à lista de exclusão do Institucional, após todas as outras tasks estarem testadas e verdes.
- **Caso de uso:** UC-14, UC-15, UC-16
- **Atores envolvidos:** nenhum (estrutura de autorização)
- **Partes afetadas:**
  - `database/seeders/RoleSeeder.php` — criar método que atribui permissions a `gestor_espaco`, modificar `RoleSeeder` para chamar
  - `database/seeders/RoleSeeder.php` — adicionar 3ª exclusão para `reservas.avaliar-urgencia` na sincronização automática do Institucional (ver documento 06 § 2.2, nota sobre P-34)
- **Depende de:** **S2-BE-05, S2-BE-06, S2-BE-08** (testes desses devem estar 100% verdes ANTES dessa task ser mergeada)
- **Riscos relacionados:** **R-18** (sequenciamento — não conceder `secao.gestao-*` antes do filtro estar pronto)
- **Casos de teste obrigatórios:**
  - `RoleSeederTest::test_gestor_espaco_has_correct_permissions` — valida que role tem exatamente as 5 permissions novas (não mais, não menos)
  - `RoleSeederTest::test_gestor_espaco_does_not_have_reserve_evaluation_permission` — valida que `gestor_espaco` **não** tem `reservas.avaliar` (fluxo normal)
  - `RoleSeederTest::test_institucional_excludes_urgencia_permission` — valida que `reservas.avaliar-urgencia` está na lista de exclusão do Institucional (P-34)
  - `RoleSeederTest::test_institucional_excludes_three_reserve_permissions` — valida tripla exclusão: `reservas.deletar`, `reservas.atualizar`, `reservas.avaliar-urgencia`
- **Critérios de aceite:**
  - [ ] Task **não é mergeada até S2-BE-05, S2-BE-06, S2-BE-08 estarem 100% verdes** (regressão de R-02, R-01)
  - [ ] Método em `RoleSeeder` que atribui permissions a `gestor_espaco`:
    - `espacos.visualizar-inventario-proprio`
    - `secao.dashboard-gestor-espaco`
    - `secao.gestao-orfaos-espaco`
    - `modulos.gerenciar-gestores-espaco`
    - `espacos.gerenciar-gestor-espaco-direto`
  - [ ] Method called from `run()` ou integrado atomicamente no seeder
  - [ ] Seeder adiciona `reservas.avaliar-urgencia` à lista de exclusão do Institucional:
    ```php
    ->where('name', '!=', 'reservas.deletar')
    ->where('name', '!=', 'reservas.atualizar')
    ->where('name', '!=', 'reservas.avaliar-urgencia')  // NOVO
    ```
  - [ ] `php artisan db:seed --class=RoleSeeder` roda sem erro
  - [ ] Consulta `Role::findByName('gestor_espaco')->permissions()->pluck('name')` retorna exatamente as 5 permissions (não `reservas.avaliar`)
  - [ ] Consulta `Role::findByName('institucional')->permissions()->pluck('name')` não inclui `reservas.avaliar-urgencia`
