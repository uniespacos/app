# Glossário da v2.0

> **Leitura essencial.** Este documento é o primeiro que um novo desenvolvedor deve consultar para entender o vocabulário do domínio. As definições são autocontidas — não pressupõem conhecimento prévio do restante da documentação.

---

### Agenda

Vínculo entre um Gestor de Reserva, um turno e um Espaço, identificando quem gerencia a reserva de um horário específico. Uma agenda é a menor unidade de responsabilidade de um Gestor de Reserva: o mesmo usuário pode ter múltiplas agendas (manhã e noite, diferentes espaços).

### Andar

Nível físico dentro de um Módulo, contendo um conjunto de Espaços. Exemplo: "Bloco A — 1º Andar" contém as salas 101, 102, 103.

### Bloco atômico

Conjunto de mudanças (commits, migrations, features) que precisam ser mergeadas juntas, nunca isoladamente, porque a entrega parcial abre uma brecha de segurança ou deixa o sistema em estado inconsistente. Exemplo: Sprint 1 da v2.0 (risco R-18) — o algoritmo de precedência de Gestores de Espaço só faz sentido se as três tabelas de vínculo existem simultaneamente.

### Coordenador de Setor

Usuário designado manualmente pelo Gestor de Unidade como responsável pelo expediente (horários de funcionamento) de um Setor. Não é um role Spatie — é uma FK de responsabilidade (`setors.coordenador_id`) que permite edições de expediente sem criar um sexto ator no sistema.

### Deferida

Situação de um Horário dentro de uma Reserva indicando que a reserva foi aprovada (pelo Gestor de Reserva via fluxo normal ou pelo Gestor de Espaço via urgência). Ver `SituacaoReservaEnum`.

### Em Análise

Situação de um Horário indicando que a reserva está aguardando avaliação do Gestor de Reserva. Ver `SituacaoReservaEnum`.

### Espaço

Unidade física reservável — uma sala de aula, auditório, laboratório, ou similar. Cada espaço pertence a um Andar, que pertence a um Módulo. Um espaço é o objeto central do sistema: nele se vinculam agendas, gestores de espaço, e é onde ocorrem as reservas.

### Espaço órfão (de Chamado)

Espaço para o qual o roteamento de chamados de infraestrutura (QR Code) não consegue atribuir um responsável: nem override direto, nem padrão do módulo retornam um gestor. O chamado é roteado para o Gestor de Unidade como exceção.

### Espaço órfão (de Gestor de Espaço)

Espaço para o qual `getGestoresDeEspaco()` retorna coleção vazia: nem override direto em `espaco_gestores_espaco`, nem padrão do módulo em `modulo_gestores_espaco`. O Gestor de Unidade é notificado para resolver a situação.

### Expediente

Horário de funcionamento de um Setor (dias da semana + horário de abertura/fechamento), com suporte a exceções por intervalo de datas (feriados, recesso, expediente reduzido). Usado para validar se o Gestor de Reserva está disponível no momento de uma aprovação por urgência.

### Espaço

Espaço físico reservável: sala de aula, auditório, laboratório. Pertence a um Andar. É vinculado a Gestores de Espaço (via override direto ou padrão do módulo) e é o objeto central de agendas e reservas.

### Fluxo A (urgência)

Aprovação acelerada de uma reserva que o solicitante já criou no sistema, exercida pelo Gestor de Espaço quando o Gestor de Reserva não está disponível. A reserva deve conter exclusivamente horários de hoje; qualquer horário em outra data faz a urgência ser recusada (P-17). Ver "Urgência (aprovação em regime de)".

### Fluxo B / walk-in (urgência)

Criação de uma reserva pelo Gestor de Espaço em nome de um solicitante presencial (atendimento de balcão), já nascendo aprovada por urgência. Requer que o solicitante esteja cadastrado no sistema; se não estiver, é orientado a se cadastrar antes. Ver "Urgência (aprovação em regime de)".

### Gestor de Espaço

Role `gestor_espaco`, responsável pela manutenção da infraestrutura física de um espaço ou conjunto de espaços: equipamentos, mobiliário, condições de uso. **Não** gerencia a agenda de reservas — gerencia a viabilidade técnica do uso. Pode aprovar reservas em regime de urgência, excepcionalmente, e recebe/tria chamados de infraestrutura (ver "Urgência (aprovação em regime de)", risco R-18).

### Gestor de Reserva

Role `gestor` (chave Spatie mantida em `roles.name`), responsável pela avaliação e aprovação/rejeição de reservas no fluxo normal. Vinculado a uma Agenda (`Agenda.user_id`), que por sua vez identifica um turno + espaço. Não pode atribuir-se a si mesmo nem a outros; isso é exclusivo do Gestor de Unidade.

### Gestor de Unidade

Role `gestor_unidade`, operador administrativo pleno de um campus (Unidade). Responsável pelo CRUD completo de Módulos, Andares, Setores e Espaços; atribuição de Gestores de Reserva e Gestores de Espaço; e visão de órfãos em formato acionável. Não participa do fluxo de aprovação de reservas. Ver "Unidade".

### Horario

Entidade que representa um slot horário dentro de uma Reserva, com data, horário de início/fim e uma situação (Solicitado, Em Análise, Deferida, Rejeitada). Cada horário pode ter origem de avaliação distinta (`origem_avaliacao`), permitindo distinguir fluxo normal de urgência. Ver `OrigemAvaliacaoEnum`.

### Institucional

Role `institucional`, administração central que realiza bootstrap de Unidades e atribuição de Gestores de Unidade. Na v2.0, sua atuação recua para essas tarefas fundacionais e para análise macro entre campi (BI comparativo); não opera Módulo/Andar/Setor/Espaço no fluxo normal, cuja responsabilidade migra para o Gestor de Unidade.

### `label_gestor`

Campo `unidades.label_gestor` (nullable, string até 100 caracteres), contendo um rótulo customizável por campus para o cargo de Gestor de Unidade. Exemplo: "Prefeitura de Campus", "Assessoria Acadêmica". Puramente cosmético, usado apenas em exibição na UI; a chave Spatie do role permanece sempre `gestor_unidade`.

### Módulo

Agrupamento territorial dentro de uma Unidade, contendo um ou mais Andares. Exemplos: "Bloco A", "Bloco B", "Biblioteca". Serve como nível intermediário de organização física e como vínculo padrão para Gestores de Espaço (todo espaço do módulo herdará o Gestor de Espaço padrão, a menos que tenha um override).

### `OrigemAvaliacaoEnum`

Enumeração que distingue a procedência da aprovação de um Horário: `FLUXO_NORMAL` (Gestor de Reserva, fluxo padrão) ou `URGENCIA_GESTOR_ESPACO` (Gestor de Espaço, exceção de urgência). Armazenado em `horarios.origem_avaliacao` para auditoria.

### Override (de Gestor de Espaço)

Vínculo direto entre um usuário e um Espaço específico, registrado em `espaco_gestores_espaco`. Tem precedência absoluta sobre o padrão do Módulo — se um espaço tem override, o padrão é ignorado. Necessário quando um espaço precisa de gestão diferente do restante de seu módulo.

### Padrão do Módulo

Vínculo entre um usuário (ou grupo de usuários) e um Módulo inteiro, registrado em `modulo_gestores_espaco`. Todos os Espaços do módulo herdam esse Gestor de Espaço, a menos que tenham um override direto. É a abordagem de menor custo para atribuir gestão quando uma equipe responde por vários espaços.

### PBAC

Permission-Based Access Control — autorização decidida por permission concreta (ex.: `reservas.avaliar-urgencia`) atribuída via Spatie, nunca por nome de role. Permite separação clara entre as capacidades técnicas de um ator e sua designação administrativa.

### Precedência (algoritmo de)

Regra de resolução implementada por `getGestoresDeEspaco(Espaco)` que retorna os Gestores de Espaço de um espaço específico seguindo a ordem: (1) override direto em `espaco_gestores_espaco`, se presente; (2) padrão do módulo em `modulo_gestores_espaco`, se presente; (3) vazio (espaço órfão). O override sempre vence.

### Reserva

Solicitação de uso de um espaço por um usuário, contendo um ou mais Horários e uma situação geral. Cada horário pode ser aprovado ou rejeitado individualmente. A auto-aprovação aplica-se quando o solicitante é um dos Gestores de Espaço vinculados àquele espaço.

### Rejeitada

Situação de um Horário indicando que o Gestor de Reserva recusou a reserva. Ver `SituacaoReservaEnum`.

### Setor

Entidade organizacional/departamental (RH-like) — Departamento de Química, Secretaria do Colegiado, Setor de TI. Usuários vinculam-se a um setor via `users.setor_id`. Na v2.0, ganha dois novos atributos: Coordenador (`coordenador_id`) e Expediente (horários de funcionamento com exceções). **Nunca** guarda escopo de gestão de espaços — esse vínculo é exclusivo dos três pivots (`unidade_gestores`, `modulo_gestores_espaco`, `espaco_gestores_espaco`). Ver "Coordenador de Setor".

### SituacaoReservaEnum

Enumeração dos estados possíveis de um Horário: `SOLICITADO` (recém-criado), `EM_ANALISE` (aguardando Gestor de Reserva), `DEFERIDA` (aprovada), `REJEITADA` (recusada), `CANCELADA` (cancelada pelo solicitante), `AVALIADA` (finalizada após uso).

### Solicitado

Situação inicial de um Horário quando a Reserva é criada pela primeira vez. Ver `SituacaoReservaEnum`.

### `tipo_vinculo`

Campo `users.tipo_vinculo` (string, obrigatório, default `'externo'`), contendo a taxonomia permanente do usuário: `ESTUDANTE`, `PROFESSOR`, `TECNICO_ADMINISTRATIVO`, `EXTERNO`. Usado como referência informativa para prioridade em urgência (professor e técnico têm o mesmo grau, acima de estudante), mas **não trava** a decisão do avaliador — é meramente consultiva. Ver `TipoVinculoEnum`.

### `TipoVinculoEnum`

Enumeração dos vínculos institucionais de um usuário: `ESTUDANTE`, `PROFESSOR`, `TECNICO_ADMINISTRATIVO`, `EXTERNO`. Suporta método `prioridadeSugerida()` que retorna um inteiro para ordenação em urgência (professor e técnico = 1, estudante = 2, externo = 3), sem trava automática.

### Unidade

Campus da UESB — Ilhéus, Itabuna, Jequié, etc. Cada unidade tem uma hierarquia própria de Módulos, Andares, Setores e Espaços. Um Gestor de Unidade é responsável pelo campus; um Institucional pode gerir múltiplas unidades globalmente.

### Urgência (aprovação em regime de)

Exceção estreita ao fluxo normal de avaliação de reserva, exercida **exclusivamente** pelo Gestor de Espaço e **exclusivamente para o mesmo dia**. Coexistem dois fluxos: (1) Fluxo A — aceleração de reserva já criada pelo solicitante; (2) Fluxo B — criação de reserva pelo Gestor de Espaço em nome de solicitante presencial. Ambos requerem que o horário seja livre (sem conflito com já deferida), que o espaço esteja sob responsabilidade do Gestor de Espaço, e que nenhum outro horário da reserva seja de data diferente. Ver "Fluxo A (urgência)", "Fluxo B / walk-in (urgência)".

---

## Referências Cruzadas para Approfundamento

- **Atores e roles:** ver `docs/auditoria-gestores-unidade-espaco/02-especificacao-novos-atores.md`
- **Modelagem de dados e algoritmos:** ver `docs/auditoria-gestores-unidade-espaco/03-modelagem-dados-vinculos-precedencia.md`
- **Regras invioláveis e padrões:** ver `docs/REGRAS_INVIOLAVEIS_E_PADROES.md`
- **Fluxo de reservas:** ver `docs/core-workflow-report.md`
- **Autorização e segurança:** ver `docs/authorization-policies.md`
