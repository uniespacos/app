# Sprint 5 — Aprovação de Reserva em Regime de Urgência

## Objetivo

Implementar o mecanismo de aprovação de reservas em regime de urgência (exceção ao fluxo normal), permitindo que o Gestor de Espaço aprove solicitações pontuais de reservas do **mesmo dia** quando o Gestor de Reserva responsável está fora do expediente. Inclui dois fluxos operacionais (A: reserva já criada; B: criação no balcão em nome de terceiro) e três novos atributos de usuário/horário.

---

## O Que Entrega

- **`User.tipo_vinculo`** — coluna permanente de taxonomia do usuário (`estudante`, `professor`, `tecnico_administrativo`, `externo`), auto-declarada no cadastro, com função derivada de prioridade **consultiva** (sem trava automática).
- **`Horario.origem_avaliacao`** — rastreamento do caminho de aprovação (`fluxo_normal`, `urgencia_gestor_espaco`), retrocompatível via `DEFAULT 'fluxo_normal'`.
- **Fluxo A (Aceleração)** — Gestor de Espaço aprova reserva já criada, sob as restrições: (1) exclusivamente hoje; (2) reserva contém **só** horários de hoje; (3) sem conflito com horário deferido; (4) validação de expediente do Setor.
- **Fluxo B (Walk-in)** — Gestor de Espaço cria reserva em nome de terceiro, já nascendo `deferida`, **síncrono e atômico** (não reutiliza `ProcessarCriacaoReserva`).
- **Permission nova** `reservas.avaliar-urgencia`, atribuída **exclusivamente ao role `gestor_espaco`** — **Institucional não a recebe automaticamente** (P-34, exclusão explícita no `RoleSeeder`).
- **Policy nova** `ReservaPolicy::avaliarComUrgencia()` — checagens de escopo espacial, data, conflito, expediente do Setor.
- **Notificação `UrgencyReservationApprovedNotification`** — destinatário único: o Gestor de Reserva titular da agenda (`Agenda.user`), **obrigatoriamente `ShouldQueue`** com `try-catch` na invocação (P-14).
- **Endpoint de busca por e-mail** — busca exato de usuário por e-mail, retorna máximo 1 registro com campos mínimos (`id`, `nome`), sob permission dedicada `usuarios.buscar-para-atendimento`, com rate limiting obrigatório (D-3).
- **Rastreamento de avaliador** — `Horario.user_id = gestorEspaco->id` em ambos os fluxos, distinguindo do fluxo normal via `origem_avaliacao` (P-31).

---

## O Que NÃO Entrega

- **Fluxo A nunca aprova reserva com horário fora de hoje (P-17).** Se a reserva submetida contiver qualquer horário de data diferente (outro dia, outro turno não solicitado no ato), a urgência é recusada e o caso volta ao fluxo normal do Gestor de Reserva.
- **Urgência é exclusivamente do mesmo dia (P-15).** Nenhuma aprovação de urgência pode valer para data futura.
- **Límite de uso da urgência (P-19).** Nenhum limite é implementado neste sprint — a mitigação vem do bloqueio automático quando o Gestor de Reserva está em expediente (D-2, Sprint 4).
- **`tipo_vinculo` não é integrado com SIGAA ou outro SIS (P-26).** É auto-declarado apenas.
- **Prioridade não é trava automática (P-18).** É apenas sugestão à decisão humana — o Gestor de Espaço sempre decide.
- **Validação de expediente** — depende do Sprint 4 (Setor Expandido) estar completo; este sprint **consome** aquela camada, não a implementa.

---

## Definição de Versão Estável

Ao fim deste sprint, `develop` deve estar **deployável sem quebras funcionais**, mesmo que a 2.0 ainda esteja incompleta.

**Invariantes obrigatórias ao fechar o sprint:**

1. **Migrations aplicadas, schema consumido.** `users.tipo_vinculo DEFAULT 'externo'` e `horarios.origem_avaliacao DEFAULT 'fluxo_normal'` retrocompatíveis.
2. **Permission criada antes do Role ser sincronizado.** A tabela `permissions` contém `reservas.avaliar-urgencia` e a tabela `role_has_permission` a exclui para o `institucional`.
3. **Policy checada toda vez.** Qualquer request que toque `Horario` passa pela Policy `avaliarComUrgencia()` ou `view()`; nunca há caminho "de confiança".
4. **Notificação implementada com `ShouldQueue`.** Não há rota de aprovação de urgência que não dispare a notificação ao final.
5. **Defesa em profundidade** — a query de update final filtra por escopo (`whereIn('agenda.espaco_id', ...)`), redundante com a Policy (padrão de `AvaliarReservaJob`).
6. **Fluxo B é síncrono.** Não enfileira em `ProcessarCriacaoReserva`; cria `Reserva` + `Horarios` + notificação atomicamente.
7. **Testes integram Sprint 4.** Os testes de urgência validam os 3 estados do expediente (`true`, `false`, `null`).
8. **Nenhuma regressão.** Todo teste da suite passando; `tsc --noEmit` limpo; ESLint sem novas supressões.

---

## Dependências

| Sprint | Componente | Por Quê |
|---|---|---|
| **Sprint 2** (Gestor de Espaço) | Role `gestor_espaco` precisa existir; algoritmo `getEspacosGeridosPorGestorEspaco()` | A Policy `avaliarComUrgencia()` valida escopo usando esse algoritmo; sem o role, a permission não tem alvo |
| **Sprint 4** (Setor / Expediente) | `Setor.expediente` com os 3 estados; `ExpedienteService::estaEmExpediente()` | O bloqueio automático quando o Gestor de Reserva está em expediente (D-2) é **a principal mitigação do risco R-09** (abuso do mecanismo); urgência sem esse bloqueio nasce frágil — recomenda-se que a entrega **inclua** Sprint 4 junto |

---

## Links de Referência

- **Decisões consolidadas:** [`../../00-visao-geral/03-decisoes-consolidadas.md`](../../00-visao-geral/03-decisoes-consolidadas.md) (P-14 a P-31, D-1 a D-9)
- **Especificação técnica completa:**
  - Seções 7 e 8 de [`../../auditoria-origem-docs/03-modelagem-dados-vinculos-precedencia.md`](../../auditoria-origem-docs/03-modelagem-dados-vinculos-precedencia.md)
  - Matriz de riscos e perguntas: [`../../auditoria-origem-docs/07-matriz-riscos.md`](../../auditoria-origem-docs/07-matriz-riscos.md) (R-09, R-14, R-16, D-2 a D-4)
  - Novos atores: [`../../auditoria-origem-docs/02-especificacao-novos-atores.md`](../../auditoria-origem-docs/02-especificacao-novos-atores.md) §1.4 e §1.6
- **Diagramas de sequência:** [`../../02-fluxos-e-diagramas/03-diagramas-de-sequencia.md`](../../02-fluxos-e-diagramas/03-diagramas-de-sequencia.md) (Fluxos A e B da urgência)
- **Matriz de permissions:** [`../../03-arquitetura/03-matriz-de-permissions.md`](../../03-arquitetura/03-matriz-de-permissions.md)

---

## Nota sobre Nomenclatura

A auditoria de origem referencia este sprint como "Sprint 5" no roadmap. Documentos anteriores podem referenciá-lo como "Fase 8" (numeração antiga do roadmap, antes do reordenamento). A numeração atual prevalece.
