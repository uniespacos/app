# Sprint 3 Frontend — Backlog

---

## [S3-FE-01] `Dashboard/DashboardPage.tsx` — Página Única Composta com Blocos Condicionais

- **Objetivo:** criar página única de dashboard que substitui 3 páginas irmãs (`DashboardInstitucionalPage`, `DashboardGestorPage`, `DashboardUsuarioPage`), renderizando cada bloco condicionalmente conforme a permission do usuário autenticado.
- **Caso de uso:** UC-18 (consolidação de dashboards para multi-papel)
- **Atores envolvidos:** Institucional, Gestor de Unidade, Gestor de Espaço, Gestor de Reserva, Comum
- **Partes afetadas:** `resources/js/presentation/pages/Dashboard/DashboardPage.tsx` (evolução), `resources/js/contracts/` (contrato de dados)
- **Depende de:** S3-BE-01, S3-BE-02 (payload e estrutura vindo do backend), S3-FE-02 a S3-FE-06 (organisms já prontos)
- **Riscos relacionados:** R-04 (PBAC — usar `<Can>`, não `hasRole()`), R-17 (performance)
- **Casos de teste obrigatórios:**
  - `DashboardPage.test.tsx::test_renders_without_crashing_for_any_role` — renderiza para todos os 5 papéis
  - `DashboardPage.test.tsx::test_renders_correct_widgets_for_institutional_user` — usuario `institucional` vê `WidgetVisaoMacroInstitucional` + `WidgetMinhasReservas`
  - `DashboardPage.test.tsx::test_renders_correct_widgets_for_gestor_reserva` — usuario `gestor` vê `WidgetReservasParaAvaliar` + `WidgetMinhasReservas`
  - `DashboardPage.test.tsx::test_renders_correct_widgets_for_gestor_unidade` — usuario `gestor_unidade` vê `WidgetPainelGestorUnidade` + `WidgetMinhasReservas`
  - `DashboardPage.test.tsx::test_renders_correct_widgets_for_gestor_espaco` — usuario `gestor_espaco` vê `WidgetEspacosSobResponsabilidade` + `WidgetMinhasReservas`
  - `DashboardPage.test.tsx::test_renders_multiple_widgets_for_multi_role_user` — usuario com 2+ papéis vê **todos** os blocos aplicáveis simultaneamente
  - `DashboardPage.test.tsx::test_does_not_render_widgets_user_cannot_see` — usuario sem permission não vê aquele widget (nem skeleton, nem vazio)
  - `DashboardPage.test.tsx::test_always_renders_minhas_reservas_widget` — qualquer usuario autenticado vê `WidgetMinhasReservas`
- **Critérios de aceite:**
  - [ ] Página renderiza sem erros com o novo payload de `HomeController`
  - [ ] Usa `<Can permission="secao.dashboard-institucional">...</Can>` para cada bloco condicional, **nunca** `if (hasRole())`
  - [ ] Estrutura visual alinhada com a página anterior (não é mudança de UX, apenas de arquitetura)
  - [ ] `WidgetMinhasReservas` sempre renderizada (sem `<Can>` wrapping)
  - [ ] Props TypeScript tipadas conforme contrato de dados do backend
  - [ ] `npx tsc --noEmit` passa sem erros
  - [ ] `npx jest` passa em todos os testes

---

## [S3-FE-02] `organisms/WidgetVisaoMacroInstitucional.tsx` — Bloco Institucional Extraído

- **Objetivo:** extrair o conteúdo visual de `DashboardInstitucionalPage.tsx` em um organism reutilizável, recebendo dados via props do novo payload de `HomeService`.
- **Caso de uso:** UC-18 (consolidação de dashboards)
- **Atores envolvidos:** Institucional
- **Partes afetadas:** `resources/js/presentation/organisms/WidgetVisaoMacroInstitucional.tsx` (novo)
- **Depende de:** S3-BE-03 (dados estruturados de `getInstitucionalData()`), S3-BE-04 (3 contadores de gestores separados)
- **Riscos relacionados:** R-08 (nomenclatura clara de papéis — "Gestor de Reserva", não "Gestor")
- **Casos de teste obrigatórios:**
  - `WidgetVisaoMacroInstitucional.test.tsx::test_renders_institutional_view_correctly` — renderiza sem erros
  - `WidgetVisaoMacroInstitucional.test.tsx::test_displays_correct_metrics` — contadores de espaços, módulos, setores, usuários aparecem
  - `WidgetVisaoMacroInstitucional.test.tsx::test_displays_three_distinct_manager_counts` — mostra separadamente contagem de Gestor de Reserva, Gestor de Espaço, Gestor de Unidade
  - `WidgetVisaoMacroInstitucional.test.tsx::test_handles_missing_data_gracefully` — se algum dado faltar, renderiza placeholder
- **Critérios de aceite:**
  - [ ] Props interface documentada (contadores, totais, etc.)
  - [ ] Visual preserva estrutura de `DashboardInstitucionalPage` (não é redesign)
  - [ ] Contadores atualizados para consumir 3 chaves separadas (não mais 1 genérica de "gestores")
  - [ ] Labels usam nomenclatura clara: "Gestores de Reserva", "Gestores de Espaço", "Gestores de Unidade" (nunca "Gestor" ambíguo)
  - [ ] `npx tsc --noEmit` passa
  - [ ] Testes passam

---

## [S3-FE-03] `organisms/WidgetReservasParaAvaliar.tsx` — Bloco de Gestor de Reserva Extraído

- **Objetivo:** extrair o conteúdo visual de `DashboardGestorPage.tsx` em um organism reutilizável (lista de reservas pendentes de avaliação).
- **Caso de uso:** UC-18 (consolidação de dashboards)
- **Atores envolvidos:** Gestor de Reserva
- **Partes afetadas:** `resources/js/presentation/organisms/WidgetReservasParaAvaliar.tsx` (novo)
- **Depende de:** S3-BE-03 (dados estruturados de `getGestorData()`)
- **Riscos relacionados:** Nenhum específico
- **Casos de teste obrigatórios:**
  - `WidgetReservasParaAvaliar.test.tsx::test_renders_pending_reservations_correctly` — renderiza sem erros
  - `WidgetReservasParaAvaliar.test.tsx::test_displays_empty_state_when_no_reservations` — mostra mensagem quando lista vazia
  - `WidgetReservasParaAvaliar.test.tsx::test_shows_all_pending_reservations_from_props` — exibe todas as reservas passadas
- **Critérios de aceite:**
  - [ ] Props interface documentada (array de reservas, etc.)
  - [ ] Visual preserva estrutura de `DashboardGestorPage` (não é redesign)
  - [ ] Links/CTAs funcionam (botão de avaliar redireciona para tela de avaliação)
  - [ ] `npx tsc --noEmit` passa
  - [ ] Testes passam

---

## [S3-FE-04] `organisms/WidgetMinhasReservas.tsx` — Bloco de Minhas Reservas (Sempre Visível)

- **Objetivo:** extrair/criar organism que lista as reservas do usuário autenticado, visível **para qualquer usuário** — não depende de permission especial, apenas de autenticação.
- **Caso de uso:** UC-18 (consolidação de dashboards)
- **Atores envolvidos:** Comum (primário), todos os papéis (secundário — podem querer ver também suas reservas pessoais enquanto gerenciam)
- **Partes afetadas:** `resources/js/presentation/organisms/WidgetMinhasReservas.tsx` (novo ou evolução se já existe)
- **Depende de:** S3-BE-03 (dados estruturados de `getUserData()`)
- **Riscos relacionados:** Nenhum específico
- **Casos de teste obrigatórios:**
  - `WidgetMinhasReservas.test.tsx::test_renders_for_any_authenticated_user` — renderiza para todos os 5 papéis
  - `WidgetMinhasReservas.test.tsx::test_displays_user_reservations_only` — mostra apenas as reservas do usuário logado, não de outros
  - `WidgetMinhasReservas.test.tsx::test_displays_empty_state_when_no_reservations` — mostra mensagem quando lista vazia
- **Critérios de aceite:**
  - [ ] Props interface documentada (array de reservas do usuário, etc.)
  - [ ] Renderizado **sem** `<Can permission="...">` wrapper (sempre visível)
  - [ ] Visual consistente com o resto do dashboard
  - [ ] `npx tsc --noEmit` passa
  - [ ] Testes passam

---

## [S3-FE-05] `organisms/WidgetPainelGestorUnidade.tsx` — Bloco Gestor de Unidade (NOVO, Básico)

- **Objetivo:** criar organism que exibe métricas básicas do campus gerenciado pelo Gestor de Unidade — total de espaços, módulos, setores, e resumo de reservas do mês.
- **Caso de uso:** UC-18 (consolidação de dashboards), parte do UC-15 (gestão de unidade)
- **Atores envolvidos:** Gestor de Unidade
- **Partes afetadas:** `resources/js/presentation/organisms/WidgetPainelGestorUnidade.tsx` (novo)
- **Depende de:** S3-BE-03 (dados estruturados de `getGestorUnidadeData()`)
- **Riscos relacionados:** R-17 (não sobrecarregar com informações — manter básico)
- **Casos de teste obrigatórios:**
  - `WidgetPainelGestorUnidade.test.tsx::test_renders_campus_metrics_correctly` — renderiza sem erros
  - `WidgetPainelGestorUnidade.test.tsx::test_displays_correct_totals` — mostra total de espaços, módulos, setores
  - `WidgetPainelGestorUnidade.test.tsx::test_displays_month_reservation_summary` — mostra reservas do mês
- **Critérios de aceite:**
  - [ ] Props interface documentada (totals de estrutura, resumo de reservas, etc.)
  - [ ] Renderiza bloco **básico** — sem "setores sem expediente" (isso é Sprint 4)
  - [ ] Deixa claro escopo: dados são apenas da unidade que o usuário gerencia (não de outras unidades)
  - [ ] Visual simples e limpo (cards com contadores, nada de gráficos complexos nesta sprint)
  - [ ] `npx tsc --noEmit` passa
  - [ ] Testes passam

---

## [S3-FE-06] `organisms/WidgetEspacosSobResponsabilidade.tsx` — Bloco Gestor de Espaço (NOVO)

- **Objetivo:** criar organism que lista os espaços sob responsabilidade do Gestor de Espaço, indicando a origem do vínculo (padrão do módulo vs. override direto) via reaproveitamento de `atoms/OrigemVinculoBadge.tsx` (do Sprint 2).
- **Caso de uso:** UC-18 (consolidação de dashboards), parte do UC-14 (gestão de espaços)
- **Atores envolvidos:** Gestor de Espaço
- **Partes afetadas:** `resources/js/presentation/organisms/WidgetEspacosSobResponsabilidade.tsx` (novo), reutiliza `atoms/OrigemVinculoBadge.tsx` (Sprint 2)
- **Depende de:** S3-BE-03 (dados estruturados de `getGestorEspacoData()`), Sprint 2 (`OrigemVinculoBadge` e modelo de vinculação)
- **Riscos relacionados:** R-02 (validar que override está excluindo espaço do padrão — já testado em Sprint 2, mas revalidar aqui)
- **Casos de teste obrigatórios:**
  - `WidgetEspacosSobResponsabilidade.test.tsx::test_renders_managed_spaces_correctly` — renderiza sem erros
  - `WidgetEspacosSobResponsabilidade.test.tsx::test_displays_all_managed_spaces` — lista todos os espaços do gestor
  - `WidgetEspacosSobResponsabilidade.test.tsx::test_shows_origin_badge_for_each_space` — cada espaço tem badge indicando origem
  - `WidgetEspacosSobResponsabilidade.test.tsx::test_displays_empty_state_when_no_spaces` — mostra mensagem quando lista vazia
- **Critérios de aceite:**
  - [ ] Props interface documentada (array de espaços com origem, etc.)
  - [ ] Cada espaço renderizado com `OrigemVinculoBadge` indicando "Padrão do Módulo" ou "Atribuição Direta"
  - [ ] Visual reaproveitando `EspacoCard` existente (não duplicar componente)
  - [ ] Claro que é escopo apenas do Gestor de Espaço (não multi-campus)
  - [ ] `npx tsc --noEmit` passa
  - [ ] Testes passam

---

## [S3-FE-07] Remoção de Páginas Irmãs e Atualização de Testes

- **Objetivo:** remover as 3 páginas antigas (`DashboardInstitucionalPage.tsx`, `DashboardGestorPage.tsx`, `DashboardUsuarioPage.tsx`) e todos os testes que as referenciam diretamente, atualizando referências de rota/import onde necessário.
- **Caso de uso:** UC-18 (consolidação de dashboards)
- **Atores envolvidos:** N/A (limpeza de código)
- **Partes afetadas:**
  - `resources/js/presentation/pages/Dashboard/DashboardInstitucionalPage.tsx` (remover)
  - `resources/js/presentation/pages/Dashboard/DashboardGestorPage.tsx` (remover)
  - `resources/js/presentation/pages/Dashboard/DashboardUsuarioPage.tsx` (remover)
  - Testes que referenciam as páginas antigas (remover ou reescrever)
  - Rota `/dashboard` (preservada, apenas consumindo `DashboardPage` novo)
- **Depende de:** S3-FE-01 a S3-FE-06 (todas as novas páginas pronta funcionando)
- **Riscos relacionados:** R-03 (regressão de labels — validar que nenhuma string hardcoded quebra)
- **Casos de teste obrigatórios:**
  - `git grep "DashboardInstitucionalPage"` retorna 0 (ou apenas comentários históricos)
  - `git grep "DashboardGestorPage"` retorna 0
  - `git grep "DashboardUsuarioPage"` retorna 0
  - Teste de rota: `GET /dashboard` ainda retorna status 200 e renderiza `Dashboard/DashboardPage`
- **Critérios de aceite:**
  - [ ] Arquivos `.tsx` antigos removidos do repositório
  - [ ] Testes antigos removidos ou reescritos para testar o novo `DashboardPage`
  - [ ] Nenhum import/require de páginas antigas permanece em arquivos `.ts/.tsx` (validar com grep)
  - [ ] Rota de dashboard funciona e renderiza nova página
  - [ ] `npx jest` passou — todos os testes (novos) passam
  - [ ] `npx tsc --noEmit` passou — sem erros de tipo
  - [ ] `npx eslint resources/js --suppressions-location <(echo '{}')` — sem novas supressões
