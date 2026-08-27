# 01 — Casos de Uso Existentes (UC-01 a UC-12)

Este documento detalha os 12 casos de uso que já existem no sistema 1.x e como a v2.0 impacta cada um com a introdução dos novos atores: Gestor de Unidade e Gestor de Espaço.

---

### UC-01: Cadastro, Autenticação, Verificação de E-mail

- **Atores hoje:** Visitante/Comum
- **Impacto dos novos atores:** Nenhum
- **Grau:** 🟢 Nulo

---

### UC-02: Consulta, Filtragem e Favoritos de Espaços

- **Atores hoje:** Comum, Gestor, Institucional
- **Impacto dos novos atores:** Nenhum na consulta em si; pode ganhar badge "Gestor de Espaço: fulano" na ficha do espaço
- **Grau:** 🟢 Baixo

---

### UC-03: Solicitação de Reserva

- **Atores hoje:** Comum
- **Impacto dos novos atores:** Nenhum — fluxo de reserva não muda
- **Grau:** 🟢 Nulo

---

### UC-04: Detecção Assíncrona de Conflitos

- **Atores hoje:** Sistema
- **Impacto dos novos atores:** Nenhum
- **Grau:** 🟢 Nulo

---

### UC-05: Edição/Cancelamento de Reserva

- **Atores hoje:** Comum
- **Impacto dos novos atores:** Nenhum
- **Grau:** 🟢 Nulo

---

### UC-06: Avaliação de Reservas pelo Gestor

- **Atores hoje:** Gestor de Reserva
- **Impacto dos novos atores:** Atualizado nesta rodada: o fluxo normal (`viewForGestor`) continua intocado, mas o Gestor de Espaço ganha um caminho de **exceção** (UC-21, aprovação em regime de urgência) restrito aos espaços que ele gerencia. Gestor de Unidade continua sem qualquer participação.
- **Grau:** 🟡 Médio

---

### UC-07: Notificações em Tempo Real

- **Atores hoje:** Sistema, Comum, Gestor
- **Impacto dos novos atores:** Precisa notificar também Gestor de Espaço (mudança de atribuição) e Gestor de Unidade (espaço órfão no seu campus)
- **Grau:** 🟡 Médio

---

### UC-08: Gestão da Estrutura Física Institucional

- **Atores hoje:** Institucional
- **Impacto dos novos atores:** **Máximo** — deixa de ser prerrogativa operacional do Institucional e passa a ser conduzido pelo Gestor de Unidade, escopado por `unidade_id` (P-05/06). Institucional mantém a capacidade apenas como bootstrap/exceção (P-22). Exige reescrever a resolução de escopo em 5 controllers + `UserService` (ver documento 07, §2.1)
- **Grau:** 🔴 Crítico

---

### UC-09: Atribuição de Agendas de Espaço por Turno

- **Atores hoje:** Institucional
- **Impacto dos novos atores:** Passa a ser feito também pelo Gestor de Unidade dentro do seu campus
- **Grau:** 🟡 Médio

---

### UC-10: Gestão de Usuários, Papéis e Permissões

- **Atores hoje:** Institucional
- **Impacto dos novos atores:** 2 roles a mais na lista de atribuição **+ novo campo `tipo_vinculo`** no cadastro/edição de usuário (P-16)
- **Grau:** 🟡 Médio

---

### UC-11: Extração/Exportação de Relatórios

- **Atores hoje:** Gestor, Institucional
- **Impacto dos novos atores:** Precisa de novo escopo (`aplicarEscopo`) para Gestor de Unidade e Gestor de Espaço
- **Grau:** 🟡 Médio

---

### UC-12: Painéis de Controle e Dashboards

- **Atores hoje:** Comum, Gestor, Institucional
- **Impacto dos novos atores:** **Alto** — não são "2 dashboards novos": por decisão P-21, o `match(true)` mutuamente exclusivo de `HomeController` e o `if/elseif` de `HomeService` são substituídos por **composição aditiva** de blocos. Ver documento 06, §0.4
- **Grau:** 🔴 Alto

---

## Resumo: Matriz de Impacto (UC-01 a UC-12)

| UC | Nome | Grau |
|---|---|:---:|
| UC-01 | Cadastro, Autenticação, Verificação de E-mail | 🟢 Nulo |
| UC-02 | Consulta, Filtragem e Favoritos de Espaços | 🟢 Baixo |
| UC-03 | Solicitação de Reserva | 🟢 Nulo |
| UC-04 | Detecção Assíncrona de Conflitos | 🟢 Nulo |
| UC-05 | Edição/Cancelamento de Reserva | 🟢 Nulo |
| UC-06 | Avaliação de Reservas pelo Gestor | 🟡 Médio |
| UC-07 | Notificações em Tempo Real | 🟡 Médio |
| UC-08 | Gestão da Estrutura Física Institucional | 🔴 Crítico |
| UC-09 | Atribuição de Agendas de Espaço por Turno | 🟡 Médio |
| UC-10 | Gestão de Usuários, Papéis e Permissões | 🟡 Médio |
| UC-11 | Extração/Exportação de Relatórios | 🟡 Médio |
| UC-12 | Painéis de Controle e Dashboards | 🔴 Alto |

**Destaques de impacto crítico:**

- **UC-08 (🔴 Crítico):** Refactoring operacional de toda gestão de estrutura física — passa de prerrogativa exclusiva do Institucional para condução principal pelo Gestor de Unidade, com Institucional mantendo apenas bootstrap e exceções. Reescreve 5 controllers e UserService.

- **UC-12 (🔴 Alto):** Abandona o padrão de dashboards mutuamente exclusivos (`match(true)`) em favor de composição aditiva de blocos dinâmicos — cada ator enxerga seu próprio widget sem exclusão de outros.

Casos com impacto **🟡 Médio** (UC-06, UC-07, UC-09, UC-10, UC-11) exigem extensões menores: novos canais de notificação, escopamento adicional e um novo campo de taxonomia (`tipo_vinculo`).
