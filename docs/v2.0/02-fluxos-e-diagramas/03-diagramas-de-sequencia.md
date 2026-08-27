# 03 — Diagramas de Sequência e Fluxogramas

Documento que reúne os diagramas de interação entre camadas (Controller → Policy → Service → Repository → DB) e fluxogramas de decisão complexa da arquitetura v2.0 do UniEspaços.

---

## 1. Fluxograma de Resolução de Gestor de Espaço

**Contexto:** O algoritmo de resolução estabelece a hierarquia de precedência para encontrar quem é responsável pela infraestrutura de um espaço: override direto vence padrão do módulo, e ambos valem mais que órfão.

```mermaid
flowchart TD
    Start([Chegou uma demanda de<br/>manutenção/infraestrutura<br/>para o Espaço X]) --> CheckOverride{Espaço X tem<br/>linha em<br/>espaco_gestores_espaco?}
    CheckOverride -->|Sim| UseOverride[Notifica os usuários<br/>do override direto]
    CheckOverride -->|Não| CheckModulo{Módulo do Espaço X<br/>tem linha em<br/>modulo_gestores_espaco?}
    CheckModulo -->|Sim| UseModulo[Notifica os usuários<br/>do padrão do módulo]
    CheckModulo -->|Não| Orfao[Espaço ÓRFÃO de<br/>Gestor de Espaço]
    Orfao --> RouteGU[Aparece no painel do<br/>Gestor de Unidade do campus]
    Orfao --> RouteInst[Aparece no painel global<br/>do Institucional]
```

A resolução é implementada no `EspacoRepository::getGestoresDeEspaco()` e sua inversa `getEspacosGeridosPorGestorEspaco()` reaplica o mesmo algoritmo para construir os dashboards.

---

## 2. Sequência: Gestor de Unidade Atribuindo um Gestor de Espaço

**Contexto:** Fluxo completo da atribuição de responsáveis pela infraestrutura, desde a seleção na interface até a persistência no banco, passando pelas camadas de autorização e lógica de negócio.

```mermaid
sequenceDiagram
    actor GU as Gestor de Unidade
    participant UI as Tela de Edição de Módulo/Espaço
    participant Ctrl as ModuloController / EspacoController
    participant Policy as ModuloPolicy / EspacoPolicy
    participant Svc as ModuloService / EspacoService
    participant Repo as ModuloRepository / EspacoRepository
    participant DB as modulo_gestores_espaco / espaco_gestores_espaco

    GU->>UI: Seleciona usuário(s) para "Gestor de Espaço"
    UI->>Ctrl: POST /institucional/modulos/{id}/gestores-espaco
    Ctrl->>Policy: authorize('gerenciar-gestores-espaco', $modulo)
    Policy-->>Ctrl: allow SE gestor_unidade E modulo.unidade_id IN unidadesGeridas(user)
    Ctrl->>Svc: syncGestoresEspaco($modulo, $userIds)
    Svc->>Repo: sync($modulo, $userIds)
    Repo->>DB: INSERT/DELETE linhas do pivot
    Svc-->>Ctrl: Modulo atualizado
    Ctrl-->>UI: redirect + flash de sucesso
    Note over Svc,DB: Dispara notificação (ShouldQueue, try-catch)<br/>para os novos e removidos gestores de espaço
```

**Pontos de atenção:**

- A Policy encadeia dois filtros: presença da role `gestor_unidade` E posse da unidade via `unidadeGeridas()`.
- A notificação é obrigatoriamente assíncrona (`ShouldQueue`) e envolvida em `try-catch` no Job (regra inviolável nº 4).

---

## 3. Fluxo de Reserva — Fluxo Normal Permanece Intocado (com Exceção Documentada)

**Contexto:** O fluxo padrão de reserva (auto-aprovação ou fila de análise) não foi alterado. A exceção de urgência é um caminho **paralelo e adicional**, nunca uma substituição. O Gestor de Espaço participa apenas em circunstâncias restritas.

```mermaid
flowchart LR
    Comum([Comum solicita reserva]) --> Job[ProcessarCriacaoReserva Job]
    Job --> Agenda{Agenda tem gestor único<br/>= solicitante?}
    Agenda -->|Sim| AutoAprova[Auto-aprovação<br/>situacao=deferida]
    Agenda -->|Não| EmAnalise[situacao=em_analise]
    EmAnalise --> GestorReserva[Gestor de Reserva avalia]
    EmAnalise -.->|EXCEÇÃO, ver diagrama §4<br/>só se fora do expediente + sala livre + mesmo dia| GestorEspacoUrgencia[Gestor de Espaço<br/>aprova com urgência]
    GestorReserva --> Notif[Notificação ao solicitante]
    GestorEspacoUrgencia --> NotifGR[Notificação obrigatória<br/>ao Gestor de Reserva titular]

    style Agenda fill:#e0f0ff
    style GestorEspacoUrgencia fill:#fff0cc
```

**Atualização desta rodada:** A regra de auto-aprovação (`docs/auto-approval-rule.md`) continua calculada **exclusivamente** a partir de `Agenda.user_id`. O Gestor de Unidade continua sem qualquer participação (nem no normal, nem na exceção).

---

## 4. Fluxograma da Aprovação de Reserva em Regime de Urgência (Dois Fluxos)

**Contexto:** O atendimento de balcão introduz um caminho excepcional para quando o solicitante chega presencialmente ao setor de audiovisual fora do expediente. O sistema oferece dois fluxos: **Fluxo A** para quem já criou a reserva, e **Fluxo B** para walk-in (cadastro na hora). Ambos convergem para os mesmos critérios de validação.

```mermaid
flowchart TD
    Start([Solicitante chega presencialmente<br/>ao setor de audiovisual]) --> Exped["estaEmExpediente(setor do Gestor de Reserva, NOW)<br/>⚠️ momento da aprovação, não o horário do slot"]
    Exped -->|"true — gestor EM EXPEDIENTE"| Bloqueia["🚫 BLOQUEIA<br/>fluxo normal ainda dá conta"]
    Exped -->|"null — NÃO CONFIGURADO<br/>(100% dos setores no deploy)"| Aviso["⚠️ LIBERA COM AVISO"]
    Exped -->|"false — fora do expediente"| Existe
    Aviso --> Existe
    Existe{Solicitante já criou<br/>a reserva no sistema?}

    Existe -->|Sim| FluxoA["FLUXO A<br/>PATCH /gestor-espaco/reservas-urgentes/id"]
    Existe -->|Não| FluxoB["FLUXO B — walk-in<br/>Gestor de Espaço cria em nome do solicitante"]

    FluxoA --> ValidaA{"Reserva contém APENAS<br/>horários de HOJE?"}
    ValidaA -->|Não| RecusaA[RECUSA — volta ao fluxo normal<br/>do Gestor de Reserva]
    ValidaA -->|Sim| Comum1

    FluxoB --> TemCadastro{Solicitante tem<br/>cadastro no sistema?}
    TemCadastro -->|Não| Aberto["Solicita cadastro na hora — P-30<br/>⚠️ no dispositivo da pessoa (D-4)<br/>⚠️ depois localizar por e-mail (D-3)"]
    TemCadastro -->|Sim| Comum1

    Comum1{"Espaço ∈ escopo do Gestor de Espaço?<br/>getEspacosGeridosPorGestorEspaco"} -->|Não| Nega[403 — fora do escopo]
    Comum1 -->|Sim| Livre{Horário livre?<br/>sem conflito com deferida}
    Livre -->|Não| Indisponivel[Sem horário disponível]
    Livre -->|Sim| Disputa{Mais de um interessado<br/>no mesmo horário?}
    Disputa -->|Sim| Apoio["Exibe prioridade como APOIO<br/>Professor = Téc-Adm > Estudante > Externo<br/>SEM trava — avaliador decide (P-18/P-25)"]
    Disputa -->|Não| Aprova
    Apoio --> Aprova["Aprova SOMENTE horários de hoje<br/>origem_avaliacao = urgencia_gestor_espaco"]
    Aprova --> Notif["Notifica APENAS o Gestor de Reserva titular<br/>P-14 · ShouldQueue + try-catch"]
    Notif --> Fim([Fim])

    style Bloqueia fill:#ffcdd2
    style Aviso fill:#ffe0b2
    style Aberto fill:#e3f2fd
    style RecusaA fill:#ffcdd2
```

**Pontos de atenção destacados:**

1. **Validação de expediente (D-2/D-6, fechadas):** Bloqueia quando o gestor está em expediente; libera com aviso quando desconhecido. A checagem usa **`now()`** — o momento da aprovação, não o horário do slot solicitado. O sistema nasce permissivo e endurece conforme os setores são configurados.

2. **Cadastro na hora (P-30/D-3/D-4, fechadas):** A pessoa se cadastra **no próprio dispositivo** via QR Code, e o Gestor de Espaço a localiza por um endpoint estreito de **busca por e-mail exato** — sem receber acesso à listagem completa de usuários.

3. **Fluxo B: Criação de Reserva Síncrona e Atômica:** O Fluxo B implementa um método dedicado `ReservaService::criarComUrgencia(User $solicitante, array $dados, User $gestorEspaco): Reserva` que cria a reserva **já com situação "deferida"** e `origem_avaliacao = 'urgencia_gestor_espaco'`. Não reutiliza `ProcessarCriacaoReserva` porque aquele job é assíncrono e aplica auto-aprovação, que não se aplica aqui. O atendimento de balcão é síncrono por natureza — a pessoa está na frente esperando resposta.

---

## 5. Resolução de Expediente do Setor

**Contexto:** O algoritmo que determina se um setor está em expediente é a base para bloquear ou permitir aprovações de urgência. Retorna três estados: `true` (em expediente), `false` (fora) ou `null` (indeterminado, quando não configurado). Essa flexibilidade permite adoção gradual.

```mermaid
flowchart TD
    Q(["estaEmExpediente(setor, quando)"]) --> Exc{"Existe exceção cobrindo a data?<br/>data_inicio ≤ quando ≤ data_fim"}
    Exc -->|Sim, fechado=true| F1["false — fechado<br/>(feriado, recesso)"]
    Exc -->|"Sim, fechado=false"| H1{"Dentro do horário<br/>especial da exceção?"}
    H1 -->|Sim| T1[true]
    H1 -->|Não| F2[false]
    Exc -->|Não| Cfg{"Expediente base<br/>configurado?"}
    Cfg -->|"Não (null)"| N1["null — INDETERMINADO<br/>⚠️ não assume nada"]
    Cfg -->|Sim| Dia{"Dia da semana ∈<br/>dias_funcionamento?"}
    Dia -->|Não| F3[false]
    Dia -->|Sim| Hora{"Entre abertura<br/>e fechamento?"}
    Hora -->|Sim| T2[true]
    Hora -->|Não| F4[false]

    style N1 fill:#ffe0b2
```

**Tratamento de cada estado (D-2 + D-6, FECHADAS):**

| Estado | Significado | Comportamento | Razão |
|---|---|---|---|
| `false` | Gestor de Reserva **fora** do expediente | ✅ **Libera** a urgência | É exatamente o cenário que a regra existe para cobrir |
| `null` | Expediente **não configurado** (setor sem horário, ou gestor sem `setor_id`) | ⚠️ **Libera com aviso** na UI | Será o estado de **100% dos setores no dia do deploy**. Bloquear aqui faria a funcionalidade nascer inutilizável (risco R-20) |
| `true` | Gestor de Reserva **está** em expediente | 🚫 **Bloqueia** | O fluxo normal ainda consegue tratar o caso — não há urgência a justificar |

**Implementação:** Exceções por **intervalo** (`data_inicio`/`data_fim`), não data a data. Um recesso de 15 dias vira **1 linha**, não 15. Isso reduz custo de entrada de dados mantendo expressividade total (feriados de 1 dia, recessos múltiplos, expedientes especiais reduzidos).

---

## 6. Fluxo de Report via QR Code com Tutorial Assistido

**Contexto:** Quando um problema é detectado no espaço (temperatura, equipamento quebrado, etc.), o usuário pode abrir um relatório via QR Code físico. Se o problema tem tutorial, o sistema oferece solução assistida antes de criar um chamado formal. Caso persista, o chamado é roteado automático pelo algoritmo de resolução de Gestor de Espaço.

```mermaid
flowchart TD
    Scan([Usuário escaneia QR Code<br/>físico no espaço]) --> Rota[GET /reportar/espaco:public_id]
    Rota --> Tipo[Seleciona tipo de problema<br/>ex.: Ajustar temperatura, Projetor não liga]
    Tipo --> TemTutorial{Tipo tem<br/>tutorial cadastrado?}
    TemTutorial -->|Sim| Tutorial[Exibe tutorial passo a passo]
    Tutorial --> Resolveu{Resolveu o problema?}
    Resolveu -->|Sim| FimSemChamado([Fim — nenhum chamado criado])
    Resolveu -->|Não| CriaChamado[Cria Chamado formal]
    TemTutorial -->|Não| CriaChamado
    CriaChamado --> Resolve[getGestoresDeEspaco espaco<br/>mesmo algoritmo do documento 03]
    Resolve --> NotifGE[Notifica Gestor de Espaço responsável<br/>ShouldQueue + try-catch]
    Resolve -->|Vazio| Orfao2[Chamado órfão —<br/>painel Institucional/Gestor de Unidade]
```

**Pontos de atenção:**

- O tutorial é **genérico por tipo de problema**, não especializado por equipamento ou modelo (exigiria catálogo de ativos, fora de escopo).
- Conteúdo pode ser Markdown simples (passo a passo) ou URL de vídeo/PDF — o formato exato é decisão de UX (P-20).
- A criação do chamado aproveita completamente a lógica de resolução de Gestor de Espaço já desenhada (override > padrão > órfão).

---

## 7. Consolidação do Dashboard: Cascata Exclusiva → Composição Aditiva

**Contexto:** O dashboard atual usa cascata mutuamente exclusiva — um usuário que acumula papéis vê **apenas** o do papel de maior precedência. A proposta unifica em uma página única com **blocos compostos**, onde cada papel contribui seu próprio widget.

```mermaid
flowchart TB
    subgraph HOJE["HOJE — cascata exclusiva (match true / if-elseif)"]
        direction TB
        U1[Usuário com 3 papéis] --> M1{tem dashboard-institucional?}
        M1 -->|Sim| D1[Renderiza SÓ DashboardInstitucionalPage<br/>❌ blocos de gestor invisíveis]
        M1 -->|Não| M2{tem dashboard-gestor?}
        M2 -->|Sim| D2[Renderiza SÓ DashboardGestorPage]
        M2 -->|Não| D3[DashboardUsuarioPage]
    end

    subgraph DEPOIS["DEPOIS — composição aditiva"]
        direction TB
        U2[Usuário com 3 papéis] --> C1[DashboardPage única]
        C1 --> B1["Can dashboard-institucional<br/>→ WidgetVisaoMacro"]
        C1 --> B2["Can dashboard-gestor-unidade<br/>→ WidgetPainelGestorUnidade"]
        C1 --> B3["Can dashboard-gestor-espaco<br/>→ WidgetEspacosSobResponsabilidade"]
        C1 --> B4["Can dashboard-gestor<br/>→ WidgetReservasParaAvaliar"]
        C1 --> B5[WidgetMinhasReservas — sempre]
    end

    style D1 fill:#ffcdd2
```

**Consequência técnica não óbvia:** a mudança **não é só de view** — `HomeService` também precisa deixar de ser `if/elseif` e passar a **agregar** os blocos de dados que o usuário pode ver. Isso levanta preocupação de performance (um usuário com todos os papéis dispararia todas as queries de todos os blocos) — recomenda-se carregamento sob demanda (risco R-17).

A composição aditiva torna visíveis **todos os papéis que a pessoa exerce**, eliminando surpresas quando alguém com múltiplos papéis descobre que o dashboard de gestor está oculto.
