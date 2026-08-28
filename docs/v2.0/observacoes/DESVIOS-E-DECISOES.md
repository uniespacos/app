# Desvios e Decisões — Divergências do Plano Original

> **Este é um documento vivo.** Registra toda divergência entre o planejado e o executado, no momento em que ela ocorre.
> Leia [`./README.md`](./README.md) para entender o processo de registro.

---

## Propósito

Nem sempre a implementação segue exatamente o que o backlog propôs. Quando divergências aparecem, elas são registradas aqui com:

- O que a auditoria/backlog previa
- O que foi realmente feito
- Por que mudou
- Impacto em outras tasks

Isso evita surpresas posteriores e documenta a evolução das decisões.

---

## Desvios Ocorridos Durante a Geração da Documentação (Reais)

### [2026-08-28] Divisão da Migration de Roles em Duas Tasks Separadas

- **Task relacionada:** S1-BE-02 (criar role `gestor_unidade`); S2-BE-03 (criar role `gestor_espaco`) no sprint seguinte
- **O que o backlog/auditoria previa:** Única migration `add_gestor_unidade_and_gestor_espaco_roles.php` (§5, item 10 em `auditoria-gestores-unidade-espaco/03-modelagem-dados-vinculos-precedencia.md`) criando ambos os roles juntos em uma só transação.
- **O que foi feito:** Dividida em duas migrations sequenciais — S1-BE-02 cria apenas `gestor_unidade`, S2-BE-03 cria apenas `gestor_espaco` (no Sprint 2).
- **Motivo do desvio:** Cada sprint concentra-se em um ator específico. Sprint 1 traz o Gestor de Unidade à vida (tabelas, migrations, políticas, controllers); Sprint 2 traz o Gestor de Espaço. Manter as duas roles na mesma migration acoplaria os sprints desnecessariamente — um sprint só seria "fechado" quando ambas estivessem ativas, mesmo tendo código que usa apenas uma delas. A divisão mantém cada sprint coeso.
- **Impacto em outras tasks:** Nenhum — a separação é transparente. Ambas as roles usam o mesmo padrão de `is_system = true` e seeding via `RoleSeeder`. Cada sprint pode ser executado independentemente (desde que mantendo a ordem Sprint 1 → Sprint 2 no roadmap). Desfaz-se sem custos: se uma mudança de escopo exigisse voltar atrás, reverter seria tão fácil quanto mesclar as migrations novamente.

---

### [2026-08-28] Matriz de Rastreabilidade Gerada Após, Não Antes, dos BACKLOGs

- **Task relacionada:** N/A (decisão de processo, não uma task específica)
- **O que o backlog/auditoria previa:** Matriz de rastreabilidade (UC × Sprint × Task × Risco) como **insumo** para decisões de sequenciamento — recomendava-se tê-la pronta **antes** de decompor cada sprint em tasks.
- **O que foi feito:** Todos os `BACKLOG.md` dos sprints foram completados primeiro; a matriz foi gerada **depois**, consolidando os dados dos BACKLOGs já prontos.
- **Motivo do desvio:** A matriz precisa referenciar IDs reais de tasks (ex.: `S1-BE-02`, `S2-FE-04`) para ser útil. Gerar a matriz antes significaria usar placeholders (`S1-BE-XX`, `S1-FE-XX`) — uma sobrecarga de abstração que torna a matriz difícil de consultar e mantém uma fonte-únVERDADE duplicada (matriz vs. BACKLOG vs. código real). A sequência real foi: (1) definir escopo dos sprints, (2) decompor em tasks nomeadas e sequenciadas, (3) consolidar referências cruzadas (UC/Risco/Task) na matriz. O resultado é uma matriz simples, direta e rastreável.
- **Impacto em outras tasks:** Positivo — a matriz gerada após tem **referências concretas** que ajudam os executores a validar cobertura e detectar lacunas. Sprints futuros (S6, S7) que ainda não têm BACKLOGs completos podem usar a matriz de sprints já planejados (S1–S5) como guia de coerência, mas não perdem tempo esperando a matriz antes de começar a planejar.

---

## Formato de Entrada (Para Desvios Futuros)

```markdown
### [DATA] Título curto e imperativo

- **Task relacionada:** S{n}-{trilha}-{nn} (ou "N/A" se for decisão de processo)
- **O que o backlog previa:** resumo do plano original
- **O que foi feito:** resumo da execução real
- **Motivo do desvio:** explicação e justificativa (técnica, de negócio, ou de processo)
- **Impacto em outras tasks:** lista de tasks afetadas, ou "Nenhum" se foi isolado
```

---

## Registros Futuros

(A ser preenchido durante a implementação dos sprints.)
