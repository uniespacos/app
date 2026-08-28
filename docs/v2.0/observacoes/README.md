# Observações — Registro de Achados Durante a Implementação

> **Este é um documento vivo.** Será preenchido durante a execução dos sprints, não retrospectivamente.
> Leia [`../README.md`](../README.md) § 4.7 para entender por que o registro em tempo real importa.

---

## Propósito

Durante a implementação da v2.0, acontecerão:
- **Bugs pré-existentes** descobertos enquanto se trabalha em code novo
- **Dúvidas de negócio** que travaram uma task
- **Desvios** do que o backlog previu (arquivo não existe onde se esperava, dependência mudou, abordagem técnica melhor apareceu)
- **Decisões de fim de ciclo** sobre prosseguir, ajustar ou pausar

A pasta `observacoes/` é o lugar para registrar tudo isto **no momento em que acontece**, não no fim do sprint nem no fim do projeto.

### Por Que Registrar Imediatamente?

1. **Contexto se esvai.** Perguntas respondidas hoje são óbvias; esperadas 2 semanas, precisa-se reconstruir a decisão do zero.
2. **Rastreabilidade.** Se um problema só aparece no Sprint 5, mas seria resolvido no Sprint 3, o registro imediato no Sprint 3 evita retrabalho.
3. **Decisões não se repetem.** Se Gestor A resolveu um problema de um jeito, Gestor B terá documentado a solução e não o refará diferente.
4. **Auditoria.** O que mudou desde o plano? Por quê? Quanto custou? Uma pasta vazia no fim é um sinal de que nada foi observado — improvável. Uma pasta cheia é prova de aprendizado.

---

## Tabela de Roteamento

| Situação | Onde Registrar | Quando |
|---|---|---|
| Bug pré-existente descoberto durante o trabalho | [`PROBLEMAS-IDENTIFICADOS.md`](./PROBLEMAS-IDENTIFICADOS.md) | Assim que confirmado (não espere fim de sprint) |
| Dúvida de negócio que **travou** uma task | [`PROBLEMAS-IDENTIFICADOS.md`](./PROBLEMAS-IDENTIFICADOS.md) (marcar como **bloqueante**) | Assim que identificado |
| Arquivo não existe onde a task disse; dependência mudou; abordagem técnica melhor apareceu | [`DESVIOS-E-DECISOES.md`](./DESVIOS-E-DECISOES.md) | No mesmo dia do desvio |
| Revisão de fim de sprint: tarefas concluídas, riscos que se materializaram, ajustes no roadmap | [`REVISAO-PERIODICA.md`](./REVISAO-PERIODICA.md) | Ao encerrar cada sprint |

---

## Formato Padrão de Entrada

Todos os 3 documentos (`PROBLEMAS-IDENTIFICADOS.md`, `DESVIOS-E-DECISOES.md` e `REVISAO-PERIODICA.md`) seguem este padrão:

```markdown
### [DATA] Título curto e descritivo

- **Campo 1:** valor
- **Campo 2:** valor
- **Descrição:** parágrafo com contexto e resolução (quando aplicável)
```

**Campos obrigatórios por tipo:**

- **PROBLEMAS:** Data, Descoberto em (task/sprint), Descrição, Severidade, Status, Resolução
- **DESVIOS:** Data, Task relacionada (ID), O que o backlog previa, O que foi feito, Motivo, Impacto
- **REVISÕES:** Sprint/Data, Sprints concluídos, Métrica de progresso, Riscos materializados, Ajustes recomendados, Decisão

---

## Índice de Documentos

1. **[`PROBLEMAS-IDENTIFICADOS.md`](./PROBLEMAS-IDENTIFICADOS.md)** — Bugs pré-existentes e dúvidas de negócio bloqueantes descobertos durante a implementação.
2. **[`DESVIOS-E-DECISOES.md`](./DESVIOS-E-DECISOES.md)** — Divergências entre o backlog planejado e o que foi realmente feito, com motivos.
3. **[`REVISAO-PERIODICA.md`](./REVISAO-PERIODICA.md)** — Checkpoints de fim de sprint; métrica de progresso, riscos que se materializaram, ajustes recomendados.

---

## Ferramenta de Busca por Decisão

Se você está investigando uma decisão ou risco, use os IDs:

- **UC-XX** — Caso de uso (ex.: UC-21-A = aprovação de urgência, Fluxo A)
- **P-XX** — Decisão de negócio (ex.: P-15 = urgência só no mesmo dia)
- **D-X** — Decisão de implementação (ex.: D-2 = comportamento por estado do expediente)
- **R-XX** — Risco mapeado (ex.: R-18 = sequenciamento de permissions — O MAIS CRÍTICO)
- **S{n}-{trilha}-{nn}** — Task de backlog (ex.: S1-BE-02 = Sprint 1, backend, task 2)

Consulte [`../00-visao-geral/03-decisoes-consolidadas.md`](../00-visao-geral/03-decisoes-consolidadas.md) para a lista completa de decisões rastreadas.

---

## Governança da Pasta

- **Quem preenche:** Agentes executores (backend, frontend, integração) e revisores (master, planner).
- **Frequência:** Contínua durante a implementação.
- **Revisão:** Ao fim de cada sprint, a pasta é auditada como parte de [`REVISAO-PERIODICA.md`](./REVISAO-PERIODICA.md).
- **Arquivo:** Esta pasta faz parte do git — commits levam as observações junto com o código, nunca retroativamente.

---

## Referências

- **Configuração de task:** [`../README.md`](../README.md) § 4.1–4.5
- **Definição de pronto:** [`../README.md`](../README.md) § 4.5
- **Regras invioláveis:** [`../00-visao-geral/04-regras-invioaveis.md`](../00-visao-geral/04-regras-invioaveis.md)
- **Matriz de rastreabilidade:** [`../04-roadmap/matriz-rastreabilidade.md`](../04-roadmap/matriz-rastreabilidade.md)
