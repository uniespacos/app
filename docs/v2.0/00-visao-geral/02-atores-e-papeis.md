# 02 — Atores e Papéis — Especificação de Referência

> **Este é o documento definitivo e exaustivo de "quem é quem" no UniEspaços 2.0.**
>
> Toda decisão de design, segurança e autorização referencia este documento. As tabelas de atribuição aqui devem
> ser espelho fiel da implementação de Policies, validações e contratos de API.

---

## Visão Consolidada

O UniEspaços 2.0 opera com **5 atores** distintos, cada um com escopo claramente delimitado:

| # | Papel | Chave Spatie | Nome de Exibição | Escopo Principal |
|---|---|---|---|---|
| 1 | Solicitante | `comum` | Solicitante | Sem vínculo obrigatório; autonomia sobre dados próprios |
| 2 | Responsável por agenda de turno | `gestor` | **Gestor de Reserva** | `Agenda.user_id` — N agendas por usuário |
| 3 | Responsável por infraestrutura | `gestor_espaco` | **Gestor de Espaço** | Espaço (direto) → Módulo (padrão) → órfão (sem gestor) |
| 4 | Responsável por campus | `gestor_unidade` | **Gestor de Unidade** | `Unidade` (escopo de CRUD e analytics do seu campus) |
| 5 | Administrador geral | `institucional` | Administrador Institucional | Nenhum (global) — bootstrap + analista macro |

---

## 1. Ator 1: Comum (Solicitante)

### 1.1 Propósito e Perfil Real

Qualquer usuário da comunidade acadêmica — docente, discente, técnico-administrativo ou externo — que deseja
reservar um espaço. Não possui qualquer responsabilidade administrativa no sistema.

### 1.2 Vínculo

Nenhum vínculo obrigatório. Pode ter `setor_id` preenchido (vínculo a um departamento da instituição), mas isso é
**opcional** — em especial, usuários externos nunca terão setor. A ausência de `setor_id` não afeta autorização.

### 1.3 Atribuições

| Pode | Não pode |
|---|---|
| Criar uma reserva (formulário de solicitação) | Avaliar reservas |
| Ver suas próprias reservas | Acessar dashboards de gestão |
| Autoavaliar urgência conforme seu tipo de vínculo (Professor/Técnico/Estudante/Externo) | Criar espaços ou estrutura física |
| Relatar problemas via QR Code (rota pública, sem autenticação) | Gerenciar roles ou permissions |

### 1.4 Mudanças em Relação ao Estado Atual (1.x)

**Nenhuma mudança de escopo.** O papel `comum` permanece exatamente como está. A adição de `tipo_vinculo`
(P-16, P-25, P-26, P-27) não altera o que ele **pode fazer**, apenas torna evidente o seu **nível sugerido** ao
solicitar urgência (função consultiva, sem trava).

---

## 2. Ator 2: Gestor de Reserva (`gestor`)

### 2.1 Propósito e Perfil Real

Responsável operacional pela **aprovação de reservas** em um ou mais turnos (manhã, tarde, noite) de um ou mais
espaços do campus. É quem a comunidade contata quando "preciso de autorização para usar a Sala 204 na quarta-feira".

### 2.2 Vínculo

Vinculado por `Agenda.user_id` — um usuário pode ser gestor de múltiplas agendas (vários espaços × múltiplos
turnos), mas cada agenda tem um único gestor por turno.

### 2.3 Atribuições

| Pode | Não pode |
|---|---|
| Solicitar reserva como usuário comum | Criar espaços ou alterar estrutura física |
| **Avaliar reservas** no fluxo normal — suas agendas apenas | Avaliar reservas fora de suas agendas |
| Ver relatórios de suas agendas (ocupação, solicitantes, trends) | Atribuir outros gestores de reserva |
| Atribuir gestor de urgência (gestores de espaço) — assistência informativa | Acessar dados de outros campi |

### 2.4 Mudanças em Relação ao Estado Atual (1.x)

**Nenhuma mudança de escopo ou lógica.** Três mudanças apenas **de nomenclatura e interface**:

1. **Chave Spatie permanece `gestor`** (P-02) — tecnicamente obrigatório. `Role::booted()` em
   `app/Models/Role.php` lança `RuntimeException` se você tentar renomear qualquer role com `is_system = true`.
   As 3 roles atuais (comum, gestor, institucional) têm esse flag, então renomear quebraria backward
   compatibility e exigiria contornar o guard deliberadamente.

2. **Rótulo de exibição muda de "Gestor" para "Gestor de Reserva"** — elimina colisão visual com "Gestor de
   Espaço" e "Gestor de Unidade" que chegam na v2.0. Toda string em UI refaz essa tradução.

3. **Dashboard agora compõe permissões aditivamente** (não mais em cascata exclusiva) — se um usuário acumula
   `gestor` + `gestor_espaco`, ele enxerga widgets de ambos os papéis, não só o papel "mais alto".

---

## 3. Ator 3: Gestor de Espaço (`gestor_espaco`)

### 3.1 Propósito e Perfil Real

Responsável pela **manutenção operacional de infraestrutura** — equipamentos (projetor, ar-condicionado, som),
mobiliário, condições físicas de uso. É quem você chama quando "o projetor da Sala 204 não liga" ou "o ventilador
do Laboratório 3 está barulhento".

### 3.2 Vínculo — Resolução em Duas Camadas com Precedência

A atribuição de Gestor de Espaço segue um algoritmo **determinístico** que tolera ausências de gestor e
reaproveitamentos em vários módulos:

1. **Nível 1 — Override direto no Espaço:** se um `Espaço` tem um gestor direto (`espaco_gestores_espaco`),
   esse gestor responde por ele (P-05/06).

2. **Nível 2 — Padrão do Módulo:** se o Espaço não tem override, o sistema herda o gestor padrão do seu
   `Módulo` (`modulo_gestores_espaco`).

3. **Nível 3 — Órfão:** se nem o Espaço nem o Módulo têm gestor atribuído, o Espaço fica **órfão** — ninguém
   responde hoje, e isso é uma métrica de manutenção.

**Princípios de design (P-05/06):**

- Um espaço responde a **exatamente um gestor** (ou nenhum, se órfão).
- Uma pessoa pode ser gestor padrão de múltiplos módulos — não há restrição de N:1.
- Uma pessoa pode ser gestor direto de espaços "fora de seu módulo" — suporta cross-módulo.
- Um módulo pode ter **múltiplos gestores** no futuro (via `modulo_gestores_espaco` do tipo bridge), embora
  por enquanto o algoritmo retorna **apenas um** (ou nenhum). Já não assume unicidade em design.

### 3.3 Atribuições

| Pode | Não pode |
|---|---|
| Solicitar reserva como usuário comum | Avaliar reservas no fluxo normal (exclusivo do Gestor de Reserva) |
| Ver os espaços sob sua responsabilidade (diretos + herdados do módulo padrão) | Criar/excluir/alterar estrutura física (Módulo, Andar, Setor, Espaço) |
| **Receber e triar chamados de infraestrutura** via QR Code (rota pública `reportar/{espaco:public_id}`) | Atribuir gestores (nem de reserva, nem de espaço) |
| Ver **relatório de inventário** dos seus espaços (equipamentos registrados, estado) | Avaliar urgência fora dos seus espaços |
| **Aprovar reserva em regime de urgência** (exceção estreita — ver §3.4) | Aprovar urgência para data futura (fora de hoje) |

### 3.4 Aprovação de Reserva em Regime de Urgência — Regra Particular

O Gestor de Espaço é o **único ator não-Gestor-de-Reserva** autorizado a avaliar uma reserva — mas **apenas sob
condições estritas e restritas ao mesmo dia** (P-15, P-14, P-17, P-18, P-23):

#### 3.4.1 Cenário de Negócio

O Gestor de Reserva trabalha em expediente (ex.: 9h–17h), o gestor de infraestrutura trabalha até mais tarde
(ex.: 9h–21h). Um solicitante aparece presencialmente no fim da tarde, o espaço está livre, mas o Gestor de
Reserva já saiu. A solução: o Gestor de Espaço do espaço específico pode autorizar naquele instante.

#### 3.4.2 Regras Estritas (Todas Confirmadas pelo Usuário)

| # | Regra | Detalhe |
|---|---|---|
| 1 | **Janela temporal** | Exclusivamente **o mesmo dia** (`now()` → `now()->endOfDay()`). Nenhuma aprovação de urgência vale para data futura. **(P-15)** |
| 2 | **Escopo espacial** | Apenas **seus espaços** (override direto ou herdado de módulo padrão). Impossível aprovar urgência de espaço alheio. |
| 3 | **Pré-condição de horário** | Horário da reserva está **livre** — sem conflito com reserva já `deferida` no mesmo slot. |
| 4 | **Notificação única** | Apenas o **Gestor de Reserva titular** da agenda é notificado. Nenhum outro ator recebe aviso. **(P-14)** |
| 5 | **Assistência de prioridade** | O Gestor de Espaço vê o tipo de vínculo do solicitante (Professor/Técnico/Estudante/Externo) como **apoio consultivo, sem trava automática**. O decisor (mesmo Gestor de Espaço ou Gestor de Reserva ao revisar) escolhe; o sistema nunca nega. **(P-18, P-25)** |
| 6 | **Validação de expediente do Gestor de Reserva** | Passará a ser possível graças à expansão de `Setor` (P-23). **Se o Gestor de Reserva está em expediente** conforme `Setor.expediente`, a urgência é **bloqueada** — o fluxo normal ainda dá conta. **Se está fora**, a urgência é **liberada**. **Se indefinido** (estado inicial), é **liberada com aviso**. **(D-2)** |
| 7 | **Limite de uso** | Nenhum limite de urgências por gestor/dia por enquanto. **(P-19)** |

#### 3.4.3 Dois Fluxos de Entrada (Ambos Suportados)

- **Fluxo A — Aceleração (solicitante criou a reserva antes):** o solicitante já preencheu o formulário de
  reserva; o Gestor de Espaço aprova no instante. **Restrição:** a reserva deve conter **apenas os horários
  imediatos**. Se tiver qualquer horário adicional (outro dia, turno extra), a aprovação é recusada e o caso
  volta ao fluxo normal. (P-17)

- **Fluxo B — Atendimento de Balcão (walk-in):** o Gestor de Espaço **cria a reserva em nome do solicitante**,
  já nascendo aprovada em regime de urgência. Isso é inédito — até 1.x era impossível criar reserva em nome de
  terceiro. Requer cuidado com identidade de solicitante e possibilidade de cadastro ad-hoc. (P-17, P-30, P-31)

### 3.5 Chamados via QR Code — Fluxo e Triagem

- **Rota pública:** `/reportar/{espaco:public_id}` — qualquer pessoa (autenticada ou não) pode acessar.
- **Tutorial opcional antes de aceitar:** tipos de chamado podem ter tutoriais autoexplicativos (ex.: "como
  ajustar temperatura", "como ativar projetor"). O tutorial é **genérico por tipo**, não por modelo de
  equipamento (P-20).
- **Chamado criado é roteado** usando a mesma lógica `getGestoresDeEspaco()` de resolução por precedência
  (override > módulo > órfão). Nenhuma lógica paralela.

### 3.6 Mudanças em Relação ao Estado Atual (1.x)

**Novo ator — não existe hoje.** A v1.x não tem modelo de gestão de infraestrutura separado de agenda. Todo
CRUD de espaço é feito pelo `institucional`. Este papel reduz essa carga, delegando manutenção operacional a
um ator mais especializado.

---

## 4. Ator 4: Gestor de Unidade (`gestor_unidade`)

### 4.1 Propósito e Perfil Real

Representa a **administração central do campus** — tipicamente "Prefeitura de Campus", "Assessoria Acadêmica",
"Coordenação de Infraestrutura" ou outro nome que varia por unidade. É o **operador administrativo pleno** do
seu campus: faz CRUD de toda estrutura física, atribui gestores de reserva e de espaço, monitora métricas.

### 4.2 Mudança de Paradigma — O Institucional Recua

A decisão mais significativa desta auditoria, confirmada pelo usuário (P-05/06):

> *"Sim, o gestor de unidade cria/exclui — inclusive acho interessante remover a necessidade do gestor
> institucional fazer a criação ou remoção dos espaços; ele apenas atribui o gestor de unidade e ele faz todo o
> processo."*

**Antes (1.x):**

- `institucional` faz CRUD direto de Unidade, Módulo, Andar, Setor, Espaço — tudo sempre.
- Não existe ator intermediário de campus.
- `institucional` é operador técnico full-stack + analista.

**Depois (2.0):**

- `institucional` cria a **Unidade** (ato fundacional) e **atribui o Gestor de Unidade** — e para por aí.
- `gestor_unidade` conduz todo o ciclo de vida do campus — CRUD pleno de Módulo/Andar/Setor/Espaço.
- `institucional` recua para **bootstrap + analista macro** — criação rara de unidade, visão agregada entre campi.

**Importante (P-22):** "remover a necessidade" é diferente de "remover a capacidade". O `institucional`
**mantém tecnicamente a permissão** de fazer CRUD — indispensável para bootstrap de unidade recém-criada que
ainda não tem Gestor de Unidade designado (senão nasce órfã e ninguém pode configurar). A mudança é de **fluxo
esperado**, não de permissão revogada.

### 4.3 Atribuições

| Pode | Não pode |
|---|---|
| **CRUD completo** de Módulo, Andar, Setor, Espaço — escopado a sua(s) Unidade(s) | Criar ou excluir a própria Unidade (ato fundacional de `institucional`) |
| Atribuir / remover **Gestor de Reserva** (`Agenda.user_id`) no seu campus | Atribuir outro Gestor de Unidade (nem para si, nem para terceiros) |
| Atribuir / remover **Gestor de Espaço** (padrão de módulo ou override de espaço) no seu campus | **Participar do fluxo de aprovação de reservas** — nem normal, nem urgência **(P-07)** |
| Ver **lista detalhada** de espaços órfãos de Gestor de Espaço no seu campus (quais são, quantos por módulo) **(P-10)** | Ver dados de outros campi |
| Ver **indicador analítico** de órfãos no seu campus (quantos no total, trend) **(P-10)** | Gerenciar Roles, Permissions ou Usuários globalmente |
| Ver dashboards/relatórios de seu campus (ocupação, solicitações por espaço, trends) | — |

### 4.4 Regras Estruturais Confirmadas

- **Múltiplos Gestores de Unidade por campus são permitidos** (P-03) — vínculo N:N via bridge table. Útil para
  titular + assessor, titular + suplente, múltiplas diretorias.

- **Acúmulo livre de papéis** (P-12): a mesma pessoa pode ser `gestor_unidade` do campus **e** `gestor_espaco`
  de um módulo dentro dele, sem trava de conflito de interesse ou impossibilidade técnica.

- **Rótulo customizável por Unidade** (P-13): cada campus pode exibir o rótulo de seu Gestor de Unidade com seu
  próprio nome — campo `Unidade.label_gestor`, nullable, com fallback para "Gestor de Unidade". Exemplo: um
  campus quer "Assessor Acadêmico", outro quer "Prefeitura de Campus" — cada um configura seu próprio.

- **Fora do fluxo de reserva, sem exceções** (P-07): a `ReservaPolicy` não recebe menção a `gestor_unidade`
  **em nenhuma forma**. Diferente do Gestor de Espaço (que tem exceção estreita de urgência), aqui não há
  sequer uma exceção. Ele gerencia infraestrutura do campus, não aprova viagens de dados.

### 4.5 Mudanças em Relação ao Estado Atual (1.x)

**Novo ator — não existe hoje.** A v1.x não tem nível intermediário de governança de campus. Tudo é operado
pelo `institucional`. Este papel resolve a escala — 3 campi não devem depender de um único ator.

---

## 5. Ator 5: Institucional (`institucional`)

### 5.1 Propósito e Perfil Real

Administrador central de tecnologia / auditoria / pró-reitoria. Responsável por **bootstrap institucional** (criar
unidades, semear dados, corrigir anomalias sistêmicas) e **visão analítica macro** (comparar performance entre
campi, identificar riscos de escala, rastreabilidade de auditoria).

### 5.2 Mudança de Paradigma — De Operador Direto para Bootstrap + Analyst

| Antes (1.x) | Depois (2.0) |
|---|---|
| Faz CRUD de toda estrutura física do sistema (3 campi) | Cria Instituição + Unidade (raro); atribui Gestor de Unidade |
| É o único operador; não delega | Delega CRUD de campus a Gestor de Unidade (fluxo normal) |
| Realiza CRUD quando a unidade não tem gestor | **Mantém capacidade técnica** para CRUD (P-22) — só não é fluxo normal |
| Visão de operador direto | Visão analítica macro entre campi |

**Importante (P-22, recomendação técnica):** Apesar de "remover a necessidade" (P-05/06), o `institucional`
**nunca perde a permissão técnica** de fazer CRUD de Módulo/Andar/Setor/Espaço — é indispensável para
bootstrap de unidade recém-criada que ainda não tem Gestor de Unidade. Ver documento de decisões para o
histórico completo dessa recomendação.

### 5.3 Atribuições

| Pode | Não pode |
|---|---|
| Criar **Instituição** (estrutura de topo) | — |
| Criar **Unidade** e atribuir **Gestor de Unidade** (ato fundacional) | Participar do fluxo de aprovação de reservas — nem normal, nem urgência |
| **CRUD completo** de Módulo, Andar, Setor, Espaço — para bootstrap/exceção | Receber `reservas.avaliar-urgencia` **(P-34 — exclusão deliberada)** |
| Atribuir / remover **Gestor de Reserva** globalmente (qualquer agenda, qualquer campus) | — |
| Atribuir / remover **Gestor de Espaço** globalmente | — |
| Ver **indicador analítico agregado** de órfãos (total por campus, trend histórico) **(P-10)** | Ver órfãos em formato item a item (lista detalhada) — é responsabilidade do Gestor de Unidade |
| Ver **dashboards/BI macro** comparativo entre campi (ocupação por campus, trends) | Gerenciar usuários finais (apenas admin de roles/permissions do sistema) |
| Gerenciar **Roles, Permissions** globalmente (sincronização, criação de novos papéis) | — |
| Acessar **auditoria** de ações do sistema (trilha de logs, soft deletes, re-triagens) | — |

### 5.4 Escopo Especial: Órfãos em Formato Analítico vs. Detalhado

A decisão P-10 estabelece **dois níveis de profundidade distintos** — não é apenas um filtro no mesmo widget:

- **Gestor de Unidade:** recebe a **lista detalhada** (quais espaços são órfãos, qual módulo cada um pertence).
  É **acionável** — ele consegue resolver.

- **Institucional:** recebe o **indicador agregado analítico** (quantos órfãos no total por campus, evolução ao
  longo do mês). É **informativo** — visa ajudá-lo a cobrar do Gestor de Unidade, não a resolver direto.

São **dois componentes distintos** em dois dashboards diferentes, não o mesmo componente com escopo filtrado.

### 5.5 Mudanças em Relação ao Estado Atual (1.x)

**Escopo reduzido; capacidade técnica mantida.** O papel não desaparece — se torna **menos operacional e mais
estratégico**:

- Deixa de ser chamado para CRUD rotineiro de campus.
- Ganha responsabilidade de visão macro e bootstrap.
- Mantém a permissão técnica de CRUD (para quebra-galho, migração, correção de dados órfãos).
- Não recebe permissão nova de avaliar urgência — essa capacidade é **exclusiva do Gestor de Espaço** (P-34).

---

## 6. Nota Conceitual: Setor e Responsável Designado (Não é um 6º Ator)

### 6.1 O que é `Setor`

`Setor` é uma **entidade organizacional** — departamento, unidade administrativa, setor de TI, audiovisual,
etc. Hoje, ele apenas agrupa pessoas (`users.setor_id` aponta para um setor). A v2.0 **expande o conceito** para
incluir dois atributos operacionais:

1. **Coordenador** (`Setor.coordenador_id`) — usuário responsável pelo setor.
2. **Expediente** (`Setor.expediente`) — horário de funcionamento com exceções (feriados, recesso, horário
   reduzido).

### 6.2 O Responsável Designado Não É um Ator

**Decisão crítica (D-1):** o responsável de um setor (**coordenador**) **não é um novo papel Spatie**.

- O Gestor de Unidade **designa manualmente, por setor**, quem é o responsável.
- A autorização sai de uma **checagem de propriedade** (`setor.coordenador_id === user.id`), sem role novo.
- O coordenador edita **apenas os campos de expediente** (`horario_inicio`, `horario_fim`, exceções) — nunca
  `nome`, `sigla`, `unidade_id` ou `coordenador_id` (risco R-21).

**Resultado:** a matriz permanece em **5 atores**, não 6. O coordenador é um atributo, não um papel.

### 6.3 Fronteira Conceitual Obrigatória

**`Setor` responde "quando essa equipe trabalha e quem a coordena" — nunca "o que ela gerencia".**

O escopo de gestão de espaços continua **exclusivamente** nos três pivots:
- `unidade_gestores` (Unidade ← → Gestor de Unidade)
- `modulo_gestores_espaco` (Módulo ← → Gestor de Espaço)
- `espaco_gestores_espaco` (Espaço ← → Gestor de Espaço)

Misturar gestão de espaços dentro de `Setor` reabriria a Opção A já rejeitada e geraria confusão entre "setor
que administra infraestrutura" e "setor que contém pessoas".

### 6.4 Implicação para a Urgência (P-23, D-2)

A validação de expediente do Gestor de Reserva percorre: `Agenda.user → User.setor → Setor.expediente`.
Assim, quando um Gestor de Espaço tenta aprovar urgência, o sistema sabe se o Gestor de Reserva (seu setor)
está ou não em expediente. Se está **em expediente**, a urgência é **bloqueada** (fluxo normal dá conta). Se
está **fora**, é **liberada**. Se **indefinido**, é **liberada com aviso** (estado inicial de todos os setores).

---

## 7. Matriz Consolidada Final — 5 Atores × Ações Chave

| Ação | Comum | Gestor de Reserva | Gestor de Espaço | Gestor de Unidade | Institucional |
|---|:---:|:---:|:---:|:---:|:---:|
| Solicitar reserva | ✅ | ✅ | ✅ | ✅ | ✅ |
| Avaliar reserva — fluxo normal | ❌ | ✅ (suas agendas) | ❌ | ❌ | ❌ |
| Aprovar reserva — **urgência** (mesmo dia, seus espaços) | ❌ | — | ✅ | ❌ | ❌ |
| Criar reserva em nome de terceiro (Fluxo B urgência) | ❌ | ❌ | ✅ (urgência) | ❌ | ❌ |
| Triar chamados de infraestrutura via QR Code | ❌ | ❌ | ✅ (seus espaços) | ❌ | ❌ |
| Ver órfãos — **lista detalhada** | ❌ | ❌ | ❌ | ✅ (seu campus) | ❌ |
| Ver órfãos — **indicador analítico** | ❌ | ❌ | ❌ | ✅ (seu campus) | ✅ (todos os campi) |
| CRUD Módulo/Andar/Setor/Espaço | ❌ | ❌ | ❌ | ✅ (seu campus) | ✅ (bootstrap/exceção) |
| Atribuir Gestor de Reserva | ❌ | ❌ | ❌ | ✅ (seu campus) | ✅ |
| Atribuir Gestor de Espaço | ❌ | ❌ | ❌ | ✅ (seu campus) | ✅ |
| Designar coordenador de setor | ❌ | ❌ | ❌ | ✅ (seu campus) | ✅ |
| Editar expediente de setor | ❌ | ❌ | ❌ | ✅ (seu campus) | ✅ |
| CRUD de Unidade | ❌ | ❌ | ❌ | ❌ | ✅ |
| Atribuir Gestor de Unidade | ❌ | ❌ | ❌ | ❌ | ✅ |
| Relatórios/BI do próprio campus | ❌ | ✅ (suas agendas) | ✅ (seus espaços) | ✅ | ✅ |
| BI macro comparativo entre campi | ❌ | ❌ | ❌ | ❌ | ✅ |
| Gerenciar Roles/Permissions/Usuários | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 8. Nomenclatura Canônica — Chave Spatie × Rótulo de Exibição

| Função | Chave Spatie | Rótulo de Exibição | Notas |
|---|---|---|---|
| Solicitante / usuário comum | `comum` | Solicitante | Padrão de nova conta |
| Gestor de turno/agenda | `gestor` | **Gestor de Reserva** | Chave mantida por limitação técnica (P-02); só rótulo muda |
| Gestor de infraestrutura | `gestor_espaco` | **Gestor de Espaço** | Novo na 2.0 |
| Gestor de campus | `gestor_unidade` | **Gestor de Unidade** (customizável via `Unidade.label_gestor`) | Novo na 2.0; rótulo pode ser "Assessor Acadêmico", "Prefeitura de Campus", etc. |
| Administrador central | `institucional` | Administrador Institucional | Inalterado em chave; escopo reduzido |

---

## 9. Referência Cruzada com Decisões

Todos os pontos-chave deste documento referem decisões específicas da rodada de auditoria. Para o texto completo
de cada decisão, consulte [`./03-decisoes-consolidadas.md`](./03-decisoes-consolidadas.md):

| Tema | IDs de Decisão |
|---|---|
| Dois novos atores (Espaço, Unidade) | P-05/06 |
| Chave `gestor` não pode ser renomeada | P-02 |
| Múltiplos Gestores de Unidade por campus | P-03 |
| Precedência de resolução de Gestor de Espaço | P-05/06 |
| Rótulo customizável do Gestor de Unidade | P-13 |
| Institucional mantém capacidade técnica (P-22) | P-22 |
| Aprovação urgência por Gestor de Espaço — mesmo dia | P-15, P-17 |
| Aprovação urgência — notificação só ao Gestor de Reserva | P-14 |
| Assistência de prioridade (consultiva, sem trava) | P-18, P-25 |
| Urgência bloqueada se Gestor de Reserva em expediente | D-2 |
| Expediente de setor agora em escopo | P-23 |
| Coordenador de setor não é novo ator | D-1 |
| Gestor de Unidade NUNCA participa de aprovação de reserva | P-07 |
| Institucional NÃO recebe permissão de urgência | P-34 |
| Órf ãos em dois formatos (detalhado vs. analítico) | P-10 |

---

## 10. Estrutura para Implementação de Políticas

Toda `Policy` de Spatie deve espelhar a matriz de §7. Exemplo:

```php
// ReservaPolicy.php
public function avaliar(User $user, Reserva $reserva): bool
{
    // Apenas Gestor de Reserva no fluxo normal
    return $user->hasRole('gestor')
        && $user->agendas()
            ->whereHas('espaco', fn($q) => $q->where('id', $reserva->agenda->espaco_id))
            ->exists();
}

public function avaliarUrgencia(User $user, Reserva $reserva): bool
{
    // Apenas Gestor de Espaço, mesmo dia, seus espaços
    if (!$user->hasRole('gestor_espaco')) {
        return false;
    }

    if (!$reserva->isToday()) {
        return false;
    }

    // Verifica se é seu espaço (override ou módulo padrão)
    return getGestoresDeEspaco($reserva->agenda->espaco)
        ->contains($user->id);
}
```

---

## 11. Versões Futuras (Fora de Escopo da 2.0)

A matriz de 5 atores é extensível sem quebra de segurança. Possíveis adições em versão futura:

- **Auditor Institucional** (`auditor`) — leitura irrestrita para compliance, sem poder de escrita.
- **Coordenador de Laboratório** (`coordenador_laboratorio`) — especialização do Gestor de Espaço para
  espaços com restrições de biossegurança.
- **Chefe de Departamento** (`chefe_departamento`) — aprovação em 1º nível por departamento, motor de cotas.
- **Apoio Operacional** (`apoio_operacional`) — portaria/kiosk, suporte a walk-in.

Cada um desses papéis (se adotado) seguiria o mesmo padrão: chave Spatie única + rótulo customizável +
escopo claro delimitado em tabela Pode/Não pode + recomendações de Policy.
