# Sprint 3 Backend — Backlog

---

## [S3-BE-01] Refatorar `HomeController::index()` de Cascata Exclusiva para Render Único

- **Objetivo:** eliminar o `match(true)` que escolhe 1 de 3 páginas por precedência, substituindo por render único de `Dashboard/DashboardPage` passando todos os dados agregados no payload Inertia.
- **Caso de uso:** UC-18 (consolidação de dashboards para multi-papel)
- **Atores envolvidos:** Institucional, Gestor de Unidade, Gestor de Espaço, Gestor de Reserva, Comum
- **Partes afetadas:** `app/Http/Controllers/HomeController.php`
- **Depende de:** S3-BE-02 (refatoração de `HomeService::getDashboardData()` deve estar pronta para ser consumida)
- **Riscos relacionados:** R-17 (performance), R-21 (escopo não filtrando por unidade)
- **Casos de teste obrigatórios:**
  - `HomeControllerTest::test_index_returns_dashboard_page_for_any_authenticated_user` — valida que `/dashboard` retorna `Dashboard/DashboardPage` (não mais 3 páginas diferentes)
  - `HomeControllerTest::test_index_passes_aggregated_dashboard_data_to_component` — valida que o payload contém todos os blocos aplicáveis, não apenas um
  - `HomeControllerTest::test_index_redirects_unauthenticated_user` — unauthenticated continua redirecionado
- **Critérios de aceite:**
  - [ ] `HomeController::index()` retorna `inertia('Dashboard/DashboardPage', $data)` sem condicionais de `match(true)`
  - [ ] Payload Inertia contém a chave agregada (ex.: `'dashboardData'`) vinda de `HomeService::getDashboardData()`
  - [ ] Nenhuma referência a `DashboardInstitucionalPage`, `DashboardGestorPage`, `DashboardUsuarioPage` permanece no controller
  - [ ] Testes passam e cobertura não regrediu

---

## [S3-BE-02] Refatorar `HomeService::getDashboardData()` para Merge Aditivo de Blocos

- **Objetivo:** substituir a cascata de `if/elseif` (que retorna apenas UM bloco de dados) por uma estratégia de **merge aditivo**, onde cada bloco de dados é adicionado ao payload apenas se o usuário tiver a permission correspondente.
- **Caso de uso:** UC-18 (consolidação de dashboards para multi-papel)
- **Atores envolvidos:** Institucional, Gestor de Unidade, Gestor de Espaço, Gestor de Reserva, Comum
- **Partes afetadas:** `app/Services/HomeService.php`
- **Depende de:** S3-BE-03 (os métodos de bloco parcial precisam estar extraídos e prontos)
- **Riscos relacionados:** R-17 (performance — cada bloco dispara queries), R-09 (necessidade de validação de escopo em cada bloco)
- **Casos de teste obrigatórios:**
  - `HomeServiceTest::test_get_dashboard_data_returns_institutional_block_for_institutional_user` — usuario com `secao.dashboard-institucional` recebe bloco institucional
  - `HomeServiceTest::test_get_dashboard_data_returns_gestor_block_for_gestor_user` — usuario com `secao.dashboard-gestor` recebe bloco de gestor de reserva
  - `HomeServiceTest::test_get_dashboard_data_returns_multiple_blocks_for_multi_role_user` — usuario com 2+ permissions recebe 2+ blocos simultaneamente
  - `HomeServiceTest::test_get_dashboard_data_never_includes_blocks_user_cannot_see` — usuario sem permission não recebe aquele bloco (nem como `null`)
  - `HomeServiceTest::test_get_dashboard_data_always_includes_user_reservations_block` — qualquer usuario autenticado sempre tem bloco `minhasReservas`
- **Critérios de aceite:**
  - [ ] Método retorna `array<string, mixed>` associativo (chaves = nomes dos blocos, valores = dados estruturados)
  - [ ] Cada chave de bloco só está presente se o usuário tiver a permission correspondente (`hasPermissionTo()`)
  - [ ] Não existe lógica `if/elseif` — apenas `if` independentes (um por bloco)
  - [ ] A chave `minhasReservas` **sempre** está presente (independente de permission)
  - [ ] Testes comprovam ausência de regressão no formato dos dados de cada bloco

---

## [S3-BE-03] Extrair e Adicionar Métodos de Bloco Parcial Componíveis

- **Objetivo:** garantir que cada tipo de dado (institucional, gestor de reserva, gestor de unidade, gestor de espaço, comum) tenha seu próprio método na `HomeService`, retornando **apenas** o bloco de dados daquele papel, sem agregação — permitindo que S3-BE-02 monte o payload por merge.
- **Caso de uso:** UC-18 (consolidação de dashboards para multi-papel)
- **Atores envolvidos:** Institucional, Gestor de Unidade, Gestor de Espaço, Gestor de Reserva, Comum
- **Partes afetadas:** `app/Services/HomeService.php`, `app/Repositories/` (novos contracts/implementations conforme necessário)
- **Depende de:** Sprint 1 (`getUnidadesGeridasPor()`), Sprint 2 (`getEspacosGeridosPorGestorEspaco()`)
- **Riscos relacionados:** R-17 (queries caras em `getInstitucionalData()`)
- **Casos de teste obrigatórios:**
  - `HomeServiceTest::test_get_institucional_data_returns_correct_structure` — valida estrutura: contadores, totais por papel, etc.
  - `HomeServiceTest::test_get_gestor_data_returns_pending_reservations` — valida bloco de gestor de reserva
  - `HomeServiceTest::test_get_user_data_returns_user_reservations` — valida bloco comum (minhas reservas)
  - `HomeServiceTest::test_get_gestor_unidade_data_returns_campus_metrics` — valida bloco novo do gestor de unidade (totais de estrutura)
  - `HomeServiceTest::test_get_gestor_espaco_data_returns_managed_spaces` — valida bloco novo do gestor de espaço (lista de espaços)
  - `HomeServiceTest::test_gestor_unidade_data_respects_unit_scope` — dados de gestor de unidade refletem apenas unidades que ele gerencia
  - `HomeServiceTest::test_gestor_espaco_data_respects_space_scope` — dados de gestor de espaço refletem apenas espaços que ele gerencia
- **Critérios de aceite:**
  - [ ] Método `getInstitucionalData(User $user): array` existe e retorna contadores/aggregates
  - [ ] Método `getGestorData(User $user): array` existe e retorna reservas pendentes de avaliação
  - [ ] Método `getUserData(User $user): array` existe e retorna reservas do usuário
  - [ ] Método `getGestorUnidadeData(User $user): array` (NOVO) existe e retorna métricas de campus (total de espaços, módulos, setores)
  - [ ] Método `getGestorEspacoData(User $user): array` (NOVO) existe e retorna lista de espaços geridos
  - [ ] Nenhum método filtra dados por papel — apenas retorna o bloco; o filtro de permission fica em S3-BE-02
  - [ ] Testes comprovam estrutura de retorno e precisão dos dados

---

## [S3-BE-04] Revisar Métrica de "Gestores" em `getInstitucionalData()`

- **Objetivo:** separar a contagem de "gestores" em três contadores distintos — um para `gestor` (de reservas), um para `gestor_espaco` e um para `gestor_unidade` — evitando misturar papéis distintos sob o rótulo genérico "gestores".
- **Caso de uso:** UC-18 (visão institucional com distinção de papéis)
- **Atores envolvidos:** Institucional (consumidor único da métrica)
- **Partes afetadas:** `app/Services/HomeService.php` (método `getInstitucionalData()`), frontend (`WidgetVisaoMacroInstitucional.tsx` para consumo)
- **Depende de:** S3-BE-03 (método `getInstitucionalData()` já estar pronto)
- **Riscos relacionados:** R-08 (confusão de papéis), R-17 (queries de contagem)
- **Casos de teste obrigatórios:**
  - `HomeServiceTest::test_get_institucional_data_counts_three_distinct_manager_roles` — valida presença de 3 contadores separados
  - `HomeServiceTest::test_gestor_reserva_count_excludes_other_roles` — contagem de `gestor` não inclui `gestor_espaco` ou `gestor_unidade`
  - `HomeServiceTest::test_gestor_espaco_count_excludes_other_roles` — contagem de `gestor_espaco` não inclui outros
  - `HomeServiceTest::test_gestor_unidade_count_excludes_other_roles` — contagem de `gestor_unidade` não inclui outros
- **Critérios de aceite:**
  - [ ] `getInstitucionalData()` retorna array com chaves `totalGestoresReserva`, `totalGestoresEspaco`, `totalGestoresUnidade`
  - [ ] Cada contagem usa `User::permission()` apropriada, sem sobreposição
  - [ ] Query de contagem é agregada (`count()`) no banco, não em aplicação
  - [ ] Frontend atualizado para consumir 3 chaves em vez de 1 genérica
  - [ ] Testes passam e não há regressão de contagem

---

## [S3-BE-05] Mitigação de Risco R-17: Montar Payload Bloco a Bloco Sob Condição de Permission

- **Objetivo:** garantir que a refatoração de `HomeService::getDashboardData()` **nunca dispara queries de um bloco que o usuário não pode ver**, implementando as checagens de permission **antes** de chamar os métodos de bloco custosos.
- **Caso de uso:** UC-18 (otimização de performance para multi-papel)
- **Atores envolvidos:** Qualquer usuário autenticado com múltiplas permissions
- **Partes afetadas:** `app/Services/HomeService.php` (lógica de seleção), `database/` (query analysis)
- **Depende de:** S3-BE-02, S3-BE-03 (refatoração base já pronta)
- **Riscos relacionados:** R-17 (performance dashboard com multi-papel — **risco principal desta task**)
- **Casos de teste obrigatórios:**
  - `HomeServiceTest::test_get_dashboard_data_does_not_call_expensive_blocks_without_permission` — valida que `getInstitucionalData()` não é chamado se usuário não tiver `secao.dashboard-institucional`
  - `HomeServiceTest::test_query_count_for_single_role_user` — teste de query count: usuário com 1 papel dispara ~N queries
  - `HomeServiceTest::test_query_count_for_multi_role_user` — teste de query count: usuário com 3 papéis dispara ~3N queries (linear, sem N+1)
  - `HomeServiceTest::test_no_n_plus_one_in_dashboard_data` — valida ausência de N+1 problems na agregação
- **Critérios de aceite:**
  - [ ] Cada chamada a `getInstitucionalData()`, `getGestorUnidadeData()`, etc., é precedida por `if ($user->hasPermissionTo('secao.dashboard-*'))`
  - [ ] O condicional está **antes** da chamada, não dentro dela (economia de CPU)
  - [ ] Query count test passa: usuário de 1 papel não dispara queries de outro papel
  - [ ] Documentação ou comentário explica estratégia de carregamento diferido para futura otimização (Inertia partial reload ou endpoint por bloco)
  - [ ] Nenhuma mudança estrutural de banco; apenas otimização de lógica
  - [ ] Teste de performance (ou regressão de query count) documentado em criação desta task
