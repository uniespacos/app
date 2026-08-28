# Sprint 6 — QR Code, Tutorial Assistido e Módulo de Chamados

> **Status:** Especificação pronta para execução
> **Dependências:** Sprint 2 (Gestor de Espaço e `getGestoresDeEspaco()`)
> **Risco de integração:** ⚠️ Incerteza sobre estado da PR #397 — task S6-BE-01 resolve antes de outras
> **Versão Estável:** Sistema de chamados roteado corretamente; nenhum chamado perdido/duplicado; rota pública `/reportar/` funciona sem autenticação

---

## 1. Objetivo

Entregar o módulo de **chamados e reporte de problemas** com suporte a **tutorial assistido por QR Code**, consolidando a modelagem desta auditoria (documento `auditoria-gestores-unidade-espaco/`) com o trabalho previamente iniciado na branch `feat/tickets-module` (PR #397).

O resultado permite que:

1. Usuários deslogados scaneiem QR Code no espaço e reportem problemas via `/reportar/{espaco:public_id}` (rota pública, sem autenticação).
2. Problemas comuns exibem tutorial interativo antes de abrir chamado formal — reduzindo chamados desnecessários.
3. Chamados são roteados automaticamente aos Gestores de Espaço (via `getGestoresDeEspaco()`), com fallback a painel de órfãos.
4. Gestor de Espaço tria (resolve, cancela com motivo, reabre) os chamados da(s) sua(s) equipe(s).

---

## 2. ⚠️ Incerteza Crítica — Estado da PR #397

**Situação no início do sprint:** a PR #397 (`feat/tickets-module`) **ainda não está mergeada em `develop`**. Essa branch contém trabalho anterior sobre modelagem de chamados, mas usa a entidade descartada `SetorAudiovisual` e faz roteamento via `Agenda.user_id`, **ambos refutados por esta auditoria**.

**Primeira task do sprint:** **S6-BE-01** reconcilia isso — traz/adapta o que puder reutilizar da PR (modelos de base, estrutura de controller), **ou recria o essencial a partir do zero** se a PR não estiver disponível. Nenhuma task subsequente do backend depende dela estar "pronta antes" — S6-BE-01 **é** a tarefa de trazer o código para um estado executável.

Se ao iniciar este sprint a PR #397 ainda estiver disponível na branch e o usuário optar por reaproveitar:
- Remover `SetorAudiovisual` — usar pivots `modulo_gestores_espaco` + `espaco_gestores_espaco` do Sprint 2.
- Adaptar `ChamadoPolicy::administraOAlvo()` para usar `getGestoresDeEspaco()` em vez de `Agenda.user_id`.
- Adaptar `ChamadoService::notificarGestores()` para o mesmo algoritmo.
- Integrar `tipos_chamado.tutorial` (texto em Markdown sanitizado, per decisão D-9).

Se a PR não estiver acessível ou for mais custoso adaptar que recriar:
- Criar migrations de `chamados` / `tipos_chamado` a partir do zero, já na modelagem correta.
- Implementar Model, Policy, Service, Controller público com a semântica certa desde o início.

**Critério de sucesso:** ao final de S6-BE-01, o backend tem `Chamado` / `TipoChamado` / `ChamadoPolicy` / `ChamadoRepositoryEloquent` funcionando com a modelagem correta (Gestores via pivots, sem `SetorAudiovisual`).

---

## 3. O Que Este Sprint Entrega

✅ **Incluso:**
- Models `Chamado`, `TipoChamado`, com campos para triagem (status, motivo, resolução).
- Policy e Service de chamados, com roteamento via `getGestoresDeEspaco()`.
- Rota pública `/reportar/{espaco:public_id}` (sem autenticação).
- Endpoint de edição de `TipoChamado` ganha campo `tutorial` (Markdown sanitizado).
- Triagem de chamados para Gestores de Espaço (lista pessoal).
- Painel de chamados órfãos: **institucional vê agregado**, **Gestor de Unidade vê lista detalhada** (mesmo padrão de P-10 / S2-FE-09).
- Permissions `chamados.triar` / `secao.gestao-chamados` atribuídas ao role `gestor_espaco`.
- Testes de integração cobrindo roteamento, sanitização, autenticação pública.

❌ **Explicitamente NÃO incluso (conforme `docs/auditoria-gestor-espaco/`):**
- Soft delete em `Espaco`, motivo obrigatório em cancelamento de chamado, trava de cascata em Andar/Módulo — **já estão documentados e implementados** em `docs/auditoria-gestor-espaco/` e **não mudam** neste sprint. Incluem-se apenas como nota de validação (S6-BE-09).

---

## 4. Definição de Versão Estável (Fim de Sprint)

Ao fim deste sprint, `develop` está **deployável** se:

- [ ] Todas as 19 tasks (9 backend, 5 frontend, 5 integração) marcadas **Concluído**.
- [ ] `Chamado` é criado via rota pública sem autenticação.
- [ ] Cada chamado criado é roteado aos Gestores de Espaço **corretos** via `getGestoresDeEspaco()`, sem duplicação.
- [ ] Chamados órfãos (sem Gestor de Espaço) aparecem **agregados** no painel institucional e em **lista detalhada** no painel do Gestor de Unidade.
- [ ] Tutorial é exibido no cliente, e "não resolveu" → cria chamado; "resolveu" → fim sem chamado.
- [ ] Sanitização de Markdown no tutorial bloqueia payloads maliciosos (`<script>`, etc.).
- [ ] Permissões (`chamados.triar` / `secao.gestao-chamados`) são concedidas e verificadas.
- [ ] Sem quebra de funcionalidades pré-existentes.

---

## 5. Dependências Explícitas

- **Sprint 2:** Models `User`, `Modulo`, `Espaco`, `Andar` com pivots `modulo_gestores_espaco` / `espaco_gestores_espaco` já implementados; método `EspacoRepositoryInterface::getGestoresDeEspaco()` disponível e testado; role `gestor_espaco` criado.
- **Sprint 1:** Role `gestor_unidade` existe; Unidade é gerida via `unidade_gestores`.

---

## 6. Riscos Específicos do Sprint

| ID | Descrição | Mitigação |
|---|---|---|
| **R-S6-01** | PR #397 em estado divergente (usa `SetorAudiovisual`, não pivots). | Task S6-BE-01 reconcilia antes de qualquer outra; se recriar, faz desde o zero com modelagem certa. |
| **R-S6-02** | Rota pública sem autenticação é vetor de abuso/spam. | Validação de `espaco.public_id` existente + rate limiting (fora deste sprint, considerar para v2.1). |
| **R-S6-03** | Sanitização de Markdown insuficiente → XSS no tutorial. | Usar biblioteca consolidada (ex.: `parsedown-extra` + whitelist) conforme D-9; teste obrigatório S6-INT-04. |
| **R-S6-04** | Chamado órfão não alcança ninguém, silenciosamente. | Query `whereDoesntHave` + painel dedicado (S6-BE-08), com teste obrigatório S6-INT-02. |

---

## 7. Referências Cruzadas

- **Modelagem:** [`../../02-fluxos-e-diagramas/03-diagramas-de-sequencia.md`](../../02-fluxos-e-diagramas/03-diagramas-de-sequencia.md) — fluxo de roteamento.
- **Decisões consolidadas:** [`../../00-visao-geral/03-decisoes-consolidadas.md`](../../00-visao-geral/03-decisoes-consolidadas.md) — D-9 (Markdown + sanitização).
- **Auditoria anterior:** [`../../auditoria-gestor-espaco/README.md`](../../auditoria-gestor-espaco/README.md) — semântica de `ChamadoPolicy`, `ChamadoService`, soft delete.
- **Auditoria preparatória:** [`../../auditoria-gestores-unidade-espaco/07-matriz-riscos-lacunas-perguntas-abertas.md`](../../auditoria-gestores-unidade-espaco/07-matriz-riscos-lacunas-perguntas-abertas.md) — seção 5 (checklist de reconciliação).

---

## 8. Ordem de Execução

```
1. Backend completo (S6-BE-01 a S6-BE-09)
   ↓
2. Frontend (S6-FE-01 a S6-FE-05) — consome contratos do backend
   ↓
3. Integração (S6-INT-01 a S6-INT-05) — valida o conjunto
   ↓
4. Checklist de Definição de Versão Estável (seção 4)
```
