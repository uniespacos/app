# 01 — Escopo e Objetivos da Versão 2.0

> **Propósito deste documento:** Delimitar o que a v2.0 resolve, quais atores serão introduzidos, e o que deliberadamente fica de fora desta rodada.

---

## 1. Contexto Atual (UniEspaços 1.x)

O sistema hoje opera com **3 papéis**:

| Papel | Vínculo de Escopo | Responsabilidade |
|---|---|---|
| `comum` | Nenhum (dados pessoais) | Solicitar reservas, consultar horários |
| `gestor` | `Agenda.user_id` (1:N) — turno de um espaço | Avaliar/aprovar reservas de sua(s) agenda(s) |
| `institucional` | Nenhum (global, sobre os 3 campi) | Administrar toda a estrutura física, setores, usuários, papéis, análises globais |

**Modelo de governança:** binário e rígido. Não existe camada intermediária entre gestor de uma agenda específica e administrador global irrestrito. Isso cria dois problemas operacionais:

1. Um campus não tem coordenador próprio — cada decisão sobre os espaços do campus vira responsabilidade do Institucional.
2. Manutenção de infraestrutura (equipamentos, ar condicionado, projetores) não é explicitamente um papel separado — fica confundida com "autoridade sobre a agenda de reservas".

---

## 2. Objetivo da v2.0

Introduzir **2 novos atores** e redistribuir responsabilidades, criando uma hierarquia de 3 níveis de governança:

**Institucional** (global, analytics + bootstrap) → **Gestor de Unidade** (direção de campus) → **Gestor de Espaço** (infraestrutura) / **Gestor de Reserva** (agenda)

### 2.1 Os Cinco Objetivos Específicos

| # | O Que Muda | Impacto |
|---|---|---|
| **1** | **Introduzir Gestor de Espaço** — papel dedicado a infraestrutura (equipamentos, manutenção, diagnósticos), distinto do Gestor de Reserva que cuida da agenda. | Separa explicitamente "quem pode usar?" de "em que estado está o equipamento?". A precedência é **Espaço (override) > Módulo (padrão) > órfão**. |
| **2** | **Introduzir Gestor de Unidade** — coordenador de campus com CRUD completo sobre os espaços e setores de sua unidade e visão analítica do campus. | O Institucional recua de "operador direto de toda a árvore" para "supervisor macro/analítico e bootstrap"; cada campus ganha agora uma autoridade nomeada localmente. |
| **3** | **Aprovação de urgência** (novo fluxo) — Gestor de Espaço pode liberar horários livres fora do expediente com validação de exceção do setor, sem travamento. | Reservas deixam de ficar represadas quando o Gestor de Reserva está fora. Protegido por regra: "só hoje" e notificação ao Gestor de Reserva. |
| **4** | **Report de problemas via QR Code** — espaço exibe QR Code com tutorial assistido antes de abrir chamado de manutenção. | Reduce atrito de comunicação entre usuário final e Gestor de Espaço; centraliza histórico de problemas. |
| **5** | **Dashboard multi-papel aditivo** — usuários que acumulam papéis veem dados de todos eles, não em cascata exclusiva. | Um Gestor de Unidade que também é Gestor de Reserva de um turno enxerga ambas as vistas sem perder nenhuma; hoje perde a de Gestor de Reserva. |

### 2.2 Tabela Comparativa: 1.x vs 2.0

| Aspecto | 1.x (hoje) | 2.0 (alvo) |
|---|---|---|
| **Papéis** | 3 | 5 |
| **Governança de campus** | Inexistente — Institucional opera os 3 campi globalmente | **Gestor de Unidade** conduz seu campus; Institucional recua para bootstrap + analytics |
| **Manutenção de infraestrutura** | Confundida com gestão de agenda | **Gestor de Espaço**, papel próprio, resolvido por precedência (Espaço > Módulo) |
| **Aprovação fora de expediente** | Impossível — reserva fica represada | Aprovação por **urgência**, restrita ao mesmo dia, com validação de expediente do setor |
| **Report de problemas** | Inexistente | **QR Code** no espaço, com tutorial assistido antes de abrir chamado |
| **Dashboard multi-papel** | Cascata exclusiva — esconde dados de quem acumula papéis | Composição aditiva por permissão |

---

## 3. Origem desta Documentação

Esta documentação é consolidação executável de **5 rodadas de auditoria técnica** conduzidas entre junho e agosto de 2026, registradas em `docs/auditoria-gestores-unidade-espaco/` (material de trabalho, não versionado).

### 3.1 Artefatos Auditados

| Artefato | Quantidade | Códigos | Status |
|---|---|---|---|
| **Decisões de Negócio Fechadas** | 43 | P-01..P-34, D-1..D-9 | ✅ Pronta para implementação |
| **Casos de Uso Mapeados** | 24 | UC-01..UC-24 (12 existentes + 12 novos) | ✅ Documentados em `01-casos-de-uso/` |
| **Riscos Catalogados com Mitigação** | 23 | R-01..R-23 | ✅ Rastreados em sprints |

### 3.2 Metodologia

Cada rodada envolveu:

1. **Especificação técnica** dos 2 novos atores (escopo, atribuições, exemplos reais UESB).
2. **Modelagem de dados** — ER proposto, novos campos, tabelas, migrations.
3. **Mapeamento de impacto** — controllers, services, repositories, policies, frontend, i18n.
4. **Reconciliação com auditorias correlatas** — validação de que nenhum trabalho anterior é invalidado sem intencionalidade.
5. **Matriz de riscos** — 23 cenários de quebra, com mitigação específica.
6. **Backlog estruturado** — 8 sprints, 50+ tasks, com dependências e critérios de aceite.

---

## 4. Fora de Escopo desta Rodada

Os itens abaixo foram **considerados em auditorias anteriores**, mas **não foram solicitados nesta migração**. Isso não significa que sejam "descartados permanentemente" — apenas que não fazem parte do objetivo da v2.0 e ficarão como backlog futuro.

### 4.1 Papéis Não Adotados (De `docs/auditoria-regras-de-negocio/`)

| Papel Proposto | Motivo da Exclusão | Possibilidade Futura |
|---|---|---|
| `chefe_departamento` | Cotas departamentais e aprovação em 1º nível por Setor não foram solicitadas nesta rodada. | Backlog prioritário — motor de cotas é caso de uso identificado (UC-08 em v1.x, não refatorado ainda). |
| `coordenador_laboratorio` (como papel separado) | O núcleo ("gestão de equipamentos/infraestrutura") foi absorvido pelo **Gestor de Espaço**; as nuances de biossegurança/insumos químicos específicas de laboratório ficam de fora. | Especialização do Gestor de Espaço — possível adicionar tipo/labels "laboratório" a espaços que exigem esse refinamento. |
| `auditor_institucional` | Leitura irrestrita para compliance não foi mencionada no escopo da v2.0. | Backlog para fase de governança/BI — depende de trilha de auditoria bem estruturada. |
| `apoio_operacional` | Portaria/kiosk (dispositivos de atendimento) fora do escopo atual. | Possível integração futura com sistema de walk-in/portaria. |

### 4.2 Funcionalidades Não Incluídas

| Funcionalidade | Contexto | Status |
|---|---|---|
| **Suplência/delegação temporária de papéis** | Um Gestor de Espaço pode delegar seu papel para um colega por "N dias". Avaliado em P-08. | Decisão: não precisamos agora. Backlog prioritário se o Gestor de Espaço virar indisponível no meio de semana. |
| **Entidade nomeada "Setor de Gestão de Espaço" com identidade própria** (ex.: `SetorAudiovisual`) | Auditoria anterior (`docs/auditoria-gestor-espaco/`) propôs isso. Análise da v2.0 mostrou que é desnecessário — os pivots (vínculo Espaço/Módulo a usuários) resolvem sem precisar de uma tabela intermediária. | P-04 e P-09 — adiado, reavaliar se a prática mostrar ator coletivo necessário. |
| **Horário de funcionamento detalhado de setores** (ex.: segunda-feira 08:00-12:00 funciona, 14:00-18:00 funciona, 12:00-14:00 não — com exceções por recesso) | Documentado em P-16 como necessário para validação de urgência. Avaliação de custo/benefício decidiu que a v2.0 adopta "expediente booleano genérico" + tabela de exceções por intervalo, deixando refinamento para versões futuras. | D-2, D-6 — bloqueador removido, protótipo funcional. Backlog se regras de biossegurança exigirem horários por tipo de espaço. |

### 4.3 Clarificação: "Fora de Escopo" ≠ "Descartado"

Todas as funcionalidades e papéis acima são **válidos e valiosos** para o UniEspaços no longo prazo. A marcação "fora de escopo" apenas significa que a v2.0 não os entrega — o trabalho foi feito e as decisões (P-01..P-34, D-1..D-9) estão registradas para que futuras implementações possam aproveitá-las sem refazer a auditoria.

---

## 5. Reconciliação com Auditorias Correlatas

### 5.1 `docs/auditoria-gestor-espaco/` (anterior)

| Aspecto | Status | Mudança |
|---|---|---|
| **Modelo de vínculo de Gestor de Espaço** | **Parcialmente invalidada** | A auditoria anterior propôs `HasOne obrigatório por Módulo` (entidade `SetorAudiovisual` com `UNIQUE(modulo_id)`). A v2.0 revelou 3 regras de negócio reais incompatíveis com isso: (a) módulo sem AV → gestor direto no espaço; (b) AV de um módulo cobrindo espaço de outro; (c) espaço específico "escapando" do AV padrão de seu próprio módulo. A v2.0 substitui por **precedência em 2 camadas** (Espaço > Módulo > órfão), permitindo todos os três casos. |
| **Soft delete em `Espaco`** | **Fora de escopo — permanece válido** | Ortogonal à modelagem de vínculo. Não foi reaberto aqui. |
| **Motivo obrigatório em cancelamento de chamado** | **Fora de escopo — permanece válido** | Parte do módulo de chamados (PR #397), não depende do desenho de atores. |
| **Módulo de chamados (PR #397)** | **Fora de escopo — permanece válido** | A v2.0 assume que a PR #397 ou seu equivalente será mergeado, mas não a desbloqueia nem a reescreve. |

### 5.2 `docs/auditoria-regras-de-negocio/` (anterior)

Naquela auditoria foram propostos **5 papéis**. A v2.0 consolida assim:

| Papel Proposto | Ação | Razão |
|---|---|---|
| `diretor_campus` (Gestor de Unidade) | ✅ **Adotado e refinado** sob nome `gestor_unidade` | Núcleo do pedido do usuário. Nome genérico evita acoplamento à nomenclatura de cada campus. |
| `coordenador_laboratorio` | ⚠️ **Parcialmente absorvido** | Núcleo (gestão de infraestrutura) virou `gestor_espaco`. Nuances de laboratório (biossegurança, insumos) ficam como especialização futura do mesmo papel. |
| `chefe_departamento` | ❌ **Fora de escopo** | Cotas departamentais não foram solicitadas. Backlog de médio prazo. |
| `auditor_institucional` | ❌ **Fora de escopo** | Compliance/leitura irrestrita não foi solicitada. Backlog. |
| `apoio_operacional` | ❌ **Fora de escopo** | Portaria/kiosk não foi solicitada. Backlog. |

**Conclusão:** A v2.0 mantém a matriz de atores em **5 papéis totais** (não 8), sendo 3 pré-existentes + 2 novos, coerente com o pedido específico do usuário.

---

## 6. Não Reabrir

Os pontos abaixo **já estão decididos** e não são assunto desta documentação v2.0. Foram validados em auditorias prévias e permanecem vigentes:

| Ponto | Onde Decidido | Status |
|---|---|---|
| **Soft delete em `Espaco`** com flag `archived_at` | `docs/auditoria-gestor-espaco/`, P-01 | ✅ Implementar em sprint de infraestrutura |
| **Motivo obrigatório em cancelamento de chamado** | `docs/auditoria-gestor-espaco/`, P-03 | ✅ Já em PR #397 |
| **Módulo de chamados** (triage, atribuição, SLA) | PR #397 | ✅ Aguarda review/merge em paralelo |
| **Regra inviolável:** Autorização por permission, nunca por nome de papel | `docs/REGRAS_INVIOLAVEIS_E_PADROES.md`, §4.3 | ✅ Já enforced — válida para os 5 papéis sem mudanças |
| **Hierarquia territorial:** `Instituição > Unidade > Módulo > Andar > Espaço` | `docs/data-model.dbml` | ✅ Consolidada, nenhuma refatoração de schema territorial |

---

## 7. Próximos Passos

1. **Leitor novo no projeto?** Comece por [`05-glossario.md`](./05-glossario.md) para entender a terminologia, depois [`02-atores-e-papeis.md`](./02-atores-e-papeis.md) para a matriz de atribuições.
2. **Quer entender um caso de uso específico?** Vá a [`../01-casos-de-uso/README.md`](../01-casos-de-uso/README.md) e procure pelo código UC-XX.
3. **Vai implementar uma task?** Encontre no [`../04-roadmap/`](../04-roadmap/) o sprint e a task, use o UC citado para contexto, depois consulte [`../03-arquitetura/`](../03-arquitetura/) da sua camada (backend/frontend).
4. **Quer revisar uma implementação?** Leia [`04-regras-invioaveis.md`](./04-regras-invioaveis.md) primeiro, depois [`03-matriz-de-permissions.md`](./03-matriz-de-permissions.md).

---

## 8. Rastreabilidade Completa com Auditoria de Origem

Todos os identificadores desta documentação são rastreáveis até a fonte em `docs/auditoria-gestores-unidade-espaco/` (não versionada):

| Prefixo | Significado | Exemplo | Intervalo |
|---|---|---|---|
| `UC-XX` | Caso de uso (identificador canônico) | UC-15 (aprovação de urgência) | UC-01..UC-24 |
| `P-XX` | Decisão de negócio (rodadas 1–4) | P-15 (urgência só no mesmo dia) | P-01..P-34 |
| `D-X` | Decisão de implementação (rodada 5) | D-2 (validação por estado de expediente) | D-1..D-9 |
| `R-XX` | Risco mapeado com mitigação | R-18 (sequenciamento de permissions) | R-01..R-23 |
| `S{n}-{trilha}-{nn}` | Task de backlog | S5-BE-07 (backend sprint 5, task 7) | Vários sprints |

> **Nota:** A auditoria de origem não é documentação v2.0 — é material de trabalho (não versionado). Use os prefixos acima como elos para investigação ou histórico, mas considere esta documentação como a fonte de verdade executável.

