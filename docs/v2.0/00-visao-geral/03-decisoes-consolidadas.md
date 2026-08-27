# 03 — Decisões Consolidadas (Rodadas 3, 4, 5)

**Sumário:** 43 decisões fechadas (21 + 13 + 9), nenhum bloqueio remanescente.

> Esta é a fonte canônica de rastreabilidade de TODAS as decisões de negócio tomadas nas Rodadas 3, 4 e 5 da auditoria de gestores de unidade/espaço. Toda decisão citada em qualquer outro documento de `docs/v2.0/` deve referenciar o ID definido aqui por uma destas formas: `P-XX`, `D-X` ou `R-XX` (risco).

---

## Bloco 1 — Rodada 3: Decisões Fechadas (P-01 a P-21)

Respostas às 21 perguntas da Rodada 2, após investigação direta em código de `develop` (commit `0306320`, 2026-08-27).

| ID | Pergunta (resumo) | Decisão do Usuário |
|---|---|---|
| **P-01** | Destino da branch `feat/tickets-module`? | **Reaproveitar partes dela, adaptando** aos novos requisitos desta auditoria (não é descarte nem reaproveitamento literal). |
| **P-02** | Renomear chave do role `gestor`? | **Não por enquanto** — mantém a chave `gestor`, organiza-se depois. |
| **P-03** | Mais de um Gestor de Unidade por campus? | **Sim, permitir livremente** — facilita a gestão. |
| **P-04** | Entidade nomeada de setor de gestão de espaço? | **Adiar, mas manter a análise documentada** (já está no documento 03, §2.4 — nada a fazer agora, só preservar). |
| **P-05** | Gestor de Unidade cria/exclui Módulo/Andar/Setor/Espaço? | **Sim, CRUD completo.** Além disso, remover a necessidade do Institucional fazer — o Institucional passa a atribuir o Gestor de Unidade, que then conduz todo o processo. |
| **P-06** | Gestor de Unidade cria/exclui estrutura física? | **Confirmado — Sim, CRUD completo** (complementa P-05). |
| **P-07** | Gestor de Unidade participa da aprovação de reservas? | **Não — exclusivamente administrativo/analítico.** `ReservaPolicy` permanece sem qualquer menção a `gestor_unidade`. |
| **P-08** | Suplência/delegação temporária agora? | **Não precisamos agora.** |
| **P-09** | "Setores" = entidade `Setor` ou linguagem genérica? | **Genérica** — "será um usuário que terá atribuído o papel" (confirma que não há fusão com a entidade `Setor`; mas ver P-23). |
| **P-10** | Espaços órfãos: para quem? | **Ambos, mas com profundidade diferente:** Gestor de Unidade vê **lista detalhada** dos órfãos do seu campus; Institucional vê **apenas visão analítica** (agregada/contadores), não a lista item a item entre todos os campi. |
| **P-11** | Reconciliação futura com PR #397? | **Sim — deixar já elencado** (ver checklist em documento 07, §5). |
| **P-12** | Acumular `gestor_unidade` + outro papel no mesmo escopo? | **Permitir livremente.** |
| **P-13** | Rótulo customizável por Unidade? | **Sim, pode ter.** |
| **P-14** | Segundo destinatário da notificação de urgência? | **Não — apenas o Gestor de Reserva mesmo.** |
| **P-15** | Urgência vale para dia futuro? | **Não — apenas o mesmo dia.** Nenhuma aprovação de urgência pode valer para data futura. |
| **P-16** | Validação automática de expediente? | Resposta expandida — introduz a **nova taxonomia `tipo_vinculo`** em `User` (Estudante, Professor, Técnico-Administrativo, Externo). Explicitamente substituída por **P-23** (Rodada 4). |
| **P-17** | Fluxo A (solicitante cria) e/ou B (Gestor de Espaço cria no balcão)? | **Ambos.** No fluxo A, a reserva submetida deve conter **exclusivamente** o(s) horário(s) daquele momento — não pode incluir dias/horários além do solicitado no ato de urgência. |
| **P-18** | Prioridade é trava automática ou apoio? | **Apoio à decisão humana, sem trava.** |
| **P-19** | Limite de uso da urgência? | **Não, por agora não.** |
| **P-20** | Tutorial genérico ou por equipamento? | **Genérico** (por tipo de chamado). |
| **P-21** | Páginas compartilhadas retroativas a tudo? | **Sim — retroativo sobre todo o projeto.** |

---

## Bloco 2 — Rodada 4: Decisões Fechadas (P-22 a P-34)

Respostas a dúvidas bloqueantes levantadas na análise da Rodada 3, mapeando impactos e interdependências.

| ID | Decisão do Usuário | Efeito no Desenho |
|---|---|---|
| **P-22** | Institucional **mantém a capacidade técnica**. | `ModuloPolicy`/`SetorPolicy`/`EspacoPolicy` usam `OR` (institucional **ou** gestor de unidade escopado), não `XOR`. Bootstrap de unidade nova fica garantido. |
| **P-23** | **Setor entra em escopo agora** como entidade expandida, com **coordenador** e expediente. | Substitui e refina P-16. Backlog vira entrega. Desenho de menor custo em documento 03, §9 (colunas aditivas + 1 tabela de exceções por intervalo). Abre dúvida **D-1** (semântica do coordenador). |
| **P-24** | Corrigir o bug **R-12** (NPE em `Auth::user()->setor->unidade->instituicao_id` quando `setor_id` nulo) **dentro** desta iniciativa. | Entra na fase de Policies escopadas, junto com a reescrita do escopo nos mesmos 5 arquivos. |
| **P-25** | `tipo_vinculo` = estudante/professor/técnico-administrativo/externo. **Monitor era só exemplo** (não vira categoria). **Técnico-administrativo = mesmo grau de professor**. | Elimina a coluna `is_monitor` e qualquer enum paralelo. Prioridade vira função derivada com empate no nível 1. |
| **P-26** | `tipo_vinculo` **auto-declarado**. | Sem verificação/integração externa na v1. |
| **P-27** | Default `externo` para a base legada. | Backfill conservador, sem conceder prioridade indevida. |
| **P-28** | **Suportar exceções** de expediente. | Tabela `setor_excecoes_expediente` com intervalo (recesso = 1 linha, não 15). |
| **P-29** | **Renomear** o prefixo de rotas (vira **D-7** na Rodada 5). | Custo medido: **51 referências** `'institucional.*'` em `resources/js`. Atômico (URL + nome juntos). |
| **P-30** | **Só usuários cadastrados** podem ter reserva — solicitar cadastro na hora. | Preserva `reservas.user_id NOT NULL`. Abre dúvidas **D-3** e **D-4**. |
| **P-31** | Gestor de Espaço fica registrado como avaliador. | `Horario.user_id = gestorEspaco->id` + `origem_avaliacao` distingue do fluxo normal. |
| **P-32** | **Remover** as permissions órfãs de `Andar`. | Migration removendo `andares.criar`/`andares.atualizar` + limpeza em `permission-labels.ts`. |
| **P-33** | Gestor de Unidade **pode** editar a própria Unidade. | Recomenda-se limitar a `label_gestor` (confirmado em **D-8**). |
| **P-34** | **Excluir** `reservas.avaliar-urgencia` do Institucional. | Adiciona 3ª exclusão no `RoleSeeder`, seguindo o precedente de `reservas.deletar`/`reservas.atualizar`. |

---

## Bloco 3 — Rodada 5: Decisões Fechadas (D-1 a D-9)

Resolução das 9 dúvidas bloqueantes e não-bloqueantes levantadas na Rodada 4.

| ID | Decisão | Efeito |
|---|---|---|
| **D-1** | O **Gestor de Unidade configura manualmente, por setor, quem é o responsável** por alterar as informações do setor (incluindo horário de funcionamento). | Confirma a opção (b): `coordenador_id` é FK de responsabilidade, **não** role. Nenhum 6º ator é criado. |
| **D-2** | Validação de expediente em urgência: `false` → libera; `null` → **libera com aviso**; `true` → **bloqueia**. | Transforma o expediente de informativo para verificável, mitigando **risco R-09**. |
| **D-3** | Busca de usuário para Fluxo B (walk-in). | Endpoint **estreito**: busca por **e-mail exato**, retornando no máximo 1 registro, sob permission dedicada. |
| **D-4** | Cadastro da pessoa walk-in. | Cadastro **no dispositivo da própria pessoa** (QR Code no balcão) — evita deslogar o Gestor de Espaço. |
| **D-5** | Notificação ao solicitante após urgência. | Manter as notificações padrão para o solicitante (P-14 tratava apenas de destinatários **adicionais** da notificação de urgência). |
| **D-6** | Preenchimento do expediente inicial dos setores. | Preencher **gradualmente** (não bloqueia nada), com indicador no dashboard do Gestor de Unidade mostrando setores sem expediente. Mitiga **risco R-20**. |
| **D-7** | Renomear rotas de P-29 (URL + nome juntos). | Novo prefixo: **`/administrativo/`** (não `/gestao/` — `/gestor/` já existe no projeto). Atômico em Fase 11. |
| **D-8** | Limite da edição de Unidade pelo Gestor de Unidade (P-33). | Limitar a **`label_gestor`** — nome/sigla do campus são identidade institucional. |
| **D-9** | Formato do `TipoChamado.tutorial` (QR Code / assistência). | **Markdown, renderizado com sanitização** — a rota `/reportar/` é pública e sem autenticação, então HTML livre seria vetor de XSS. |

> **Nota sobre D-9:** não foi respondida literalmente em Rodada 5; decisão foi assumida por omissão e contexto de segurança. Sinalizar se discordar.

---

## Delimitações Aplicadas

Três correções de segurança decorrentes das respostas da Rodada 5, não conflitando com decisões anteriores, mas precisando de registro explícito para evitar brecha na implementação.

### 1. O responsável pelo setor edita apenas campos de expediente (R-21)

D-1 diz "responsável por alterar **as informações do setor**". Tomado ao pé da letra, isso incluiria `unidade_id` — o que permitiria a um responsável **mover o setor para outro campus**, escapando do escopo do Gestor de Unidade que o designou.

**Delimitação:** o responsável edita **apenas os campos de expediente** — `horario_abertura`, `horario_fechamento`, `dias_funcionamento` e as exceções. **Não** edita `nome`, `sigla`, `unidade_id` nem `coordenador_id`.

### 2. Alterações de expediente exigem trilha de auditoria (R-22)

Com D-2 (bloquear quando `true`), o expediente deixa de ser informativo e passa a **governar** se a urgência é permitida. Como D-1 dá a um usuário o poder de editar esse expediente, ele controla indiretamente o mecanismo.

**Delimitação:** registrar todas as alterações de expediente em tabela de auditoria — barato de implementar e suficiente como controle. O Gestor de Unidade pode corrigir a qualquer momento.

### 3. A resolução `Agenda.user → User.setor` é premissa explícita (R-23)

A regra de negócio é "o **setor que gerencia a agenda** encerrou o expediente". O modelo resolve isso via o setor **pessoal** do usuário gestor (`users.setor_id`), que é um vínculo de RH. Os dois coincidem no caso comum, mas **não são a mesma coisa**.

**Premissa explícita:** se divergências reais aparecerem, o vínculo passaria a ser modelado na própria `Agenda` — mas por enquanto, a resolução por `User.setor` fica registrada como desenho intencional.

---

## Decisões Mais Impactantes

Oito decisões que moldaram fundamentalmente o desenho do novo sistema de atores e fluxos.

1. **P-05/P-06: Gestor de Unidade ganha CRUD completo; Institucional recua para bootstrap.**  
   O Institucional deixa de ser o operador direto de Módulo/Andar/Setor/Espaço e passa a delegá-lo — permanecendo como fallback de bootstrap e visão analítica macro.

2. **P-07: Gestor de Unidade fica inteiramente fora do fluxo de reservas, mesmo em urgência.**  
   Garantia de separação de papéis: infraestrutura e operação de reservas são responsabilidades ortogonais.

3. **P-09: "Setores" na fala original era linguagem genérica, não a entidade `Setor`.**  
   Evita confusão crítica entre setor organizacional (RH) e escopo de gestão de infraestrutura — mas P-23 depois trouxe a entidade `Setor` de volta para outro propósito (expediente), sem contradizer P-09.

4. **P-10: Órfãos têm profundidades diferentes.**  
   Gestor de Unidade vê lista detalhada escopada; Institucional vê visão analítica agregada — alinha-se ao princípio de "cada ator enxerga seu nível de responsabilidade".

5. **P-17: Ambos os fluxos de urgência (A e B) são suportados.**  
   Flexibilidade operacional preservada: solicitante cria (A, assincrono) e Gestor de Espaço cria no balcão (B, presencial/síncrono).

6. **P-18/P-25: Prioridade de urgência é apoio informativo sem trava; taxonomia única `tipo_vinculo`, sem categoria "monitor".**  
   Decisão de negócio humanista: o sistema recomenda, a pessoa decide. Monitor passa a ser flag sobre `estudante`, unificando a fonte de verdade.

7. **D-2/D-6: Bloqueio automático de urgência quando Gestor de Reserva está em expediente, liberação com aviso quando indeterminado, preenchimento gradual.**  
   Transforma a urgência de "baseada em confiança" para "verificável e transparente" — mas não bloqueia o sistema no deploy quando os dados ainda não existem.

8. **P-29/D-7: Rename do prefixo de rotas para `/administrativo/` (não `/gestao/`), atômico (URL + nome).**  
   Alinha rota com estrutura de arquivos existente (`pages/Administrativo/`), resolvendo conflito de nomenclatura com `/gestor/` já existente.

---

## Análise de Regressão

Verificação sistemática: **nenhuma decisão da Rodada 5 contradiz decisão anterior.** O único caso de "substituição" — D-2 tornando automática uma validação que P-16 havia dispensado — está registrado como supersessão explícita por P-23, com a trilha completa preservada.

| Verificação | Resultado |
|---|---|
| D-1 × P-09 ("setores" era genérico; gestão é por usuário com papel) | ✅ **Coerente** — o responsável é um usuário designado, não um role. |
| D-1 × escopo de "5 atores" | ✅ **Preservado** — nenhum ator novo. |
| D-1 × P-05/06 (Gestor de Unidade tem CRUD de Setor) | ✅ **Coerente** — designar o responsável é parte desse CRUD. |
| D-2 × P-16 (originalmente: "sem validação automática") | ⚠️ **Supersedido, não contraditório** — P-16 foi explicitamente substituído por P-23 na Rodada 4. |
| D-2 × P-19 (sem limite de uso da urgência) | ✅ **Reforça** — com bloqueio automático, a necessidade de limite cai ainda mais. |
| D-3 × RoleSeeder (sincronização automática ao institucional) | ✅ **Sem problema** — o institucional já tem `usuarios.listar`; a permission estreita é redundante para ele. |
| D-5 × supressão de e-mail da auto-aprovação | ✅ **Sem conflito** — no Fluxo B o solicitante não é gestor da agenda, então a supressão não se aplica. |
| D-8 × "Gestor de Unidade tem CRUD completo" | ✅ **Coerente** — a exceção é deliberada e alinhada a "não pode criar/excluir a própria Unidade". |
| D-7 × prefixo `/gestor/` já existente | ✅ **Resolvido** — mudança de `/gestao/` para `/administrativo/` elimina conflito. |

**Conclusão:** nenhuma regressão identificada. As três delimitações aplicadas (§ acima) resolvem brechas potenciais sem contradição.

---

## Rastreabilidade

Toda decisão citada em qualquer outro documento de `docs/v2.0/` deve referenciar o ID definido aqui por uma destas formas:
- `P-XX` para decisões da Rodada 3 (perguntas de negócio)
- `P-XX` para decisões da Rodada 4 (perguntas de detalhe)
- `D-X` para decisões da Rodada 5 (dúvidas de implementação)
- `R-XX` para riscos catalogados em `docs/auditoria-gestores-unidade-espaco/07-matriz-riscos-lacunas-perguntas-abertas.md`

Exemplo: "Conforme **P-07**, o Gestor de Unidade fica fora do fluxo de reservas."
