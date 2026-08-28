# Matriz de Rastreabilidade UC × Sprint × Task × Risco

> **Documento de referência cruzada.** Permite navegar entre Casos de Uso, Sprints, Tasks e Riscos mapeados na documentação preparatória da v2.0.
>
> **Origem:** Consolidação dos backlogs detalhados (8 sprints, 3 trilhas cada) + índice de casos de uso + catálogo de riscos.

---

## Como Usar Esta Matriz

Navegue pelo documento conforme sua necessidade:

- **Preciso implementar UC-15 (CRUD escopado):** consulte a "Matriz UC × Sprint" para saber que está no Sprint 1, depois leia o backlog do sprint para o contexto completo.
- **Quero mitigar R-18 (sequenciamento de permissions):** consulte a "Matriz de Riscos Críticos" para ver que Sprint 1 é o responsável pelas tasks S1-BE-01 a S1-BE-13 que o endereçam.
- **Preciso entender a cobertura do Sprint 5:** consulte a "Cobertura por Sprint" para ver quantas tasks ele inclui e quais UCs/riscos ele toca.

---

## Matriz UC × Sprint

| UC | Nome Curto | Sprint(s) | Tasks-Chave | Impacto |
|---|---|---|---|---|
| UC-01 | Cadastro, Autenticação, Verificação de E-mail | — | Nenhuma (existente, sem mudança em v2.0) | Nulo |
| UC-02 | Consulta, Filtragem e Favoritos de Espaços | — | Nenhuma (existente, sem mudança em v2.0) | Baixo |
| UC-03 | Solicitação de Reserva | — | Nenhuma (existente, sem mudança em v2.0) | Nulo |
| UC-04 | Detecção Assíncrona de Conflitos | — | Nenhuma (existente, sem mudança em v2.0) | Nulo |
| UC-05 | Edição/Cancelamento de Reserva | — | Nenhuma (existente, sem mudança em v2.0) | Nulo |
| UC-06 | Avaliação de Reservas pelo Gestor | — | Nenhuma (existente; exceção em UC-21-A/B) | Médio |
| UC-07 | Notificações em Tempo Real | — | Nenhuma (existente, sem mudança em v2.0) | Médio |
| UC-08 | Gestão da Estrutura Física Institucional | Sprint 1 | S1-BE-07, S1-BE-08, S1-BE-09 | Crítico |
| UC-09 | Atribuição de Agendas de Espaço por Turno | Sprint 1 | S1-BE-10, S1-FE-05, S1-FE-06 | Médio |
| UC-10 | Gestão de Usuários, Papéis e Permissões | Sprint 0 | S0-BE-01, S0-BE-02, S0-BE-03 | Médio |
| UC-11 | Extração/Exportação de Relatórios | Sprint 1, 2 | S1-BE-09, S2-INT-06 | Médio |
| UC-12 | Painéis de Controle e Dashboards | Sprint 1, 2, 3 | S3-BE-01, S3-BE-02, S3-FE-01, S3-FE-07 | Alto |
| UC-13 | Atribuição de Gestor de Unidade | Sprint 1 | S1-BE-10, S1-FE-06, S1-INT-04 | Novo |
| UC-14 | Atribuição de Gestor de Espaço | Sprint 2 | S2-BE-01 a S2-BE-03, S2-FE-05, S2-INT-02 | Novo |
| UC-15 | CRUD Escopado de Estrutura Física por Gestor de Unidade | Sprint 1 | S1-BE-07, S1-BE-08, S1-BE-09, S1-INT-03 | Novo |
| UC-15-B | Bootstrap de Unidade Recém-Criada | Sprint 1 | S1-BE-10, S1-INT-04 | Novo |
| UC-16 | Bloco de Dashboard do Gestor de Unidade | Sprint 1, 3 | S3-FE-05, S3-BE-05 | Novo |
| UC-17 | Bloco de Dashboard do Gestor de Espaço | Sprint 2, 3 | S3-FE-06, S3-BE-05 | Novo |
| UC-18 | Espaços Órfãos — Duas Profundidades Distintas | Sprint 2, 3 | S2-FE-08, S2-INT-06, S3-INT-04 | Novo |
| UC-19 | Relatórios Escopados por Unidade | Sprint 2 | S2-BE-01, S2-INT-06 | Novo |
| UC-20 | Visão Institucional "Macro" Consolidada Entre Campi | Sprint 3 | S3-BE-01, S3-FE-02 | Novo |
| UC-21-A | Aprovação de Urgência sobre Reserva Já Existente | Sprint 5 | S5-BE-08, S5-FE-04, S5-INT-01 | Novo |
| UC-21-B | Criação Assistida de Reserva no Balcão | Sprint 5 | S5-BE-09, S5-FE-05, S5-INT-05 | Novo |
| UC-22 | Report de Problema via QR Code com Tutorial Assistido | Sprint 6 | S6-BE-06, S6-FE-02, S6-INT-05 | Novo |
| UC-23 | Cadastro/Edição de Usuário com Tipo de Vínculo | Sprint 5 | S5-BE-01, S5-BE-02, S5-FE-03 | Novo |
| UC-24 | Designação de Coordenador e Configuração de Expediente do Setor | Sprint 4 | S4-BE-04, S4-BE-05, S4-BE-06, S4-BE-09, S4-FE-01 | Novo |

---

## Matriz de Riscos Críticos × Tasks Mitigadoras

Para cada risco crítico, as tasks principais que endereçam sua mitigação:

| Risco | Descrição Curta | Sprint | Tasks Mitigadoras | Estratégia |
|---|---|---|---|---|
| **R-01** | IDOR: Gestor de Unidade/Espaço consegue operar recurso de outro campus via URL direta | Sprint 1, 2 | S1-BE-07, S1-BE-08, S1-BE-09, S2-BE-01, S2-BE-02 | Policy escopada por `unidade_id` em todas as entidades administrativas |
| **R-02** | Falta de sincronização entre backend (Policy) e frontend (UI) | Sprint 1, 2, 3 | S1-FE-04, S2-FE-04, S3-FE-01 | Contrato SSOT (frontend) + cobertura de teste de autorização |
| **R-09** | Urgência baseada em confiança, não verificável; risco de abuso | Sprint 4, 5 | S4-BE-04 (expediente verificável), S5-BE-07, S5-INT-02 | Validação automática contra `ExpedienteService::estaEmExpediente()` |
| **R-12** | NPE em `Auth::user()->setor->unidade->instituicao_id` quando `setor_id` nulo | Sprint 0 | S0-BE-01, S0-BE-02 | Helper null-safe + aplicação nos 5 controllers |
| **R-16** | Permissions órfãs criando confusão na administração de roles | Sprint 0 | S0-BE-03, S0-FE-01 | Remoção de `andares.criar`/`andares.atualizar` + atualização de labels |
| **R-17** | Dashboard escondendo dados de usuários que acumulam papéis (cascata exclusiva) | Sprint 3 | S3-BE-01, S3-BE-02, S3-FE-01, S3-INT-01 | Composição aditiva por permission, renderização condicional por bloco |
| **R-18** | Sequenciamento de permissions: conceder `secao.gestao-*` sem Policy escopada cria janela de exposição | Sprint 1 | S1-BE-07, S1-BE-08, S1-BE-09, S1-BE-13, S1-INT-02 | **Bloco atômico** — Policies implementadas antes (ou com) concessão de permissões |
| **R-20** | Expediente indeterminado bloqueia visibilidade de status operacional dos setores | Sprint 4 | S4-BE-10 (indicador no dashboard), S4-FE-04 | Indicador gradual no dashboard do Gestor de Unidade mostrando setores sem expediente |
| **R-21** | Coordenador de setor consegue mover o setor para outro campus via edição de `unidade_id` | Sprint 4 | S4-BE-09, S4-INT-03 | Policy delimitada por campo — coordenador edita apenas expediente, nunca `unidade_id` |
| **R-22** | Alterações secretas no expediente viram controle indireto do portão de urgência | Sprint 4 | S4-BE-08, S4-INT-05 | Trilha de auditoria em todas as alterações de expediente (modelo de eventos) |

---

## Cobertura por Sprint

Resumo de entrega, contagem de tasks e riscos mitigados:

| Sprint | Objetivo Principal | Total de Tasks | Backend | Frontend | Integração | UCs Cobertos | Riscos Endereçados |
|---|---|---|---|---|---|---|---|
| **S0** | Preparação: Bug R-12 + permissions órfãs | 6 | 3 | 1 | 2 | UC-10 | R-12, R-16 |
| **S1** | Gestor Unidade: roles + schema + policies (🔴 bloco atômico) | 27 | 13 | 8 | 6 | UC-08, UC-09, UC-13, UC-15, UC-15-B, UC-16 | R-01, R-02, R-18 |
| **S2** | Gestor Espaço: pivots + precedência + atribuição + órfãos | 27 | 13 | 8 | 6 | UC-14, UC-17, UC-18, UC-19 | R-01, R-02 |
| **S3** | Dashboard Composto: composição aditiva HomeController + HomeService | 16 | 5 | 7 | 4 | UC-12, UC-16, UC-17, UC-18, UC-20 | R-17 |
| **S4** | Setor Expandido: coordenador + expediente + exceções | 19 | 10 | 4 | 5 | UC-24 | R-09, R-20, R-21, R-22 |
| **S5** | Aprovação Urgência: tipo_vinculo + Fluxos A e B + validação de expediente | 27 | 12 | 8 | 7 | UC-21-A, UC-21-B, UC-23 | R-09 |
| **S6** | QR Code + Chamados: reconciliação PR #397 + tutorial + gestores de espaço | 19 | 9 | 5 | 5 | UC-22 | — |
| **S7** | Consolidação Retroativa: rename `/institucional/` → `/administrativo/` + páginas compartilhadas | 10 | 3 | 3 | 4 | — | — |
| **TOTAL** | **8 sprints consolidam 24 UCs e mitigam 10 riscos críticos** | **151** | **68** | **44** | **39** | **24 UCs** | **10 riscos críticos** |

> Contagens validadas via `grep -cE '^#{2,3} \[?S[0-9]+-(BE|FE|INT)-[0-9]+\]?'` em cada `BACKLOG.md` — não são estimativas.

---

## Dependências Entre Sprints e Riscos

### Cadeia de Mitigação Crítica (Caminho mais longo)

```
R-12 (Sprint 0) 
  → R-18 (Sprint 1 — bloco atômico)
    → R-01 (Sprints 1–2 — policies escopadas)
      → R-09 (Sprint 5 — validação contra expediente)
        ← R-20, R-21, R-22 (Sprint 4 — expediente verificável)
```

**Leitura:** o bug R-12 é corrigido primeiramente (Sprint 0), permitindo que Sprint 1 implemente o algoritmo de escopo com segurança. Apenas após Sprints 1–2 estarem consolidados, Sprint 3 pode compor dashboards sem expor dados (R-17). Sprints 4–5 são paralelos: Sprint 4 fornece o expediente verificável (mitigando R-20, R-21, R-22), que Sprint 5 consome para validar urgências contra R-09.

---

## Referências Relacionadas

- [`../README.md`](../README.md) — Visão geral da v2.0 e navegação
- [`../04-roadmap/README.md`](../04-roadmap/README.md) — Grafo de dependências entre sprints
- [`../01-casos-de-uso/README.md`](../01-casos-de-uso/README.md) — Índice de 24 UCs
- [`../sprints/`](../sprints/) — Backlogs detalhados de cada sprint
- [`../00-visao-geral/03-decisoes-consolidadas.md`](../00-visao-geral/03-decisoes-consolidadas.md) — Todas as 43 decisões (P-01..P-34, D-1..D-9) + 23 riscos
