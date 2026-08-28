# Sprint 6 — Frontend Backlog

## [S6-FE-01] Componente `molecules/TutorialChamadoViewer.tsx` — exibição de tutorial

- **Objetivo:** Implementar componente reutilizável que exibe o conteúdo em Markdown do `TipoChamado.tutorial` com sanitização, incluindo CTA "Resolveu?" que permite usuário ignorar o chamado formal se o tutorial resolveu o problema.
- **Caso de uso:** UC-19-B (tutorial assistido)
- **Atores envolvidos:** Comum (vê tutorial)
- **Partes afetadas:** `resources/js/presentation/molecules/TutorialChamadoViewer.tsx` (NOVO), `resources/js/hooks/useSanitizeMarkdown.ts` (possivelmente reutilizar/criar)
- **Depende de:** S6-BE-05 (campo `tutorial` em `TipoChamado`)
- **Riscos relacionados:** R-S6-03 (XSS — sanitização deve ser rigorosa)
- **Casos de teste obrigatórios:**
  - Testa que componente renderiza Markdown sem scripts/iframes maliciosos
  - Testa que CTA "Resolveu?" dispara callback sem criar chamado
  - Testa que CTA "Não resolveu" dispara callback habilitando formulário de chamado
  - Testa que conteúdo nulo/undefined é tratado gracefully
- **Critérios de aceite:**
  - [ ] Componente usa biblioteca de sanitização consolidada (`parsedown-extra` ou equivalente já no projeto)
  - [ ] Whitelist de tags HTML é estrita (sem `<script>`, `<iframe>`, `<object>`, handlers inline)
  - [ ] TypeScript sem erros de tipo (`npx tsc --noEmit`)
  - [ ] ESLint limpo (sem novas supressões)
  - [ ] Snapshot ou visual regression tests passam

---

## [S6-FE-02] Página pública `/reportar/{espaco:public_id}` — `Espacos/Reportar.tsx`

- **Objetivo:** Implementar página pública (sem autenticação obrigatória) que permite usuário deslogado escanear QR Code, selecionar tipo de problema, ver tutorial (se houver), e decidi se abre chamado formal ou não.
- **Caso de uso:** UC-19-A (reporte público via QR Code)
- **Atores envolvidos:** Comum (deslogado)
- **Partes afetadas:** `resources/js/presentation/pages/Espacos/Reportar.tsx` (NOVO), rota `/reportar/{espaco:public_id}` (integração com Inertia)
- **Depende de:** S6-FE-01 (tutorial viewer), S6-BE-06 (endpoint público)
- **Riscos relacionados:** R-S6-02 (sem autenticação, é superfície de abuso — apenas validar dados, rate limiting é infraestrutura fora deste sprint)
- **Casos de teste obrigatórios:**
  - Testa que página carrega sem login
  - Testa que selector de tipo de chamado lista tipos disponíveis
  - Testa que seleção de tipo carrega seu tutorial (se houver)
  - Testa que "Resolveu?" fecha página sem criar chamado
  - Testa que "Não resolveu" abre formulário de chamado
  - Testa que `espaco_id` inválido exibe erro clara (404 customizado ou fallback)
- **Critérios de aceite:**
  - [ ] Página é acessível sem autenticação
  - [ ] Todos os fluxos (tutorial + chamado formal) funcionam
  - [ ] Validação de `public_id` é feita no backend (frontend nunca confia em entrada)
  - [ ] Feedback visual claro em cada etapa (loading, erro, sucesso)
  - [ ] `npx tsc --noEmit` limpo
  - [ ] `npx jest` cobrindo fluxo principal passa

---

## [S6-FE-03] Formulário de edição `TipoChamado` — adicionar campo `tutorial`

- **Objetivo:** Estender formulário administrativo de edição de tipo de chamado para incluir campo de texto rico / Markdown editor, permitindo Institucional definir tutorial para cada tipo.
- **Caso de uso:** UC-19-D (manutenção de tutoriais)
- **Atores envolvidos:** Institucional
- **Partes afetadas:** `resources/js/presentation/pages/Administrativo/TiposChamados/Form.tsx` (ou equivalente), componente editor de Markdown
- **Depende de:** S6-BE-05 (campo `tutorial` criado), S6-FE-01 (visualização do tutorial)
- **Riscos relacionados:** R-S6-03 (confiança em validação backend de sanitização, frontend apenas captura a entrada)
- **Casos de teste obrigatórios:**
  - Testa que campo `tutorial` aparece no formulário
  - Testa que texto é preservado na submissão (PATCH/POST)
  - Testa que preview em tempo real funciona (opcional, nice-to-have)
  - Testa que campo é opcional (permite NULL)
- **Critérios de aceite:**
  - [ ] Campo é textarea ou editor de Markdown (reutilizar componente existente se houver)
  - [ ] Submissão envia conteúdo ao backend sem validação extra (backend sanitiza)
  - [ ] Edição de TipoChamado existente mantém tutorial anterior (PUT/PATCH)
  - [ ] `npx tsc` limpo
  - [ ] Sem regressão em testes de `TipoChamado` form

---

## [S6-FE-04] Painel de triagem de chamados — `ChamadosDoGestorEspaco.tsx`

- **Objetivo:** Implementar tela que permite Gestor de Espaço ver, filtrar e triagar (resolver, cancelar com motivo, reabre) chamados dos espaços sob sua responsabilidade.
- **Caso de uso:** UC-19-C (triagem de chamados)
- **Atores envolvidos:** Gestor de Espaço
- **Partes afetadas:** `resources/js/presentation/pages/ChamadosDoGestorEspaco.tsx` (NOVO), componente modal/form de triagem
- **Depende de:** S6-BE-02 (Policy de acesso), S6-BE-03 (notificações implementadas), S6-BE-07 (permissions definidas)
- **Riscos relacionados:** R-S6-02 (UI deve respeitar escopo de backend, nunca filtrar dados sensível no frontend)
- **Casos de teste obrigatórios:**
  - Testa que lista mostra apenas chamados dos espaços do Gestor
  - Testa que filtros por status (pendente, resolvido, cancelado) funcionam
  - Testa que triagem com motivo (cancelado) é validada
  - Testa que reabertura de chamado funciona
  - Testa que usuário sem `chamados.triar` não vê página (403)
- **Critérios de aceite:**
  - [ ] Página é gated por `<Can permission="chamados.triar">`
  - [ ] Lista é paginada (dados vindos de backend, não fetch tudo)
  - [ ] Filtros são URL-state (bookmarkable)
  - [ ] Triagem é um modal/drawer que valida motivo se status = cancelado
  - [ ] `npx jest` para lógica de filtro/triagem passa
  - [ ] Sem regressão em dashboards/páginas existentes

---

## [S6-FE-05] Painel de chamados órfãos — `ChamadosOrfaos.tsx` (agregado para Institucional, detalhado para Gestor de Unidade)

- **Objetivo:** Implementar página com profundidade diferenciada: Institucional vê widget de agregado (contadores por campus), Gestor de Unidade vê lista completa dos órfãos do seu campus, reutilizando padrão visual de `EspacosOrfaos.tsx` do Sprint 2.
- **Caso de uso:** UC-20 (visão de chamados órfãos)
- **Atores envolvidos:** Gestor de Unidade, Institucional
- **Partes afetadas:** `resources/js/presentation/pages/ChamadosOrfaos.tsx` (NOVO), widget agregado (reutilizável), lista detalhada
- **Depende de:** S6-BE-08 (endpoints de órfãos), S6-BE-07 (permissions), Sprint 2 (padrão visual de `EspacosOrfaos.tsx`)
- **Riscos relacionados:** R-S6-04 (órfão não alcança ninguém — comunicar visualmente)
- **Casos de teste obrigatórios:**
  - Testa que Institucional vê widget com contadores por campus
  - Testa que Gestor de Unidade A vê lista de órfãos do Campus A
  - Testa que Gestor de Unidade A NÃO vê lista de Campus B
  - Testa que link de triagem (CTA) está presente em lista detalhada
  - Testa que widget agregado não quebra se há 0 órfãos
- **Critérios de aceite:**
  - [ ] Usa mesma estrutura visual de `EspacosOrfaos.tsx` (cards/tabela, paginação, filtros)
  - [ ] Endpoints diferenciam Institucional (agregado) vs. Gestor de Unidade (detalhado) automaticamente via permission
  - [ ] Sem exposição de dados cross-campus (backend valida escopo)
  - [ ] `npx jest` para lógica de filtragem detalhada passa
  - [ ] Testes de regres com múltiplos campi passam

---

## Notas Gerais — Frontend Sprint 6

- **Sanitização de Markdown:** sempre confiada ao backend (tasks S6-BE-05, S6-BE-03). Frontend apenas renderiza.
- **Autenticação:** página `/reportar/` é pública; demais páginas (triagem, órfãos) são gated por `<Can>` com permission backend.
- **Contrato SSOT:** aproveitar o que backend expõe em `resources/js/contracts/` — criar se não existir `chamado.contract.ts`.
- **i18n:** adicionar chaves em `resources/js/i18n/` se necessário (labels de status, motivos, mensagens de sucesso).
- **Reutilização:** máximo reaproveitamento de componentes atômicos (`Button`, `Select`, `Modal`) de `shadcn` + pattern existente.
