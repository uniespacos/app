# Sprint 6 — Backend Backlog

## [S6-BE-01] Reconciliar módulo de chamados com modelagem correta

- **Objetivo:** Trazer o código de chamados da branch `feat/tickets-module` (PR #397) para o estado desta auditoria, adaptando o roteamento de `Agenda.user_id` para pivots `modulo_gestores_espaco` / `espaco_gestores_espaco` e removendo a entidade `SetorAudiovisual`.
- **Caso de uso:** UC-19 (suporte ao reporte de problemas via espaço)
- **Atores envolvidos:** Gestor de Espaço, Gestor de Unidade, Institucional
- **Partes afetadas:** `app/Models/Chamado.php`, `app/Models/TipoChamado.php`, `app/Policies/ChamadoPolicy.php`, `app/Services/ChamadoService.php`, `app/Repositories/ChamadoRepositoryEloquent.php`, `app/Http/Controllers/ChamadoController.php` (ou equivalente)
- **Depende de:** Sprint 2 (pivots `modulo_gestores_espaco` / `espaco_gestores_espaco`, método `getGestoresDeEspaco()`)
- **Riscos relacionados:** R-S6-01 (estado divergente da PR #397)
- **Casos de teste obrigatórios:**
  - Testa que `Chamado` é criável via ORM com campos mínimos
  - Testa que `TipoChamado` existe com schema correto (sem `SetorAudiovisual`)
  - Testa que models têm os relacionamentos esperados com `Espaco`, `User`, e pivots
- **Critérios de aceite:**
  - [ ] Models `Chamado` e `TipoChamado` existem e são migráveis
  - [ ] `ChamadoPolicy`, `ChamadoService`, `ChamadoRepositoryEloquent` são implementáveis (mesmo que sem lógica completa nesta task)
  - [ ] Nenhuma referência a `SetorAudiovisual` permanece no backend novo
  - [ ] Código não viola regras invioláveis (`RefreshDatabase`, `migrate:fresh`, etc.)

---

## [S6-BE-02] Adaptar `ChamadoPolicy::administraOAlvo()` para usar `getGestoresDeEspaco()`

- **Objetivo:** Policy que autoriza Gestor de Espaço a triagar um chamado deve usar o algoritmo centralizado `EspacoRepositoryInterface::getGestoresDeEspaco()`, não critério baseado em `Agenda.user_id`.
- **Caso de uso:** UC-19 (triagem de chamados pelo Gestor de Espaço responsável)
- **Atores envolvidos:** Gestor de Espaço
- **Partes afetadas:** `app/Policies/ChamadoPolicy.php`, `app/Repositories/EspacoRepositoryEloquent.php` (consulta)
- **Depende de:** S6-BE-01 (models de chamados prontos), Sprint 2 (repositório de espaço com `getGestoresDeEspaco()`)
- **Riscos relacionados:** R-S6-01, R-18 (sequenciamento de permissions — policy governa acesso)
- **Casos de teste obrigatórios:**
  - Testa que Gestor de Espaço (por override direto) consegue triagar o chamado
  - Testa que Gestor de Espaço (por padrão de módulo) consegue triagar o chamado
  - Testa que usuário sem vínculo é negado
  - Testa que Gestor de Espaço de outro módulo é negado (IDOR mitigation)
- **Critérios de aceite:**
  - [ ] `ChamadoPolicy::administraOAlvo()` implementa a checagem exatamente como proposto em `docs/auditoria-gestor-espaco/`
  - [ ] Usa `getGestoresDeEspaco()`, nunca lógica de `Agenda.user_id`
  - [ ] Testes de IDOR com 2 módulos e 2 gestores distintos passam
  - [ ] `npx eslint` sem novas supressões

---

## [S6-BE-03] Adaptar `ChamadoService::notificarGestores()` para usar `getGestoresDeEspaco()`

- **Objetivo:** Serviço que notifica o(s) Gestor(es) de Espaço responsável(eis) quando um chamado é criado deve usar o mesmo algoritmo de resolução que a Policy, evitando lógica paralela divergente.
- **Caso de uso:** UC-19 (notificação ao gestor responsável)
- **Atores envolvidos:** Sistema (notificação), Gestor de Espaço
- **Partes afetadas:** `app/Services/ChamadoService.php`, `app/Repositories/EspacoRepositoryEloquent.php`, `app/Notifications/ChamadoRelatadoNotification.php` (ou equiv.)
- **Depende de:** S6-BE-02 (Policy já usa `getGestoresDeEspaco()`), Sprint 2 (repositório)
- **Riscos relacionados:** R-S6-01 (consistência de roteamento)
- **Casos de teste obrigatórios:**
  - Testa que notificação é enviada apenas aos gestores retornados por `getGestoresDeEspaco()`
  - Testa que notificação é enviada a múltiplos gestores (equipe)
  - Testa que sem gestores, nenhuma notificação é disparada (chamado vai para órfãos)
- **Critérios de aceite:**
  - [ ] `ChamadoService::notificarGestores()` chama `getGestoresDeEspaco()` uma única vez
  - [ ] Nenhuma query paralela baseada em `Agenda.user_id`
  - [ ] Notificação implementa `ShouldQueue` e emite em `try-catch` dentro de Job/Service
  - [ ] Todos os casos de teste passam

---

## [S6-BE-04] Critério de "chamado órfão" via `whereDoesntHave` sobre resultado de `getGestoresDeEspaco()`

- **Objetivo:** Implementar query que identifica chamados cujo espaço não tem Gestor de Espaço atribuído (nem override, nem padrão de módulo), usando precisamente o algoritmo proposto (não heurística paralela).
- **Caso de uso:** UC-20 (painel de chamados órfãos — visão do Gestor de Unidade e Institucional)
- **Atores envolvidos:** Gestor de Unidade, Institucional
- **Partes afetadas:** `app/Repositories/ChamadoRepositoryEloquent.php`, queries de listagem
- **Depende de:** S6-BE-02 (Policy com `getGestoresDeEspaco()`), S6-BE-03 (Service com `getGestoresDeEspaco()`)
- **Riscos relacionados:** R-S6-04 (chamado órfão não alcança ninguém silenciosamente)
- **Casos de teste obrigatórios:**
  - Testa que chamado de espaço sem gestores aparece como órfão
  - Testa que chamado de espaço com gestor padrão NÃO aparece como órfão
  - Testa que chamado de espaço com override direto NÃO aparece como órfão
  - Testa query com múltiplos chamados, filtrando corretamente os órfãos
- **Critérios de aceite:**
  - [ ] Método `queryOrfaos()` (ou equivalente) usa `whereDoesntHave` sobre a lógica de precedência
  - [ ] Query resultado é eficiente (eager loads quando necessário)
  - [ ] Testes de previsão/contagem de órfãos são 100% confiáveis
  - [ ] Nenhuma chamada a `getGestoresDeEspaco()` em loop — usa sub-query Eloquent

---

## [S6-BE-05] Migration: adicionar `tutorial` em `tipos_chamado`

- **Objetivo:** Estender schema de `TipoChamado` com campo de tutorial interativo em Markdown, permitindo que cada tipo de problema exiba orientação antes de abrir chamado formal.
- **Caso de uso:** UC-19-B (tutorial assistido para problemas comuns)
- **Atores envolvidos:** Institucional (edita tutorial), Comum (vê tutorial)
- **Partes afetadas:** `database/migrations/YYYY_MM_DD_add_tutorial_to_tipos_chamado_table.php`, `app/Models/TipoChamado.php` (cast/accessor para sanitização)
- **Depende de:** S6-BE-01 (TipoChamado modelo existe)
- **Riscos relacionados:** R-S6-03 (sanitização de Markdown insuficiente → XSS)
- **Casos de teste obrigatórios:**
  - Testa que migration roda forward e backward sem erro
  - Testa que TipoChamado pode ser criado com `tutorial NULL` (opcional)
  - Testa que `tutorial` é legível e armazenável como Markdown
- **Critérios de aceite:**
  - [ ] Migration criada com `ALTER TABLE tipos_chamado ADD COLUMN tutorial TEXT NULL`
  - [ ] Coluna é nullable (não quebra registros existentes)
  - [ ] `php artisan migrate` roda sem erro (DatabaseTransactions)
  - [ ] Model tem cast/accessor para sanitizar conteúdo (ver D-9: Markdown + sanitização)
  - [ ] Nenhum comando banido (`migrate:fresh`, etc.) em testes

---

## [S6-BE-06] Rota pública `/reportar/{espaco:public_id}` — `ChamadoPublicoController::store()`

- **Objetivo:** Implementar endpoint público (sem autenticação) que permite usuário deslogado escanear QR Code e reportar problema, selecionando tipo de chamado e abrindo fluxo de tutorial/chamado formal.
- **Caso de uso:** UC-19-A (reporte público via QR Code)
- **Atores envolvidos:** Comum (deslogado), Sistema
- **Partes afetadas:** `app/Http/Controllers/ChamadoPublicoController.php` (NOVO), `app/Http/Requests/StoreReportagemPublicaRequest.php` (NOVO), `routes/web.php`
- **Depende de:** S6-BE-01 (models Chamado/TipoChamado)
- **Riscos relacionados:** R-S6-02 (rota pública é vetor de abuso/spam — validar `espaco.public_id` existente, rate limiting fora deste sprint)
- **Casos de teste obrigatórios:**
  - Testa que rota `/reportar/{public_id}` existe e retorna 200 sem autenticação
  - Testa que `public_id` válido retorna tela com seletor de tipo de chamado
  - Testa que `public_id` inválido retorna 404
  - Testa que `StoreReportagemPublicaRequest` valida tipo de chamado e espaco existente
- **Critérios de aceite:**
  - [ ] Rota definida sem `auth` middleware
  - [ ] Validação de `espaco.public_id` é rigorosa (não expõe IDs internos)
  - [ ] FormRequest aplicada corretamente
  - [ ] Resposta contém lista de `TipoChamado` disponíveis para seleção
  - [ ] Sem quebra de funcionalidades pré-existentes

---

## [S6-BE-07] Atribuir permissions `chamados.triar` / `secao.gestao-chamados` ao role `gestor_espaco`

- **Objetivo:** Registrar as permissions específicas de chamados no `PermissionSeeder` e atribuí-las ao role `gestor_espaco` (não criar outro role, não usar `gestor`).
- **Caso de uso:** UC-19-C (autorização de triagem)
- **Atores envolvidos:** Gestor de Espaço
- **Partes afetadas:** `database/seeders/PermissionSeeder.php`, `database/seeders/RoleSeeder.php`, `resources/js/contracts/permissions.contract.ts` (frontend)
- **Depende de:** Sprint 1 (role `gestor_espaco` existe)
- **Riscos relacionados:** R-18 (sequenciamento de permissions — aplicar apenas com Policies escopadas), R-04 (usar permission, não role name)
- **Casos de teste obrigatórios:**
  - Testa que `gestor_espaco` tem `chamados.triar` após seed
  - Testa que `gestor_espaco` tem `secao.gestao-chamados` após seed
  - Testa que `comum` NÃO tem essas permissions
  - Testa que `gestor_unidade` NÃO tem `chamados.triar` (escopo diferente — ver S6-BE-08)
- **Critérios de aceite:**
  - [ ] Permissions criadas no PermissionSeeder
  - [ ] Atribuição feita no RoleSeeder, apenas a `gestor_espaco`
  - [ ] Contrato frontend atualizado (se houver `permissions.contract.ts`)
  - [ ] Seed roda sem erro em DB clean (DatabaseTransactions)

---

## [S6-BE-08] Painel de chamados órfãos institucional/Gestor de Unidade — profundidade diferenciada

- **Objetivo:** Implementar endpoint(s) que expõem chamados órfãos com diferenciação: **Institucional vê visão agregada** (contadores, estatísticas), **Gestor de Unidade vê lista detalhada** escopada ao seu campus.
- **Caso de uso:** UC-20 (reporte de problemas órfãos)
- **Atores envolvidos:** Gestor de Unidade, Institucional
- **Partes afetadas:** `app/Http/Controllers/ChamadoOrfaoController.php` (NOVO), `app/Repositories/ChamadoRepositoryEloquent.php` (métodos de filtro), políticas de escopo
- **Depende de:** S6-BE-04 (critério de órfão implementado), S6-BE-07 (permissions definidas)
- **Riscos relacionados:** R-S6-04, R-01 (IDOR — Gestor de Unidade não vê outros campi)
- **Casos de teste obrigatórios:**
  - Testa que Institucional vê agregado (contagem por campus, não lista item a item)
  - Testa que Gestor de Unidade A vê lista detalhada APENAS de órfãos do Campus A
  - Testa que Gestor de Unidade A NÃO vê órf de Campus B (IDOR mitigation)
  - Testa que lista detalhada contém campos esperados (tipo, data, espaço, última atualização)
- **Critérios de aceite:**
  - [ ] Endpoint institucional (`GET /painel-orfaos`) retorna agregado (não lista)
  - [ ] Endpoint do Gestor de Unidade (`GET /painel-orfaos-meu-campus`) filtra por `unidade_id`
  - [ ] Ambos usam `queryOrfaos()` do repositório (DRY)
  - [ ] Escopo de `unidade_id` é aplicado no backend, nunca no frontend
  - [ ] Testes com 2 campi passam

---

## [S6-BE-09] Nota de validação: soft delete Espaco, motivo em cancelamento, cascata de Andar/Módulo

- **Objetivo:** Registrar checklist de conformidade com decisões já implementadas em `docs/auditoria-gestor-espaco/`, confirmando que soft delete de Espaco, motivo obrigatório em cancelamento de chamado, e trava de cascata em Andar/Módulo seguem exatamente como documentado, sem mudanças adicionais.
- **Caso de uso:** UC-17 (auditoria de espaços excluídos com histórico de chamados)
- **Atores envolvidos:** Institucional, Gestor de Unidade
- **Partes afetadas:** `app/Models/Espaco.php` (soft delete), `app/Models/Chamado.php` (campo motivo), migrações de Andar/Módulo (cascata)
- **Depende de:** Todas as tasks anteriores
- **Riscos relacionados:** Nenhum adicional — apenas validação
- **Casos de teste obrigatórios:**
  - Verificar que `Espaco` tem trait `SoftDeletes`
  - Verificar que `Chamado` tem campo `motivo` e valida quando status é `cancelado`
  - Verificar que soft-delete de Espaco não cascata para hard-delete de Chamado
  - Verificar que Andar/Módulo não cascatam hard-delete para Espaco (ação manual ou soft delete apenas)
- **Critérios de aceite:**
  - [ ] Checklist de auditorias do `auditoria-gestor-espaco/` é 100% satisfeito
  - [ ] Nenhuma quebra de invariantes (Chamado órfão de Espaco deletado, etc.)
  - [ ] Documentação em `docs/auditoria-gestor-espaco/` não exige atualização
  - [ ] Testes de soft delete e motivo obrigatório passam
