# Fila de Issues — Acompanhamento

A partir da auditoria em [`auditoria-issues-2026-08-20.md`](./auditoria-issues-2026-08-20.md).
Atualizado a cada entrega.

**Última atualização:** 2026-08-22 · develop em `ee79eb4` (release rc.22) · #108 mergeada (PR #266) · #119/#222/#101/#105/#111 fechadas no GitHub · **#108 ainda OPEN no GitHub — falta fechar na mão**

---

## ✅ Concluídas

- [x] **#119 — IDOR em detalhes/edição de reserva** `P0`
  Branch `fix/idor-reserva-authorization` → PR #253 → merged `4a59670`
  Regressão de um fix anterior (`725d76f` corrigiu, `214c437` removeu no refactor). Achados extras: vazamento de PII (email/telefone) e escalada de privilégio no `GestorReservaController::update`. Inclui página de erro Inertia (fatia da #112).
  *9 testes de regressão · baseline 6 falhas → 9 passando*

- [x] **#222 — Link de notificação abre semana errada** `P1`
  Branch `fix/222-semana-reserva-notificacao` → PR #256 → merged `3b62a3e`
  Corrigido no `show()` e não nas Notifications, porque a URL fica gravada na tabela `notifications` — assim o histórico já enviado também é consertado. Helper `resolveDataAncora` unificou o padrão em 3 pontos.
  *8 testes · baseline 5 falhas → 8 passando*

- [x] **#101 — Ordem dos gestores por turno no admin** `P1`
  Branch `fix/101-ordem-gestores-turno` → PR #258 → merged `4374bcd`
  Espelhou o padrão do `GerenciarGestoresDialog` (enumerar turnos fixos) em vez de só ordenar, atendendo ao "mesmo que o turno esteja vazio". Extraiu `TURNOS_ORDENADOS`/`TURNO_LABEL` eliminando 3 cópias da ordem.
  *6 testes de componente · baseline 5 falhas → 6 passando*

- [x] **#105 — Exibir espaço e módulo na lista de reservas** `P2`
  Branch `fix/105-modulo-lista-reservas` → PR #261 → merged `4cd67ea` · issue fechada
  Cadeia `andar.modulo` adicionada ao eager loading dos dois repositórios. No `getPaginatedForGestor`, que usa selects por coluna, foi preciso incluir `andar_id`/`modulo_id` — sem as chaves estrangeiras a relação aninhada volta `null` sem erro. Extraído o componente `LocalReserva`.
  *3 testes de payload + 4 de componente · baseline 3 falhas → 7 passando*

- [x] **#112 — Tratamento de erros e logging padronizados** `P2`
  Branch `fix/112-tratamento-erros-api` → PR #263 → merged `a504887` · ⚠️ **issue ainda OPEN no GitHub**
  A premissa da issue não batia com o código: não existe `routes/api.php`, e os únicos endpoints JSON vivos são os 4 de relatórios. Envelope feito **aditivo** (`error_code`/`details` ao lado de `message`/`errors`), porque `use-gerar-relatorio.ts` lê `data.message` na raiz e o `useForm` do Inertia depende do bag `errors` — mover qualquer um dos dois quebraria em silêncio.
  Decisão de segurança: a issue pedia "request data" no log, mas o app trafega senha em texto plano (`ConfirmPasswordRequest`, no cancelamento de reserva). O payload ficou **fora** do contexto, travado por teste.
  Achado de bug: `phpunit.xml` definia `APP_ENV=testing` sem `force="true"`, então o `.env` do container de dev vencia e **a suíte nunca rodou em env `testing`** — o bypass da página de erro da #119 nunca foi exercitado como documentado.
  O GitGuardian barrou o PR por causa dos literais `'password' => 'senha-super-secreta'` no teste novo; trocados por canários de runtime (`347ca67`). Falso positivo — nenhuma credencial real vazou.
  *26 chamadas de log padronizadas · 13 testes novos · 95 → 115 testes passando*

- [x] **#108 — Filtro/arquivamento (soft delete) de reservas** `P1`
  Branch `fix/108-filtro-arquivamento-reservas` → PR #266 → merged `8f180f0` (+ ajuste visual `ed85116`) · ⚠️ **issue ainda OPEN no GitHub**
  O requisito 1 da issue (soft delete) **já estava pronto** — `cancel()` marca `inativa` em transação e não existe delete permanente. A issue descrevia um risco inexistente.
  O bug real era outro: `getPaginatedForUser` aplicava `where('situacao', '!=', 'inativa')` incondicionalmente e logo depois oferecia filtro por situação, então filtrar por arquivadas produzia `situacao != 'inativa' AND situacao = 'inativa'` — **contradição lógica, lista sempre vazia**. O gestor tinha a versão correta do mesmo código; a assimetria era a raiz.
  Achado extra: **"Todas" mentia para os dois papéis** — mandava `''`, o parâmetro sumia, e ambos caíam no default que esconde arquivadas.
  Solução: separar os eixos. `situacao` fica só com resultado de avaliação; novo `arquivo` (`ativas`/`arquivadas`/`todas`) via `scopeArquivo` no model, usado pelos dois repositórios. URL legada `?situacao=inativa` é traduzida para não passar a devolver vazio. Entrou também uma guarda de idempotência no cancelamento (recancelar reserva arquivada não dispara mais notificação repetida).
  *12 testes de feature + 6 de componente · baseline 8 falhas → 12 passando · 115 → 127 testes PHP*

---

## 🔨 Em andamento

- [ ] **#265 — Avaliar uma reserva arquivada a ressuscita** `P1` · `effort: small` — **próxima, ainda não iniciada**
  Sem branch aberta ainda. Isolada de propósito: `AvaliarReservaJob::updateReservaOverallStatus` (linha ~255) recalcula `situacao` a partir da contagem de horários e o `match` não trata `inativa` — toda avaliação em uma reserva arquivada a ressuscita para `em_analise`/`deferida`/etc. Caminho de escrita crítico, enquanto a #108 era caminho de leitura. Branch a partir de `develop` (que já tem a #108).

---

## 🔴 Gaps Críticos (do Core Workflow Report)

Identificados na auditoria de fluxo (`docs/core-workflow-report.md` seção 14.1):

- [ ] **GAP-01 — Atualização automática da AvaliarReservaPage após ValidateJob terminar** `P0` · `effort: medium`
  **Impacto:** UX ruim em reservas grandes. Gestor vê loading indefinidamente e precisa recarregar a página manualmente quando a validação termina.
  **Problema:** `AvaliarReservaPage` detecta `validation_status = processing` e exibe spinner, mas não há polling nem evento Reverb para notificar quando `ValidateReservationConflictsJob` termina e `conflict_cache` está atualizado.
  **Solução sketch:** Implementar evento Reverb em `ValidateReservationConflictsJob::handle()` para disparar `ReservationValidatedBroadcast` (ou similar) após sucesso; frontend assina com `Echo.channel()` e recarrega automaticamente.
  **Dependências:** Reverb já está configurado e funcional.

- [ ] **GAP-02 — UpdateReservaJob não regenera conflitos** `P1` · `effort: medium`
  **Impacto:** Dados inconsistentes. Após editar uma reserva, o `conflict_cache` fica obsoleto e o gestor vê conflitos antigos.
  **Problema:** `UpdateReservaJob` atualiza os horários mas **não dispara `ValidateReservationConflictsJob`** depois para recalcular conflitos.
  **Solução sketch:** No final de `UpdateReservaJob::handle()`, despachar `ValidateReservationConflictsJob::dispatch($reserva)` e atualizar `validation_status = 'pending'`.
  **Dependências:** Requer que GAP-01 ou polling estejam resolvidos para feedback ao gestor.

- [ ] **GAP-03 — Escopo `recurring` em AvaliarReservaJob pode exceder agendas do gestor** `P1` · `effort: small`
  **Impacto:** Possível conflito de responsabilidade. Um gestor pode propagar aprovação para agendas de outro gestor.
  **Problema:** No `AvaliarReservaJob` com `scope=recurring`, a busca por horários recorrentes procura por `agenda_id` mas **não restringe ao conjunto de agendas que o gestor gerencia globalmente** — apenas valida que o gestor gerencia alguma agenda da reserva, depois propaga para todas.
  **Solução sketch:** Antes de propagar em `recurring`, validar que cada `agenda_id` destino é gerenciado pelo gestor; pular ou indeferir horários de agendas outras.
  **Testes:** Cenário: Reserva com múltiplas agendas (gestor A gerencia 2 de 4); só propaga para as 2 do gestor.

---

## 🟡 Melhorias Importantes (do Core Workflow Report)

Identificadas na auditoria de fluxo (`docs/core-workflow-report.md` seção 14.2):

- [ ] **GAP-04 — Notificação por e-mail sem template HTML** `P2` · `effort: small`
  **Problema:** `BaseNotification.toMail()` usa `MailMessage` básico com texto puro. Sem branding, sem estilos.
  **Escopo:** Refatorar para usar template Blade customizado (ex.: `resources/views/mail/base-notification.blade.php`).

- [ ] **GAP-05 — ReservasGestorPage sem filtro de período** `P2` · `effort: medium`
  **Problema:** A listagem de reservas do gestor traz **todas** as reservas das agendas sem filtro de data — pode ser lento em produção com histórico grande.
  **Solução sketch:** Adicionar filtro de período (últimos 30 dias, trimestre, ano) com query otimizada; considerar índices em (user_id, created_at).

- [ ] **GAP-06 — Política de update muito restritiva** `P2` · `effort: small`
  **Problema:** `ReservaPolicy.update()` bloqueia edição se **qualquer** horário foi avaliado. Se 1 de 50 foi avaliado, solicitante perde acesso aos 49 outros.
  **Solução sketch:** Permitir edição se nenhum horário foi avaliado; ou permitir edição granular (só dos não-avaliados).
  **Dependências:** Relacionado a #46 (edição administrativa).

- [ ] **GAP-07 — Falta feedback em tempo real para o Solicitante na criação** `P2` · `effort: medium`
  **Impacto:** UX ruim. Solicitante submete formulário, vê flash "sendo processado" e fica cego sobre o progresso do job.
  **Problema:** Não há indicador visual do progresso do `ProcessarCriacaoReserva` nem da validação de conflitos subsequente.
  **Solução sketch:** Dashboard de criação com eventos Reverb (`ReservationCreatedBroadcast`, `ReservationValidatedBroadcast`) e barra de progresso no frontend.
  **Conexo com:** GAP-01 (ambos usam Reverb).

---

## 🟢 Evoluções Futuras (do Core Workflow Report)

Identificadas na auditoria de fluxo (`docs/core-workflow-report.md` seção 14.3):

- [ ] **GAP-08 — Dashboard com métricas de ocupação** `P3` · `effort: large`
  **Problema:** `HomeController` e `HomeService` existem mas não consolidam dados de ocupação por espaço/turno/período.
  **Escopo:** Gráficos, cards com taxa de ocupação, tendências.

- [ ] **GAP-09 — Aprovação parcial granular** `P3` · `effort: medium`
  **Problema:** Gestor pode deferir/indeferir por slot individual, mas fluxo de `parcialmente_deferida` não tem caminho claro de "o que fazer a seguir".
  **Solução sketch:** Notificar solicitante com opções (reagendar pendentes, cancelar parciais, etc.); frontend mostra diferentemente.

- [ ] **GAP-10 — Histórico e audit trail de avaliações** `P3` · `effort: medium`
  **Problema:** Não há log de quem avaliou o quê e quando além de `user_id` no `Horario`. Falta audit trail completo.
  **Solução sketch:** Tabela `horario_evaluations_log` ou eventos de domínio; rastreabilidade de mudanças.

- [ ] **GAP-11 — Notificações em tempo real completas via Reverb** `P3` · `effort: large`
  **Problema:** Reverb está configurado e `notification-dropdown.tsx` existe, mas eventos de broadcast só notificam novas notificações — não recarregam dados das páginas (ReservasPage, AvaliarReservaPage) automaticamente.
  **Solução sketch:** Estruturar canais Reverb (ex.: `reservas.{user_id}`, `agendas.{agenda_id}`) e disparar eventos a cada mudança de estado de reserva.
  **Conexo com:** GAP-01, GAP-07 (todos usam Reverb como camada base).

---

## 📋 Fila

- [ ] **#255 — `data_inicial`/`data_final` dessincronizam na edição de ocorrência única** `P2` · `effort: medium`
  Aberta por mim durante a #222. Bug de integridade: com `edit_scope='single'`, o período é reescrito com os limites da semana editada. Bloqueia navegação para semanas que têm horários. Requer migração de dados.

- [ ] **#104 — Templates de horário configuráveis pelo gestor** `P0 de negócio` · `effort: large`
  Nenhuma base no código. Exige migration, revisão da lógica de conflito e do calendário. **Precisa de design antes da execução.**

- [ ] **#102 — Ordenação na "Gerenciar Reservas"** `P3` · `effort: large`

- [ ] **#48 — Filtro/busca no dashboard do gestor** `P3`
  Parcial: busca existe, mas na aba "Favoritos" e sem debounce. Falta na aba "Espaços que gerencio" e o filtro de pavilhão.

- [ ] **#98 — Versão de build no footer admin via CI/CD** `P3`

- [ ] **#106 — Dia da semana nos grupos de turno** `P4`
  ⚠️ **Validar antes de investir:** o header sticky já entrega o essencial. Confirmar com o time se ainda faz sentido.

- [ ] **#107 — Alerta de solicitações pendentes sobrepostas** `P4` · `effort: large`

- [ ] **#46 — Edição administrativa de reserva** `P4`
  Escopo maior do que aparenta: exige audit log, notificação ao dono e habilitar a permission `reservas.atualizar` em algum role.

- [ ] **#49 — Navegação rápida entre salas do pavilhão** `P4`

- [ ] **#260 — Edição administrativa não registra log nem notifica o dono** `P3` · `effort: medium`
  Aberta por mim ao testar a edição de reservas. A permission `reservas.atualizar` (só `institucional`) faz `ReservaPolicy::update()` retornar `true` para qualquer reserva em qualquer estado — o caminho de edição administrativa da #46 já está **ligado**, mas sem as salvaguardas que ela especifica: não há log de alteração, e `UpdateReservaJob:141` notifica **quem editou**, não o dono da reserva. Corrigir a #46 provavelmente fecha esta; o bug da notificação vale ser corrigido sozinho de todo modo.

---

## 🚫 Fora da fila

- [x] **#111 — Alerta de exclusão mal posicionado** → **fechada em 2026-08-20**
  Já estava corrigida no código antes da auditoria (`Dialog` do Radix em `delete-item.tsx:54-100`), aparentemente por refatoração que não referenciou a issue. Verificada e fechada. A label `P0` estava obsoleta.

- [ ] **#41 — Refresh manual (F5)** → manter `wontfix`
  Decisão já tomada pelo time.

---

## Pendências de gestão (não são código)

- [x] Fechar a **#111** — feita em 2026-08-20
- [x] Fechar **#119**, **#222**, **#101** com comentário do que foi corrigido — feitas em 2026-08-20
- [ ] Fechar **#112** e **#108** no GitHub com comentário — mergeadas (PR #263 e #266) mas seguem OPEN, mesmo problema do `Closes #NNN` não disparar auto-close em merge para `develop`
- [ ] Repriorizar a **#119** de `P2` → `P0` no GitHub (registro histórico; a issue já está fechada)
- [ ] Decidir se `institucional` sem agendas **deveria** avaliar reservas (efeito colateral documentado na #119)
- [ ] Decidir o escopo pretendido de `reservas.atualizar` — ver as três opções na **#260**
- [ ] Validar a **#106** com o time antes de investir

> A ressalva sobre o corpo da #119 (`ReservaPolicy::view()` desatualizada) ficou registrada no comentário de fechamento, então não é mais necessário editar o corpo da issue.

---

## 🎯 Brainstorm — Ordem de Resolução Sugerida

Baseado em **prioridade**, **dependências**, **impacto** e **esforço**. O objetivo é máximo valor entregue com mínimo risco e bloqueio.

### Fase 1: Corrigir Bugs Críticos de Dados (1–2 semanas)

**Dependência:** Nenhuma. Todos podem rodar em paralelo.

1. **#265 (P1, effort: small)** — Avaliar reserva arquivada a ressuscita
   - **Por quê primeiro:** Bug de data/escrita crítico. A #108 deixou um caminho de reescrita de status sem tratar `inativa`. Afeta integridade de arquivamento.
   - **Bloqueador:** Nenhum. Roda em `develop` que já tem a #108.
   - **Duração:** ~1–2 dias.

2. **GAP-03 (P1, effort: small)** — Escopo `recurring` em AvaliarReservaJob pode exceder agendas
   - **Por quê:** Segurança de autorização. Um gestor pode espalhar aprovações para agendas que não gerencia.
   - **Bloqueador:** Nenhum.
   - **Duração:** ~1–2 dias.
   - **Nota:** Pode ser um GitHub issue novo (`#281 — AvaliarReservaJob escopo recurring`)

3. **#255 (P2, effort: medium)** — `data_inicial`/`data_final` dessincronizam na edição de ocorrência única
   - **Por quê:** Bloqueia navegação. Requer migração de dados (risco moderado).
   - **Bloqueador:** Nenhum.
   - **Duração:** ~2–3 dias.
   - **Nota:** Teste de migração em local antes de produção.

### Fase 2: Melhorias de UX/Data (2–3 semanas)

**Dependência:** Fase 1 concluída.

4. **GAP-02 (P1, effort: medium)** — UpdateReservaJob não regenera conflitos
   - **Por quê:** Corrige inconsistência de dados após edição. Essencial para trust no sistema.
   - **Bloqueador:** Nenhum técnico, mas GAP-01 (feedback em tempo real) melhoraria a UX.
   - **Duração:** ~2–3 dias.
   - **Nota:** Pode ser batizado de `#282 — UpdateReservaJob não revalida conflitos`.

5. **GAP-06 (P2, effort: small)** — Política de update muito restritiva
   - **Por quê:** Quick win. Desbloqueia solicitantes de editar horários não-avaliados.
   - **Bloqueador:** Nenhum.
   - **Duração:** ~1 dia.
   - **Nota:** Pode ser batizado de `#283 — ReservaPolicy update granular`.

6. **#260 (P3, effort: medium)** — Edição administrativa não registra log nem notifica
   - **Por quê:** Auditoria e confiança. Edições admin (`reservas.atualizar`) devem deixar trilha.
   - **Bloqueador:** Nenhum técnico; depende de design de #46 (edição admin).
   - **Duração:** ~2 dias.
   - **Nota:** Pode ser resolvida independentemente de #46 — só adiciona log + notifica dono.

### Fase 3: UX em Tempo Real (3–4 semanas) — Impacto Alto

**Dependência:** Todas as fases anteriores. Reverb já funciona.

7. **GAP-01 (P0, effort: medium)** — Atualização automática da AvaliarReservaPage
   - **Por quê:** Crítico para UX. Gestor não fica esperando/recarregando em reservas grandes.
   - **Bloqueador:** Nenhum (Reverb já está operacional).
   - **Duração:** ~2–3 dias.
   - **Nota:** Implementar evento `ReservationValidatedBroadcast` em `ValidateReservationConflictsJob::handle()`.

8. **GAP-07 (P2, effort: medium)** — Feedback em tempo real para Solicitante
   - **Por quê:** Closure perceptual. Solicitante sabe o que está acontecendo após submeter.
   - **Bloqueador:** GAP-01 (mesmo padrão de Reverb).
   - **Duração:** ~2 dias.
   - **Nota:** Dashboard de criação com barra de progresso.

### Fase 4: Plataforma (melhorias de escalabilidade e facilidade)

9. **GAP-05 (P2, effort: medium)** — ReservasGestorPage sem filtro de período
   - **Por quê:** Performance sob volume. Gestor com histórico grande vai ficar lento.
   - **Bloqueador:** Nenhum.
   - **Duração:** ~2 dias.
   - **Nota:** Adicionar índice em `(user_id, created_at)` no schema.

10. **GAP-04 (P2, effort: small)** — Templates de e-mail HTML
    - **Por quê:** Branding. Notificações de e-mail hoje são texto plano.
    - **Bloqueador:** Nenhum.
    - **Duração:** ~1 dia.

### Fase 5: Futuro (Design necessário antes de executar)

- **#104 (P0 de negócio, effort: large)** — Templates de horário configuráveis
  - ⚠️ **Requer design e aprovação de negócio antes de qualquer código.**
- **GAP-08, GAP-09, GAP-10, GAP-11** — Evoluções de longo prazo (métricas, audit, Reverb completo, etc.)
- **#48, #102, #106, #107** — Filtros, ordenação, alertas (boa completude de produto, depois de Fase 3).

---

### Resumo Visual

```
Semana 1    │ #265 (arquivada ressuscita) ✅
            │ GAP-03 (recurring scope) ✅
            │ #255 (data_inicial/final) 🔧
            │
Semana 2–3  │ GAP-02 (update revalida) ✅
            │ GAP-06 (update granular) ✅
            │ #260 (admin log + notify) ✅
            │
Semana 4–5  │ GAP-01 (reverb + auto-reload) 📡
            │ GAP-07 (progress bar solicitante) 📡
            │
Semana 6–7  │ GAP-05 (período filter + índice) 🔍
            │ GAP-04 (email HTML) 🎨
            │
Semana 8+   │ #104 Design + Templates Horário 🎯
            │ #48, #102 Filtros & Ordenação 📋
            │ GAP-08...11 Metrics & Audit 📊
```

### Critérios de Conclusão por Fase

**Fase 1:** Testes de regressão passam; integridade de dados validada.
**Fase 2:** Todos os novos getters/setters testados; edição de reserva confiável.
**Fase 3:** Reverb evento testado em localhost; gestor vê auto-refresh sem F5.
**Fase 4:** Query de gestor com índice roda em <200ms; e-mail é HTML.
**Fase 5:** Design aprovado; roadmap de longo prazo claro.

---

## Placar

| | |
|---|---|
| Concluídas e mergeadas | **6** (#119, #222, #101, #105, #112, #108) |
| Fechadas no GitHub | **6** (#119, #222, #101, #105, #111, #112) — **#108 falta fechar** |
| Em andamento | **1** (#265, still no branch) |
| Na fila (GitHub issues) | **9** (#255, #104, #102, #48, #98, #106, #107, #46, #49, #260) |
| Gaps críticos (descobertos) | **3** (GAP-01, GAP-02, GAP-03) |
| Melhorias importantes (descobertas) | **4** (GAP-04, GAP-05, GAP-06, GAP-07) |
| Evoluções futuras (descobertas) | **4** (GAP-08, GAP-09, GAP-10, GAP-11) |
| Wontfix | **1** (#41) |
| Abertas por auditoria anterior | **3** (#255, #260, #265) |

**Fora da fila desta auditoria:** desde a última atualização (`12b0be9`), `develop` recebeu 7 outros PRs (#268, #270, #273, #275, #276, #278, #280) — refatorações de UI/UX, performance e arquitetura frontend não relacionados a nenhuma issue da fila. Nenhum toca #255, #260, #46, #48, #102, #104, #106, #107 ou #98.

> ⚠️ **Fechar issues manualmente após o merge.** O `Closes #NNN` no commit **não** dispara o auto-close quando o merge é para `develop` — o GitHub só fecha automaticamente em merges para o branch default (`main`). Aconteceu com a #105, fechada na mão depois do PR #261.
