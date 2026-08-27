# Sprint 3 Integração — Backlog

---

## [S3-INT-01] Teste Multi-Papel: Usuário `institucional` + `gestor` Vê Ambos Blocos Simultaneamente

- **Objetivo:** validar que um usuário com múltiplos papéis (ex.: `institucional` **e** `gestor` de agendas) vê **todos** os blocos aos quais tem permission no mesmo dashboard — comprovando a correção do efeito colateral pré-existente (antes: bloco institucional vencia e blocos de gestor ficavam invisíveis).
- **Caso de uso:** UC-18 (consolidação de dashboards para multi-papel)
- **Atores envolvidos:** Institucional + Gestor de Reserva (acúmulo deliberado)
- **Partes afetadas:** Testes de integração backend↔frontend (não toca código produto)
- **Depende de:** S3-BE-02 (refatoração de `HomeService` completa), S3-FE-01 (página única renderizando blocos)
- **Riscos relacionados:** R-13 (consolidação retroativa — este teste prova que o efeito colateral antigo está resolvido)
- **Casos de teste obrigatórios:**
  - `HomeIntegrationTest::test_multi_role_user_institucional_and_gestor_sees_both_blocks_in_dashboard`
    - Setup: usuário com `institucional` + `gestor` (de agendas)
    - GET `/dashboard`
    - Assertions:
      - Status 200 OK
      - Payload contém chave de bloco institucional (`dashboardData.institucional` ou similar)
      - Payload contém chave de bloco gestor (`dashboardData.gestor` ou similar)
      - Frontend renderiza ambos `WidgetVisaoMacroInstitucional` e `WidgetReservasParaAvaliar`
      - Nenhuma CSS de `display: none` ou comentário visual indicando "estes dados estão ocultos"
  - `HomeIntegrationTest::test_multi_role_user_nunca_vê_dados_bloqueados_anteriormente`
    - Setup: criar cenário específico onde o usuário gestor tem reservas pendentes
    - Antes (versão antiga): essas reservas ficariam invisíveis quando ele recebe `institucional`
    - Depois (esta versão): reservas aparecem no widget de gestor
- **Critérios de aceite:**
  - [ ] Teste passa (usuário multi-papel vê N blocos)
  - [ ] Test setup simples e documentado (exemplo: fixture de usuário com 2 roles atribuídos)
  - [ ] Assertions verificam presença de dados no payload Inertia, não apenas CSS (robusto contra mudanças de UI)
  - [ ] Teste rápido (< 1s)
  - [ ] Comentário no teste documenta: "Regression test para efeito colateral pré-existente S-03-INT-01"

---

## [S3-INT-02] Teste Single-Papel: Usuário com 1 Papel Vê Apenas Bloco Correspondente + Minhas Reservas

- **Objetivo:** validar que um usuário com **exatamente 1 papel** vê **apenas** o bloco correspondente àquele papel, **mais** o bloco `WidgetMinhasReservas` (que é sempre presente) — nunca vê blocos de papéis que não possui.
- **Caso de uso:** UC-18 (composição aditiva por permission, não por papel)
- **Atores envolvidos:** Todos os 5 papéis (Comum, Gestor de Reserva, Gestor de Espaço, Gestor de Unidade, Institucional)
- **Partes afetadas:** Testes de integração backend↔frontend (não toca código produto)
- **Depende de:** S3-BE-02 (refatoração de `HomeService` completa), S3-FE-01 (página única renderizando blocos)
- **Riscos relacionados:** R-04 (PBAC — nenhum usuario vê dados sem permission)
- **Casos de teste obrigatórios:**
  - `HomeIntegrationTest::test_comum_user_sees_only_minhas_reservas`
    - Setup: usuário com papel `comum` apenas
    - GET `/dashboard`
    - Assertions: payload contém apenas `dashboardData.user` (minhas reservas), sem chaves de outros blocos
  - `HomeIntegrationTest::test_gestor_reserva_sees_only_gestor_and_minhas_reservas_blocks`
    - Setup: usuário com `gestor` (de agendas) apenas
    - Assertions: payload contém `dashboardData.gestor` + `dashboardData.user`, sem `institucional`/`gestor_unidade`/`gestor_espaco`
  - `HomeIntegrationTest::test_gestor_espaco_sees_only_espaco_and_minhas_reservas_blocks`
    - Setup: usuário com `gestor_espaco` apenas
    - Assertions: payload contém `dashboardData.gestor_espaco` + `dashboardData.user`
  - `HomeIntegrationTest::test_gestor_unidade_sees_only_unidade_and_minhas_reservas_blocks`
    - Setup: usuário com `gestor_unidade` apenas
    - Assertions: payload contém `dashboardData.gestor_unidade` + `dashboardData.user`
  - `HomeIntegrationTest::test_institucional_sees_only_institucional_and_minhas_reservas_blocks`
    - Setup: usuário com `institucional` apenas
    - Assertions: payload contém `dashboardData.institucional` + `dashboardData.user`
  - `HomeIntegrationTest::test_unauthenticated_user_redirected_from_dashboard`
    - Setup: nenhuma autenticação
    - GET `/dashboard`
    - Assertion: redirect 302/redirectTo login (comportamento atual preservado)
- **Critérios de aceite:**
  - [ ] 6 testes passam (1 por papel + 1 unauthenticated)
  - [ ] Cada teste valida **ausência** de blocos não pertinentes (não assume ordem ou estrutura específica)
  - [ ] Fixtures de usuário reusáveis e documentadas
  - [ ] Testes parametrizados se possível (não código duplicado para 5 papéis)

---

## [S3-INT-03] Teste/Verificação de Contagem de Queries (N+1) por Perfil de Usuário

- **Objetivo:** validar que a refatoração de `HomeService` respeita a mitigação de R-17: um usuário com 1 papel dispara ~N queries, um usuário com 3 papéis dispara ~3N queries (linear), e **nunca há N+1 problems** dentro de um bloco (ex.: contar usuários com query de user sem eager loading).
- **Caso de uso:** UC-18 (otimização de performance para multi-papel)
- **Atores envolvidos:** Qualquer usuário autenticado
- **Partes afetadas:** Testes de query count (não toca código produto, apenas valida comportamento)
- **Depende de:** S3-BE-05 (mitigação de R-17 implementada)
- **Riscos relacionados:** R-17 (performance — **risco principal**)
- **Casos de teste obrigatórios:**
  - `HomeIntegrationTest::test_query_count_single_role_user_institutional`
    - Setup: usuário com `institucional` apenas
    - Query count recorder activado
    - GET `/dashboard`
    - Assertion: total de queries ≤ 20 (baseline, ajustar conforme necessidade real)
    - Exemplo: `getInstitucionalData()` faz ~6 queries + 3 aggregates = ~9, aceitável
  - `HomeIntegrationTest::test_query_count_single_role_user_gestor_reserva`
    - Setup: usuário com `gestor` (de agendas) apenas
    - Assertion: query count similar ao baseline
  - `HomeIntegrationTest::test_query_count_multi_role_user_scales_linearly`
    - Setup: usuário com `institucional` + `gestor` + `gestor_unidade` (3 papéis)
    - Assertion: query count ≈ 3 × baseline_single_role (dentro de 20% de tolerância)
    - Reason: cada bloco é independente, não há otimização de batch cruzada
  - `HomeIntegrationTest::test_query_count_no_n_plus_one_in_institutional_data`
    - Setup: usuário `institucional`, com múltiplos gestores no banco
    - Query count test:
      - Baseline: 1 usuário → 9 queries
      - Com 100 usuarios no banco: **ainda** ~9 queries (agregação no SQL, não loop)
      - Assertion: query count não cresce com N usuários
  - `HomeIntegrationTest::test_query_count_no_n_plus_one_in_spaces_listing`
    - Setup: usuário `gestor_espaco` gerenciando 10 espaços
    - Assertion: query para listar espaços usa eager loading (não 1 + N queries)
- **Critérios de aceite:**
  - [ ] Tests passam e documentam baseline de query count por perfil
  - [ ] Comentários nos testes indicam blocos mais caros (ex.: "institucional = 9 queries")
  - [ ] Sem N+1 problems detectados (usar ferramentas como Laravel Query Debugger)
  - [ ] Se um teste falha com "X queries para Y records", há documentação de por quê e se é aceitável
  - [ ] Recomendação registrada para futuro: "se query count crescer acima de threshold, considerar Inertia partial reload para este bloco"

---

## [S3-INT-04] Smoke Test: `/dashboard` Renderiza sem Erro para Todos os 5 Perfis de Usuário

- **Objetivo:** garantia simples: cada um dos 5 papéis consegue acessar `/dashboard` e receber uma página renderizável (sem 500 errors, sem broken props, sem type errors).
- **Caso de uso:** UC-18 (validação básica de funcionalidade)
- **Atores envolvidos:** Comum, Gestor de Reserva, Gestor de Espaço, Gestor de Unidade, Institucional
- **Partes afetadas:** Testes de integração backend↔frontend (não toca código produto)
- **Depende de:** Todos os SPs anteriores de integração
- **Riscos relacionados:** Nenhum específico (é validação de linha de base)
- **Casos de teste obrigatórios:**
  - `HomeIntegrationTest::test_dashboard_smoke_test_comum_user`
    - Setup: usuário com `comum` apenas
    - GET `/dashboard`
    - Assertion: status 200, resposta Inertia contém chave `component` = 'Dashboard/DashboardPage', props têm estrutura esperada
  - `HomeIntegrationTest::test_dashboard_smoke_test_gestor_reserva_user`
    - Setup: usuário com `gestor` (de agendas) apenas
    - Assertion: status 200, props contêm `dashboardData.gestor`
  - `HomeIntegrationTest::test_dashboard_smoke_test_gestor_espaco_user`
    - Setup: usuário com `gestor_espaco` apenas
    - Assertion: status 200, props contêm `dashboardData.gestor_espaco`
  - `HomeIntegrationTest::test_dashboard_smoke_test_gestor_unidade_user`
    - Setup: usuário com `gestor_unidade` apenas
    - Assertion: status 200, props contêm `dashboardData.gestor_unidade`
  - `HomeIntegrationTest::test_dashboard_smoke_test_institucional_user`
    - Setup: usuário com `institucional` apenas
    - Assertion: status 200, props contêm `dashboardData.institucional`
- **Critérios de aceite:**
  - [ ] 5 testes passam (1 por papel)
  - [ ] Nenhum 500 error (se houver erro, é bloqueante — refactor necessário)
  - [ ] Props Inertia têm estrutura consistente (todas têm `dashboardData` como chave principal)
  - [ ] Testes são rápidos e não dependem de dados dinâmicos (fixtures estáticas OK)
  - [ ] Testes rodam com `APP_ENV=testing` (obrigatório, evita vazamento de sessão/CSRF)
