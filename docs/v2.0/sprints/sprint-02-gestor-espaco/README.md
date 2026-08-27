# Sprint 2 — Gestor de Espaço

## Objetivo

Implementar o papel **Gestor de Espaço** (`gestor_espaco`) como ator responsável pela manutenção de infraestrutura e pela aprovação de reservas em regime de urgência. Esse sprint estabelece os alicerces de dois subsistemas: (1) o algoritmo de **precedência de gestores** (override direto > padrão do módulo > órfão) e (2) a **aprovação de urgência** com validação de expediente do setor.

---

## O Que Este Sprint Entrega

✅ **Role `gestor_espaco`** (system role, `is_system = true`)

✅ **Schema completo:**
- Tabela `modulo_gestores_espaco` (padrão por módulo)
- Tabela `espaco_gestores_espaco` (override direto por espaço)
- Relations Eloquent em `Modulo`, `Espaco`, `User`

✅ **Algoritmo de precedência** (`EspacoRepositoryInterface::getGestoresDeEspaco()`)
- Override sempre vence
- Se vazio, cai no padrão do módulo
- Se ambos vazios, espaço é órfão

✅ **Algoritmo inverso** (`EspacoRepositoryInterface::getEspacosGeridosPorGestorEspaco()`)
- Com **subtração crítica**: `NOT IN (SELECT espaco_id FROM espaco_gestores_espaco)` para excluir espaços com override de outro gestor
- Teste de regressão obrigatório (R-02)

✅ **Autorização escopada:**
- `ModuloPolicy::gerenciarGestoresEspaco()` — institucional ou gestor_unidade do campus
- `EspacoPolicy::gerenciarGestorEspacoDireto()` — institucional ou gestor_unidade do campus

✅ **Endpoints de gestão:**
- `POST/PATCH /institucional/modulos/{modulo}/gestores-espaco` + Request com validação
- `POST/PATCH /institucional/espacos/{espaco}/gestor-espaco-direto` + Request com validação

✅ **Painel de espaços órfãos** (`EspacoOrfaoController`):
- Lista detalhada escopada para Gestor de Unidade
- Agregado por campus para Institucional (dois endpoints distintos, não o mesmo com filtro)

✅ **Notifications** (`ShouldQueue` obrigatório):
- `UserAssignedAsEspacoManagerNotification` (atribuição)
- `UserRemovedAsEspacoManagerNotification` (remoção)

✅ **Permissions novas:**
- `espacos.visualizar-inventario-proprio`
- `secao.dashboard-gestor-espaco`
- `secao.gestao-orfaos-espaco`
- `modulos.gerenciar-gestores-espaco`
- `espacos.gerenciar-gestor-espaco-direto`

---

## O Que Este Sprint NÃO Entrega

❌ **Approval de urgência** — fica para Sprint 5 (depende da expansão de `Setor` com expediente, que é Sprint 4)

❌ **Alteração de `ReservaPolicy`** — nenhuma mudança em autorização de avaliação de reservas neste sprint

❌ **QR Code e tutorial assistido** — artefato backend de `TipoChamado`, mas sem UI

---

## Definição de Versão Estável

Ao fim do sprint, `develop` deve estar **deployável** mesmo com a v2.0 incompleta:

- [ ] Todas as 3 tabelas pivot criadas e testadas (migrations + seeds vazias para dados iniciais)
- [ ] `getGestoresDeEspaco()` e `getEspacosGeridosPorGestorEspaco()` implementados, com **teste de regressão obrigatório** para R-02 (`test_override_exclui_espaco_do_padrao_do_modulo`)
- [ ] Policies escopadas verdes com testes de autorização (2 campi, 2 gestores distintos)
- [ ] Endpoints de gestão de gestores funcionais, com validação de Request
- [ ] Painel de órfãos retornando dados corretos (lista × agregado)
- [ ] Notifications disparadas em `try-catch` dentro de Job (regra inviolável)
- [ ] Nenhuma page do frontend refaz `role ===` em código novo (REGRAS_INVIOLAVEIS_E_PADROES.md §4.3)
- [ ] `npx tsc --noEmit`, `npx jest`, `docker exec -e APP_ENV=testing ... php artisan test` — 100% verde
- [ ] `npx eslint resources/js --suppressions-location <(echo '{}')` — nenhuma supressão nova

**Nota:** O Gestor de Unidade (Sprint 1) **deve** estar concluído e mergeado — este sprint reaproveita `getUnidadesGeridasPor()` para escopar a atribuição de Gestor de Espaço.

---

## Dependências

- **Sprint 1 (Gestor de Unidade)** — BLOQUEANTE
  - `getUnidadesGeridasPor(int $userId): Collection` já deve existir em `UnidadeRepositoryInterface`
  - Role `gestor_unidade` já deve estar criado
  - Policies de `Modulo`, `Setor`, `Espaco` já devem estar escopadas por unidade

---

## Links para Documentação

- **Modelo de dados + algoritmos:** [`../../02-fluxos-e-diagramas/04-modelo-de-dados.md`](../../02-fluxos-e-diagramas/04-modelo-de-dados.md)
- **Detalhamento técnico (schemas, relations, precedência):** [`../../auditoria-gestores-unidade-espaco/03-modelagem-dados-vinculos-precedencia.md`](../../auditoria-gestores-unidade-espaco/03-modelagem-dados-vinculos-precedencia.md) § 2.2, 2.3, 3, 3.1, 6
- **Componentes backend/frontend esperados:** [`../../auditoria-gestores-unidade-espaco/06-impacto-paginas-componentes-backend-frontend.md`](../../auditoria-gestores-unidade-espaco/06-impacto-paginas-componentes-backend-frontend.md) § 1, 2.3
- **Matriz de riscos (R-02 — precedência):** [`../../auditoria-gestores-unidade-espaco/07-matriz-riscos-lacunas-perguntas-abertas.md`](../../auditoria-gestores-unidade-espaco/07-matriz-riscos-lacunas-perguntas-abertas.md) § 1
- **Regras invioláveis do projeto:** [`../../00-visao-geral/04-regras-invioaveis.md`](../../00-visao-geral/04-regras-invioaveis.md)

---

## Estrutura de Entrega

```
sprint-02-gestor-espaco/
├── README.md           ← você está aqui
├── backend/
│   └── BACKLOG.md      ← 13 tasks (S2-BE-01 a S2-BE-13)
├── frontend/
│   └── BACKLOG.md      ← criado por outro agente
└── integracao/
    └── BACKLOG.md      ← criado por outro agente
```

---

## Notas para Executores

1. **Risco R-18 — Sequenciamento de Permissions:** As rotas administrativas são liberadas por `middleware(['permission:secao.gestao-*'])`. O `gestor_unidade` ganha essas permissions **já neste sprint**, mas elas só devem ser **concedidas ao role** (em S2-BE-13) **após** a Fase de Policies escopadas estar completa (S2-BE-08). Não mergear a concessão da permission antes do filtro estar em produção — senão o Gestor de Unidade enxergaria os 3 campi.

2. **Teste de Regressão R-02:** A task S2-BE-06 marca esse risco com destaque. O teste `test_override_exclui_espaco_do_padrao_do_modulo` deve estar incluído na suíte de regressão antes do merge — é a garantia de que o algoritmo inverso nunca vai deixar "escapar" espaços com override para o dashboard do gestor padrão.

3. **Defesa em Profundidade:** Copie o padrão de `AvaliarReservaJob.php` — o endpoint de alteração de gestores deve sempre refilter a posse na query de escrita, redundante com a Policy. Nunca confie só na autorização em memória.
