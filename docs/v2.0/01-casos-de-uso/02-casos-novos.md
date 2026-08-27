# 02 — Casos de Uso Novos (UC-13 a UC-24)

Documentação técnica dos 13 casos de uso novos introduzidos pela v2.0. Cada UC detalha seus atores, camada técnica, regras de negócio e achados de código que condicionam a implementação.

---

## UC-13: Atribuição de Gestor de Unidade a uma Unidade

**Atores:** Institucional.

**Camada:** `InstitucionalUnidadeController::alterarGestores()` (novo método, espelha `InstitucionalEspacoController::alterarGestores()` já existente para Agenda).

**Regras:**
- Institucional vincula/desvincula 1+ usuários a uma `Unidade` via `unidade_gestores`.
- Requer permission nova `unidades.gerenciar-gestores`.

---

## UC-14: Atribuição de Gestor de Espaço (Padrão de Módulo ou Override de Espaço)

**Atores:** Institucional, Gestor de Unidade (escopado à sua Unidade).

**Camada:**
- Novo `ModuloController::alterarGestoresEspaco()` (padrão do módulo).
- `EspacoController::alterarGestorEspacoDireto()` (override).

**Regras:**
- Insere/remove linhas em `modulo_gestores_espaco` ou `espaco_gestores_espaco`.
- A UI deve deixar explícito quando uma atribuição por espaço está **sobrepondo** o padrão do módulo.

---

## UC-15: CRUD Escopado de Estrutura Física por Gestor de Unidade

**Atores:** Gestor de Unidade (operador principal), Institucional (bootstrap/exceção).

**Camada:** Mesmos controllers de UC-08:
- `InstitucionalModuloController`
- `InstitucionalSetorController`
- `InstitucionalEspacoController`

Policies estendidas para aceitar `gestor_unidade`, sempre validando que o `unidade_id` do alvo pertence ao conjunto gerido pelo usuário.

**Regras:**
- CRUD completo (P-05/P-06) — criar, editar e excluir Módulo, Andar, Setor e Espaço.
- Não pode operar fora da(s) sua(s) Unidade(s).
- Não pode criar/excluir a própria `Unidade`.

**Achados de código que condicionam a implementação:**

1. **`Andar` não tem Policy nem Controller próprios** — seu ciclo de vida inteiro vive dentro de `ModuloService::store()/update()/delete()`. Estender `ModuloPolicy` já cobre Andar por transitividade; criar uma `AndarPolicy` seria desnecessário.

2. **As permissions `andares.criar` e `andares.atualizar` são órfãs** — existem no `PermissionSeeder` e têm rótulo no frontend, mas nunca são verificadas em lugar nenhum do backend. Decidir na execução: ligar de fato ou remover (ver P-32).

3. **Ordem de implementação é crítica (risco R-18):** conceder `secao.gestao-modulos`/`-setores`/`-espacos` ao `gestor_unidade` **antes** de implementar o filtro de escopo faria com que ele enxergasse os 3 campi — as rotas são liberadas por permission, e os controllers hoje não filtram por unidade.

---

## UC-15-B: Bootstrap de Unidade Recém-Criada

**Atores:** Institucional.

**Camada:** Transversal — reúso de UC-13 e UC-08.

**Regras:**
- Uma `Unidade` recém-criada não tem Gestor de Unidade — logo ninguém poderia configurá-la se a capacidade do Institucional fosse revogada.
- O Institucional cria a Unidade, atribui o Gestor de Unidade (UC-13) e, a partir daí, sai do caminho.
- Este caso de uso é a justificativa técnica da recomendação em P-22 ("remover a necessidade, não a capacidade").

---

## UC-16: Bloco de Dashboard do Gestor de Unidade

**Atores:** Gestor de Unidade.

**Camada:**
- `organisms/WidgetPainelGestorUnidade.tsx` **como bloco condicional** dentro do dashboard único (P-21) — não uma página dedicada.
- `HomeService` ganha um método agregador correspondente.

**Regras:**
- Métricas restritas à(s) sua(s) Unidade(s):
  - Total de espaços
  - Reservas do mês
  - Espaços órfãos de Gestor de Espaço
  - Espaços sem Gestor de Reserva
  - Contagem de módulos/setores

---

## UC-17: Bloco de Dashboard do Gestor de Espaço

**Atores:** Gestor de Espaço.

**Camada:** `organisms/WidgetEspacosSobResponsabilidade.tsx`, também bloco condicional.

**Regras:**
- Lista de espaços sob responsabilidade (via `getEspacosGeridosPorGestorEspaco()`).
- Indicação da origem do vínculo (override direto vs. padrão do módulo).

---

## UC-18: Espaços Órfãos — Duas Profundidades Distintas (P-10)

Decisão P-10 tornou este caso de uso **dois casos de uso diferentes**, não um só com filtro de escopo.

**Atores:** Gestor de Unidade, Institucional.

**Camada:** `EspacoRepositoryInterface::queryOrfaosDeGestorEspaco()` serve aos dois, com agregação diferente na camada de Service.

**Regras:**
- "Órfão" = `getGestoresDeEspaco()` retorna vazio (nem override no espaço, nem padrão no módulo).

**Duas profundidades distintas:**

| Aspecto | Gestor de Unidade | Institucional |
|---|---|---|
| **Formato** | Lista detalhada e acionável (`<DataTable>`) | Indicador agregado/analítico (contadores por campus) |
| **Escopo** | Só a(s) sua(s) Unidade(s) | Todos os campi |
| **Objetivo** | Resolver — atribuir um Gestor de Espaço a cada órfão | Cobrar — saber qual campus está descoberto |
| **Componente** | `Institucional/EspacosOrfaos.tsx` (tabela) | Bloco dentro de `WidgetVisaoMacroInstitucional` |

---

## UC-19: Relatórios Escopados por Unidade

**Atores:** Gestor de Unidade.

**Camada:** `RelatorioService::aplicarEscopo()` (extensão).

**Regras:**
- Mesmos 4 relatórios já existentes:
  - `reservas-periodo`
  - `ocupacao-espacos`
  - `inventario-espacos`
  - `indicadores-consolidados`
- Filtro implícito de `unidade_id` para quem tem `gestor_unidade` e não `institucional`.

---

## UC-20: Visão Institucional "Macro" Consolidada Entre Campi

**Atores:** Institucional.

**Camada:**
- Extensão de `DashboardInstitucionalPage.tsx`.
- `RelatorioService`.

**Regras:**
- Comparativo lado a lado entre Unidades (ex.: taxa de ocupação por campus, espaços órfãos por campus).
- A "visão macro" mencionada explicitamente pelo usuário como novo papel do Institucional.

---

## UC-21-A: Aprovação de Urgência sobre Reserva Já Existente (Fluxo A)

**Atores:** Gestor de Espaço.

**Camada:**
- `ReservaPolicy::avaliarComUrgencia()`.
- Endpoint `PATCH /gestor-espaco/reservas-urgentes/{horario}`.
- Permission `reservas.avaliar-urgencia`.

**Regras (todas fechadas):**
- Espaço ∈ escopo do Gestor de Espaço.
- Horário é **de hoje** (P-15).
- **A reserva não pode conter nenhum horário fora de hoje** (P-17) — impede aprovar uma reserva semestral pelo balcão.
- Sem conflito com horário já deferido.
- Notifica **apenas** o Gestor de Reserva titular (P-14).
- Prioridade sugerida (Professor **=** Técnico-Administrativo > Estudante > Externo) é **exibida como apoio, sem trava** — o desempate é do avaliador (P-18 + P-25).
- Validação de expediente do setor entra aqui — ver documento 03, §7.7.

---

## UC-21-B: Criação Assistida de Reserva no Balcão (Fluxo B — Walk-in)

**Atores:** Gestor de Espaço (operador), solicitante presencial (titular da reserva).

**Camada:** Novo `ReservaService::criarComUrgencia()` — caminho **síncrono e dedicado**, que não passa pela cascata de auto-aprovação de `ProcessarCriacaoReserva` (ver documento 03, §8.1).

**Regras:**
- Reserva nasce já `deferida`, com `origem_avaliacao = urgencia_gestor_espaco`.
- Gestor de Espaço é registrado como avaliador.
- Mesmas validações do Fluxo A (hoje, escopo, sem conflito).

**Ponto aberto (P-30):** solicitante **externo sem cadastro** não pode ser titular — `reservas.user_id` é FK obrigatória. Três alternativas em documento 03, §8.2. (Solução final está em `../00-visao-geral/03-decisoes-consolidadas.md`.)

---

## UC-22: Report de Problema via QR Code com Tutorial Assistido

**Atores:** Visitante/Comum (reporta, sem necessidade de login), Gestor de Espaço (recebe e tria).

**Camada:**
- Rota pública `/reportar/{espaco:public_id}` (já prevista na PR #397).
- Extensão de `tipos_chamado` com campo `tutorial` (documento 03, §7.6).

**Regras:**
- Ao selecionar um tipo de problema com tutorial associado, exibe passo a passo antes de permitir a abertura formal do chamado.
- Chamado criado é roteado ao(s) usuário(s) que `getGestoresDeEspaco()` retornar para aquele espaço — mesmo algoritmo de precedência já usado para dashboards e atribuição (documento 03, §3).

---

## UC-23: Cadastro/Edição de Usuário com Tipo de Vínculo

**Atores:** Visitante (auto-cadastro), Institucional (edição administrativa).

**Camada:**
- `StoreRegisterRequest` + `RegisteredUserController`.
- Tela `auth/register`.
- Telas de usuário do Institucional.
- (hoje já carrega `Instituicao::with(['unidades.setors'])` para o seletor de setor)

**Regras:**
- Novo campo `tipo_vinculo` com valores:
  - `estudante`
  - `professor`
  - `tecnico_administrativo`
  - `externo`
- Auto-declarado na v1 (P-26 recomendado).
- Base legada recebe `externo` como default conservador (P-27).

---

## UC-24: Designação de Responsável e Configuração de Expediente do Setor (P-23/P-28/D-1)

**Atores:**
- Gestor de Unidade (designa o responsável e configura, nos setores do seu campus).
- Institucional (global).
- Responsável designado (apenas o expediente do seu próprio setor).

**Camada:**
- Endpoint estreito `PATCH /setores/{setor}/expediente`.
- `Setor` + `setor_excecoes_expediente`.
- Novo `ExpedienteService::estaEmExpediente()`.
- `SetorPolicy::atualizarExpediente()`.

**Regras:**
- O **Gestor de Unidade designa manualmente** quem é o responsável por setor (D-1) — é uma FK, não um role.
- O responsável edita **somente** horários, dias e exceções.
- **Não** edita `nome`, `sigla`, `coordenador_id` nem `unidade_id`.
  - Permitir editar `unidade_id` seria risco R-21 (escapar do escopo movendo o setor de campus).
- Exceções são registradas por **intervalo de datas** (recesso de 15 dias = 1 registro, não 15).
- Toda alteração de expediente gera **trilha de auditoria** (R-22), pois governa o portão da urgência.

**Consumo:** alimenta a validação de urgência (UC-21-A/B) — documento 03, §7.7.

**Adoção:** preenchimento **gradual** (D-6); o dashboard do Gestor de Unidade indica os setores pendentes.
