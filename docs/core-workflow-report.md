# UniEspaços — Core Workflow Report
> Generated: 2026-06-02 | Base para definição de próximos passos

---

## 1. Visão Geral do Sistema

UniEspaços é uma aplicação web de reserva de espaços acadêmicos com arquitetura full-stack desacoplada:

| Camada | Tecnologia |
|--------|-----------|
| Backend | Laravel 12.x (PHP) |
| Frontend | React 18 + Inertia.js (SPA) |
| Database | PostgreSQL 16 |
| Real-time | Laravel Reverb (WebSockets via Broadcast) |
| Queue | Laravel Queue (background jobs) |
| Auth / RBAC | Spatie Laravel Permission |

O **fluxo central** da aplicação tem dois atores principais:
- **Solicitante** — qualquer usuário autenticado que solicita a reserva de um espaço.
- **Gestor** — usuário com permissão `secao.gestao-reservas` que avalia as solicitações de reserva.

---

## 2. Modelo de Dados Central

```mermaid
erDiagram
    User {
        int id
        string name
        string email
    }

    Espaco {
        int id
        string nome
        int andar_id
    }

    Agenda {
        int id
        string turno
        int espaco_id
        int user_id "gestor responsável"
    }

    Reserva {
        int id
        string titulo
        string descricao
        string situacao "em_analise | deferida | indeferida | parcialmente_deferida | inativa"
        date data_inicial
        date data_final
        string recorrencia
        int user_id "solicitante"
        string validation_status "pending | processing | completed | failed"
        json conflict_cache
    }

    Horario {
        int id
        date data
        time horario_inicio
        time horario_fim
        string situacao "em_analise | deferida | indeferida | inativa"
        string justificativa
        int agenda_id
        int reserva_id
        int user_id "avaliador"
    }

    User ||--o{ Agenda : "gerencia"
    Espaco ||--o{ Agenda : "tem agendas por turno"
    Agenda ||--o{ Horario : "contém slots"
    Reserva ||--o{ Horario : "inclui"
    User ||--o{ Reserva : "solicita"
```

**Relação chave:** Uma `Reserva` agrupa vários `Horario`s. Cada `Horario` pertence a uma `Agenda` (que é vinculada a um `Espaco` e tem um `User` gestor). O status final da `Reserva` é **derivado** do conjunto de status dos seus `Horario`s.

---

## 3. Estados da Reserva

```mermaid
stateDiagram-v2
    [*] --> em_analise : Solicitante submete reserva\n(ProcessarCriacaoReserva Job)
    em_analise --> deferida : Todos os horários deferidos\n(AvaliarReservaJob)
    em_analise --> indeferida : Todos os horários indeferidos\n(AvaliarReservaJob)
    em_analise --> parcialmente_deferida : Mix de deferidos + outros\n(AvaliarReservaJob)
    em_analise --> inativa : Solicitante cancela\n(ReservaService.cancel)
    deferida --> inativa : Solicitante cancela\n(ReservaService.cancel)
    parcialmente_deferida --> deferida : Reavaliação → todos deferidos
    parcialmente_deferida --> indeferida : Reavaliação → todos indeferidos
    parcialmente_deferida --> inativa : Solicitante cancela
    indeferida --> deferida : Reavaliação (Gestor)

    note right of em_analise
        Auto-deferida se solicitante
        é o próprio gestor do espaço
    end note
```

**Regra especial de auto-aprovação:** Se o solicitante for o único gestor de todos os espaços solicitados, a reserva já nasce com `situacao = deferida` (código em `ProcessarCriacaoReserva`).

---

## 4. Fluxo Completo de Criação de Reserva

### 4.1 Frontend — Seleção de Slots

```mermaid
graph TD
    A["EspacosPage\n(Listagem de Espaços)"] --> B["VisualizarEspacoPage\n(Detalhe do Espaço)"]
    B --> C["EspacoAgenda\n(Organism)"]
    C --> D["AgendaCalendario\n(Organism)\nExibe grid semanal"]
    D --> E["calendar-slot-cell\n(Molecule)\nSlot clicável por turno/dia"]
    E -->|"alternarSelecaoSlot()"| F["Estado: slotsSelecao[]"]
    F --> G["AgendaNavegacao\n(Molecule)\nNavegação entre semanas"]
    F -->|">0 slots selecionados"| H["AgendaDialogReserva\n(Organism)\nModal de confirmação"]
    H --> I["Formulário: título, descrição,\nrecorrência, datas"]
    I -->|"onSubmit() → useForm.post()"| J["POST /reservas\n(ReservaController.store)"]
```

### 4.2 Backend — Processamento Assíncrono

```mermaid
sequenceDiagram
    participant Browser
    participant ReservaController
    participant ReservaService
    participant Queue as "Queue Worker"
    participant ProcessarCriacaoReserva as "ProcessarCriacaoReserva Job"
    participant DB as "PostgreSQL"
    participant ValidateJob as "ValidateReservationConflictsJob"
    participant Notification

    Browser->>ReservaController: POST /reservas (dados validados)
    ReservaController->>ReservaService: create(data, user)
    ReservaService->>Queue: ProcessarCriacaoReserva::dispatch(data, user)
    ReservaController-->>Browser: redirect → espacos.index (flash "processando")

    Queue->>ProcessarCriacaoReserva: handle()
    ProcessarCriacaoReserva->>DB: BEGIN TRANSACTION
    ProcessarCriacaoReserva->>DB: INSERT INTO reservas (situacao='em_analise')
    loop Para cada horario_solicitado com recorrência semanal
        ProcessarCriacaoReserva->>DB: INSERT INTO horarios (situacao='em_analise' ou 'deferida' se auto-aprovação)
    end
    ProcessarCriacaoReserva->>DB: COMMIT

    ProcessarCriacaoReserva->>Notification: NewReservationNotification → Gestores
    ProcessarCriacaoReserva->>Queue: ValidateReservationConflictsJob::dispatch(reserva)
    ProcessarCriacaoReserva->>Notification: ReservationCreatedNotification → Solicitante

    Queue->>ValidateJob: handle()
    ValidateJob->>DB: UPDATE reservas SET validation_status='processing'
    ValidateJob->>DB: SQL JOIN horarios para detectar conflitos (mesma agenda, data, sobreposição de horário)
    ValidateJob->>DB: UPDATE reservas SET conflict_cache=JSON, validation_status='completed'
```

---

## 5. Fluxo de Avaliação pelo Gestor

### 5.1 Frontend — Tela de Avaliação

```mermaid
graph TD
    A["ReservasGestorPage\n(Listagem com filtros)"] -->|"Ver detalhes"| B["AvaliarReservaPage\n(Página de Avaliação)"]
    B --> C["Card de Informações\nda Reserva (título, solicitante, período)"]
    B --> D["AgendaNavegacaoGestor\n(Molecule)\nNavegação semana a semana"]
    B --> E["CalendarReservationDetails\n(Molecule)\nCalendário de slots com status visual"]
    E -->|"avaliarSlot()"| F["useReservationSlots Hook\nEstado: slotsSelecao[]"]
    F -->|Sincroniza| G["EvaluationForm\n(Organism)"]
    G --> H["Escopo: 'single' ou 'recurring'"]
    G --> I["Decisão global: Deferir / Indeferir"]
    G --> J["Campo Motivo (condicional se indeferir)"]
    G --> K["Campo Observação (opcional)"]
    G -->|"onSubmit → useAvaliarReservaUseCase"| L["PATCH /gestor/reservas/{id}"]
```

> **Nota importante:** O `AvaliarReservaPage` detecta `validation_status === 'processing'` ou `'pending'` e exibe um loading spinner em vez do formulário, evitando avaliação antes da validação de conflitos terminar.

### 5.2 Backend — Processamento da Avaliação

```mermaid
sequenceDiagram
    participant Browser
    participant GestorCtrl as "GestorReservaController"
    participant ReservaService
    participant Queue as "Queue Worker"
    participant AvaliarJob as "AvaliarReservaJob"
    participant ConflictService as "ConflictDetectionService"
    participant DB
    participant ValidateJob as "ValidateReservationConflictsJob"
    participant Notification

    Browser->>GestorCtrl: PATCH /gestor/reservas/{id} (horarios_avaliados, evaluation_scope, motivo)
    GestorCtrl->>GestorCtrl: authorize('viewForGestor', reserva)\nVerifica se gestor gerencia alguma agenda da reserva
    GestorCtrl->>ReservaService: evaluate(reserva, data, gestor)
    ReservaService->>Queue: AvaliarReservaJob::dispatch(reserva, data, gestor)
    GestorCtrl-->>Browser: redirect → gestor.reservas.index (flash "processando")

    Queue->>AvaliarJob: handle(conflictService)
    AvaliarJob->>ConflictService: findConflictsFor(reserva.id)
    ConflictService->>DB: SQL JOIN para detectar horarios com conflito (situacao='deferida' + sobreposição)
    DB-->>ConflictService: mapa horario_id → conflito

    alt evaluation_scope === 'single'
        loop Para cada horario na semana visível
            AvaliarJob->>DB: UPDATE horarios (situacao, justificativa, user_id)\nSe conflitante → força 'indeferida'
        end
    else evaluation_scope === 'recurring'
        AvaliarJob->>DB: UPDATE horarios conflitantes → 'indeferida' + justificativa
        loop Para cada padrão único (agenda_id + horario_inicio + dia_da_semana)
            AvaliarJob->>DB: UPDATE todos os horarios recorrentes não conflitantes\nPropaga status para toda a série
        end
    end

    AvaliarJob->>AvaliarJob: updateReservaOverallStatus()\nRecalcula situacao da Reserva pelo agregado dos Horarios
    AvaliarJob->>Queue: triggerConflictRevalidation()\nDispara ValidateReservationConflictsJob para outras reservas\nem_analise que compartilham slots recém-aprovados
    AvaliarJob->>Notification: ReservationEvaluatedNotification → Solicitante (database + broadcast + mail)
```

---

## 6. Regra de Status Agregado da Reserva

A situação final da `Reserva` é calculada em `AvaliarReservaJob::updateReservaOverallStatus()`:

```mermaid
flowchart TD
    A["Conta horários por situação"] --> B{"Todos 'deferida'?"}
    B -->|Sim| C["situacao = 'deferida'"]
    B -->|Não| D{"Todos 'indeferida'?"}
    D -->|Sim| E["situacao = 'indeferida'"]
    D -->|Não| F{"Algum 'em_analise'?"}
    F -->|Sim| G["situacao = 'em_analise'"]
    F -->|Não| H["situacao = 'parcialmente_deferida'\n(mix de deferida + indeferida)"]
```

---

## 7. Cascata de Revalidação de Conflitos

Quando o gestor aprova horários (`deferida`), o sistema automaticamente revalida outras reservas pendentes que disputam os mesmos slots:

```mermaid
sequenceDiagram
    participant AvaliarJob
    participant DB
    participant ValidateJob as "ValidateReservationConflictsJob\n(para cada reserva afetada)"

    AvaliarJob->>AvaliarJob: Identifica horários recém-aprovados
    AvaliarJob->>DB: Busca outras Reservas em_analise\nque compartilham (data, agenda_id) com os aprovados
    loop Para cada reserva afetada
        AvaliarJob->>ValidateJob: dispatch(reserva_afetada)
        ValidateJob->>DB: Atualiza conflict_cache da reserva afetada
    end
```

> **Objetivo:** Garantir que o gestor sempre veja o estado atual de conflitos ao avaliar uma reserva, mesmo que outra tenha sido aprovada após a submissão.

---

## 8. Fluxo de Cancelamento

```mermaid
sequenceDiagram
    participant Browser
    participant ReservaController
    participant ReservaService
    participant DB
    participant Notification

    Browser->>ReservaController: DELETE /reservas/{id} (com confirmação de senha)
    ReservaController->>ReservaController: authorize('delete', reserva)
    ReservaController->>ReservaController: Verifica senha do usuário
    ReservaController->>ReservaService: cancel(reserva, user)
    ReservaService->>DB: BEGIN TRANSACTION
    ReservaService->>DB: UPDATE horarios SET situacao='inativa'
    ReservaService->>DB: UPDATE reservas SET situacao='inativa'
    ReservaService->>DB: COMMIT
    ReservaService->>Notification: ReservationCanceledNotification → Gestores afetados
    ReservaController-->>Browser: redirect back (flash "cancelada")
```

> **Nota:** O cancelamento é **síncrono** (não usa job/queue), diferente da criação e avaliação.

---

## 9. Sistema de Notificações

Todas as notificações estendem `BaseNotification` que implementa `ShouldQueue`:

```mermaid
graph LR
    subgraph "Canais de Entrega"
        DB["database\n(notifications table)"]
        BROADCAST["broadcast\n(Laravel Reverb / WebSocket)"]
        MAIL["mail\n(Mailtrap/SMTP)"]
    end

    N1["NewReservationNotification"] -->|Gestor| DB & BROADCAST & MAIL
    N2["ReservationCreatedNotification"] -->|Solicitante| DB & BROADCAST & MAIL
    N3["ReservationEvaluatedNotification"] -->|Solicitante| DB & BROADCAST & MAIL
    N4["ReservationCanceledNotification"] -->|Gestores| DB & BROADCAST & MAIL
    N5["ReservationUpdatedNotification"] -->|Solicitante| DB & BROADCAST & MAIL
    N6["ReservationFailedNotification"] -->|Solicitante| DB & BROADCAST & MAIL

    subgraph "Regra de supressão de e-mail"
        RULE["Se solicitante === único gestor\n(auto-aprovação) → sem e-mail"]
    end
```

O canal `broadcast` usa **Laravel Reverb** (WebSocket) para entrega em tempo real via `notification-dropdown.tsx` no frontend.

---

## 10. Árvore de Componentes Frontend (Fluxo de Reserva)

```mermaid
graph TD
    subgraph "Páginas (Inertia Pages)"
        VP["VisualizarEspacoPage"]
        RP["ReservasPage"]
        RGP["ReservasGestorPage"]
        AVP["AvaliarReservaPage"]
    end

    subgraph "Templates"
        AL["AppLayout"]
    end

    subgraph "Organisms"
        EA["EspacoAgenda\n(agenda calendar + seleção)"]
        AC["AgendaCalendario\n(grid semanal)"]
        ADR["AgendaDialogReserva\n(modal confirmação)"]
        RL["ReservasList\n(lista com modal)"]
        RD["ReservasDetalhes\n(detalhe modal)"]
        EF["EvaluationForm\n(formulário avaliação)"]
    end

    subgraph "Molecules"
        AH["AgendaHeader"]
        AN["AgendaNavegacao"]
        ANG["AgendaNavegacaoGestor"]
        CRD["CalendarReservationDetails"]
        RF["ReservasFilters"]
        CSC["calendar-slot-cell"]
    end

    subgraph "Application (Use Cases)"
        UC1["useReservasListUseCase"]
        UC2["useAvaliarReservaUseCase"]
        H1["useReservationSlots"]
    end

    AL --> VP & RP & RGP & AVP
    VP --> EA
    EA --> AC & ADR & AH & AN
    AC --> CSC
    RP --> RF & RL
    RL --> RD
    RGP --> RF & RL
    AVP --> ANG & CRD & EF
    AVP --> H1
    AVP --> UC2
    RP --> UC1
```

---

## 11. Camada de Arquitetura Backend

```mermaid
graph TD
    subgraph "HTTP Layer"
        RC["ReservaController\n(CRUD do Solicitante)"]
        GRC["GestorReservaController\n(avaliação)"]
        RP2["ReservaPolicy\n(autorização)"]
    end

    subgraph "Service Layer"
        RS["ReservaService\n(orquestra lógica)"]
        CDS["ConflictDetectionService\n(SQL de conflito)"]
    end

    subgraph "Jobs (Queue)"
        PCR["ProcessarCriacaoReserva"]
        URJ["UpdateReservaJob"]
        ARJ["AvaliarReservaJob"]
        VCJ["ValidateReservationConflictsJob"]
    end

    subgraph "Repository Layer"
        RRI["ReservaRepositoryInterface"]
        RRE["ReservaRepositoryEloquent"]
        ARI["AgendaRepositoryInterface"]
        ARE["AgendaRepositoryEloquent"]
    end

    subgraph "Models"
        MR["Reserva"]
        MH["Horario"]
        MA["Agenda"]
        ME["Espaco"]
        MU["User"]
    end

    RC --> RS
    GRC --> RS
    RC --> RP2
    GRC --> RP2

    RS --> PCR
    RS --> URJ
    RS --> ARJ
    RS --> CDS
    RS --> RRI

    ARJ --> CDS
    VCJ --> CDS

    PCR --> MR & MH & MA
    URJ --> MR & MH
    ARJ --> MH & MR

    RRI --> RRE
    ARI --> ARE
    RRE --> MR
    ARE --> MA
```

---

## 12. Gaps Identificados e Próximos Passos

Com base na análise do código, os seguintes pontos foram identificados como oportunidades de melhoria:

### 12.1 🔴 Crítico

| # | Gap | Descrição | Impacto |
|---|-----|-----------|---------|
| 1 | **Atualização automática da tela do Gestor** | A `AvaliarReservaPage` exibe loading para `validation_status = processing`, mas **não há polling nem evento Reverb** para recarregar automaticamente quando o `ValidateReservationConflictsJob` termina. O gestor precisa recarregar a página manualmente. | UX ruim em reservas grandes |
| 2 | **Update de reserva não regenera conflitos** | O `UpdateReservaJob` atualiza os horários mas **não dispara `ValidateReservationConflictsJob`** depois. O `conflict_cache` fica desatualizado após edição. | Dados de conflito inconsistentes |
| 3 | **Escopo de avaliação `recurring` ignora gestor** | No `AvaliarReservaJob` com `scope=recurring`, a propagação busca horários por `agenda_id` do gestor, mas **não restringe ao conjunto de agendas que o gestor gerencia** globalmente — apenas às da reserva. Se um espaço tiver múltiplos gestores, o primeiro a avaliar pode propagar para agendas de outro gestor. | Conflito de responsabilidade |

### 12.2 🟡 Melhorias Importantes

| # | Gap | Descrição |
|---|-----|-----------|
| 4 | **Notificação por e-mail sem template HTML** | O `BaseNotification.toMail()` usa `MailMessage` básico com texto puro. Não há template de e-mail customizado. |
| 5 | **Sem paginação no ReservasGestorPage** | A listagem de reservas do gestor usa paginação igual ao solicitante, mas a query não filtra por período — traz todas as reservas das agendas do gestor. Pode ser lento em produção. |
| 6 | **Política de update muito restritiva** | `ReservaPolicy.update()` bloqueia edição se qualquer horário tiver sido avaliado individualmente. Se apenas 1 de 50 horários foi avaliado, o solicitante perde a capacidade de editar os outros. |
| 7 | **Falta feedback em tempo real para o Solicitante** | Ao criar uma reserva, o solicitante vê apenas um flash "sendo processado". Não há indicador visual do progresso do job nem da validação de conflitos. |

### 12.3 🟢 Evoluções Futuras

| # | Sugestão | Descrição |
|---|----------|-----------|
| 8 | **Dashboard com métricas** | O `HomeController` e `HomeService` existem mas não têm dados consolidados de ocupação por espaço/turno. |
| 9 | **Aprovação parcial granular** | Atualmente o gestor pode deferir/indeferir por slot individual, mas o status `parcialmente_deferida` não tem fluxo claro de "o que fazer a seguir". |
| 10 | **Histórico de avaliações** | Não há log de quem avaliou o quê e quando além do `user_id` no `Horario`. Falta audit trail completo. |
| 11 | **Notificações em tempo real completas** | O Reverb está configurado e o `notification-dropdown.tsx` existe, mas os eventos de broadcast só notificam novas notificações — não recarregam dados das páginas automaticamente. |

---

## 13. Referências de Código

| Arquivo | Responsabilidade |
|---------|-----------------|
| [`ReservaController.php`](../app/Http/Controllers/ReservaController.php) | CRUD HTTP do solicitante |
| [`GestorReservaController.php`](../app/Http/Controllers/Gestor/GestorReservaController.php) | HTTP de avaliação do gestor |
| [`ReservaService.php`](../app/Services/ReservaService.php) | Orquestração e despacho de jobs |
| [`ProcessarCriacaoReserva.php`](../app/Jobs/ProcessarCriacaoReserva.php) | Job de criação assíncrona |
| [`UpdateReservaJob.php`](../app/Jobs/UpdateReservaJob.php) | Job de atualização assíncrona |
| [`AvaliarReservaJob.php`](../app/Jobs/AvaliarReservaJob.php) | Job de avaliação do gestor |
| [`ValidateReservationConflictsJob.php`](../app/Jobs/ValidateReservationConflictsJob.php) | Job de validação de conflitos |
| [`ConflictDetectionService.php`](../app/Services/ConflictDetectionService.php) | SQL de detecção de conflitos |
| [`ReservaPolicy.php`](../app/Policies/ReservaPolicy.php) | Autorização de ações na reserva |
| [`BaseNotification.php`](../app/Notifications/BaseNotification.php) | Base para todas as notificações |
| [`EspacoAgenda.tsx`](../resources/js/presentation/organisms/EspacoAgenda.tsx) | Organismo principal de seleção de slots |
| [`AgendaDialogReserva.tsx`](../resources/js/presentation/organisms/AgendaDialogReserva.tsx) | Modal de confirmação de reserva |
| [`AvaliarReservaPage.tsx`](../resources/js/presentation/pages/Reservas/Gestor/AvaliarReservaPage.tsx) | Página de avaliação do gestor |
| [`EvaluationForm.tsx`](../resources/js/presentation/organisms/EvaluationForm.tsx) | Formulário de avaliação |
