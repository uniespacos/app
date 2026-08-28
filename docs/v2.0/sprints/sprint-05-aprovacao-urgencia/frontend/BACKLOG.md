# Sprint 5 — Aprovação de Urgência · Frontend Backlog

**Objetivo:** Implementar a trilha de frontend da aprovação de reservas em regime de urgência (Fluxo A e Fluxo B), incluindo novos contratos, campos de cadastro, widget de aprovação, badges de origem/aviso, e defesa contra abuso da urgência.

**Prioridade:** Alta — desbloqueador para validação de ponta a ponta do fluxo de urgência.

**Dependências em Paralelo:** `backend/BACKLOG.md` (S5-BE-01 a S5-BE-12).

---

## S5-FE-01 — Criar Contrato SSOT de `TipoVinculo`

- **Objetivo:** Definir o contrato único de verdade (SSOT) para os 4 tipos de vínculo institucional do usuário, reusável em telas de cadastro, perfil, aprovação de urgência e testes.
- **Caso de uso:** UC-23 (autodeclaração de categoria no cadastro).
- **Atores envolvidos:** Comum (ao se cadastrar e editar perfil).
- **Partes afetadas:**
  - `resources/js/contracts/tipo-vinculo.contract.ts` (NOVO)
  - `resources/js/contracts/contracts.test.ts` (extensão com teste de contrato)
- **Depende de:** Nenhuma.
- **Riscos relacionados:** R-14 (autodeclaração de taxonomia — mitigado por P-18: categoria não bloqueia, é apenas apoio informativo).
- **Casos de teste obrigatórios:**
  - `test_contrato_tipo_vinculo_exporta_4_valores` — valida que o contrato exibe `ESTUDANTE`, `PROFESSOR`, `TECNICO_ADMINISTRATIVO`, `EXTERNO`.
  - `test_contrato_tipo_vinculo_valores_imutaveis` — afirma que os 4 valores literais nunca mudam (quebra se renomeado).
  - `test_assertNever_cobre_tipo_vinculo` — mock de switch sobre TipoVinculo com `default: assertNever(...)` lança erro se new case é adicionado.
- **Critérios de aceite:**
  - [ ] Arquivo `resources/js/contracts/tipo-vinculo.contract.ts` criado com export `const TipoVinculo = { ESTUDANTE, PROFESSOR, TECNICO_ADMINISTRATIVO, EXTERNO }`.
  - [ ] Valores coincidem com enum backend (`TipoVinculoEnum` em `app/Enums/`).
  - [ ] Testes passam em `npx jest contracts.test.ts`.
  - [ ] Contrato é importável em componentes de cadastro e perfil.

---

## S5-FE-02 — Criar Contrato SSOT de `OrigemAvaliacao`

- **Objetivo:** Definir o contrato único de verdade para os 2 valores de origem da avaliação (fluxo normal vs. urgência), reusável em badges, notificações e testes.
- **Caso de uso:** UC-21 (Fluxo A e B), UC-22 (aprovação por urgência).
- **Atores envolvidos:** Gestor de Espaço (ao aprovar com urgência), Gestor de Reserva (ao ver origem da aprovação).
- **Partes afetadas:**
  - `resources/js/contracts/origem-avaliacao.contract.ts` (NOVO)
  - `resources/js/contracts/contracts.test.ts` (extensão)
- **Depende de:** Nenhuma.
- **Riscos relacionados:** Nenhum específico.
- **Casos de teste obrigatórios:**
  - `test_contrato_origem_avaliacao_exporta_2_valores` — valida `FLUXO_NORMAL` e `URGENCIA_GESTOR_ESPACO`.
  - `test_assertNever_cobre_origem_avaliacao` — defesa de evolução.
- **Critérios de aceite:**
  - [ ] Arquivo `resources/js/contracts/origem-avaliacao.contract.ts` criado.
  - [ ] Valores: `FLUXO_NORMAL = 'fluxo_normal'`, `URGENCIA_GESTOR_ESPACO = 'urgencia_gestor_espaco'`.
  - [ ] Testes passam.
  - [ ] Contrato importável em components/atoms/badges.

---

## S5-FE-03 — Estender `auth/register` e `ProfilePage` com Campo `tipo_vinculo`

- **Objetivo:** Permitir que o usuário declare seu vínculo institucional (Estudante/Professor/Técnico-Administrativo/Externo) no cadastro e edit o valor no perfil, consumindo o contrato S5-FE-01.
- **Caso de uso:** UC-23 (autodeclaração de vínculo).
- **Atores envolvidos:** Comum (cadastro), qualquer papel autenticado (edição de perfil).
- **Partes afetadas:**
  - `resources/js/presentation/pages/auth/Register.tsx` (extensão)
  - `resources/js/presentation/pages/Profile/ProfilePage.tsx` (extensão)
  - `resources/js/presentation/molecules/TipoVinculoSelect.tsx` (NOVO, reusável)
  - `resources/js/types/index.d.ts` (extensão: tipo `User` ganha `tipo_vinculo: string`)
- **Depende de:** S5-FE-01, S5-BE-01 (migration de `tipo_vinculo` em `users`).
- **Riscos relacionados:** R-14 (autodeclaração — sem impacto, é apenas informativo).
- **Casos de teste obrigatórios:**
  - `test_register_page_exibe_select_tipo_vinculo` — select está visível, com 4 opções.
  - `test_profile_page_exibe_tipo_vinculo_atual` — tipo_vinculo do usuário vem preenchido.
  - `test_tipo_vinculo_select_rejeita_valor_invalido` — validação no componente.
  - `test_submit_register_com_tipo_vinculo_envia_payload_correto` — form submit inclui field.
- **Critérios de aceite:**
  - [ ] `Register.tsx` inclui novo `<TipoVinculoSelect name="tipo_vinculo" />` após email/password.
  - [ ] `ProfilePage.tsx` exibe campo editável de `tipo_vinculo` na seção de informações pessoais.
  - [ ] Novo componente `TipoVinculoSelect.tsx` em `molecules/`, reutilizável, consumindo contrato S5-FE-01.
  - [ ] `User` type em `index.d.ts` estendido com `tipo_vinculo: string`.
  - [ ] Todos os testes passam (`npx jest`).
  - [ ] `npx tsc --noEmit` limpo.

---

## S5-FE-04 — Implementar `organisms/WidgetAprovacaoUrgencia.tsx`

- **Objetivo:** Bloco condicional visível apenas a Gestores de Espaço (permissão `reservas.avaliar-urgencia`) na página de Reservas do Gestor, listando horários livres do dia nos espaços gerenciados com seletor de prioridade sugerida e botão de aprovação (Fluxo A).
- **Caso de uso:** UC-21 (Fluxo A).
- **Atores envolvidos:** Gestor de Espaço (único consumidor).
- **Partes afetadas:**
  - `resources/js/presentation/organisms/WidgetAprovacaoUrgencia.tsx` (NOVO)
  - `resources/js/presentation/pages/Reservas/Gestor/*` (extensão com `<Can>` wrapper)
  - Possível novo hook/service para buscar horários livres do dia (consumirá endpoint S5-BE-08)
- **Depende de:** S5-FE-01 (prioridade derivada de TipoVinculo), S5-BE-08 (endpoint de listagem de horários livres do dia), S5-BE-09 (endpoint de aprovação).
- **Riscos relacionados:** R-09 (abuso de urgência — mitigado por validação de expediente no backend + notificação obrigatória), R-18 (permissions sequenciadas corretamente).
- **Casos de teste obrigatórios:**
  - `test_widget_aparece_apenas_com_reservas_avaliar_urgencia` — não renderiza se usuário sem permission.
  - `test_widget_lista_horarios_livres_do_dia_nos_espacos_gerenciados` — chamada ao backend retorna horários de 5 espaços, apenas de hoje.
  - `test_widget_exibe_prioridade_sugerida_sem_trava` — dropdown de categoria mostra ordem sugerida mas permite qualquer seleção.
  - `test_aprova_horario_quando_botao_clicado` — click em "Aprovar" submete `PATCH /gestor-espaco/reservas-urgentes/{horarioId}` com categoria.
  - `test_aprovacao_com_sucesso_mostra_notificacao` — toast de sucesso aparece.
  - `test_aprovacao_falha_mostra_erro` — request 403 exibe mensagem de erro clara.
- **Critérios de aceite:**
  - [ ] Widget só renderiza dentro de `<Can permission="reservas.avaliar-urgencia">`.
  - [ ] Widget faz GET ao endpoint S5-BE-08 ao montar (horários livres do dia).
  - [ ] Exibe tabela/lista de horários com colunas: Espaço, Horário, Solicitante, Categoria Sugerida.
  - [ ] Dropdown de categoria mostra 4 opções (Prof, Téc-Adm, Aluno, Externo) com ordem de prioridade como hint (ex.: ícone), sem reordenação automática.
  - [ ] Botão "Aprovar" desabilitado até categoria ser selecionada.
  - [ ] Submit envia `PATCH /gestor-espaco/reservas-urgentes/{horarioId}` com `{ categoria_solicitante_urgencia }`.
  - [ ] Resposta 200 mostra toast de sucesso; remove linha da tabela ou recarrega lista.
  - [ ] Resposta 403/422 mostra toast de erro com mensagem do backend.
  - [ ] `npx jest` 100% verde.
  - [ ] `npx tsc --noEmit` limpo.

---

## S5-FE-05 — Implementar Fluxo B (Walk-in): UI de Busca de Usuário e Criação Assistida de Reserva

- **Objetivo:** Interface de busca de usuário por e-mail exato (sem listar todos) + formulário de criação de reserva em nome de terceiro (já aprovada, Fluxo B), com orientação visual para cadastro no dispositivo próprio quando o usuário não existe.
- **Caso de uso:** UC-21 (Fluxo B), UC-22 (criação de reserva por Gestor de Espaço).
- **Atores envolvidos:** Gestor de Espaço (operador), Comum (solicitante, não no dispositivo do atendente).
- **Partes afetadas:**
  - `resources/js/presentation/pages/FluxoBWalkin.tsx` ou seção dentro de `Reservas/Gestor/*` (NOVO ou extensão)
  - `resources/js/presentation/molecules/BuscaUsuarioPorEmail.tsx` (NOVO)
  - `resources/js/presentation/organisms/FormCriacaoReservaAssistida.tsx` (NOVO)
  - `resources/js/presentation/atoms/AvisoQRCodeCadastro.tsx` (NOVO)
- **Depende de:** S5-BE-09 (endpoint de busca por e-mail), S5-BE-10 (endpoint de criação com urgência), S5-FE-03 (tipo_vinculo).
- **Riscos relacionados:** R-09 (abuso — rate limiting no endpoint de busca, D-3), R-16 (auto-aprovação — não dispara, criação é síncrona com aprovação já no banco).
- **Casos de teste obrigatórios:**
  - `test_busca_usuario_por_email_retorna_1_resultado` — input "usuario@example.com", submit, retorna { id, nome }.
  - `test_busca_usuario_por_email_nao_encontrado_mostra_aviso_qrcode` — email não encontrado, exibe aviso com QR Code de /register.
  - `test_busca_usuario_por_email_mostra_aviso_cadastre_no_proprio_dispositivo` — orientação clara de que o cadastro deve ser no dispositivo da pessoa (D-4).
  - `test_form_criacao_reserva_mostra_opcoes_de_espaco_gerenciado` — após encontrar usuário, select de espaço com só os gerenciados.
  - `test_form_criacao_reserva_mostra_horarios_disponiveis_hoje` — após espaço, grid/list de horários de hoje (consumir endpoint S5-BE-08).
  - `test_criacao_com_sucesso_mostra_notificacao` — submit criação retorna 201, toast de "Reserva criada e aprovada".
  - `test_criacao_falha_403_mostra_espaço_fora_do_escopo` — erro claro sobre escopo.
  - `test_criacao_falha_422_conflito_horario` — erro sobre horário já ocupado.
- **Critérios de aceite:**
  - [ ] Nova página/seção `FluxoBWalkin` ou modal acessível do widget de urgência (se juntar S5-FE-04 e S5-FE-05).
  - [ ] Componente `BuscaUsuarioPorEmail` com input de e-mail + botão "Localizar".
  - [ ] Busca submete GET a `/usuarios/buscar-atendimento?email={email}` (endpoint S5-BE-09), com rate limiting cliente-side (debounce 300ms, max 5 tentativas).
  - [ ] Busca encontrada: exibe `<div>{usuario.nome}</div>` com botão "Continuar".
  - [ ] Busca não encontrada: exibe `<AvisoQRCodeCadastro />` com QR code de `/register` e texto "Solicite o cadastro no **próprio celular da pessoa**" (D-4).
  - [ ] Formulário de criação pós-busca: select de Espaço (apenas gerenciados), grid de horários de hoje com `expandHorarios()` (reaproveita serviço de expansão).
  - [ ] Seleção de horários: checkbox múltipla ou visual de drag/select.
  - [ ] Submit `POST /gestor-espaco/reservas-urgentes` com `{ usuario_id, espaco_ids[], horarios[] }` (endpoint S5-BE-10).
  - [ ] Resposta 201: toast "Reserva criada e aprovada" + limpa formulário ou redireciona.
  - [ ] Resposta 403: "Espaço fora do seu escopo"; 422: "Horário indisponível ou em conflito".
  - [ ] Avisos UX claros em cada passo (permissão, disponibilidade, escopo).
  - [ ] `npx jest` 100% verde.
  - [ ] `npx tsc --noEmit` limpo.

---

## S5-FE-06 — Implementar `atoms/OrigemAvaliacaoBadge.tsx`

- **Objetivo:** Badge pequeno indicando "Aprovado em regime de urgência" ou similar, exibido no card/detalhe de reserva sempre que `Horario.origem_avaliacao !== 'fluxo_normal'`, para transparência ao solicitante e ao Gestor de Reserva.
- **Caso de uso:** UC-21 (visibilidade de decisão), UC-22 (transparência).
- **Atores envolvidos:** Comum (solicitante), Gestor de Reserva, Gestor de Espaço (visualização).
- **Partes afetadas:**
  - `resources/js/presentation/atoms/OrigemAvaliacaoBadge.tsx` (NOVO)
  - `resources/js/presentation/molecules/ReservaCard.tsx` (extensão com importação do badge)
  - `resources/js/presentation/pages/Reservas/DetalheReserva.tsx` (extensão)
  - Qualquer outro local que exiba uma reserva (reutilização do atom)
- **Depende de:** S5-FE-02 (contrato OrigemAvaliacao), contrato `Horario` retornando campo `origem_avaliacao` do backend.
- **Riscos relacionados:** Nenhum específico.
- **Casos de teste obrigatórios:**
  - `test_badge_nao_renderiza_quando_origem_fluxo_normal` — hidden se `origem_avaliacao === 'fluxo_normal'`.
  - `test_badge_renderiza_quando_origem_urgencia` — visível se `origem_avaliacao === 'urgencia_gestor_espaco'`.
  - `test_badge_exibe_texto_correto` — texto é "Aprovado em regime de urgência" ou i18n key correspondente.
  - `test_badge_style_e_acessibilidade` — cor distinta (ex.: amarelo/warning), texto alternativo (aria-label).
- **Critérios de aceite:**
  - [ ] Atom `OrigemAvaliacaoBadge.tsx` criado, export default component com prop `origem: string`.
  - [ ] Renderiza badge estilizada apenas se `origem !== 'fluxo_normal'`.
  - [ ] Texto: "Aprovado em regime de urgência" (consultado de i18n).
  - [ ] Estilo Tailwind: use classe de warning/attention (ex.: `bg-yellow-100 text-yellow-800`), ícone opcional (ex.: ⚡).
  - [ ] Acessibilidade: `aria-label="Esta reserva foi aprovada em regime de urgência"`.
  - [ ] Importado e integrado em `ReservaCard` e `DetalheReserva`.
  - [ ] Testes passam.
  - [ ] `npx tsc --noEmit` limpo.

---

## S5-FE-07 — Implementar `atoms/AvisoExpedienteIndeterminado.tsx`

- **Objetivo:** Aviso visual exibido no fluxo de urgência quando a checagem de expediente retorna `null` (não configurado), comunicando que a validação não pôde ser feita sem bloquear a aprovação (D-2).
- **Caso de uso:** UC-21 (Fluxo A), UC-22 (validação de expediente).
- **Atores envolvidos:** Gestor de Espaço (ao aprovar com urgência).
- **Partes afetadas:**
  - `resources/js/presentation/atoms/AvisoExpedienteIndeterminado.tsx` (NOVO)
  - `resources/js/presentation/organisms/WidgetAprovacaoUrgencia.tsx` (extensão com importação)
- **Depende de:** S5-BE-06 (endpoint que retorna estado do expediente: true/false/null), backend respondendo com campo `estado_expediente_setor` ou mensagem de aviso.
- **Riscos relacionados:** R-20 (deploy com expedientes vazios — mitigado por avisar em vez de bloquear).
- **Casos de teste obrigatórios:**
  - `test_aviso_renderiza_quando_expediente_null` — visível se backend/contexto indica `null`.
  - `test_aviso_nao_renderiza_quando_expediente_true_ou_false` — hidden quando `true` (bloqueado pelo backend) ou `false` (liberado).
  - `test_aviso_exibe_texto_amigavel` — comunica "Não foi possível validar se o gestor está em expediente. Prosseguir com cautela." (D-2).
  - `test_aviso_com_icone_warning` — ícone de atenção (ex.: ⚠️).
- **Critérios de aceite:**
  - [ ] Atom `AvisoExpedienteIndeterminado.tsx` criado, export default component com prop `mostrar: boolean` ou `estado: 'indeterminado'`.
  - [ ] Renderiza aviso styled (ex.: `border-l-4 border-yellow-500 bg-yellow-50 text-yellow-800 p-3`) apenas se necessário.
  - [ ] Texto (i18n): "Não foi possível validar se o Gestor de Reserva está em expediente. Verifique se essa aprovação é apropriada antes de continuar."
  - [ ] Ícone: ⚠️ ou similar.
  - [ ] Acessibilidade: `role="alert"` (ARIA live region).
  - [ ] Integrado no `WidgetAprovacaoUrgencia` para ser exibido acima do botão de aprovação, se necessário.
  - [ ] Testes passam.
  - [ ] `npx tsc --noEmit` limpo.

---

## S5-FE-08 — Estender `resources/js/types/index.d.ts` e Testes de Contrato

- **Objetivo:** Adicionar campo `tipo_vinculo: string` ao tipo global `User`; expandir `contracts.test.ts` para cobrir os dois contratos novos (S5-FE-01 e S5-FE-02) com validação de `assertNever` em switches.
- **Caso de uso:** Qualquer caso que cita uso de `User.tipo_vinculo` (UC-23, UC-21, UC-22).
- **Atores envolvidos:** Qualquer desenvolvedor estendendo tipos de `User`.
- **Partes afetadas:**
  - `resources/js/types/index.d.ts` (extensão)
  - `resources/js/contracts/contracts.test.ts` (extensão)
- **Depende de:** S5-FE-01, S5-FE-02.
- **Riscos relacionados:** Nenhum específico (housekeeping).
- **Casos de teste obrigatórios:**
  - `test_user_type_inclui_tipo_vinculo` — `User` exporte propriedade `tipo_vinculo: string`.
  - `test_tipo_vinculo_enum_validavel` — tipo é unionable de 4 strings literais.
  - `test_contracts_test_cobre_tipo_vinculo_switch` — teste faz mock switch sobre `TipoVinculo` com `assertNever`, confirma que adição de novo case quebra test.
  - `test_contracts_test_cobre_origem_avaliacao_switch` — idem para `OrigemAvaliacao`.
- **Critérios de aceite:**
  - [ ] Arquivo `resources/js/types/index.d.ts` actualizado: `interface User { ..., tipo_vinculo: 'estudante' | 'professor' | 'tecnico_administrativo' | 'externo' }` (ou importar contrato).
  - [ ] `contracts.test.ts` estendido com 4+ testes cobrindo TipoVinculo e OrigemAvaliacao.
  - [ ] Cada teste inclui switch mock com `default: return assertNever(valor)` (validação exhaustive).
  - [ ] Testes passam (`npx jest contracts.test.ts`).
  - [ ] `npx tsc --noEmit` limpo (nenhum erro de tipo).
  - [ ] `npx eslint resources/js --suppressions-location <(echo '{}')` sem novas supressões.

---

## Ordem de Implementação Sugerida

1. **S5-FE-01, S5-FE-02** — Contratos isolados (sem dependências de UI).
2. **S5-FE-03** — Estender páginas simples com novos campos (aproveitando contratos de #1 e #2).
3. **S5-FE-08** — Tipos e testes globais (aproveita #1, #2, #3).
4. **S5-FE-06, S5-FE-07** — Atoms isolados (pequenos, reutilizáveis).
5. **S5-FE-04, S5-FE-05** — Widgets/organismos compostos (dependem de #1–#4 e backends S5-BE-*).

---

## Definição de Pronto (DDP) — Frontend

Cada task desta trilha está pronta quando:

- [ ] Todos os critérios de aceite marcados.
- [ ] Todos os casos de teste listados **implementados e passando** em `npx jest`.
- [ ] `npx tsc --noEmit` retorna 0 (sem erros de tipo).
- [ ] `npx eslint resources/js --suppressions-location <(echo '{}')` sem novas supressões (tolerância zero).
- [ ] Nenhuma regra inviolável de `REGRAS_INVIOLAVEIS_E_PADROES.md` violada.
- [ ] Componentes reutilizáveis (S5-FE-06, S5-FE-07, S5-FE-08) estão em pastas corretas (`atoms/`, `molecules/`).
- [ ] Contratos SSOT (S5-FE-01, S5-FE-02) importáveis de camadas múltiplas sem circular dependency.
- [ ] i18n keys adicionadas (se houver strings novas).
