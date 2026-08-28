# Revisão Periódica — Checkpoints de Fim de Sprint

> **Este é um documento vivo.** Registra a saúde do projeto ao encerrar cada sprint — o que funcionou, quais riscos se materializaram, o que ajustar.
> Leia [`./README.md`](./README.md) para entender o processo de registro.

---

## Propósito

A cada fim de sprint, um checkpoint estruturado é registrado aqui:

- **Métrica de progresso:** quantas tasks foram concluídas vs. planejadas.
- **Riscos que se materializaram:** e como foram mitigados.
- **Riscos que não se materializaram:** liberando espaço para rebaixá-los ou remover monitoramento.
- **Ajustes recomendados:** mudanças no roadmap restante, incluindo resequenciamento de sprints.
- **Decisão de prosseguir:** continuar no plano, desacelerar, ou pausar por riscos críticos.

Periodicidade obrigatória: ao fim de **cada sprint**, e principalmente ao fim do **Sprint 1** (bloco atômico crítico).

---

## Exemplo Ilustrativo — Remova ou Substitua pela Primeira Revisão Real

### Revisão — Sprint 1 (Gestor de Unidade) · 2026-10-15

- **Sprints concluídos desde a última revisão:** Sprint 0 (prep/migrations) e Sprint 1 (Gestor de Unidade).
- **Métrica de progresso:** 8 de 8 tasks de backend concluídas (100%); 6 de 7 tasks de frontend (85% — S1-FE-04 adiado por falta de recurso visual); 4 de 5 tasks de integração (80% — testes de PBAC pendentes).
  - **Agregado:** 18 de 20 tasks (90%).
- **Riscos que se materializaram:**
  - **R-18** (sequenciamento de permissions): a policy de Gestor de Unidade nasceu mas com escopo vago. Mitigado: testes de PBAC obrigatórios em Sprint 2 antes de abrir Gestor de Espaço.
  - **R-23** (precedência expediente vs. setor pessoal): confirmado em QA — alguns gestores têm setor diferente de onde administram agendas. Não travou Sprint 1 (era escopo de Sprint 2 em diante), mas recomenda-se adotar a premissa documentada em 03-modelagem (§7.7.3) desde já.
- **Riscos que não se materializaram:**
  - **R-05** (soft-delete de unidade deixando órf ão): padrão de cascade já estava consolidado; não foi surpresa.
  - **R-11** (notificação falhando silenciosamente): `try-catch` na queue funcionou; todos os alertas de falha de e-mail foram capturados em logs.
- **Ajustes recomendados:**
  - S1-FE-04 migrar para Sprint 2 como primeira task (antes de S2-BE-01) — o mockup já está em contratos/i18n, não bloqueia.
  - Triplicar tempo de testes de integração em Sprint 2 — PBAC é crítico (R-18) e o sprint anterior foi leve aqui.
  - Confirmar com Institucional se a "Definição de Versão Estável" de Sprint 1 pode realmente deployar — nenhum teste de fluxo end-to-end de Gestor de Unidade ainda.
- **Decisão de prosseguir:** ✅ Prosseguir com Sprint 2 no plano. Nenhum bloqueador crítico. S1-FE-04 adiado é aceitável (funcionalidade cosmética).

---

## Formato de Entrada (Copie e Adapte)

```markdown
### Revisão — Sprint {N} (Ator/Funcionalidade) · DATA

- **Sprints concluídos desde a última revisão:** (lista de sprints desde a última revisão)
- **Métrica de progresso:** (N de M tasks, porcentagem, breakdown por trilha se relevante)
- **Riscos que se materializaram:** (lista com referência R-XX, como foi mitigado)
- **Riscos que não se materializaram:** (lista, opcionalmente rebaixando para "monitorar só em próximas fases")
- **Ajustes recomendados:** (mudanças no roadmap restante, resequenciamento, alocação de tempo)
- **Decisão de prosseguir:** ✅ Prosseguir / ⚠️ Prosseguir com caução / 🛑 Pausar
```

---

## Histórico de Revisões

(A ser preenchido ao fim de cada sprint.)
