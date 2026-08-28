# Backend — BACKLOG Sprint 5

---

## [S5-BE-01] Migration — Adicionar `tipo_vinculo` à tabela `users`

- **Objetivo:** Registrar o vínculo institucional permanente de cada usuário no banco, com default conservador.
- **Caso de uso:** UC-21-A, UC-21-B (aprox. contextual)
- **Atores envolvidos:** Desenvolvedor (execução técnica)
- **Partes afetadas:**
  - `database/migrations/YYYY_MM_DD_add_tipo_vinculo_to_users_table.php` (novo)
  - `app/Models/User.php` (possível cast, se necessário)
- **Depende de:** Nenhuma
- **Riscos relacionados:** P-27 (default conservador)
- **Casos de teste obrigatórios:**
  - `MigrationTipoVinculoTest::test_column_created_with_correct_type` — verifica que a coluna existe, é `VARCHAR(30)` e tem `DEFAULT 'externo'`
  - `MigrationTipoVinculoTest::test_existing_users_backfilled_with_externo` — valida que usuários legados recebem `'externo'`, nunca `NULL`
  - `MigrationTipoVinculoTest::test_migration_reversible` — `down()` remove a coluna sem erro
- **Critérios de aceite:**
  - [ ] Coluna `tipo_vinculo VARCHAR(30) NOT NULL DEFAULT 'externo'` criada
  - [ ] Seed de teste cria usuário e verifica default
  - [ ] `Schema::hasColumn('users', 'tipo_vinculo')` passa
  - [ ] Migration reversa não deixa artefatos

---

## [S5-BE-02] Enum `TipoVinculoEnum` com Função Derivada de Prioridade

- **Objetivo:** Definir a taxonomia canônica de vínculo institucional e expor função derivada de prioridade **consultiva** (P-25, sem trava automática).
- **Caso de uso:** UC-21-A, UC-21-B (contextual)
- **Atores envolvidos:** Desenvolvedor; Gestor de Espaço (usuário de prioridade sugerida)
- **Partes afetadas:**
  - `app/Enums/TipoVinculoEnum.php` (novo)
  - `app/Models/User.php` (cast possível, se cast for estratégia escolhida)
- **Depende de:** S5-BE-01
- **Riscos relacionados:** R-14 (autodeclaração), P-25 (empate intencional)
- **Casos de teste obrigatórios:**
  - `TipoVinculoEnumTest::test_enum_has_four_cases` — verifica casos `estudante`, `professor`, `tecnico_administrativo`, `externo`
  - `TipoVinculoEnumTest::test_prioridade_sugerida_values` — professor e técnico-administrativo retornam `1` (mesma); estudante retorna `2`; externo retorna `3`
  - `TipoVinculoEnumTest::test_prioridade_sugerida_no_automatic_ordering` — confirma que a função retorna números, **não** aplica trava automática
  - `TipoVinculoEnumTest::test_all_cases_have_defined_priority` — nenhum caso sem prioridade derivada
- **Critérios de aceite:**
  - [ ] Enum implementado com exatamente 4 casos: `ESTUDANTE = 'estudante'`, `PROFESSOR = 'professor'`, `TECNICO_ADMINISTRATIVO = 'tecnico_administrativo'`, `EXTERNO = 'externo'`
  - [ ] Método público `prioridadeSugerida(): int` implementado, retornando: 1 para professor e técnico-administrativo (empate intencional), 2 para estudante, 3 para externo
  - [ ] Documentação no enum claro que a prioridade é **consultiva**, nunca bloqueante
  - [ ] Nenhuma coluna `is_monitor` criada em `users`
  - [ ] Código reproduz fielmente o documento 03 §7.1

---

## [S5-BE-03] Migration — Adicionar `origem_avaliacao` à Tabela `horarios`

- **Objetivo:** Rastrear o caminho de aprovação de cada horário (normal vs. urgência), com default para retrocompatibilidade.
- **Caso de uso:** UC-21-A, UC-21-B (rastreamento de auditoria)
- **Atores envolvidos:** Desenvolvedor
- **Partes afetadas:**
  - `database/migrations/YYYY_MM_DD_add_urgencia_fields_to_horarios_table.php` (novo)
  - `app/Models/Horario.php` (possível cast)
- **Depende de:** Nenhuma
- **Riscos relacionados:** P-31 (rastreamento de avaliador)
- **Casos de teste obrigatórios:**
  - `MigrationOrigemAvaliacaoTest::test_column_created_with_default` — verifica `VARCHAR(30) NOT NULL DEFAULT 'fluxo_normal'`
  - `MigrationOrigemAvaliacaoTest::test_existing_horarios_backfilled` — todos os horários legados recebem `'fluxo_normal'`
  - `MigrationOrigemAvaliacaoTest::test_migration_reversible` — `down()` remove sem erros
- **Critérios de aceite:**
  - [ ] Coluna `origem_avaliacao VARCHAR(30) NOT NULL DEFAULT 'fluxo_normal'` criada
  - [ ] Nenhum backfill manual necessário (default resolve)
  - [ ] Seed testa default para novo horário
  - [ ] Migration reversa funciona

---

## [S5-BE-04] Enum `OrigemAvaliacaoEnum`

- **Objetivo:** Definir a taxonomia canônica de origem de avaliação (fluxo normal vs. urgência por Gestor de Espaço).
- **Caso de uso:** UC-21-A, UC-21-B (rastreamento)
- **Atores envolvidos:** Desenvolvedor
- **Partes afetadas:**
  - `app/Enums/SituacaoReserva/OrigemAvaliacaoEnum.php` (novo — viver no diretório `SituacaoReserva` mantém a coesão com outros enums de reserva)
- **Depende de:** Nenhuma
- **Riscos relacionados:** Nenhum
- **Casos de teste obrigatórios:**
  - `OrigemAvaliacaoEnumTest::test_enum_has_two_cases` — verifica `FLUXO_NORMAL`, `URGENCIA_GESTOR_ESPACO`
  - `OrigemAvaliacaoEnumTest::test_case_values` — confirma strings `'fluxo_normal'` e `'urgencia_gestor_espaco'`
- **Critérios de aceite:**
  - [ ] Enum com exatamente 2 casos: `FLUXO_NORMAL = 'fluxo_normal'`, `URGENCIA_GESTOR_ESPACO = 'urgencia_gestor_espaco'`
  - [ ] Localizado em `app/Enums/SituacaoReserva/OrigemAvaliacaoEnum.php`
  - [ ] Comentário no enum explica que `FLUXO_NORMAL` é o valor default para retrocompatibilidade

---

## [S5-BE-05] Estender `StoreRegisterRequest` — Validar `tipo_vinculo`

- **Objetivo:** Capturar declaração de vínculo institucional no cadastro de usuário (auto-declarado, P-26).
- **Caso de uso:** UC-24 (novo usuário se cadastra)
- **Atores envolvidos:** Usuário comum, Gestor de Espaço (balcão)
- **Partes afetadas:**
  - `app/Http/Requests/Auth/StoreRegisterRequest.php` (modificar)
  - `database/seeders/UserSeeder.php` (possível ajuste se testador precisar)
- **Depende de:** S5-BE-01, S5-BE-02
- **Riscos relacionados:** R-14 (autodeclaração), P-26 (sem verificação externa)
- **Casos de teste obrigatórios:**
  - `StoreRegisterRequestTest::test_tipo_vinculo_is_required` — falha se omitido
  - `StoreRegisterRequestTest::test_tipo_vinculo_must_be_valid_enum_value` — rejeita valores inválidos
  - `StoreRegisterRequestTest::test_accepts_all_four_tipo_vinculo_values` — aceita os 4 valores válidos
  - `StoreRegisterRequestTest::test_tipo_vinculo_does_not_default_in_request` — o request não fornece default; é o database
- **Critérios de aceite:**
  - [ ] Campo `tipo_vinculo` adicionado ao array de validação como `'required' | 'in:estudante,professor,tecnico_administrativo,externo'`
  - [ ] Campo incluído no `authorize()` como sempre verdadeiro (qualquer pessoa pode declarar seu próprio vínculo)
  - [ ] `Controller::store()` passa `$validated['tipo_vinculo']` para a `User::create()` ou similar
  - [ ] Testes cobrem rejeição de valores inválidos
  - [ ] Documentação de erro clara (ex.: "Vínculo institucional deve ser um dos valores válidos")

---

## [S5-BE-06] Permission `reservas.avaliar-urgencia` com Exclusão Explícita do Institucional

- **Objetivo:** Registrar a nova permission no banco e garantir que o Institucional **nunca a receba** automaticamente pela sincronização (P-34).
- **Caso de uso:** UC-21-A, UC-21-B (autorização)
- **Atores envolvidos:** Desenvolvedor (seeder)
- **Partes afetadas:**
  - `database/seeders/Production/PermissionSeeder.php` (modificar ou criar entrada)
  - `database/seeders/Production/RoleSeeder.php` (adicionar 3ª exclusão)
- **Depende de:** S5-BE-02 (para que a permission faça sentido), Sprint 2 (para que o role `gestor_espaco` exista)
- **Riscos relacionados:** R-18 (sequenciamento de permissions), P-34 (exclusão explícita)
- **Casos de teste obrigatórios:**
  - `PermissionSeederTest::test_reservas_avaliar_urgencia_permission_exists` — verifica entrada na tabela `permissions`
  - `PermissionSeederTest::test_gestores_espaco_has_permission_by_default` — após sincronização, `gestor_espaco` role recebe a permission automaticamente
  - `RoleSeederTest::test_institucional_does_not_have_avaliar_urgencia` — role `institucional` está **explicitamente excluído** (terceira exclusão, junto com `reservas.deletar` e `reservas.atualizar`)
  - `RoleSeederTest::test_institucional_exclusions_are_exactly_three` — valida que `RoleSeeder` exclui exatamente as 3 permissions (não mais, não menos)
- **Critérios de aceite:**
  - [ ] Entrada criada em `PermissionSeeder` com nome `'reservas.avaliar-urgencia'` e rótulo descritivo
  - [ ] `RoleSeeder`, na seção de sincronização do `institucional`, adiciona 3ª condição: `.where('name', '!=', 'reservas.avaliar-urgencia')` junto com as exclusões existentes de `deletar` e `atualizar`
  - [ ] Comentário no `RoleSeeder` documenta o motivo: "Urgência é exclusiva do Gestor de Espaço; Institucional monitora, não avalia"
  - [ ] Código reproduz exatamente o documento 07 §2.4-C, implementando a correção de P-34
  - [ ] **Marque com ⚠️ em destaque** que esta é a **3ª exclusão** do Institucional

---

## [S5-BE-07] `ReservaPolicy::avaliarComUrgencia(User $user, Horario $horario): bool`

- **Objetivo:** Validar todas as pré-condições da aprovação de urgência (permission, escopo, data, conflito, expediente) em um único ponto de autorização.
- **Caso de uso:** UC-21-A (validação do Fluxo A)
- **Atores envolvidos:** Gestor de Espaço (executor)
- **Partes afetadas:**
  - `app/Policies/ReservaPolicy.php` (adicionar método)
  - `app/Services/ConflictDetectionService.php` (já existente, será usado)
  - `app/Repositories/Interfaces/EspacoRepositoryInterface.php` (será usado para `getEspacosGeridosPorGestorEspaco()`)
  - `app/Services/ExpedienteService.php` (será usado para `estaEmExpediente()` — necessário que Sprint 4 esteja completo)
- **Depende de:** S5-BE-06, Sprint 2 (algoritmo `getEspacosGeridosPorGestorEspaco()`), Sprint 4 (expediente)
- **Riscos relacionados:** R-09 (abuso do mecanismo, mitigado por D-2), R-23 (premissa semântica do expediente)
- **Casos de teste obrigatórios:**
  - `ReservaPolicyTest::test_avaliar_urgencia_without_permission_returns_false` — falha se usuário não tem `reservas.avaliar-urgencia`
  - `ReservaPolicyTest::test_avaliar_urgencia_only_for_managed_spaces` — falha se espaço não está na lista de `getEspacosGeridosPorGestorEspaco()`
  - `ReservaPolicyTest::test_avaliar_urgencia_rejects_future_date` — rejeita se `horario.data` não é hoje (P-15)
  - `ReservaPolicyTest::test_avaliar_urgencia_rejects_multi_day_reservation` — rejeita se a reserva contém **qualquer** horário fora de hoje (P-17 Fluxo A)
  - `ReservaPolicyTest::test_avaliar_urgencia_rejects_conflicting_horario` — rejeita se existe conflito com horário `deferida`
  - `ReservaPolicyTest::test_avaliar_urgencia_with_expediente_false_allows` — quando `estaEmExpediente() === false`, permite (D-2)
  - `ReservaPolicyTest::test_avaliar_urgencia_with_expediente_null_allows` — quando `estaEmExpediente() === null`, permite com aviso viável (D-2)
  - `ReservaPolicyTest::test_avaliar_urgencia_with_expediente_true_blocks` — quando `estaEmExpediente() === true`, bloqueia (D-2)
  - `ReservaPolicyTest::test_avaliar_urgencia_rejects_horario_not_in_analysis_or_requested` — rejeita se situação não é `EM_ANALISE` ou `SOLICITADO`
- **Critérios de aceite:**
  - [ ] Método `avaliarComUrgencia(User $user, Horario $horario): bool` criado
  - [ ] Checagens implementadas **na ordem exata** do documento 03 §7.4 e §7.7:
    - (1) `!$user->hasPermissionTo('reservas.avaliar-urgencia')` → retorna `false`
    - (2) Espaço não está em `getEspacosGeridosPorGestorEspaco($user->id)` → retorna `false`
    - (3) `!$horario->data->isToday()` → retorna `false` (P-15)
    - (4) Situação não é `EM_ANALISE` ou `SOLICITADO` → retorna `false`
    - (5) Reserva contém horário fora de hoje (`whereDate('data', '!=', today())->exists()`) → retorna `false` (P-17)
    - (6) Conflito com horário `deferida` → retorna `false`
    - (7) Expediente: `estaEmExpediente() === true` → retorna `false`; `=== null` ou `=== false` → continua
  - [ ] Defesa em profundidade: comentário documenta que `Policy` é apenas primeira linha; a query de update deve filtrar novamente por `whereIn('agenda.espaco_id', ...)`
  - [ ] Documentação em comentário de cada pré-condição explica o motivo (referência a P-15, P-17, etc.)
  - [ ] Retorno é booleano simples, sem exceção (autorização falha silenciosamente com `false`)

---

## [S5-BE-08] `GestorEspacoReservaUrgenteController::aprovar()` — Fluxo A

- **Objetivo:** Endpoint `PATCH /gestor-espaco/reservas-urgentes/{horario}` que aprova urgência com defesa em profundidade.
- **Caso de uso:** UC-21-A
- **Atores envolvidos:** Gestor de Espaço (solicitante)
- **Partes afetadas:**
  - `app/Http/Controllers/GestorEspaco/ReservaUrgenteController.php` (novo)
  - `routes/web.php` (adicionar rota)
  - `app/Models/Horario.php` (possível relacionamento, se não existir)
  - `app/Models/Reserva.php` (possível relacionamento, se não existir)
- **Depende de:** S5-BE-07 (Policy), S5-BE-04 (enum), S5-BE-11 (notificação)
- **Riscos relacionados:** R-18 (sequenciamento), defesa em profundidade de autorização
- **Casos de teste obrigatórios:**
  - `GestorEspacoReservaUrgenteControllerTest::test_patch_endpoint_exists` — rota respondendo a `PATCH /gestor-espaco/reservas-urgentes/{horario:id}`
  - `GestorEspacoReservaUrgenteControllerTest::test_authorizes_with_policy` — Policy `avaliarComUrgencia()` é consultada
  - `GestorEspacoReservaUrgenteControllerTest::test_requires_authentication` — acesso anônimo é rejeitado com 401
  - `GestorEspacoReservaUrgenteControllerTest::test_update_query_filters_by_espaco_posse` — query de update inclui `whereIn('agenda.espaco_id', ...)` em adição ao ID
  - `GestorEspacoReservaUrgenteControllerTest::test_approves_horario_and_sets_origem_avaliacao` — após sucesso, `Horario` tem `situacao = 'deferida'` e `origem_avaliacao = 'urgencia_gestor_espaco'` e `user_id = gestor.id` (P-31)
  - `GestorEspacoReservaUrgenteControllerTest::test_sends_notification_to_gestor_agenda` — `UrgencyReservationApprovedNotification` é despachada
  - `GestorEspacoReservaUrgenteControllerTest::test_rejects_if_not_owned_by_gestor` — tentativa de aprovar espaço não gerido falha mesmo se o horário é válido
  - `GestorEspacoReservaUrgenteControllerTest::test_response_format` — retorna JSON com `horario` aprovado e `message` descritiva
- **Critérios de aceite:**
  - [ ] Controller `GestorEspacoReservaUrgenteController` criado com método `aprovar(Request $request, Horario $horario)`
  - [ ] Rota `PATCH /gestor-espaco/reservas-urgentes/{horario}` conecta ao método
  - [ ] Autenticação obrigatória (`auth` middleware)
  - [ ] Policy `authorizeResource` verifica `avaliarComUrgencia()` antes de qualquer ação
  - [ ] Update interno replica filtro de escopo: `Horario::where('id', $horario->id)->whereIn('agenda_id', $agendasDoGestorIds)->update(...)`  **ou** equivalente com join em `Agenda → Espaco` e filtro em `espaco_id IN (...)`
  - [ ] Estados atualizados: `situacao = SituacaoReservaEnum::DEFERIDA`, `origem_avaliacao = OrigemAvaliacaoEnum::URGENCIA_GESTOR_ESPACO`, `user_id = Auth::user()->id`
  - [ ] Notificação `UrgencyReservationApprovedNotification` é despachada ao Gestor de Reserva (`Agenda.user`)
  - [ ] Resposta 200 JSON com horário atualizado
  - [ ] Resposta 403 se Policy falhar
  - [ ] Resposta 404 se horário não existe ou pertence a outro espaço

---

## [S5-BE-09] `ReservaService::criarComUrgencia()` — Fluxo B (Walk-in, Síncrono)

- **Objetivo:** Caminho **síncrono e dedicado** para criar reserva em nome de terceiro, já nascendo `deferida`, **sem** passar por `ProcessarCriacaoReserva` (que é assíncrono e aplica auto-aprovação indevida — R-16).
- **Caso de uso:** UC-21-B
- **Atores envolvidos:** Gestor de Espaço (criador no balcão), Solicitante (terceiro em cujo nome é criada)
- **Partes afetadas:**
  - `app/Services/ReservaService.php` (adicionar método)
  - `app/Services/ExpansaoHorariosService.php` (será reutilizado para montar horários)
  - `app/Models/Reserva.php`, `app/Models/Horario.php`
  - Possível novo controller/endpoint ou modificação de `ReservaController`
- **Depende de:** S5-BE-02, S5-BE-04, S5-BE-07, S5-BE-11, Sprint 4 (expediente), Sprint 2 (escopo espacial)
- **Riscos relacionados:** R-16 (interação com auto-aprovação), R-23 (premissa semântica)
- **Casos de teste obrigatórios:**
  - `ReservaServiceTest::test_criar_com_urgencia_creates_reservation_with_solicitation_user` — `reserva.user_id = solicitante.id`, não `gestorEspaco.id`
  - `ReservaServiceTest::test_criar_com_urgencia_creates_horarios_already_deferida` — horários nascem com `situacao = 'deferida'`
  - `ReservaServiceTest::test_criar_com_urgencia_sets_origem_avaliacao_urgencia` — `origem_avaliacao = 'urgencia_gestor_espaco'`
  - `ReservaServiceTest::test_criar_com_urgencia_registers_gestor_espaco_as_evaluator` — `horario.user_id = gestorEspaco.id` (quem aprovou) (P-31)
  - `ReservaServiceTest::test_criar_com_urgencia_validates_all_horarios_are_today` — rejeita se qualquer horário não é de hoje (mesmo critério do Fluxo A, P-17)
  - `ReservaServiceTest::test_criar_com_urgencia_validates_all_espacos_are_in_gestor_scope` — rejeita se qualquer espaço não está em `getEspacosGeridosPorGestorEspaco(gestorEspaco)`
  - `ReservaServiceTest::test_criar_com_urgencia_checks_no_conflict_with_deferida` — rejeita se existe conflito com qualquer horário `deferida`
  - `ReservaServiceTest::test_criar_com_urgencia_sends_notification` — `UrgencyReservationApprovedNotification` é despachada
  - `ReservaServiceTest::test_criar_com_urgencia_is_synchronous` — execução completa sem enfileiramento em `ProcessarCriacaoReserva`
  - `ReservaServiceTest::test_criar_com_urgencia_throws_on_validation_failure` — lança exception (recomendado) ou retorna erro se validação falha
- **Critérios de aceite:**
  - [ ] Método `criarComUrgencia(User $solicitante, array $dados, User $gestorEspaco): Reserva` implementado
  - [ ] Assinatura corresponde exatamente ao pseudocódigo do documento 03 §8.1
  - [ ] Comentário no método documenta por que **não** reutiliza `ProcessarCriacaoReserva`: "Job é assíncrono + aplica cascata de auto-aprovação que não se aplica ao walk-in; este caminho é síncrono e dedicado"
  - [ ] Validações (em qualquer ordem):
    - Todos os horários estão em TODAY
    - Todos os espaços estão em `getEspacosGeridosPorGestorEspaco(gestorEspaco)`
    - Nenhum conflito com horário `deferida`
  - [ ] Criação transacional (tudo ou nada):
    - `Reserva` criada com `user_id = solicitante.id`, `situacao = 'solicitada'` ou `'em_analise'` (dependência de lógica existente)
    - `Horario` records criados com `situacao = 'deferida'`, `origem_avaliacao = 'urgencia_gestor_espaco'`, `user_id = gestorEspaco.id`
  - [ ] `UrgencyReservationApprovedNotification` despachada ao Gestor de Reserva (`Agenda.user`), **não** ao solicitante (P-14)
  - [ ] Sem enfileiramento — tudo executa na mesma request (síncrono)
  - [ ] Exceção clara se validação falha (ex.: `ReservaException` com mensagem específica)

---

## [S5-BE-10] Endpoint de Busca de Usuário por E-mail Exato com Rate Limiting

- **Objetivo:** Fornecer caminho seguro para o Gestor de Espaço localizar um usuário já cadastrado por e-mail, sem expor a lista completa de usuários (D-3).
- **Caso de uso:** UC-21-B (pré-requisito operacional: localizar solicitante após cadastro)
- **Atores envolvidos:** Gestor de Espaço (solicitante), Usuário cadastrado (alvo da busca)
- **Partes afetadas:**
  - `app/Http/Controllers/GestorEspaco/UsuarioController.php` (novo ou adicionar método a existente)
  - `app/Http/Requests/BuscarUsuarioPorEmailRequest.php` (novo, FormRequest)
  - `routes/web.php` (adicionar rota)
  - `database/seeders/Production/PermissionSeeder.php` (adicionar permission `usuarios.buscar-para-atendimento`)
  - Possível middleware de rate limiting
- **Depende de:** Sprint 2 (role `gestor_espaco` existe)
- **Riscos relacionados:** D-3 (acesso necessário mas controlado)
- **Casos de teste obrigatórios:**
  - `UsuarioBuscaControllerTest::test_endpoint_exists` — rota `GET /gestor-espaco/usuarios/busca-email` responde
  - `UsuarioBuscaControllerTest::test_requires_authentication` — rejeita anônimo com 401
  - `UsuarioBuscaControllerTest::test_requires_permission` — rejeita se usuário não tem `usuarios.buscar-para-atendimento`
  - `UsuarioBuscaControllerTest::test_exact_email_match_returns_user` — busca por `email=usuario@example.com` retorna o usuário se existe
  - `UsuarioBuscaControllerTest::test_partial_email_no_match` — busca por `email=usuario` (sem domínio) retorna 0 resultados
  - `UsuarioBuscaControllerTest::test_case_insensitive_email` — busca por `USUARIO@EXAMPLE.COM` encontra `usuario@example.com`
  - `UsuarioBuscaControllerTest::test_returns_only_min_fields` — resposta contém **apenas** `id` e `nome`, não `email`, `password`, `tipo_vinculo`, etc.
  - `UsuarioBuscaControllerTest::test_returns_max_one_record` — resposta é array com 0 ou 1 elemento, nunca múltiplos
  - `UsuarioBuscaControllerTest::test_rate_limiting_applied` — após N requisições em T segundos (ex.: 10 em 1 minuto), cliente recebe 429 Too Many Requests
  - `UsuarioBuscaControllerTest::test_missing_email_parameter_rejected` — request sem `?email=...` é rejeitado com 422
- **Critérios de aceite:**
  - [ ] Rota `GET /gestor-espaco/usuarios/busca-email?email=...` criada e conectada
  - [ ] Middleware `auth` obrigatório
  - [ ] `authorize()` no FormRequest verifica `usuarios.buscar-para-atendimento` (nova permission)
  - [ ] `FormRequest::rules()` exige `email` como `'required' | 'email'` ou similar
  - [ ] Query internamente: `User::where('email', $email)->first()` (busca exata, case-insensitive em DB)
  - [ ] Resposta JSON: `[{ 'id': 123, 'nome': 'Fulano da Silva' }]` (array com 0 ou 1 objeto) **ou** `{ 'user': null }` (escolher um padrão consistente com projeto)
  - [ ] Nenhum campo sensível exposto (email, password hash, setor, etc.)
  - [ ] Rate limiting implementado (ex.: Laravel's `throttle:10,1` middleware ou similar)
  - [ ] Documentação em comentário: "D-3: endpoint estreito para balcão, sem expor lista geral"
  - [ ] Permission `usuarios.buscar-para-atendimento` criada no `PermissionSeeder`
  - [ ] Somente `gestor_espaco` recebe automaticamente esta permission (ou qualquer role designado para o endpoint, a definir)

---

## [S5-BE-11] `UrgencyReservationApprovedNotification` — Notificação `ShouldQueue`

- **Objetivo:** Notificar o Gestor de Reserva titular da agenda que sua reserva foi aprovada por urgência (única notificação de urgência, destinatário único — P-14).
- **Caso de uso:** UC-21-A, UC-21-B (notificação de auditoria)
- **Atores envolvidos:** Gestor de Reserva (destinatário único)
- **Partes afetadas:**
  - `app/Notifications/UrgencyReservationApprovedNotification.php` (novo)
  - `app/Http/Controllers/GestorEspaco/ReservaUrgenteController.php` (vai invocar)
  - `app/Services/ReservaService.php::criarComUrgencia()` (vai invocar)
- **Depende de:** S5-BE-08, S5-BE-09
- **Riscos relacionados:** R-09 (abuso do mecanismo, notificação é principal controle), regra inviolável nº 4 (CLAUDE.md: `notify()` em Job tem `try-catch`)
- **Casos de teste obrigatórios:**
  - `UrgencyReservationApprovedNotificationTest::test_notification_implements_should_queue` — classe implementa `ShouldQueue`
  - `UrgencyReservationApprovedNotificationTest::test_single_recipient_is_gestor_agenda` — `$notification->toMail($notifiable)` recebe o Gestor de Reserva (`Agenda.user`), não o solicitante, não outro ator
  - `UrgencyReservationApprovedNotificationTest::test_via_includes_mail` — `via()` retorna `['mail']` (ou similar, conforme config do projeto)
  - `UrgencyReservationApprovedNotificationTest::test_mail_subject_descriptive` — subject menciona "urgência" ou "aprovação urgente"
  - `UrgencyReservationApprovedNotificationTest::test_mail_body_contains_context` — body menciona: solicitante, espaço, horário, Gestor de Espaço que aprovou
  - `UrgencyReservationApprovedNotificationTest::test_no_other_recipients` — notificação é enviada **apenas** para o Gestor de Reserva; log ou código explicitamente documenta que não há outros destinatários (nem Institucional, nem Gestor de Unidade, nem solicitante)
  - `UrgencyReservationApprovedNotificationTest::test_notification_sent_in_fluxo_a` — após `ReservaUrgenteController::aprovar()`, notificação é despachada
  - `UrgencyReservationApprovedNotificationTest::test_notification_sent_in_fluxo_b` — após `ReservaService::criarComUrgencia()`, notificação é despachada
- **Critérios de aceite:**
  - [ ] Classe `UrgencyReservationApprovedNotification extends Notification implements ShouldQueue`
  - [ ] Construtor recebe `Horario $horario` (pelo menos) — e extrai contexto necessário
  - [ ] Método `via()` retorna `['mail']` (ou conforme convenção do projeto)
  - [ ] Método `toMail(Notifiable $notifiable)` retorna `MailMessage` com:
    - Subject descritivo (ex.: "Sua reserva foi aprovada (urgência)")
    - Body com: solicitante, espaço, horário aprovado, quem aprovou, data/hora da aprovação
    - Call-to-action opcional (link para ver reserva)
  - [ ] `$notifiable` é sempre `$horario->agenda->user` (Gestor de Reserva), nunca outro
  - [ ] Código documenta em comentário: "P-14 (fechada): única notificação de urgência, destinatário único é o Gestor de Reserva"
  - [ ] **Invocação sempre em `try-catch`** conforme regra inviolável:
    - Qualquer invocação de `$user->notify()` em Job (se houver) ou Service que dispache a notificação está envolvida em try-catch
    - Fallback para `Log::warning()` em caso de falha (R-09: notificação é principal controle contra abuso; falha silenciosa é grave)
  - [ ] Exemplo de código no controller/service:
    ```php
    try {
        $gestorAgenda->notify(new UrgencyReservationApprovedNotification($horario));
    } catch (Exception $e) {
        Log::warning('Falha ao enviar notificação de urgência', [
            'horario_id' => $horario->id,
            'gestor_id' => $gestorAgenda->id,
            'error' => $e->getMessage(),
        ]);
        // Não lança exception — deixa a aprovação prosseguir
    }
    ```

---

## [S5-BE-12] Registrar `Horario.user_id` e `origem_avaliacao` em Ambos os Fluxos

- **Objetivo:** Garantir que, em qualquer aprovação de urgência (Fluxo A ou B), o Gestor de Espaço é registrado como avaliador e a origem é rastreada (P-31).
- **Caso de uso:** UC-21-A, UC-21-B (rastreamento)
- **Atores envolvidos:** Desenvolvedor (implementação em S5-BE-08 e S5-BE-09)
- **Partes afetadas:**
  - `app/Http/Controllers/GestorEspaco/ReservaUrgenteController.php` (Fluxo A)
  - `app/Services/ReservaService.php::criarComUrgencia()` (Fluxo B)
  - `app/Models/Horario.php` (nenhuma mudança; colunas já existem pós-migrations S5-BE-01 e S5-BE-03)
- **Depende de:** S5-BE-08 (Fluxo A), S5-BE-09 (Fluxo B)
- **Riscos relacionados:** P-31 (fechada)
- **Casos de teste obrigatórios:**
  - `FluxoATest::test_fluxo_a_sets_horario_user_id_to_gestor` — após `ReservaUrgenteController::aprovar()`, `Horario.user_id === gestorEspaco.id`
  - `FluxoATest::test_fluxo_a_sets_origem_avaliacao` — `Horario.origem_avaliacao === 'urgencia_gestor_espaco'`
  - `FluxoBTest::test_fluxo_b_sets_horario_user_id_to_gestor` — após `ReservaService::criarComUrgencia()`, `Horario.user_id === gestorEspaco.id`
  - `FluxoBTest::test_fluxo_b_sets_origem_avaliacao` — `Horario.origem_avaliacao === 'urgencia_gestor_espaco'`
  - `FluxoATest::test_fluxo_a_distinguishes_from_normal_flow` — um horário normal tem `origem_avaliacao = 'fluxo_normal'`, urgência tem `'urgencia_gestor_espaco'`
  - `FluxoBTest::test_fluxo_b_distinguishes_from_normal_flow` — mesmo acima
- **Critérios de aceite:**
  - [ ] **Fluxo A (S5-BE-08):** `Horario::where('id', ...)->update(['user_id' => $gestorEspaco->id, 'origem_avaliacao' => OrigemAvaliacaoEnum::URGENCIA_GESTOR_ESPACO->value])`
  - [ ] **Fluxo B (S5-BE-09):** Ao criar os `Horario` records, atribuir `user_id = $gestorEspaco->id` e `origem_avaliacao = 'urgencia_gestor_espaco'` (usando o enum)
  - [ ] Ambos os fluxos diferenciam claramente de `fluxo_normal` (default)
  - [ ] Testes verificam que ambos os campos são **sempre** atualizados juntos (não um sem o outro)
  - [ ] Documentação em comentário: "P-31 (fechada): Gestor de Espaço fica registrado como avaliador, distinguindo de fluxo normal"

---

## Resumo de Interdependências

```
S5-BE-01 (tipo_vinculo migration)
  ↓
S5-BE-02 (TipoVinculoEnum com prioridade)
  ↓
S5-BE-05 (StoreRegisterRequest valida tipo_vinculo)

S5-BE-03 (origem_avaliacao migration)
  ↓
S5-BE-04 (OrigemAvaliacaoEnum)

S5-BE-06 (Permission + Seeder exclusão Institucional)
  ↓
S5-BE-07 (ReservaPolicy::avaliarComUrgencia)
  ├─ S5-BE-08 (Fluxo A Controller)
  └─ S5-BE-09 (Fluxo B Service)
      ↓
    S5-BE-11 (Notificação)
    S5-BE-12 (Registrar avaliador)

S5-BE-10 (Busca por e-mail) — independente, depende apenas de Sprint 2 (role)
```

**Ordem de Implementação Recomendada:**
1. S5-BE-01, S5-BE-03 (migrations)
2. S5-BE-02, S5-BE-04 (enums)
3. S5-BE-05 (FormRequest)
4. S5-BE-06 (permission + seeder)
5. S5-BE-07 (Policy)
6. S5-BE-10 (busca, pode ser paralelo)
7. S5-BE-08, S5-BE-09 (controllers/services)
8. S5-BE-11 (notificação)
9. S5-BE-12 (integração final)

---

## Notas Gerais

- **Defesa em Profundidade:** Qualquer update de `Horario` na validação de urgência deve incluir filtro de escopo redundante na query (`whereIn('agenda.espaco_id', ...)` ou equivalente), seguindo o padrão de `AvaliarReservaJob`.
- **Integração com Sprint 4:** Os testes de urgência devem rodar **com** Sprint 4 (expediente) completo. Se Sprint 4 não estiver pronto, testes do estado `null` podem ser skipped até lá (mas não devem passar como "aceito").
- **Rate Limiting (S5-BE-10):** Implementação específica (qual middleware, qual limite) pode ser definida durante execução, mas é **obrigatória** contra enumeração de e-mails.
- **Notificação Robusta (S5-BE-11):** A regra inviolável #4 (`notify()` em Job tem `try-catch`) aplica-se aqui, mesmo que não em Job: a notificação é o **único** controle contra R-09, então falha silenciosa é inaceitável.
