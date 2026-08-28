# Frontend Backlog — Sprint 4: Setor Expandido

---

### [S4-FE-01] Componente: `SetorExpedienteForm.tsx`

- **Objetivo:** Construir formulário reutilizável para edição de horário de abertura/fechamento, dias de funcionamento (checkbox por dia da semana) e exceções por intervalo de datas, visível para Institucional, Gestor de Unidade e coordenador designado.
- **Caso de uso:** UC-18
- **Atores envolvidos:** Institucional, Gestor de Unidade, Coordenador do Setor
- **Partes afetadas:**
  - `resources/js/presentation/organisms/SetorExpedienteForm.tsx` (NOVO)
  - Possivelmente atoms/molecules para campos de horário e intervalo de datas
- **Depende de:** S4-BE-04, S4-BE-06 (contrato de endpoint)
- **Riscos relacionados:** Nenhum específico
- **Casos de teste obrigatórios:**
  - Formulário renderiza com campos: horário de abertura (input time), horário de fechamento (input time), checkboxes para dias (seg-dom)
  - Seção de exceções renderiza com botão "Adicionar exceção"
  - Cada exceção exibe: data início, data fim, toggles "fechado", horários especiais (desabilitados quando "fechado" = true), motivo (opcional)
  - Validação client-side: `horario_abertura < horario_fechamento` é verificada e impede submit
  - Validação client-side: `data_inicio ≤ data_fim` em exceções
  - Preenchimento: se setor já tem expediente, campos carregam valores anteriores
  - Preenchimento: exceções existentes aparecem na lista com opção de editar/remover
  - Modo readonly: quando usuário não tem permissão de editar, inputs ficam desabilitados
- **Critérios de aceite:**
  - [ ] Componente é `organisms`, não `pages` (reutilizável em múltiplos contextos)
  - [ ] Contratos TypeScript: interface `SetorExpedienteFormProps { setor: Setor; onSubmit?: (data: ExpedientePayload) => void; readOnly?: boolean; }`
  - [ ] Integração com `useCan()` hook: renderiza condicionalmente se usuário tem `setores.atualizar`
  - [ ] Renderiza 7 checkboxes para dias da semana, com labels claros (segunda, terça, ...)
  - [ ] Campos de horário são `<input type="time">` ou componente shadcn correspondente
  - [ ] Exceções: tabela ou lista com ícone de remover/editar
  - [ ] Botão de submit desabilitado até que haja mudança (detecta `isDirty` no form state)
  - [ ] Sem hard-coded role names — usa `useCan('setores.atualizar')`

---

### [S4-FE-02] Campo de Designação: `coordenador_id` na Tela de Edição de Setor

- **Objetivo:** Adicionar campo de busca/seleção de usuário para designar o coordenador responsável na tela de edição de setor (`Administrativo/Setores/Edit`), visível apenas para Institucional e Gestor de Unidade.
- **Caso de uso:** UC-18
- **Atores envolvidos:** Institucional, Gestor de Unidade
- **Partes afetadas:**
  - `resources/js/presentation/pages/Administrativo/Setores/SetorEdit.tsx` (ou `SetorForm.tsx` se modularizado)
  - `resources/js/contracts/setor.contract.ts` (estender para incluir `coordenador_id` e metadados de busca)
- **Depende de:** S4-BE-07 (endpoint de designação), S4-BE-03 (relação Eloquent)
- **Riscos relacionados:** R-21 (nunca renderizar este campo para coordenador designado)
- **Casos de teste obrigatórios:**
  - Campo renderiza apenas para Institucional e Gestor de Unidade (não renderiza para coordenador designado)
  - Campo renderiza como busca typeahead (search por nome/email)
  - Campo carrega valor anterior (coordenador atual) no edit
  - Campo permite limpar seleção (designar `null`)
  - Seleção de usuário inexistente é bloqueada
  - Formulário consegue ser submetido com campo vazio (`coordenador_id = null`)
- **Critérios de aceite:**
  - [ ] Campo renderizado condicionalmente com `<Can permission="setores.atualizar">`
  - [ ] Integração com `useCan()`: confirma que coordenador designado **não vê este campo**
  - [ ] Input é typeahead com busca por nome/email (reuse componente existente do projeto ou crie novo)
  - [ ] Dados para busca vêm de backend (endpoint via `useAsync` ou `useFetcher`)
  - [ ] Campo aparece no mesmo formulário de setor (não separado), como parte de `UpdateSetorRequest`
  - [ ] Validação: usuário selecionado deve existir e ser ativo
  - [ ] Clear button disponível para remover coordenador anterior

---

### [S4-FE-03] Integração: `SetorExpedienteForm.tsx` na Tela de Setor com Consumo do Endpoint

- **Objetivo:** Integrar o componente `SetorExpedienteForm` na tela de edição de setor, consumindo `PATCH /setores/{setor}/expediente` com feedback visual de sucesso/erro.
- **Caso de uso:** UC-18
- **Atores envolvidos:** Institucional, Gestor de Unidade, Coordenador do Setor
- **Partes afetadas:**
  - `resources/js/presentation/pages/Administrativo/Setores/SetorEdit.tsx` (ou `SetorDetail.tsx`)
  - Contracts: `setor.contract.ts` (estender com `ExpedientePayload`)
  - Hooks/composables: integração com `useFetcher` ou `useAction`
- **Depende de:** S4-FE-01, S4-BE-06 (endpoint)
- **Riscos relacionados:** Nenhum específico
- **Casos de teste obrigatórios:**
  - Alteração de `horario_abertura` dispara POST para `PATCH /setores/{setor}/expediente` corretamente
  - Sucesso: toast/snackbar "Expediente atualizado com sucesso"
  - Erro 403: "Você não tem permissão para editar este expediente"
  - Erro 422: erro de validação exibe campos inválidos
  - Loading state: botão submit mostra spinner enquanto request está em voo
  - Após sucesso: dados do setor refrescam (re-fetch ou update do estado)
  - Campo de exceção: adição de nova exceção pelo formulário é enviada corretamente (`POST /setores/{setor}/expediente` com `excecoes[0]` no payload)
- **Critérios de aceite:**
  - [ ] `SetorExpedienteForm` renderiza na página de edição de setor
  - [ ] Consumo de `PATCH /setores/{setor}/expediente` via `useFetcher` (ou hook apropriado do projeto)
  - [ ] Feedback visual: toast de sucesso/erro (usar `useToast` do projeto)
  - [ ] Loading: botão submit desabilitado/com spinner durante submissão
  - [ ] Erros de validação do backend aparecem próximos aos campos relevantes
  - [ ] Após sucesso: cache/estado do setor é atualizado (ou página refaz fetch)
  - [ ] Teste Jest: mock do endpoint, verifica que `PATCH` é chamado com payload correto
  - [ ] Teste Jest: mock de erro 403, verifica que mensagem apropriada é exibida

---

### [S4-FE-04] Extensão: Widget do Painel Gestor de Unidade com Indicador de Setores Pendentes

- **Objetivo:** Adicionar à página de dashboard do Gestor de Unidade um widget que exibe contagem (ou mini-lista) de setores do campus que ainda não têm expediente cadastrado, com atalho direto para configuração.
- **Caso de uso:** UC-18, UC-20
- **Atores envolvidos:** Gestor de Unidade
- **Partes afetadas:**
  - `resources/js/presentation/organisms/WidgetPainelGestorUnidade.tsx` (existente — estender)
  - `resources/js/presentation/pages/Home.tsx` ou `Dashboard.tsx` (verificar se widget já está integrado)
  - Contracts: expandir `GestorUnidadeData` para incluir `setores_pendentes_count` e/ou `setores_pendentes`
- **Depende de:** S4-BE-10 (dados no backend), S4-FE-01, S4-FE-03 (formulário de edição)
- **Riscos relacionados:** R-19 (payload inchado), R-20 (expediente vazio — mitigação visual)
- **Casos de teste obrigatórios:**
  - Widget não renderiza para usuários sem `gestor_unidade` role
  - Número de setores pendentes é exibido corretamente (reflete dados do backend)
  - Widget exibe lista expandível de setores pendentes (ex.: "3 setores sem expediente")
  - Clique em um setor da lista leva diretamente para a página de edição daquele setor
  - Mini-lista está vazia (e widget collapsa ou mostra "Nenhum setor pendente") quando todos têm expediente
  - Indicador visual (badge com número) aparece de forma destacada
- **Critérios de aceite:**
  - [ ] Widget renderiza apenas se `useCan('gestor_unidade')` retorna true (ou similar)
  - [ ] Consome dados de `gestorUnidadeData.setores_pendentes_count` (número)
  - [ ] Exibe contagem em badge destacado (ex.: vermelho/laranja para chamar atenção)
  - [ ] Clique expande lista de setores ou abre modal (UX decision — documentar qual)
  - [ ] Cada item da lista é link para `/administrativo/setores/{setor}/edit`
  - [ ] Teste Jest: mock de `gestorUnidadeData`, verifica que widget renderiza contagem
  - [ ] Teste Jest: click no setor navega para URL correta (com `route()` do Ziggy)
  - [ ] Teste JS: widget desaparece quando count é 0 (opcional — depende de UX)

---

## Resumo de Dependências Entre Tasks

```
S4-BE-03 (Relações)
└── S4-FE-01 (SetorExpedienteForm)
    ├── S4-FE-03 (Integração com endpoint)
    │   └── S4-FE-04 (Widget do dashboard)
    └── S4-FE-02 (Campo coordenador_id)
```

**Ordem recomendada de execução:** S4-FE-01 → S4-FE-02 → S4-FE-03 → S4-FE-04

S4-FE-02 pode rodar em paralelo com S4-FE-01 uma vez que ambas dependem de S4-BE-03.
