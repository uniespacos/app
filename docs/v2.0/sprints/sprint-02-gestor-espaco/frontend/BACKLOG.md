# Sprint 2 — Gestor de Espaço — Frontend

> **Trilha:** Frontend (Contratos, Componentes, Páginas)
>
> **Objetivo do Sprint:** Implementar contratos SSOT para o novo role `gestor_espaco`, componentes reutilizáveis de badge e seletor multi-usuário, integração da atribuição de Gestor de Espaço em administrativo, e painéis de espaços órfãos (detalhado para Gestor de Unidade, agregado para Institucional).

---

## [S2-FE-01] Adicionar `GESTOR_ESPACO` ao contrato de roles

- **Objetivo:** Expandir o contrato SSOT de roles para incluir o novo papel `gestor_espaco`, mantendo sincronização com backend e garantindo cobertura em switches exhaustivos.
- **Caso de uso:** UC-03 (Gestão de Espaço — definição de papéis), UC-16 (Painel de Espaços Órfãos).
- **Atores envolvidos:** Institucional, Gestor de Unidade, Gestor de Espaço.
- **Partes afetadas:**
  - `resources/js/contracts/roles.contract.ts` (modificar)
- **Depende de:** Nenhuma (independente, executar em paralelo com S2-BE-01 que cria o role no banco).
- **Riscos relacionados:** Nenhum risco isolado; integra-se com R-02 (precedência de algoritmo) via S2-INT-01.
- **Casos de teste obrigatórios:**
  - `contracts.test.ts::test_roles_contract_includes_all_system_roles` — valida que `GESTOR_ESPACO` está presente e é string `'gestor_espaco'`.
  - `contracts.test.ts::test_all_system_roles_in_ROLES_VALIDAS` — valida que `GESTOR_ESPACO` consta em `ROLES_VALIDAS[]`.
- **Critérios de aceite:**
  - [ ] Contrato exposto em `export const SystemRole = { ..., GESTOR_ESPACO: 'gestor_espaco', ... }`
  - [ ] Tipo `RoleType` automaticamente inclui `'gestor_espaco'` via `as const`
  - [ ] Array `ROLES_VALIDAS` inclui `SystemRole.GESTOR_ESPACO`
  - [ ] Nenhuma novo `enum SystemRole` criado (reutilizar objeto literal existente)
  - [ ] Testes de contrato implementados e passando (100% cobertura de roles)
  - [ ] `npx tsc --noEmit` retorna 0

---

## [S2-FE-02] Adicionar constantes de permissions do novo role `ROLE_GESTOR_ESPACO` e permissions novas

- **Objetivo:** Centralizar constantes de permissão para o `gestor_espaco`, expandindo o padrão já estabelecido com `ROLE_INSTITUCIONAL`, `ROLE_GESTOR` e `ROLE_COMUM`.
- **Caso de uso:** UC-03, UC-16, UC-15 (aprovação de urgência).
- **Atores envolvidos:** Institucional, Gestor de Espaço.
- **Partes afetadas:**
  - `resources/js/constants/permissions.ts` (modificar/expandir)
- **Depende de:** S2-FE-01 (contrato de roles).
- **Riscos relacionados:** R-01 (sequenciamento de permissions — frontend e backend devem estar sincronizados).
- **Casos de teste obrigatórios:**
  - `permissions.test.ts::test_role_constants_match_contract` — valida que `ROLE_GESTOR_ESPACO` é exportado e equivale a `SystemRole.GESTOR_ESPACO`.
  - `permissions.test.ts::test_permission_constants_exist` — valida presença de `PERMISSIONS.SPACE_MANAGE_DIRECT_MANAGERS`, `PERMISSIONS.DASHBOARD_GESTOR_ESPACO`, etc.
- **Critérios de aceite:**
  - [ ] Exportar `ROLE_GESTOR_ESPACO = 'gestor_espaco'` como constante derivada de `SystemRole`
  - [ ] Adicionar ao objeto `PERMISSIONS` as constantes (sugiro namespace para clareza):
    - `SPACE_MANAGE_DIRECT_MANAGERS = 'espacos.gerenciar-gestor-espaco-direto'`
    - `MODULE_MANAGE_SPACE_MANAGERS = 'modulos.gerenciar-gestores-espaco'`
    - `DASHBOARD_GESTOR_ESPACO = 'secao.dashboard-gestor-espaco'`
    - `SPACE_VIEW_INVENTORY = 'espacos.visualizar-inventario-proprio'`
    - `SPACE_MANAGE_ORPHANS = 'secao.gestao-orfaos-espaco'`
    - `RESERVA_AVALIAR_URGENCIA = 'reservas.avaliar-urgencia'`
  - [ ] Manter nomes em kebab-case (padrão backend) na string, mas exportar como camelCase no TS
  - [ ] Nenhum comentário duplicando o que já está em `permission-labels.ts`
  - [ ] `npx tsc --noEmit` retorna 0

---

## [S2-FE-03] Adicionar rótulos das permissions novas em `permission-labels.ts`

- **Objetivo:** Fornecer rótulos legíveis em português para as 6 permissions novas do `gestor_espaco`, permitindo exibição nas telas administrativas de atribuição de papéis.
- **Caso de uso:** UC-03 (definição de papéis, telas de admin).
- **Atores envolvidos:** Institucional, Gestor de Unidade.
- **Partes afetadas:**
  - `resources/js/constants/permission-labels.ts` (modificar)
  - `resources/js/i18n/*.json` (sem mudança direta; rótulos em português puro aqui)
- **Depende de:** S2-FE-02 (constantes de permissions).
- **Riscos relacionados:** Nenhum.
- **Casos de teste obrigatórios:**
  - `permission-labels.test.ts::test_labels_for_new_permissions` — valida que todas as 6 permissions novas têm rótulo não-nulo.
- **Critérios de aceite:**
  - [ ] Adicionar em `permissionLabels = { ... }`:
    - `'espacos.gerenciar-gestor-espaco-direto': 'Gerenciar Gestor de Espaço (Override Direto)'`
    - `'modulos.gerenciar-gestores-espaco': 'Gerenciar Gestores de Espaço Padrão (Módulo)'`
    - `'secao.dashboard-gestor-espaco': 'Acessar Dashboard do Gestor de Espaço'`
    - `'espacos.visualizar-inventario-proprio': 'Visualizar Inventário (Próprios Espaços)'`
    - `'secao.gestao-orfaos-espaco': 'Gerenciar Espaços Órfãos'`
    - `'reservas.avaliar-urgencia': 'Avaliar Reservas por Urgência'`
  - [ ] Rótulos devem ser concisos (1–8 palavras)
  - [ ] Nenhuma duplicata com labels existentes
  - [ ] `npx tsc --noEmit` retorna 0

---

## [S2-FE-04] Cobertura de contrato para novos roles e tipos; enforcement de `assertNever` em switches

- **Objetivo:** Validar que o contrato de roles cobre todos os 5 atores e que qualquer `switch` sobre `SystemRole` rejeita valores inesperados via `assertNever`, mitigando risco de futuros novos roles quebrados silenciosamente.
- **Caso de uso:** UC-03 (introduz 2 novos roles).
- **Atores envolvidos:** Todos (developers mantendo o código).
- **Partes afetadas:**
  - `resources/js/contracts/contracts.test.ts` (modificar/expandir)
  - Qualquer arquivo `*.tsx/*.ts` com `switch (role)` (audit, não fix nesta task)
- **Depende de:** S2-FE-01, S2-FE-02.
- **Riscos relacionados:** R-02 (precedência — um novo role esquecido pode ser tratado indevidamente em um switch).
- **Casos de teste obrigatórios:**
  - `contracts.test.ts::test_ROLES_VALIDAS_covers_all_SystemRole_keys` — mapeia todas as chaves de `SystemRole` e valida que cada uma consta em `ROLES_VALIDAS`.
  - `contracts.test.ts::test_switch_over_role_requires_assertNever_default` — exemplo de como um switch sobre `SystemRole` deve ter `default: assertNever(...)` e falha em compile-time se valor novo for esquecido.
- **Critérios de aceite:**
  - [ ] Teste `contracts.test.ts` cobre: `INSTITUCIONAL`, `GESTOR`, `GESTOR_ESPACO`, `GESTOR_UNIDADE`, `COMUM`
  - [ ] Documentar por exemplo (teste ou comentário) o padrão esperado: `switch (role) { case INSTITUCIONAL: ... default: return assertNever(role); }`
  - [ ] Auditar codebase por switches existentes sobre role que ainda usem `if/elseif` ou não tenham `default` — marcar achados em `observacoes/PROBLEMAS-IDENTIFICADOS.md` (não corrigir nesta task)
  - [ ] Todos os testes de contrato passando (jest 100%)
  - [ ] `npx eslint resources/js --suppressions-location <(echo '{}')` sem novas supressões

---

## [S2-FE-05] Criar organism `GestoresEspacoInfraestrutura.tsx` — seletor multi-usuário para Gestor de Espaço

- **Objetivo:** Implementar componente reutilizável de seleção de múltiplos usuários para vincular Gestores de Espaço (padrão do módulo ou override do espaço), irmão de `GestoresEspaco.tsx` (que hoje só faz Gestor de Reserva).
- **Caso de uso:** UC-03 (definição e atribuição de Gestor de Espaço), UC-04 (Gestor de Unidade gerindo seu campus).
- **Atores envolvidos:** Institucional, Gestor de Unidade.
- **Partes afetadas:**
  - `resources/js/presentation/organisms/GestoresEspacoInfraestrutura.tsx` (novo)
  - `resources/js/presentation/organisms/GestoresEspaco.tsx` (validar nomenclatura interna — renomear "Gestor" → "Gestor de Reserva" nos rótulos para desambiguação)
- **Depende de:** S2-BE-09 (endpoints `ModuloController::alterarGestoresEspaco()` e `EspacoController::alterarGestorEspacoDireto()` devem estar prontos).
- **Riscos relacionados:** Nenhum isolado; integra-se com autorização backend em S2-INT-05.
- **Casos de teste obrigatórios:**
  - `GestoresEspacoInfraestrutura.test.tsx::test_renders_multi_select_input` — valida que componente renderiza um `UserMultiSelect` (ou padrão de multi-select local) com rótulo "Gestores de Espaço".
  - `GestoresEspacoInfraestrutura.test.tsx::test_submit_posts_to_correct_endpoint` — valida que ao submeter, a requisição POST vai para o endpoint correto (passado via prop).
  - `GestoresEspacoInfraestrutura.test.tsx::test_displays_current_managers_on_load` — valida que managers já atribuídos aparecem selecionados (via prop de inicial value).
  - `GestoresEspacoInfraestrutura.test.tsx::test_displays_loading_and_error_states` — valida feedback de carregamento e erro.
- **Critérios de aceite:**
  - [ ] Componente recebe props:
    - `endpoint: string` — URL para POST (ex.: `/administrativo/modulos/42/gestores-espaco`)
    - `currentManagers: User[]` — usuários já atribuídos
    - `title?: string` — rótulo customizável
    - `description?: string` — texto descritivo (ex.: "Equipe padrão do Módulo X")
  - [ ] Renderiza título, descrição, select multi-usuário com busca (reutilizar componente de busca existente se houver)
  - [ ] Botão "Salvar" dispara POST com `{ user_ids: [...] }` e feedback de sucesso/erro
  - [ ] Em caso de erro, exibe mensagem e permite retry
  - [ ] Estilos coerentes com `GestoresEspaco.tsx` (Tailwind, tema Catppuccin)
  - [ ] `npx tsc --noEmit` retorna 0
  - [ ] `npx jest --testPathPattern=GestoresEspacoInfraestrutura` 100% verde

---

## [S2-FE-06] Criar badges `EspacoGestorEspacoBadge.tsx` e `OrigemVinculoBadge.tsx`

- **Objetivo:** Implementar duas badges reutilizáveis: uma exibindo "Gerenciado por: {nome}" e outra indicando a origem do vínculo ("Padrão do Módulo" vs. "Atribuição Direta"), permitindo reutilização em múltiplas telas (cards de espaço, listagens, etc.).
- **Caso de uso:** UC-03 (exibição de vínculo em administrativo), UC-16 (listagem de órfãos).
- **Atores envolvidos:** Institucional, Gestor de Unidade, Gestor de Espaço.
- **Partes afetadas:**
  - `resources/js/presentation/atoms/EspacoGestorEspacoBadge.tsx` (novo)
  - `resources/js/presentation/atoms/OrigemVinculoBadge.tsx` (novo)
- **Depende de:** S2-FE-01, S2-FE-02 (constantes).
- **Riscos relacionados:** R-02 (algoritmo de precedência — badges precisam comunicar corretamente qual vínculo está em vigor).
- **Casos de teste obrigatórios:**
  - `EspacoGestorEspacoBadge.test.tsx::test_renders_manager_name_and_status` — valida que exibe "Gerenciado por: {nome}" com ícone/cor adequada.
  - `EspacoGestorEspacoBadge.test.tsx::test_renders_loading_and_empty_state` — valida comportamento quando não há gestor.
  - `OrigemVinculoBadge.test.tsx::test_renders_module_default_badge` — valida texto "Padrão do Módulo" com estilo/ícone diferenciado.
  - `OrigemVinculoBadge.test.tsx::test_renders_direct_assignment_badge` — valida texto "Atribuição Direta".
- **Critérios de aceite:**
  - [ ] **EspacoGestorEspacoBadge:**
    - Props: `espaco: Espaco`, `gestorNome?: string`, `onClick?: () => void` (opcional)
    - Renderiza "Gerenciado por: {nome}" com cor/ícone de destaque (ex.: fundo suave, ícone de pessoa)
    - Se `gestorNome` nulo (espaço órfão), exibe "Sem Gestor de Espaço" com ícone de aviso
    - Clicável (navegação ou callback) se `onClick` fornecido
  - [ ] **OrigemVinculoBadge:**
    - Props: `origem: 'padrao_modulo' | 'atribuicao_direta'`, `size?: 'sm' | 'md' | 'lg'`
    - "Padrão do Módulo": ícone de engrenagem/módulo, cor neutra
    - "Atribuição Direta": ícone de pessoa ou seta, cor de destaque
    - Componente pequeno (atom), sem quebra de linha
  - [ ] Ambas usam variantes Tailwind (`bg-primary-light`, `text-primary`, etc.) compatíveis com Catppuccin
  - [ ] Testes de renderização com variantes de props
  - [ ] `npx jest --testPathPattern='Badge' 100% verde

---

## [S2-FE-07] Integrar atribuição de Gestor de Espaço em `Administrativo/Modulos/*` e `Administrativo/Espacos/*`

- **Objetivo:** Adicionar controles de atribuição de Gestor de Espaço (padrão do módulo em `/administrativo/modulos/{id}`, override do espaço em `/administrativo/espacos/{id}`), reutilizando o organism `GestoresEspacoInfraestrutura.tsx` e consumindo endpoints S2-BE-09.
- **Caso de uso:** UC-03 (definição de Gestor de Espaço), UC-04 (Gestor de Unidade gerenciando seu campus).
- **Atores envolvidos:** Institucional, Gestor de Unidade.
- **Partes afetadas:**
  - `resources/js/presentation/pages/Administrativo/Modulos/EditarModulo.tsx` (modificar/expandir)
  - `resources/js/presentation/pages/Administrativo/Modulos/MostrarModulo.tsx` (ou onde fizer sentido)
  - `resources/js/presentation/pages/Administrativo/Espacos/EditarEspaco.tsx` (modificar/expandir)
  - Possível ajuste em componentes auxiliares (`ModuloForm`, `EspacoForm`) se usarem validação inline
- **Depende de:** S2-FE-05, S2-FE-06, S2-BE-09 (endpoints prontos).
- **Riscos relacionados:** R-01 (sequenciamento permission/policy — gestor de unidade só deve conseguir atribuir em seu campus), R-18 (escape de escopo por atribuição cruzada).
- **Casos de teste obrigatórios:**
  - `AdminModulosEdit.test.tsx::test_renders_gestores_espaco_infraestrutura_component` — valida que o organism aparece na tela.
  - `AdminModulosEdit.test.tsx::test_can_update_module_managers_when_authorized` — simula edição de gestor do módulo e valida chamada ao endpoint.
  - `AdminModulosEdit.test.tsx::test_respects_unidade_scope_visibility` — valida que apenas módulos do campus do usuário são editáveis.
  - `AdminEspacosEdit.test.tsx::test_can_override_space_manager_when_authorized` — simula override de espaço e valida chamada ao endpoint.
  - `AdminEspacosEdit.test.tsx::test_shows_origin_badge_indicating_module_default_or_override` — valida que badge de origem aparece, indicando se o gestor é padrão ou override.
- **Critérios de aceite:**
  - [ ] **Em EditarModulo.tsx:**
    - Adicionar seção "Gestores de Espaço — Padrão do Módulo" após a seção de Gestores de Reserva (ou em aba separada se layout exigir)
    - Integrar `<GestoresEspacoInfraestrutura endpoint={...} currentManagers={...} />` com endpoint: `ROUTES.modulos.alterarGestoresEspaco(moduloId)`
    - Feedback de sucesso/erro sincronizado com resto do formulário
  - [ ] **Em EditarEspaco.tsx:**
    - Adicionar seção "Gestor de Espaço — Atribuição Direta (Override)" com mesmo organism
    - Integrar com endpoint: `ROUTES.espacos.alterarGestorEspacoDireto(espacoId)`
    - Exibir `<OrigemVinculoBadge origem={...} />` ao lado, indicando se há override ou se está usando padrão do módulo
  - [ ] Ambas as páginas respeitam autorização (usuário sem `modulos.gerenciar-gestores-espaco` ou `espacos.gerenciar-gestor-espaco-direto` não veem a seção)
  - [ ] Validação de escopo no backend (S2-INT-05); frontend apenas exibe ou oculta baseado em permission
  - [ ] `npx tsc --noEmit` retorna 0
  - [ ] `npx jest --testPathPattern='Admin' 100% verde (para as páginas modificadas)

---

## [S2-FE-08] Implementar `EspacosOrfaos.tsx` (lista detalhada) + bloco analítico no dashboard

- **Objetivo:** Criar dois componentes distintos para exibir espaços órfãos de Gestor de Espaço: (1) lista completa em página dedicada (`/espacos-orfaos`) exclusiva para Gestor de Unidade, escopada ao campus, e (2) bloco de contadores agregados por campus no dashboard institucional. Dois componentes **completamente distintos**, não filtrado.
- **Caso de uso:** UC-16 (Painel de Espaços Órfãos), UC-13 (Visão Macroinstitucional).
- **Atores envolvidos:** Gestor de Unidade (lista detalhada), Institucional (contadores).
- **Partes afetadas:**
  - `resources/js/presentation/pages/Espacos/EspacosOrfaos.tsx` (novo)
  - `resources/js/presentation/organisms/WidgetVisaoMacroInstitucional.tsx` ou novo `WidgetOAAnaliticsWidget.tsx` (para blocos de contador)
  - `routes/web.php` — rota `/espacos-orfaos` com middleware de autorização
- **Depende de:** S2-BE-11 (endpoints de listagem de órfãos — `EspacoOrfaoController::index()` para GU, método em `HomeController` para Institucional), S2-FE-01 (roles), S2-FE-02 (permissions).
- **Riscos relacionados:** R-02 (precedência — órfão é definido corretamente pelo algoritmo), R-16 (escopo — GU só vê seus órfãos, Institucional vê todos).
- **Casos de teste obrigatórios:**
  - `EspacosOrfaos.test.tsx::test_renders_datatable_with_orphan_spaces` — valida que `<DataTable>` carrega lista de órfãos via endpoint.
  - `EspacosOrfaos.test.tsx::test_filters_by_campus_of_gestor_unidade` — valida que lista é filtrada ao campus do usuário.
  - `EspacosOrfaos.test.tsx::test_access_denied_without_permission` — valida que rota está protegida por `secao.gestao-orfaos-espaco`.
  - `EspacosOrfaos.test.tsx::test_datatable_allows_action_to_assign_manager` — valida que linha da tabela oferece ação "Atribuir Gestor", navegando ou abrindo modal.
  - `WidgetOrfaosAnalitcos.test.tsx::test_renders_counters_by_campus` — valida que widget mostra contadores "X espaços órfãos" por campus.
  - `WidgetOrfaosAnalitcos.test.tsx::test_only_visible_to_institucional` — valida que widget só renderiza se usuário tem `secao.dashboard-institucional`.
- **Critérios de aceite:**
  - [ ] **Página EspacosOrfaos.tsx:**
    - Título: "Espaços Sem Gestor de Espaço" (ou rótulo i18n correspondente)
    - `<DataTable>` com colunas: Módulo, Andar, Espaço, Campus, Ações
    - Dados carregados de `GET /espacos-orfaos?campus={campusId}` (escopado no backend)
    - Ações: botão "Atribuir Gestor" → abre modal/formulário usando `<GestoresEspacoInfraestrutura />` (reutilizar S2-FE-05)
    - Feedback visual (loading, empty state, error)
    - Paginação se houver muitos órfãos
    - Rota `/espacos-orfaos`, middleware `can:secao.gestao-orfaos-espaco`
  - [ ] **Bloco Analítico (WidgetOrfaosAnaliticos ou integrado em WidgetVisaoMacroInstitucional):**
    - Grid ou cards mostrando: "Campus A: 2 espaços órfãos | Campus B: 5 | Campus C: 0"
    - Valores recuperados de `GET /dashboard/orfaos-por-campus` ou similar (S2-BE-11)
    - Apenas visível se usuário tem `secao.dashboard-institucional` (via `<Can permission="...">`)
    - Números são clicáveis (navegam para página de detalhes? ou apenas informativos? — revisar requisito UC-16)
  - [ ] Nenhum filtro "por role" no componente — segurança é 100% backend (S2-INT-05, S2-INT-06)
  - [ ] `npx tsc --noEmit` retorna 0
  - [ ] `npx jest --testPathPattern='Orfao' 100% verde
  - [ ] Componentes não compartilham estado; lista e widget são totalmente independentes

