# Frontend — Backlog Sprint 0

## S0-FE-01 — Remover rótulos órfãos de permissions em `permission-labels.ts`

- **Objetivo:** Remover as entradas de `andares.criar` e `andares.atualizar` de
  `resources/js/constants/permission-labels.ts`, garantindo que a tela de gerenciamento de Roles não exiba
  permissions inexistentes no backend.

- **Caso de uso:** Nenhum (correção técnica — P-32 fechou a remoção das permissions órfãs).

- **Atores envolvidos:** Nenhum ator específico (correção de infra).

- **Partes afetadas:**
  - `resources/js/constants/permission-labels.ts` (remover 2 entradas)
  - `resources/js/contracts/contracts.test.ts` (se houver validação de contrato sobre as permissions, atualizar para não esperar `andares.criar`/`andares.atualizar`)
  - Validação de grep em `resources/js` para garantir que não há referência residual a `andares.criar` ou
    `andares.atualizar` em nenhum arquivo TypeScript/TSX

- **Depende de:** S0-BE-03 (a permission precisa deixar de existir no backend primeiro, para não haver
  descompasso entre banco e frontend).

- **Riscos relacionados:** P-32.

- **Casos de teste obrigatórios:**
  1. `test_permission_labels_nao_contem_andares_criar` — Validar que `permission-labels.ts` não exporta entrada para `andares.criar`.
  2. `test_permission_labels_nao_contem_andares_atualizar` — Validar que `permission-labels.ts` não exporta entrada para `andares.atualizar`.

- **Critérios de aceite:**
  - [ ] As 2 entradas removidas de `permission-labels.ts`
  - [ ] `npx tsc --noEmit` retorna 0 (sem referências quebradas a essas chaves)
  - [ ] `npx jest` — 100% verde (incluindo testes de contrato)
  - [ ] `grep -r "andares\.(criar|atualizar)" resources/js` retorna vazio (nenhuma referência residual)
  - [ ] Tela de Roles renderiza sem erro e não lista `andares.criar`/`andares.atualizar` em nenhuma linha
  - [ ] `npx eslint resources/js --suppressions-location <(echo '{}')` — sem novas supressões

