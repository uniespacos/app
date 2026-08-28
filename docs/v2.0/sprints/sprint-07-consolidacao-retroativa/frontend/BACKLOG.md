# Sprint 7 — Frontend: Rename de Rotas Administrativas

---

## S7-FE-01 — Atualizar 51 ocorrências de `'institucional.*'` em `resources/js` para `'administrativo.*'`

- **Objetivo:** Localizar e substituir todas as referências ao nome de rota antigo `'institucional.*'` pelo novo `'administrativo.*'` em TypeScript/TSX/JavaScript, cobrindo ~30 nomes de rota distintos (`institucional.espacos.*`, `institucional.modulos.*`, `institucional.setors.*`, `institucional.unidades.*`, `institucional.instituicoes.*`, `institucional.roles.*`, `institucional.andares.store`, etc.).

- **Caso de uso:** P-29 (closed) · D-7 (closed) — atualizar referências Ziggy no frontend

- **Atores envolvidos:** Desenvolvedor frontend

- **Partes afetadas:**
  - `resources/js/` — todos os diretórios (presentation, hooks, utils, types)
  - Qualquer lugar onde apareça `'institucional.` em uma string (argumentos de `route()`, `usePage().props.ziggy.routes`, conditional paths, etc.)
  - ~51 ocorrências por contagem anterior (ver `docs/auditoria-gestores-unidade-espaco/07-matriz-riscos-lacunas-perguntas-abertas.md`, §2.6)

- **Depende de:** S7-BE-01 (rotas devem estar renomeadas no backend)

- **Riscos relacionados:** R-15 (semântica de rotas — mitigado por esta task)

- **Casos de teste obrigatórios:**
  1. **Teste de Cobertura Completa:** `grep -r "'institucional\." resources/js` e `grep -r '"institucional\.'` resources/js` não encontram nada (0 ocorrências)
  2. **Teste de Tipagem:** `npx tsc --noEmit` retorna exit code 0 (Ziggy valida que os nomes de rota renomeados existem no backend)
  3. **Teste de Linter:** `npx eslint resources/js` sem novas supressões (código limpo, sem workarounds)

- **Critérios de aceite:**
  - [ ] `grep -r "'institucional\." resources/js` retorna 0 linhas
  - [ ] `grep -r '"institucional\.'` resources/js` retorna 0 linhas (double quotes)
  - [ ] Todas as ocorrências foram substituídas por `'administrativo.*'` ou `"administrativo.*"` correspondente
  - [ ] Nenhuma lógica condicional quebrada por falta de rota (ex.: componente esperava rota que agora tem nome diferente, mas deixou de verificar sintaxe)
  - [ ] `npx tsc --noEmit` limpo
  - [ ] `npx prettier --write` aplicado em todos os arquivos tocados (consistência de formatação)

---

## S7-FE-02 — Verificação de rótulos visuais e breadcrumbs que mencionam "Institucional"

- **Objetivo:** Garantir que nenhuma tela, breadcrumb, menu de navegação ou link visível ao usuário exibe o rótulo "Institucional" num contexto onde o termo agora é impreciso (ex.: Gestor de Unidade navegando em `/administrativo/modulos` não deveria ver "Institucional" na UI — deveria ver "Administrativo" ou deixar o contexto claro).

- **Caso de uso:** UX — coerência visual com o novo nome de rota

- **Atores envolvidos:** Qualquer usuário navegando em `/administrativo/*`

- **Partes afetadas:**
  - `resources/js/constants/` — labels e i18n keys
  - `resources/js/presentation/pages/Administrativo/` — strings literais em componentes
  - `resources/js/presentation/components/` — breadcrumbs, menus, títulos de página
  - `resources/js/contracts/` — se houver enum de "tipo de seção" que mencionava "institucional"

- **Depende de:** S7-FE-01 (referências de rota devem estar atualizadas primeiro)

- **Riscos relacionados:** UX confusa — usuário vê "Institucional" mas não é institucional

- **Casos de teste obrigatórios:**
  1. **Teste Manual de UI:** Navegar para `/administrativo/modulos` como `gestor_unidade` e verificar que no mínimo a página não está etiquetada como "Institucional"
  2. **Teste de String:** `grep -r "Institucional" resources/js/presentation/pages/Administrativo` — verificar contexto de cada match (alguns podem ser históricos ou comentários)

- **Critérios de aceite:**
  - [ ] Nenhum breadcrumb exibe "Institucional" quando o usuário atual é `gestor_unidade`
  - [ ] Títulos de página em `/administrativo/*` não fazem confusão de semântica (podem ser genéricos como "Gerenciamento de Módulos")
  - [ ] Menus de navegação refletem o novo nome visualmente (se havia seção chamada "Institucional" no menu, revisar se deve ser renomeada)
  - [ ] Checagem manual de strings: qualquer menção a "Institucional" em `Administrativo/*` está em comentário ou é intencional (ex.: "Apenas Institucional pode deletar")
  - [ ] `npx eslint resources/js --suppressions-location <(echo '{}')` sem novas supressões

---

## S7-FE-03 — Revisão final de páginas compartilhadas e auditoria de checklist de composição

- **Objetivo:** Confirmar que todas as telas dentro de `/administrativo/*` (Instituições, Unidades, Módulos, Setores, Espaços, Usuários, Roles, Relatórios) já seguem o princípio de composição por permission conforme definido em `docs/v2.0/03-arquitetura/02-frontend.md`, ou documentar desvios.

- **Caso de uso:** P-21 (closed) — consolidação retroativa. Não é implementação nova, é auditoria de conformidade.

- **Atores envolvidos:** Revisor (arquitetura)

- **Partes afetadas:**
  - `resources/js/presentation/pages/Administrativo/` (8 grupos de tela)
  - `resources/js/presentation/components/` (componentes compartilhados usados nessas telas)
  - Estrutura de autorização no backend (correlato em S7-BE-01, S7-BE-02)

- **Depende de:** S7-FE-01, S7-FE-02 (contexto de nomes deve estar claro)

- **Riscos relacionados:** Regressão de composição — uma tela que deveria ser compartilhada entre `institucional` e `gestor_unidade` está hardcoded para um papel só

- **Casos de teste obrigatórios:**
  1. **Teste de Checklist Manual:** Revisar cada página em `Administrativo/*` contra o checklist de §4 (documento 06) — documentar cada um como "✅ Pronto" ou "🔴 Desvio"
  2. **Teste de Renderização Condicional:** Cada bloco que deveria ser condicional (ex.: `<Can permission="...">`) está renderizado de forma condicional no código
  3. **Teste de Exclusão de Papel:** Nenhuma página em `Administrativo/*` hardcoda `if (role === 'institucional')` — todas usam `<Can>` ou `useCan()`

- **Critérios de aceite:**
  - [ ] Checklist de composição preenchido para todas as 8 telas / grupos de tela em `Administrativo/*`
  - [ ] Nenhuma tela usa `role ===` para decidir renderização de conteúdo administrativo (grep: `if.*role.*===.*institucional` ou similar deve retornar 0 em `Administrativo/`)
  - [ ] Qualquer desvio encontrado está documentado com justificativa (ex.: "Esta tela permanece exclusiva de Institucional porque...")
  - [ ] Se desvios existem e não foram corrigidos, criar issue separada para ciclo futuro (não bloqueia este sprint)
  - [ ] Documentação (`docs/v2.0/03-arquitetura/02-frontend.md`) está alinhada com o estado do código

---

## Checklist de Conclusão da Trilha Frontend

- [ ] S7-FE-01 implementado e testado — 51 referências atualizadas
- [ ] S7-FE-02 auditoria concluída — rótulos visuais coerentes
- [ ] S7-FE-03 auditoria de composição concluída — páginas compartilhadas confirmadas
- [ ] `npx tsc --noEmit` — exit code 0
- [ ] `npx jest` — 100% verde (se houver testes que referenciam nomes de rota)
- [ ] `npx eslint resources/js --suppressions-location <(echo '{}')` — sem novas supressões
- [ ] `npx prettier --write resources/js` aplicado
