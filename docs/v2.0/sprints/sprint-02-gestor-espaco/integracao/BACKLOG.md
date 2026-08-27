# Sprint 2 — Gestor de Espaço — Integração

> **Trilha:** Integração (Testes cross-layer, Autorização, Regressão, Contrato Backend-Frontend)
>
> **Objetivo do Sprint:** Validar o algoritmo de precedência de Gestor de Espaço através de testes de integração rigorosos, garantir que a autorização escopada não permite escape entre campi, e confirmar que o painel de espaços órfãos retorna dados corretos por escopo (campus vs. institucional).

---

## [S2-INT-01] Teste de regressão: Override de espaço exclui espaço do padrão do módulo no dashboard

- **Objetivo:** Implementar teste de regressão nominalmente citado na auditoria (documento 03 §3.1, "sem ela, um espaço com override para o **usuário B** continuaria aparecendo erroneamente no dashboard do **usuário A**") — prova que o algoritmo de precedência filtra corretamente espaços com override alheio.
- **Caso de uso:** UC-03 (Precedência de Vínculo), UC-14 (Dashboard do Gestor de Espaço).
- **Atores envolvidos:** Gestor de Espaço (dois usuários distintos — A e B).
- **Partes afetadas:**
  - `tests/Feature/Repository/EspacoRepositoryTest.php` (novo teste neste arquivo ou criá-lo se não existir)
  - `app/Repositories/EspacoRepository.php` (ou implementação Eloquent correspondente)
  - Database (transações de teste)
- **Depende de:** S2-BE-02 (migrations de tabelas de vínculo), S2-BE-04 (Repository com método `getEspacosGeridosPorGestorEspaco()`).
- **Riscos relacionados:** R-02 (algoritmo de precedência — falha aqui significa dashboard mostra espaços indevidos), R-01 (vazamento de escopo — usuário A vê espaço atribuído a B).
- **Casos de teste obrigatórios:**
  - `EspacoRepositoryTest::test_override_exclui_espaco_do_padrao_do_modulo` — **o teste nomeado na auditoria**
- **Critérios de aceite:**
  - [ ] Teste cria:
    - 1 Módulo M
    - 2 Espaços E1, E2 dentro de M
    - 2 Usuários: gestorA, gestorB
    - Vínculo padrão: gestorA é gestor padrão de M (entrada em `modulo_gestores_espaco`)
    - Override: E2 tem override para gestorB (entrada em `espaco_gestores_espaco`)
  - [ ] Executa `$repository->getEspacosGeridosPorGestorEspaco(gestorA->id)`
  - [ ] Valida que resultado inclui E1 (padrão do módulo, sem override alheio)
  - [ ] Valida que resultado **exclui** E2 (tem override para outro usuário)
  - [ ] Executa `$repository->getEspacosGeridosPorGestorEspaco(gestorB->id)`
  - [ ] Valida que resultado inclui E2 (override direto)
  - [ ] Teste usa `DatabaseTransactions` (nunca `RefreshDatabase`)
  - [ ] Nenhuma query N+1 (use `assertQueryCount()` ou similar se framework suportar)
  - [ ] Teste retorna informação útil em caso de falha (include espaço_ids nos assertions)
  - [ ] `docker exec -e APP_ENV=testing uniespacos-workspace-1 php artisan test tests/Feature/Repository/EspacoRepositoryTest.php::test_override_exclui_espaco_do_padrao_do_modulo` verde

---

## [S2-INT-02] Testes de precedência cobrindo 3 cenários reais de negócio

- **Objetivo:** Implementar 3 testes de precedência, cada um cobrindo um cenário real de negócio mencionado na auditoria (documento 03 §2.3), validando que `getGestoresDeEspaco()` retorna o conjunto correto de usuários em cada caso.
- **Caso de uso:** UC-03 (Precedência de Vínculo), UC-14 (Determinação de Gestor).
- **Atores envolvidos:** Gestor de Espaço (múltiplos usuários em vários módulos).
- **Partes afetadas:**
  - `tests/Feature/Repository/EspacoRepositoryTest.php`
  - `app/Repositories/EspacoRepository.php` (método `getGestoresDeEspaco()`)
  - Database (transações de teste)
- **Depende de:** S2-BE-02, S2-BE-04.
- **Riscos relacionados:** R-02 (algoritmo deve ser **o oposto** de N+1 de casos — deve cobrir todos sem exceção).
- **Casos de teste obrigatórios:**
  - `EspacoRepositoryTest::test_precedence_scenario_a_no_module_default_only_override` — Cenário A
  - `EspacoRepositoryTest::test_precedence_scenario_b_cross_module_coverage` — Cenário B
  - `EspacoRepositoryTest::test_precedence_scenario_c_local_override_beats_own_module_default` — Cenário C
- **Critérios de aceite:**
  - [ ] **Cenário A: Módulo sem Equipe Padrão → Só Override do Espaço Responde**
    - Cria Módulo M1, Espaço E1 dentro de M1
    - Nenhuma entrada em `modulo_gestores_espaco` para M1
    - Entrada em `espaco_gestores_espaco`: E1 → usuário X
    - Executa `getGestoresDeEspaco(E1)`
    - Valida retorno = [X] (só o override, padrão é vazio)
    - Teste: `test_precedence_scenario_a_no_module_default_only_override`
  - [ ] **Cenário B: Equipe do Módulo A Cobrindo Espaço do Módulo B (Cross-Módulo)**
    - Cria 2 Módulos: M_Audio (audiovisual), M_Sala (sala de aula)
    - Cria Espaço E_sala dentro de M_Sala
    - Vínculo padrão: usuários X, Y são gestores de M_Audio (equipe de audiovisual)
    - Override: E_sala tem override → [X, Y] (mesmos usuários, atribuição cruzada)
    - Executa `getGestoresDeEspaco(E_sala)`
    - Valida retorno = [X, Y]
    - Teste: `test_precedence_scenario_b_cross_module_coverage`
  - [ ] **Cenário C: Espaço Específico "Escapando" do Próprio Padrão do Módulo**
    - Cria Módulo M1
    - Vínculo padrão: M1 → usuários X, Y (equipe padrão de M1)
    - Cria Espaço E1 dentro de M1
    - Override: E1 → usuário Z (diferente da equipe padrão de M1)
    - Executa `getGestoresDeEspaco(E1)`
    - Valida retorno = [Z] (override **vence** o padrão do mesmo módulo)
    - Teste: `test_precedence_scenario_c_local_override_beats_own_module_default`
  - [ ] Todos os 3 testes:
    - Criam dados apenas via `create()` (não fixtures)
    - Usam `DatabaseTransactions`
    - Incluem assertions de contexto (ex.: "esperado [Z], obteve " . print_r($result))
    - Passam no `php artisan test`
  - [ ] Nenhuma supressão de lint ou teste `.skip()` / `markTestIncomplete()`

---

## [S2-INT-03] Teste de espaço órfão: sem override e sem padrão do módulo

- **Objetivo:** Validar que um espaço sem override **e** sem padrão no módulo é corretamente identificado como órfão por `getGestoresDeEspaco()`, e que `queryOrfaosDeGestorEspaco()` (ou método equivalente de listagem) o retorna como órfão.
- **Caso de uso:** UC-16 (Painel de Espaços Órfãos).
- **Atores envolvidos:** Gestor de Unidade (identifica órfão), Institucional (vê agregado).
- **Partes afetadas:**
  - `tests/Feature/Repository/EspacoRepositoryTest.php`
  - `app/Repositories/EspacoRepository.php` (métodos `getGestoresDeEspaco()`, `queryOrfaosDeGestorEspaco()` ou similar)
  - Database (transações de teste)
- **Depende de:** S2-BE-02, S2-BE-04, S2-BE-11 (método de query de órfãos).
- **Riscos relacionados:** R-02 (definição de órfão). R-16 (escopo — só órfãos do campus relevante).
- **Casos de teste obrigatórios:**
  - `EspacoRepositoryTest::test_orphan_space_has_no_manager_from_either_source`
  - `EspacoRepositoryTest::test_orphan_query_returns_spaces_without_managers`
- **Critérios de aceite:**
  - [ ] Cria:
    - 1 Módulo M1 **sem** padrão (nenhuma linha em `modulo_gestores_espaco`)
    - 2 Espaços: E_orphan (nenhuma linha em `espaco_gestores_espaco`), E_managed (com override)
  - [ ] Teste 1: `getGestoresDeEspaco(E_orphan)` retorna coleção vazia
  - [ ] Teste 2: `getGestoresDeEspaco(E_managed)` retorna não-vazio (override)
  - [ ] Teste 3: `queryOrfaosDeGestorEspaco()` (ou `getOrfaos()` conforme impl.) retorna E_orphan mas **não** E_managed
  - [ ] Teste inclui assertion de count: `$this->assertCount(1, $result)`
  - [ ] Usa `DatabaseTransactions`
  - [ ] Passa em `php artisan test`

---

## [S2-INT-04] Teste de escopo: dashboard do Gestor de Espaço não mostra espaços com override para outro

- **Objetivo:** Validar, do ponto de vista do endpoint/página (não só repositório), que o dashboard de um Gestor de Espaço padrão de um módulo **não** retorna espaços que têm override para outro usuário. Testa a integração completa: Permission → Policy → Service → Repository → Response.
- **Caso de uso:** UC-14 (Dashboard do Gestor de Espaço).
- **Atores envolvidos:** Gestor de Espaço (dois distintos — A e B).
- **Partes afetadas:**
  - `tests/Feature/Controller/GestorEspacoDashboardControllerTest.php` (novo, ou adicionar ao controller test existente)
  - `app/Http/Controllers/GestorEspacoDashboardController.php` (ou método equivalente em dashboard)
  - `app/Services/GestorEspacoService.php` (ou nome correspondente)
  - `app/Repositories/EspacoRepository.php`
- **Depende de:** S2-BE-10 (GestorEspacoDashboardController e Service), S2-BE-04 (Repository), S2-FE-08 (frontend aguarda este teste passar).
- **Riscos relacionados:** R-02 (precedência — reflete-se no endpoint), R-01 (vazamento de escopo entre usuários).
- **Casos de teste obrigatórios:**
  - `GestorEspacoDashboardControllerTest::test_gestor_a_sees_only_his_spaces_not_override_for_gestor_b`
- **Critérios de aceite:**
  - [ ] Teste de integração (não mock):
    - Autentica como `gestorA` (role `gestor_espaco`)
    - Cria Módulo M, Espaços E1 e E2
    - Vínculo: gestorA é padrão de M
    - Override: E2 tem override para gestorB (usuário diferente)
    - Faz GET `/dashboard` (ou `/gestor-espaco/dashboard` conforme rota)
    - Valida response inclui E1 em `espacos` (ou campo correspondente)
    - Valida response **não inclui** E2
  - [ ] Teste também valida:
    - Status 200 OK
    - JSON bem-formado com campos esperados
    - Contagem correta de espaços (`count` field ou size de array)
  - [ ] Autentica como `gestorB` em teste paralelo:
    - Mesmo dashboard, mesmos espaços
    - gestorB vê **só** E2 (seu override)
    - Não vê E1 (não é seu, é padrão de gestorA em M)
  - [ ] Usa `DatabaseTransactions`
  - [ ] Passa em `php artisan test`

---

## [S2-INT-05] Teste de autorização escopada: Gestor de Unidade não consegue atribuir fora do campus

- **Objective:** Implementar teste que prova que um Gestor de Unidade do Campus A **não consegue** atribuir Gestor de Espaço a um Módulo ou Espaço do Campus B (mesma classe de risco R-01/R-18 já mitigada para Gestor de Reserva — replicar para novo papel).
- **Caso de uso:** UC-03 (Autorização de Atribuição), UC-04 (Escopo do Gestor de Unidade).
- **Atores envolvidos:** Gestor de Unidade (dois, Campus A e B), Módulo/Espaço de ambos os campi.
- **Partes afetadas:**
  - `tests/Feature/Policy/ModuloPolicyTest.php` e/ou `EspacoPolicyTest.php` (adicionar)
  - `app/Policies/ModuloPolicy.php` (método `gerenciarGestoresEspaco()`)
  - `app/Policies/EspacoPolicy.php` (método `gerenciarGestorEspacoDireto()`)
- **Depende de:** S2-BE-05 (Policies com escopo), S2-BE-06 (Controller validando Policy).
- **Riscos relacionados:** R-01 (vazamento de escopo entre campi), R-18 (sequenciamento de permissions e policies).
- **Casos de teste obrigatórios:**
  - `ModuloPolicyTest::test_gestor_unidade_campus_a_cannot_manage_module_in_campus_b`
  - `EspacoPolicyTest::test_gestor_unidade_campus_a_cannot_manage_space_in_campus_b`
- **Critérios de aceite:**
  - [ ] Cria:
    - 2 Unidades (Campi): campus_a, campus_b
    - 2 Usuários: gu_a (gestor de campus_a), gu_b (gestor de campus_b)
    - Vínculo: gu_a ← unidade_gestores → campus_a
    - Vínculo: gu_b ← unidade_gestores → campus_b
    - 1 Módulo em campus_a, 1 Módulo em campus_b
    - 1 Espaço em campus_a, 1 Espaço em campus_b
  - [ ] Teste de Policy (não HTTP, direto):
    - `$policy->gerenciarGestoresEspaco(gu_a, modulo_b)` retorna **false** (gu_a não gerencia campus_b)
    - `$policy->gerenciarGestoresEspaco(gu_a, modulo_a)` retorna **true** (gu_a gerencia campus_a)
    - Idem para `gerenciarGestorEspacoDireto()`
  - [ ] Teste de Controller (integração HTTP, opcional mas recomendado):
    - Autentica como gu_a
    - PATCH `/administrativo/modulos/{modulo_b}/gestores-espaco` com payload
    - Valida status 403 Forbidden (ou 401 Unauthorized conforme implementação)
    - PATCH `/administrativo/modulos/{modulo_a}/gestores-espaco`
    - Valida status 200/201/204 OK (sucesso)
  - [ ] Usa `DatabaseTransactions`
  - [ ] Passes in `php artisan test`

---

## [S2-INT-06] Teste de painel de órfãos: Gestor de Unidade vê só seus órfãos, Institucional vê agregado de todos

- **Objetivo:** Validar que o painel de espaços órfãos retorna dados corretos por escopo: Gestor de Unidade recebe lista completa de órfãos **do seu campus** (escopado), Institucional recebe **contadores agregados por campus** (dois componentes/endpoints completamente distintos, não é filtro do mesmo com parâmetro).
- **Caso de uso:** UC-16 (Painel de Espaços Órfãos).
- **Atores envolvidos:** Gestor de Unidade (campus-específico), Institucional (visão global).
- **Partes afetadas:**
  - `tests/Feature/Controller/EspacoOrfaoControllerTest.php` (novo)
  - `tests/Feature/Controller/HomeControllerTest.php` (ou dashboard controller, adicionar método de órfãos)
  - `app/Http/Controllers/EspacoOrfaoController.php` (novo)
  - `app/Http/Controllers/HomeController.php` (ou onde o endpoint de contadores fica)
  - `app/Services/EspacoOrfaoService.php` (ou repositório com métodos de query)
- **Depende de:** S2-BE-11 (EspacoOrfaoController e endpoint de contadores), S2-BE-04 (Repository), S2-FE-08 (frontend aguarda).
- **Riscos relacionados:** R-02 (precisão da query de órfãos), R-16 (escopo — GU só vê seu campus, Institucional vê todos).
- **Casos de teste obrigatórios:**
  - `EspacoOrfaoControllerTest::test_gestor_unidade_gets_detailed_list_of_orphans_in_campus`
  - `EspacoOrfaoControllerTest::test_gestor_unidade_cannot_see_orphans_of_other_campus`
  - `HomeControllerTest::test_institucional_gets_counter_aggregation_by_campus` (ou nome correspondente)
- **Critérios de aceite:**
  - [ ] **Teste 1: Gestor de Unidade — Lista Detalhada**
    - Cria:
      - 2 Campi: A, B
      - 3 Espaços órfãos em A, 2 em B
      - 1 Espaço **gerido** em A (não órfão)
      - gu_a = Gestor de Unidade do Campus A
    - Autentica como gu_a
    - GET `/espacos-orfaos` (ou rota definida no sprint)
    - Valida response: lista com **exatamente 3 espaços** (órfãos de A)
    - Valida que **não inclui** os 2 órfãos de B
    - Valida que **não inclui** o espaço gerido de A (filtro é por ausência de gestor)
    - Valida JSON inclui campos: `modulo`, `andar`, `espaco`, `unidade`
  - [ ] **Teste 2: Gestor de Unidade Não Vê Outro Campus**
    - Autentica como gu_b (Gestor de Unidade do Campus B)
    - GET `/espacos-orfaos`
    - Valida response: lista com **exatamente 2 espaços** (órfãos de B)
    - Valida status 200 OK (permissão atendida), não 403
  - [ ] **Teste 3: Institucional — Contadores Agregados**
    - Autentica como usuário `institucional`
    - GET `/dashboard` (ou endpoint específico de contadores, ex.: `/dashboard/orfaos-aggregation`)
    - Valida response JSON com estrutura tipo: `{ "campus_a": 3, "campus_b": 2, "campus_c": 0 }`
    - **Não retorna lista item a item** — apenas contadores (prova de que são 2 endpoints/componentes distintos)
  - [ ] Todos os testes:
    - Usam `DatabaseTransactions`
    - Passam em `php artisan test`
    - Sem `.skip()` ou mocks que engulam erro

