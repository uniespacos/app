# Sprint 1 — Gestor de Unidade — Frontend

> **Trilha:** Frontend | **Responsabilidade:** Contratos SSOT, páginas, organisms/molecules/atoms, i18n, constantes de permissão.

---

## S1-FE-01 — Expandir contrato de roles com `GESTOR_UNIDADE`

- **Objetivo:** Adicionar a nova role `gestor_unidade` ao contrato canônico de roles do frontend, garantindo type-safety em toda a aplicação.
- **Caso de uso:** UC-01 (impacto de roles), UC-15 (Gestor de Unidade)
- **Atores envolvidos:** Gestor de Unidade, Gestor de Espaço, Institucional
- **Partes afetadas:**
  - `resources/js/contracts/roles.contract.ts` — expansão de `SystemRole`
  - `resources/js/constants/permissions.ts` — derivar `ROLE_GESTOR_UNIDADE`
  - `resources/js/types/index.d.ts` — garantir que tipos globais de `User` incluem role novo
- **Depende de:** S1-BE-02 (role `gestor_unidade` criada no banco)
- **Riscos relacionados:** R-04 (autorização por role em vez de permission)
- **Casos de teste obrigatórios:**
  - `test_role_gestor_unidade_presente_no_contrato` — constante exportada
  - `test_role_gestor_unidade_valido_em_ROLES_VALIDAS` — integrado na lista de roles válidas
  - `test_todas_as_keys_de_SystemRole_presentes_em_switch_completo` — auditar que futuros switches sobre a role não usam `default: throw` sem assertNever
- **Critérios de aceite:**
  - [ ] `resources/js/contracts/roles.contract.ts` contém `GESTOR_UNIDADE: 'gestor_unidade'`
  - [ ] `ROLES_VALIDAS` incluí `SystemRole.GESTOR_UNIDADE` e todas as 5 roles
  - [ ] `resources/js/types/index.d.ts` reflete o tipo atualizado
  - [ ] Nenhum `'string'` hardcoded em testes de role — usa constantes do contrato
  - [ ] `npx tsc --noEmit` retorna 0

---

## S1-FE-02 — Criar constantes de permissions novas em `permissions.ts`

- **Objetivo:** Exportar constantes das permissions novas concedidas ao `gestor_unidade` e `gestor_espaco`, garantindo que o frontend sempre usa chaves canônicas (SSOT), nunca hardcoded.
- **Caso de uso:** UC-15, UC-14 (Gestor de Espaço)
- **Atores envolvidos:** Gestor de Unidade, Gestor de Espaço
- **Partes afetadas:**
  - `resources/js/constants/permissions.ts` — adicionar constantes das permissions novas
  - Referenciar `docs/v2.0/03-arquitetura/03-matriz-de-permissions.md` para lista definitiva
- **Depende de:** S1-BE-03 (permissions criadas e associadas aos roles)
- **Riscos relacionados:** R-04 (hardcoding de permission strings)
- **Casos de teste obrigatórios:**
  - `test_permission_unidades_gerenciar_gestores_exportada` — constante `PERMISSION_UNIDADES_GERENCIAR_GESTORES` existe
  - `test_permission_modulos_gerenciar_gestores_espaco_exportada` — constante para permissão de Módulo
  - `test_permission_espacos_gerenciar_gestor_espaco_direto_exportada` — constante para Espaço
  - `test_permission_secao_dashboard_gestor_unidade_exportada` — constante para dashboard
  - `test_todas_as_permissions_novas_sao_strings_nao_vazias` — validação de integridade
- **Critérios de aceite:**
  - [ ] Todas as permissions novas listadas em `03-matriz-de-permissions.md` têm constante em `permissions.ts`
  - [ ] Constantes seguem padrão `PERMISSION_*_MAIUSCULO`
  - [ ] `ROLE_GESTOR_UNIDADE` e `ROLE_GESTOR_ESPACO` derivadas de `SystemRole` (não hardcoded)
  - [ ] ESLint passa sem supressões novas
  - [ ] Nenhuma permission referenciada como string literal em componentes — usa constante

---

## S1-FE-03 — Adicionar rótulos de permissions em `permission-labels.ts` e corrigir rótulo de `gestor`

- **Objetivo:** Exportar rótulos legíveis das novas permissions para exibição em telas de gerenciamento de roles, e corrigir o rótulo de `gestor` de "Gestor" (ambíguo) para "Gestor de Reserva".
- **Caso de uso:** UC-15, UC-14
- **Atores envolvidos:** Institucional (gerenciamento de roles), Gestor de Unidade, Gestor de Espaço
- **Partes afetadas:**
  - `resources/js/constants/permission-labels.ts` — adicionar entries para permissions novas e corrigir entrada existente de `gestor`
- **Depende de:** S1-FE-02 (constantes de permissions já definidas)
- **Riscos relacionados:** R-03 (regressão de strings hardcoded esperando "Gestor" exato), R-08 (confusão entre "Gestor" genérico e os novos papéis)
- **Casos de teste obrigatórios:**
  - `test_rotulo_gestor_corrigido_para_gestor_de_reserva` — entrada antecedente foi atualizada
  - `test_rotulo_gestor_unidade_presente` — "Gestor de Unidade"
  - `test_rotulo_gestor_espaco_presente` — "Gestor de Espaço"
  - `test_nenhum_permission_label_sem_traducao` — auditar que todas as constantes de `permissions.ts` têm entrada no dicionário de rótulos
- **Critérios de aceite:**
  - [ ] `permission-labels.ts` mapeia todas as permissions novas
  - [ ] Rótulos são descritivos e únicos — sem "Gestor" genérico
  - [ ] Rótulo de `gestor` mudou para "Gestor de Reserva"
  - [ ] Grep de `'Gestor'` e `"Gestor"` em `resources/js/` não retorna matches inesperados (apenas em comentários ou como substring de "Gestor de Reserva"/"Gestor de Unidade"/"Gestor de Espaço")
  - [ ] Chaves em `permission-labels.ts` seguem o padrão de `permissions.ts`

---

## S1-FE-04 — Auditar teste de contrato para cobertura de roles novas

- **Objetivo:** Garantir que o teste de contrato cobre todas as 5 roles (incluindo as 2 novas) e que qualquer `switch` sobre `SystemRole` implementa `default: return assertNever(...)` conforme regra inviolável §4.2.
- **Caso de uso:** UC-15
- **Atores envolvidos:** Qualquer desenvolvedor mantendo o código
- **Partes afetadas:**
  - `resources/js/contracts/contracts.test.ts` (ou equivalente, ex.: `roles.contract.test.ts`) — adicionar cases para `GESTOR_UNIDADE` e `GESTOR_ESPACO`
  - `resources/js/` — grep por `switch.*SystemRole` para auditar que todos usam `default: return assertNever(...)`
- **Depende de:** S1-FE-01 (contrato atualizado)
- **Riscos relacionados:** R-04 (código olvida de tratar nova role num switch)
- **Casos de teste obrigatórios:**
  - `test_switch_sobre_SystemRole_implementa_assertNever_em_default` — valida pattern em função que testa
  - `test_todas_as_5_roles_cobertas_no_switch` — casos positivos para cada role
  - `test_switch_lanca_erro_tipo_UnreachableCaseError_se_role_nova_for_adicionada` — garante que o padrão está ativo
  - `test_contrato_roles_exporta_exatamente_5_roles` — integridade de `ROLES_VALIDAS`
- **Critérios de aceite:**
  - [ ] Teste de contrato cobre 5 roles (todas)
  - [ ] Qualquer função que faz `switch (user.role)` implementa `default: return assertNever(role)`
  - [ ] Grep de `role ===` ou `hasRole(` **sem** `<Can>` / `useCan()` retorna zero matches em código novo (auditoria de R-04)
  - [ ] Jest passa 100%
  - [ ] `npx tsc --noEmit` retorna 0 — não há `@ts-ignore` ou `as any` em código novo

---

## S1-FE-05 — Criar organism `GestoresUnidade.tsx` para seletor multi-usuário

- **Objetivo:** Desenvolver componente reutilizável que permite selecionar múltiplos usuários como Gestores de Unidade para uma Unidade, reaproveita padrão de `UsuariosSetor.tsx` já existente.
- **Caso de uso:** UC-15 (P-03 — mais de um Gestor de Unidade por campus)
- **Atores envolvidos:** Institucional
- **Partes afetadas:**
  - `resources/js/presentation/organisms/GestoresUnidade.tsx` (novo)
  - Potencial reaproveitamento/inspiração de `resources/js/presentation/organisms/UsuariosSetor.tsx` para pattern
- **Depende de:** S1-FE-02 (constantes de permission), S1-BE-10 (endpoint de atribuição de gestores)
- **Riscos relacionados:** R-04 (condição `role === 'gestor_unidade'`)
- **Casos de teste obrigatórios:**
  - `test_organism_renderiza_lista_de_usuarios_adicionaveis` — exibe usuários disponíveis
  - `test_organism_permite_multiselecao_de_usuarios` — seleção de múltiplos
  - `test_organism_desabilita_usuarios_ja_gestores` — UX: já atribuídos não ficam duplicados
  - `test_organism_usa_useCan_permission_nao_role_para_condicionar_renderizacao` — auditoria de R-04
  - `test_organism_dispara_submissao_via_endpoint_correto` — POST/PATCH ao endpoint de atribuição
- **Critérios de aceite:**
  - [ ] Componente exportado de `presentation/organisms/`
  - [ ] Usa `<Can permission="...">` nunca `role ===`
  - [ ] Interface clara de multi-seleção (checkbox ou similar)
  - [ ] Valida que o usuário selecionado tem permissão de receber o papel (regra de negócio do backend)
  - [ ] Integra com endpoint S1-BE-10 (atribuição)
  - [ ] TypeScript estrito — sem `any`

---

## S1-FE-06 — Implementar seção/tela de gerenciamento de Gestores de Unidade

- **Objetivo:** Criar ou estender página da tela de edição de Unidade para incluir a seção de atribuição de Gestores, consumindo o organism `GestoresUnidade.tsx` e chamando o endpoint de atribuição.
- **Caso de uso:** UC-15
- **Atores envolvidos:** Institucional
- **Partes afetadas:**
  - `resources/js/presentation/pages/Administrativo/Unidades/EditarUnidade.tsx` (ou `GestoresUnidade.tsx` dentro desse diretório) — nova seção ou página dedicada
  - Rota possível: `/administrativo/unidades/{unidade}/gestores` (após renomeação de rotas em Fase 11)
- **Depende de:** S1-FE-05 (organism pronto), S1-BE-10 (endpoint pronto)
- **Riscos relacionados:** R-18 (sequenciamento — só renderizar se permissions aplicadas)
- **Casos de teste obrigatórios:**
  - `test_tela_renderiza_lista_de_gestores_atuais_da_unidade` — fetch de dados iniciais
  - `test_tela_permite_adicionar_novo_gestor` — adicionar via organism
  - `test_tela_permite_remover_gestor_existente` — removal com confirmação
  - `test_tela_usa_Can_permission_secao_gestao_unidades_para_condicionar_acesso` — gate de acesso
  - `test_tela_exibe_mensagem_sucesso_apos_atribuicao` — UX feedback
  - `test_tela_desabilita_se_usuario_nao_tem_permission_unidades_gerenciar_gestores` — auditoria
- **Critérios de aceite:**
  - [ ] Tela acessível apenas com `unidades.gerenciar-gestores`
  - [ ] Consume `GestoresUnidade.tsx`
  - [ ] Chama endpoint S1-BE-10 com payload correto
  - [ ] Feedback visual claro de sucesso/erro
  - [ ] Integra em fluxo natural de edição de Unidade (não isolado)
  - [ ] `npx jest` passa em testes específicos desta tela

---

## S1-FE-07 — Adicionar campo `label_gestor` na tela de edição de Unidade

- **Objetivo:** Expor campo customizável `label_gestor` (rótulo do cargo de Gestor de Unidade para aquele campus) na tela de edição, com lógica de permissão: Institucional edita livre, Gestor de Unidade apenas via endpoint estreito `S1-BE-11`.
- **Caso de uso:** UC-15 (P-13 — rótulo customizável por Unidade), UC-01 (impacto nas telas)
- **Atores envolvidos:** Institucional, Gestor de Unidade
- **Partes afetadas:**
  - `resources/js/presentation/pages/Administrativo/Unidades/EditarUnidade.tsx` — campo novo no formulário
  - Possível novo form/modal: `resources/js/presentation/pages/Administrativo/Unidades/AlterarLabelGestor.tsx` (se Gestor de Unidade editar via endpoint separado)
- **Depende de:** S1-BE-07 (migration de `label_gestor`), S1-BE-11 (endpoint estreito de alteração)
- **Riscos relacionados:** D-8 (Gestor não edita nome/sigla — só `label_gestor`), R-21 (escalonamento de permissão)
- **Casos de teste obrigatórios:**
  - `test_campo_label_gestor_visivel_para_institucional` — renderiza para role institucional
  - `test_campo_label_gestor_editavel_para_institucional` — institucional consegue alterar
  - `test_gestor_unidade_nao_acessa_tela_completa_EditarUnidade` — apenas endpoint estreito
  - `test_endpoint_estreito_PATCH_unidades_label_gestor_funciona_para_gestor_unidade` — chamada correta
  - `test_gestor_unidade_nao_consegue_alterar_nome_ou_sigla` — proteção de escopo
- **Critérios de aceite:**
  - [ ] Campo renderiza em `EditarUnidade.tsx` (visível ao Institucional)
  - [ ] Persiste valor via `PUT /administrativo/unidades/{unidade}` ou endpoint separado
  - [ ] Gestor de Unidade tem acesso apenas via `PATCH /unidades/{unidade}/label-gestor` (endpoint estreito)
  - [ ] Rótulo é opcional (default vazio ou "Gestor de Unidade")
  - [ ] Validação: máximo X caracteres (recomendação: 100)
  - [ ] Nenhum acesso cruzado — Gestor A não consegue alterar `label_gestor` da Unidade B

---

## S1-FE-08 — Auditoria de regra inviolável §4.3: nenhum componente novo usa `role === 'gestor_unidade'`

- **Objetivo:** Garantir que nenhum componente, página ou tela nova introduzida neste sprint condiciona fluxo ou renderização a comparação direta de role, sempre usando `<Can permission="...">` ou `useCan()`. Esta é uma task de code review e auditorea grep, não feature nova.
- **Caso de uso:** UC-01 (impacto de papéis), arquitetura geral
- **Atores envolvidos:** Revisor de código
- **Partes afetadas:**
  - Todos os arquivos criados/modificados nas tasks S1-FE-01 a S1-FE-07
- **Depende de:** Todas as tasks FE deste sprint (S1-FE-01 a S1-FE-07)
- **Riscos relacionados:** R-04 (autorização por role em vez de permission)
- **Casos de teste obrigatórios:**
  - `test_grep_no_codigo_novo_por_role_gestao_unidade_retorna_zero_matches` — Grep de `role === 'gestor_unidade'` em código novo
  - `test_grep_por_hasRole_ou_is_role_no_codigo_novo_retorna_zero` — Grep de `hasRole('gestor_unidade')` ou similar
  - `test_todos_os_condicionais_de_permissao_usam_Can_ou_useCan` — audit de padrão correto
  - `test_auditoria_de_permission_labels_coerente_com_componentes` — validação cruzada de que label usado matcheia component usage
- **Critérios de aceite:**
  - [ ] Grep de `role === 'gestor_unidade'` em `resources/js/` (código novo) retorna **zero** resultados
  - [ ] Grep de `hasRole('gestor_unidade')` retorna **zero** resultados
  - [ ] Grep de `is_gestor_unidade` ou similar retorna **zero** resultados
  - [ ] Todos os condicionais de acesso usam `<Can permission="...">` ou `const { can } = useCan()`
  - [ ] Relatório final registrado em `docs/v2.0/observacoes/` se algum padrão incorreto for encontrado (será tratado em PR review)
  - [ ] Tarefa validada após merge de todas as FE tasks

---

## Definição de Pronto para Trilha Frontend

Todas as 8 tasks FE devem estar 100% completas:

- [ ] S1-FE-01: contrato atualizado, `npx tsc --noEmit` passa
- [ ] S1-FE-02: constantes exportadas, sem supressões ESLint novas
- [ ] S1-FE-03: rótulos atualizados e corretos, sem "Gestor" ambíguo
- [ ] S1-FE-04: teste de contrato cobre 5 roles, assertNever pattern verificado
- [ ] S1-FE-05: organism `GestoresUnidade.tsx` implementado, reutilizável, testes passando
- [ ] S1-FE-06: seção de gerenciamento de gestores em `EditarUnidade.tsx`, consumindo organism
- [ ] S1-FE-07: campo `label_gestor` visível/editável conforme permission, endpoint estreito funcional
- [ ] S1-FE-08: auditoria de regra §4.3 passou — zero matches de role direta em código novo
- [ ] `npx tsc --noEmit` retorna 0 (sem novos erros de tipo)
- [ ] `npx jest` — 100% verde (todos os testes da trilha passando)
- [ ] `npx eslint resources/js --suppressions-location <(echo '{}')` — sem supressões novas
- [ ] Nenhuma regra de `docs/v2.0/00-visao-geral/04-regras-invioaveis.md` violada

> **Bloco Atômico (Risco R-18):** Esta trilha **não pode ser mergeada isoladamente**. Depende de S1-BE-01 a S1-BE-13 (backend) terem aplicado as policies escopadas já. Merge conjuntamente com `integracao/BACKLOG.md`.
