# Sprint 3 — Dashboard Composto

**Status:** Backlog · **Duração estimada:** 3–4 semanas · **Trilhas:** Backend, Frontend, Integração

---

## Objetivo

Substituir o dashboard atual — que usa **cascata exclusiva** (match/if-elseif escolhendo **uma única** página por precedência de papel) — por um dashboard **único com composição aditiva**, onde cada bloco renderiza condicionalmente conforme a **permission** do usuário autenticado. Isso elimina o efeito colateral atual: um usuário `institucional` que também é gestor de agendas nunca vê suas reservas pendentes (o bloco institucional vence e os dados de gestor nem sequer são consultados).

---

## O Que Entrega Este Sprint

1. ✅ **Refatoração de `HomeController::index()`** — de `match(true)` elegendo 1 de 3 views, para render único de `Dashboard/DashboardPage.tsx`
2. ✅ **Refatoração de `HomeService::getDashboardData()`** — de `if/elseif` retornando 1 bloco, para **merge aditivo** dos blocos aplicáveis
3. ✅ **Extração e adaptação de métodos de bloco** — `getInstitucionalData()`, `getGestorData()`, `getUserData()` + **2 métodos novos** (`getGestorUnidadeData()`, `getGestorEspacoData()`)
4. ✅ **Página React única** — `Dashboard/DashboardPage.tsx` com 5 organisms condicionais (um por permission)
5. ✅ **Remoção de páginas irmãs** — `DashboardInstitucionalPage.tsx`, `DashboardGestorPage.tsx`, `DashboardUsuarioPage.tsx`
6. ✅ **Validação de contagem de queries** — mitigação de R-17 (performance do dashboard composto com múltiplos papéis)
7. ✅ **Teste de multi-papel** — prova que um usuário com 2+ papéis vê TODOS os blocos simultaneamente (correção do efeito colateral pré-existente)

---

## O Que NÃO Entrega Este Sprint

❌ **Widget de aprovação de urgência** (`WidgetAprovacaoUrgencia`) — é Sprint 5. Este sprint limita-se aos blocos "básicos" de cada papel:
- Institucional: visão macro (contadores)
- Gestor de Reserva: reservas para avaliar
- Gestor de Unidade: painel básico (totais de estrutura do campus)
- Gestor de Espaço: lista dos espaços sob responsabilidade
- Comum: minhas reservas (sempre presente)

---

## Definição de Versão Estável

Ao fim deste sprint, `develop` deve estar **deployável em produção** com a seguinte garantia:

> **Nenhum usuário perde acesso a um dado que via antes.** Um usuário multi-papel (ex.: `institucional` + `gestor` de agendas) vê **simultaneamente** todos os blocos aos quais tem permission — nunca mais blocos sendo ocultados por precedência de papel.

Validações obrigatórias:
- [ ] Teste com usuário `institucional` + `gestor` confirma ambos blocos visíveis
- [ ] Teste com usuário `comum` vê apenas `WidgetMinhasReservas`
- [ ] Teste com cada papel isolado vê bloco único + `WidgetMinhasReservas`
- [ ] Query count não dispara queries de blocos que o usuário não pode ver
- [ ] Nenhuma regressão em rota ou permissão do dashboard existente

---

## Dependências

- ✅ **Sprint 1** (`sprint-01-gestor-unidade`) — `getUnidadesGeridasPor()` e modelo de dados de unidade
- ✅ **Sprint 2** (`sprint-02-gestor-espaco`) — `getEspacosGeridosPorGestorEspaco()` e modelo de dados de espaço  
- ✅ **Dados e Schema já presentes** — permissões `secao.dashboard-gestor-unidade` e `secao.dashboard-gestor-espaco` já existem (ou são criadas nos sprints 1/2)

---

## Links Estratégicos

- **Diagrama de consolidação (antes/depois):** [`docs/v2.0/02-fluxos-e-diagramas/05-fluxos-e-diagramas.md`](../../02-fluxos-e-diagramas/05-fluxos-e-diagramas.md#10-novo-consolidação-do-dashboard-cascata-exclusiva-composição-aditiva-p-21) (§10)
- **Transformação de código necessária:** [`docs/auditoria-gestores-unidade-espaco/06-impacto-paginas-componentes-backend-frontend.md`](../../../auditoria-gestores-unidade-espaco/06-impacto-paginas-componentes-backend-frontend.md#04-novo-o-que-a-consolidação-exige-no-backend-achado-de-código) (§0.4)
- **Risco de performance R-17:** [`docs/auditoria-gestores-unidade-espaco/07-matriz-riscos-lacunas-perguntas-abertas.md`](../../../auditoria-gestores-unidade-espaco/07-matriz-riscos-lacunas-perguntas-abertas.md#1-matriz-de-riscos) (matriz de riscos, linha R-17)
- **Exemplo de código composto:** [`docs/auditoria-gestores-unidade-espaco/06-impacto-paginas-componentes-backend-frontend.md`](../../../auditoria-gestores-unidade-espaco/06-impacto-paginas-componentes-backend-frontend.md#02-exemplo-concreto-dashboard-único-substitui-a-proposta-anterior-de-2-páginas-separadas) (§0.2)

---

## Ordem de Execução Dentro do Sprint

```
1. Backend (S3-BE-01 a S3-BE-05) — estabelece o payload e o escopo
   ↓
2. Frontend (S3-FE-01 a S3-FE-07) — consome payload, monta UI
   ↓
3. Integração (S3-INT-01 a S3-INT-04) — valida o conjunto
```

Backend e Frontend **podem começar em paralelo** assim que os contratos de dados (`resources/js/contracts/`) estiverem definidos.

---

## Observações Importantes

- **Composição por permission, nunca por role:** o frontend usa `<Can permission="secao.dashboard-gestor-unidade">`, nunca `if (hasRole('gestor_unidade'))` — regra inviolável §4.3 de [`docs/v2.0/00-visao-geral/04-regras-invioaveis.md`](../../00-visao-geral/04-regras-invioaveis.md)
- **Bloco a bloco sob condição:** `HomeService` monta o payload verificando permission a cada bloco, **nunca disparando queries de blocos que o usuário não pode ver** (mitigação de R-17)
- **Métrica de "gestores" revisada:** em `getInstitucionalData()`, a contagem hoje mistura papéis distintos (`gestor`, `gestor_espaco`, `gestor_unidade`). S3-BE-04 separa as contagens.
