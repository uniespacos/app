# Casos de Uso: Índice Consolidado (UC-01 a UC-24)

## Introdução

Este documento é o **índice centralizado** de todos os 24 casos de uso do UniEspaços v2.0 — tanto aqueles herdados do 1.x (UC-01 a UC-12) com avaliação de impacto da v2.0, quanto os novos (UC-13 a UC-24).

O detalhamento dos **casos existentes** (UC-01 a UC-12) e seu **grau de impacto** para v2.0 está em [`./01-casos-existentes.md`](./01-casos-existentes.md).

O detalhamento dos **casos novos** (UC-13 a UC-24) introduzidos pela v2.0 está em [`./02-casos-novos.md`](./02-casos-novos.md).

---

## Tabela-Índice: UC-01 a UC-24

| ID | Nome | Atores Principais | Impacto* | Link |
|---|---|---|---|---|
| UC-01 | Cadastro, Autenticação, Verificação de E-mail | Visitante, Comum | 🟢 Nulo | [01-casos-existentes.md](./01-casos-existentes.md) |
| UC-02 | Consulta, Filtragem e Favoritos de Espaços | Comum, Gestor, Institucional | 🟢 Baixo | [01-casos-existentes.md](./01-casos-existentes.md) |
| UC-03 | Solicitação de Reserva | Comum | 🟢 Nulo | [01-casos-existentes.md](./01-casos-existentes.md) |
| UC-04 | Detecção Assíncrona de Conflitos | Sistema | 🟢 Nulo | [01-casos-existentes.md](./01-casos-existentes.md) |
| UC-05 | Edição/Cancelamento de Reserva | Comum | 🟢 Nulo | [01-casos-existentes.md](./01-casos-existentes.md) |
| UC-06 | Avaliação de Reservas pelo Gestor | Gestor de Reserva | 🟡 Médio | [01-casos-existentes.md](./01-casos-existentes.md) |
| UC-07 | Notificações em Tempo Real | Sistema, Comum, Gestor | 🟡 Médio | [01-casos-existentes.md](./01-casos-existentes.md) |
| UC-08 | Gestão da Estrutura Física Institucional | Institucional, **Gestor de Unidade** | 🔴 Crítico | [01-casos-existentes.md](./01-casos-existentes.md) |
| UC-09 | Atribuição de Agendas de Espaço por Turno | Institucional, **Gestor de Unidade** | 🟡 Médio | [01-casos-existentes.md](./01-casos-existentes.md) |
| UC-10 | Gestão de Usuários, Papéis e Permissões | Institucional | 🟡 Médio | [01-casos-existentes.md](./01-casos-existentes.md) |
| UC-11 | Extração/Exportação de Relatórios | Gestor, Institucional | 🟡 Médio | [01-casos-existentes.md](./01-casos-existentes.md) |
| UC-12 | Painéis de Controle e Dashboards | Comum, Gestor, Institucional | 🔴 Alto | [01-casos-existentes.md](./01-casos-existentes.md) |
| UC-13 | Atribuição de Gestor de Unidade a uma Unidade | Institucional | novo | [02-casos-novos.md](./02-casos-novos.md) |
| UC-14 | Atribuição de Gestor de Espaço | Institucional, **Gestor de Unidade** | novo | [02-casos-novos.md](./02-casos-novos.md) |
| UC-15 | CRUD Escopado de Estrutura Física por Gestor de Unidade | **Gestor de Unidade**, Institucional | novo | [02-casos-novos.md](./02-casos-novos.md) |
| UC-15-B | Bootstrap de Unidade Recém-Criada | Institucional | novo | [02-casos-novos.md](./02-casos-novos.md) |
| UC-16 | Bloco de Dashboard do Gestor de Unidade | **Gestor de Unidade** | novo | [02-casos-novos.md](./02-casos-novos.md) |
| UC-17 | Bloco de Dashboard do Gestor de Espaço | **Gestor de Espaço** | novo | [02-casos-novos.md](./02-casos-novos.md) |
| UC-18 | Espaços Órfãos — Duas Profundidades Distintas | **Gestor de Unidade**, Institucional | novo | [02-casos-novos.md](./02-casos-novos.md) |
| UC-19 | Relatórios Escopados por Unidade | **Gestor de Unidade**, Gestor, Institucional | novo | [02-casos-novos.md](./02-casos-novos.md) |
| UC-20 | Visão Institucional "Macro" Consolidada Entre Campi | Institucional | novo | [02-casos-novos.md](./02-casos-novos.md) |
| UC-21-A | Aprovação de Urgência sobre Reserva Já Existente | **Gestor de Espaço** | novo | [02-casos-novos.md](./02-casos-novos.md) |
| UC-21-B | Criação Assistida de Reserva no Balcão | **Gestor de Espaço** | novo | [02-casos-novos.md](./02-casos-novos.md) |
| UC-22 | Report de Problema via QR Code com Tutorial Assistido | Comum, **Gestor de Espaço** | novo | [02-casos-novos.md](./02-casos-novos.md) |
| UC-23 | Cadastro/Edição de Usuário com Tipo de Vínculo | Comum, Institucional | novo | [02-casos-novos.md](./02-casos-novos.md) |
| UC-24 | Designação de Responsável e Configuração de Expediente do Setor | **Gestor de Unidade**, Institucional, Responsável Designado | novo | [02-casos-novos.md](./02-casos-novos.md) |

*Coluna "Impacto": aplica-se apenas aos casos existentes (UC-01 a UC-12). Para casos novos, marcado como "novo".

---

## Matriz: Atores × Casos de Uso (Visão Consolidada)

| Caso de Uso | Comum | Gestor de Reserva | Gestor de Espaço | Gestor de Unidade | Institucional |
|---|:---:|:---:|:---:|:---:|:---:|
| UC-01 a UC-05 (reserva, ponta a ponta) | ✅ | — | — | — | — |
| UC-06 (avaliar reserva, fluxo normal) | — | ✅ | — | — | — |
| UC-08/UC-15 (CRUD estrutura física) | — | — | — | ✅ (operador principal) | ✅ (bootstrap/exceção) |
| UC-09/UC-14 (atribuir gestores) | — | — | — | ✅ (escopado) | ✅ (global) |
| UC-13 (atribuir Gestor de Unidade) | — | — | — | — | ✅ |
| UC-15-B (bootstrap de unidade nova) | — | — | — | — | ✅ |
| UC-16 (bloco de dashboard de unidade) | — | — | — | ✅ | — |
| UC-17 (bloco de dashboard de espaço) | — | — | ✅ | — | — |
| UC-18 (órfãos — lista detalhada) | — | — | — | ✅ (seu campus) | — |
| UC-18 (órfãos — indicador analítico) | — | — | — | ✅ | ✅ (todos os campi) |
| UC-19 (relatórios escopados) | — | Parcial | Parcial | ✅ | ✅ |
| UC-20 (BI macro entre campi) | — | — | — | — | ✅ |
| UC-21-A (urgência sobre reserva existente) | — | — | ✅ | — | — |
| UC-21-B (criação assistida no balcão) | — | — | ✅ | — | — |
| UC-22 (report QR Code + tutorial) | ✅ (sem login) | — | ✅ (triagem) | — | — |
| UC-23 (cadastro com tipo de vínculo) | ✅ (auto) | — | — | — | ✅ (administrativo) |
| UC-24 (expediente de setor) | — | — | — | ✅ (designa), Responsável Designado (configura próprio setor) | ✅ (global) |

---

## Destaque: Casos de Maior Impacto e Exceções

### UC-08 e UC-15 — CRUD de Estrutura Física (🔴 Crítico)

O **UC-08** (estrutura física) muda radicalmente de paradigma: deixa de ser prerrogativa exclusiva do **Institucional** e passa a ser operado primariamente pelo **Gestor de Unidade**, escopado por `unidade_id`. O Institucional retém a capacidade apenas como **bootstrap e exceção** (justificativa técnica: uma Unidade recém-criada não tem Gestor de Unidade, logo ninguém poderia configurá-la).

O **UC-15** é a contraparte operacional — CRUD completo (criar, editar, excluir Módulo, Andar, Setor, Espaço) pela mão do Gestor de Unidade. O **UC-15-B** (bootstrap de unidade recém-criada) garante que o Institucional consiga fazer a atribuição inicial do Gestor de Unidade.

### UC-12 — Dashboards (🔴 Alto)

O padrão de painéis muda de `match(true)` mutuamente exclusivo para **composição aditiva de blocos**: Comum vê um dashboard, Gestor de Reserva/Espaço veem widgets próprios, Gestor de Unidade vê bloco consolidado da unidade, e Institucional vê BI macro entre campi. Nenhum caso de uso novo por actor, mas refatoração profunda da lógica de `HomeController` e `HomeService`.

### UC-06 — Avaliação de Reservas (🟡 Médio, Com Exceção)

O fluxo normal **continua intocado**: Gestor de Reserva avalia pelo caminho tradicional (`viewForGestor`). Mas o **Gestor de Espaço** ganha um caminho de **exceção** (UC-21-A, aprovação em regime de urgência) restrito aos espaços que ele gerencia. Não há mudança no fluxo de UC-06 em si; a exceção vive em UC-21-A.
