# Arquitetura Backend — v2.0

Documentação técnica de referência para implementação da v2.0 do UniEspaços. Este documento consolida o desenho de novos componentes, padrões de autorização e fluxos de urgência.

---

## 1. Padrão de Camadas (Inalterado)

A v2.0 segue estritamente o padrão de arquitetura em camadas já estabelecido e documentado em `docs/repositories-pattern.md`. Nenhuma camada nova é introduzida.

| Camada | Responsabilidade | Exemplo |
|---|---|---|
| **Controller** | HTTP request/response, parse de input, orquestração | `ReservaController::store()` |
| **FormRequest** | Validação de input, regras customizadas | `StoreReservaRequest` |
| **Service** | Lógica de negócio, orquestração de repositórios | `ReservaService::criarComUrgencia()` |
| **Repository (Interface)** | Contrato de acesso a dados | `ReservaRepositoryInterface` |
| **Repository (Eloquent)** | Implementação concreta de queries | `ReservaRepositoryEloquent` |
| **Policy** | Autorização granular por usuário/recurso | `ReservaPolicy::avaliarComUrgencia()` |
| **Model/Migration** | Persistência de dados, relacionamentos | `Reserva`, `Horario` |

**Binding em `AppServiceProvider`:**

```php
$this->app->bind(ReservaRepositoryInterface::class, ReservaRepositoryEloquent::class);
$this->app->bind(UnidadeRepositoryInterface::class, UnidadeRepositoryEloquent::class);
$this->app->bind(EspacoRepositoryInterface::class, EspacoRepositoryEloquent::class);
// ... todos os demais repositórios
```

Controllers e Services injetam interfaces, nunca implementações concretas. Isso permite mockar em testes e trocar implementação sem alterar consumers.

---

## 2. Novos Componentes por Camada

Seguindo estritamente o padrão já estabelecido (Controller → Request → Service → Repository), conforme `docs/repositories-pattern.md`.

### Controllers

| Componente Novo | Responsabilidade |
|---|---|
| `InstitucionalUnidadeController::alterarGestores()` (método novo em controller existente) | Atribuir/remover `gestor_unidade` de uma `Unidade` |
| `InstitucionalModuloController::alterarGestoresEspaco()` (método novo) | Sincronizar `modulo_gestores_espaco` |
| `EspacoController::alterarGestorEspacoDireto()` (método novo, ao lado do já existente `alterarGestores()` de Agenda) | Sincronizar `espaco_gestores_espaco` (override) |
| `GestorEspacoDashboardController` (novo) | Endpoint do dashboard do Gestor de Espaço |
| `GestorUnidadeDashboardController` (novo) | Endpoint do dashboard do Gestor de Unidade |
| `EspacoOrfaoController` (novo) | Listagem de espaços órfãos de Gestor de Espaço, escopada |
| `GestorEspacoReservaUrgenteController` (novo) | `PATCH /gestor-espaco/reservas-urgentes/{horario}` — aprovação em regime de urgência |
| `ChamadoPublicoController::store()` (rota pública, reaproveitada da auditoria-gestor-espaco) | Recebe report via QR Code; se `tipo.tutorial` existe, frontend intercepta antes de submeter |
| Endpoint estreito de **busca de usuário por e-mail exato** (D-3, fechada) | Fluxo B (walk-in): localiza o solicitante recém-cadastrado **sem** conceder `usuarios.listar`. Retorna no máximo 1 registro, com campos mínimos (`id`, `nome`). Permission dedicada `usuarios.buscar-para-atendimento`. **Aplicar rate limiting** — é um vetor de enumeração de e-mails |

### Requests

| Componente Novo | Responsabilidade |
|---|---|
| `AlterarGestoresUnidadeRequest` | Validação (`user_id` existe, pertence ao escopo correto) |
| `AlterarGestoresEspacoModuloRequest` | Validação para gestores de espaço de módulo |
| `AlterarGestorEspacoDiretoRequest` | Validação para override direto de espaço |
| `StoreRegisterRequest` (existente, **estendida**) | Passa a validar `tipo_vinculo` (UC-23) |

### Policies

| Componente Novo | Responsabilidade |
|---|---|
| `UnidadePolicy::gerenciarGestores()` | Autorização — `institucional` sempre; `gestor_unidade` apenas se o alvo pertence à(s) sua(s) Unidade(s) |
| `ModuloPolicy::gerenciarGestoresEspaco()` | Autorização por escopo de unidade |
| `EspacoPolicy::gerenciarGestorEspacoDireto()` | Autorização por escopo de unidade |
| Extensão de `ModuloPolicy`, `AndarPolicy`, `SetorPolicy`, `EspacoPolicy` (métodos `viewAny`, `create`, `update`, `delete`) | Aceitar `gestor_unidade` além de `institucional`, sempre validando escopo de `unidade_id` |
| `ReservaPolicy::avaliarComUrgencia()` (método novo, documento 03 §7.4) | Autorização estreita: só espaços geridos pelo próprio Gestor de Espaço, só dia solicitado, sem conflito |

### Services

| Componente Novo | Responsabilidade |
|---|---|
| `UnidadeService::syncGestores()` | Lógica de sincronização + disparo de notificação (`ShouldQueue`, `try-catch`) |
| `ModuloService::syncGestoresEspaco()` | Sincronização de gestores padrão de espaço |
| `EspacoService::syncGestorEspacoDireto()` | Sincronização de override direto |
| `ReservaService::avaliarComUrgencia()` (método novo) | Marca `Horario.origem_avaliacao = urgencia_gestor_espaco`, grava `categoria_solicitante_urgencia`, dispara notificação ao Gestor de Reserva titular |
| `ReservaService::criarComUrgencia()` (NOVO — Fluxo B, documento 03 §8.1) | Caminho **síncrono** de criação em nome de terceiro, que **não** passa pela cascata de auto-aprovação de `ProcessarCriacaoReserva`; reaproveita `ExpansaoHorariosService` para montar horários |
| `ExpedienteService::estaEmExpediente()` (NOVO — P-23/P-28) | Resolve os 3 estados do expediente (documento 03, §9.4); consumido pela Policy de urgência |

### Repositories

| Componente Novo | Responsabilidade |
|---|---|
| `EspacoRepositoryInterface::getGestoresDeEspaco()` | Algoritmo de precedência (documento 03, §3) |
| `EspacoRepositoryInterface::getEspacosGeridosPorGestorEspaco()` | Espaços geridos por usuário (inverso do anterior) |
| `EspacoRepositoryInterface::queryOrfaosDeGestorEspaco()` | Espaços órfãos escopados |
| `UnidadeRepositoryInterface::getUnidadesGeridasPor(int $userId)` | Resolve escopo do Gestor de Unidade |

### Notifications

| Componente Novo | Responsabilidade |
|---|---|
| `UserAssignedAsUnidadeManagerNotification` | Notifica usuário de atribuição como Gestor de Unidade — obrigatoriamente `ShouldQueue` |
| `UserRemovedAsUnidadeManagerNotification` | Notifica remoção de vínculo como Gestor de Unidade |
| `UserAssignedAsEspacoManagerNotification` | Notifica usuário de atribuição como Gestor de Espaço — obrigatoriamente `ShouldQueue` |
| `UserRemovedAsEspacoManagerNotification` | Notifica remoção de vínculo como Gestor de Espaço |
| `UrgencyReservationApprovedNotification` (NOVO) | `ShouldQueue` — destinatário **único**: o Gestor de Reserva titular da agenda (P-14, fechada). É o principal controle contra abuso (R-09), logo deve logar falha de envio |

### Models/Migrations

| Componente Novo | Responsabilidade |
|---|---|
| `unidade_gestores` (migration + model relation) | Tabela pivot N:N de Gestores de Unidade |
| `modulo_gestores_espaco` (migration + model relation) | Tabela pivot N:N de Gestores de Espaço padrão do módulo |
| `espaco_gestores_espaco` (migration + model relation) | Tabela pivot N:N de Gestores de Espaço com override direto |
| `add_tipo_vinculo_to_users_table` (migration) | Taxonomia de vínculo institucional; default `externo` para base legada (P-27) |
| `add_label_gestor_to_unidades_table` (migration) | Rótulo customizável do cargo por campus (P-13) |
| `add_urgencia_fields_to_horarios_table` (migration) | Novo campo `origem_avaliacao` (documento 03 §7.2) |
| `add_coordenador_e_expediente_to_setors_table` (migration) | Novo campos de expediente (documento 03 §9.2) |
| `create_setor_excecoes_expediente_table` (migration) | Tabela de exceções de expediente (documento 03 §9.3) |
| `Setor` + model relations | `coordenador_id`, horários, `dias_funcionamento` (JSON) — documento 03, §9.2–9.3 |
| Extensão de `TipoChamado` (migration) | Novo campo `tutorial` (documento 03 §7.6) |

### Rules

| Componente Novo | Responsabilidade |
|---|---|
| `UsuarioDaMesmaUnidade` (NOVO) | Espelha a rule já existente `UsuarioDaMesmaInstituicaoDaAgenda` — valida que o usuário atribuído pertence à Unidade do Gestor de Unidade que está atribuindo |

### Refatorações/Correções

| Alvo | Tipo | Detalhes |
|---|---|---|
| `HomeController` + `HomeService` (documento 06 §0.4) | Refatoração | Cascata exclusiva → composição aditiva de blocos |
| 5 controllers institucionais + `UserService` (bug R-12) | Correção | **P-24 (fechada): corrigir dentro desta iniciativa.** `Auth::user()->setor->unidade` quebra com `setor_id` nulo — confirmado alcançável, pois `StoreRegisterRequest` aceita `setor_id` nullable. Ver seção 6 abaixo. |
| `RoleSeeder` (3ª exclusão) | Configuração | **P-34 (fechada):** `reservas.avaliar-urgencia` entra na lista de exclusão do `institucional`, junto com `reservas.deletar` e `reservas.atualizar` |
| `permissions` migrations (remoção) | Configuração | **P-32 (fechada)** — remover `andares.criar` / `andares.atualizar`. São permissions órfãs. |

---

## 3. Código de Referência — Autorização de Urgência

### `ReservaPolicy::avaliarComUrgencia()`

Autorização para avaliação em regime de urgência (defesa em profundidade obrigatória).

```php
public function avaliarComUrgencia(User $user, Horario $horario): bool
{
    if (! $user->hasPermissionTo('reservas.avaliar-urgencia')) {
        return false;
    }

    // Escopo espacial: só espaços que ele gerencia como Gestor de Espaço
    // (mesmo algoritmo de precedência do §3.1 — sem duplicação de lógica)
    $espacoIdsGeridos = $this->espacoRepository
        ->getEspacosGeridosPorGestorEspaco($user->id)
        ->pluck('id');

    if (! $espacoIdsGeridos->contains($horario->agenda->espaco_id)) {
        return false;
    }

    // P-15 (FECHADA): exclusivamente hoje. Nunca data futura.
    if (! $horario->data->isToday()) {
        return false;
    }

    // Não pode "reavaliar" algo que o fluxo normal já decidiu
    if (! in_array($horario->situacao, [
        SituacaoReservaEnum::EM_ANALISE->value,
        SituacaoReservaEnum::SOLICITADO->value,
    ], true)) {
        return false;
    }

    // P-17/Fluxo A (FECHADA): a reserva deve conter EXCLUSIVAMENTE horários de hoje.
    // Se houver qualquer horário de outra data, a urgência é recusada e o caso
    // volta ao fluxo normal do Gestor de Reserva.
    $temHorarioForaDeHoje = $horario->reserva->horarios()
        ->whereDate('data', '!=', today())
        ->exists();

    if ($temHorarioForaDeHoje) {
        return false;
    }

    return ! $this->conflictDetectionService->temConflitoComDeferida($horario);
}
```

**Notas de segurança:**

1. **Defesa em profundidade obrigatória:** `app/Jobs/AvaliarReservaJob.php` estabelece o padrão de sempre repetir o filtro de posse na própria query de escrita, redundante com a Policy (`Horario::where('id', $id)->whereIn('agenda_id', $agendasDoGestorIds)->update(...)`). O fluxo de urgência deve replicar isso, filtrando por `espaco_id` dentro do conjunto gerido — **nunca** confiando apenas na autorização em memória.

2. A checagem de "reserva contém apenas horários de hoje" (P-17/Fluxo A) é o que impede o vetor mais óbvio de abuso: submeter uma reserva semestral e conseguir aprová-la inteira pelo balcão.

3. Este método **não** substitui `viewForGestor()` — é um caminho de exceção adicional e paralelo.

---

## 4. Código de Referência — Escopo do Gestor de Unidade

### Pseudocódigo `aplicarEscopo()`

Padrão de restrição por unidade, inspirado em `app/Services/Relatorio/RelatorioService.php:121`.

```
função aplicarEscopo(usuario: User, filtros: FiltrosRelatorio) -> FiltrosRelatorio:
    SE usuario.hasRole('institucional'):
        RETORNA filtros  // sem restrição

    SE usuario.hasRole('gestor_unidade'):
        unidadeIds = unidade_gestores WHERE user_id = usuario.id .pluck(unidade_id)
        filtros.unidade_id = unidadeIds   // NOVO — restringe consulta às unidades geridas
        RETORNA filtros

    SE usuario.hasRole('gestor'):
        // comportamento já existente, inalterado
        ...
```

**Replicação Obrigatória:** O mesmo padrão de escopo (`whereIn('unidade_id', $unidadeIdsGeridas)`) precisa ser replicado nos repositórios de:

- `ModuloRepository::getPaginatedForUnidadeGestor()`
- `AndarRepository::getPaginatedForUnidadeGestor()`
- `SetorRepository::getPaginatedForUnidadeGestor()`
- `EspacoRepository::getPaginatedForUnidadeGestor()`

Cada um encapsula a mesma lógica: resolver as unidades geridas pelo usuário autenticado, depois filtrar apenas recursos que pertencem àquelas unidades.

---

## 5. Código de Referência — Criação em Nome de Terceiro (Fluxo B)

### Desenho de `ReservaService::criarComUrgencia()`

Caminho **síncrono** de criação quando o Gestor de Espaço opera o formulário no balcão para um solicitante presente.

```php
/**
 * Cria e aprova imediatamente uma reserva em nome de terceiro (Fluxo B).
 * Executado **sincronamente** — sem passar pela cascata de ProcessarCriacaoReserva.
 */
public function criarComUrgencia(
    User $solicitante,
    array $dados,
    User $gestorEspaco
): Reserva {
    // 1) Validação: todos os horários são de HOJE (mesma regra do §7.4)
    foreach ($dados['horarios'] as $horario) {
        if (! Carbon::parse($horario['data'])->isToday()) {
            throw new \InvalidArgumentException('Fluxo B: apenas horários de hoje.');
        }
    }

    // 2) Validação: todos os espaços ∈ getEspacosGeridosPorGestorEspaco($gestorEspaco)
    $espacoIdsGeridos = $this->espacoRepository
        ->getEspacosGeridosPorGestorEspaco($gestorEspaco->id)
        ->pluck('id');

    foreach ($dados['horarios'] as $horario) {
        if (! $espacoIdsGeridos->contains($horario['agenda']['espaco_id'])) {
            throw new \InvalidArgumentException('Espaço fora do escopo do Gestor de Espaço.');
        }
    }

    // 3) Validação: nenhum conflito com horário já deferido
    foreach ($dados['horarios'] as $horario) {
        if ($this->conflictDetectionService->temConflitoComDeferida($horario)) {
            throw new \InvalidArgumentException('Conflito com horário já deferido.');
        }
    }

    // 4) Criação ATÔMICA: Reserva + Horarios já com situacao = 'deferida'
    $reserva = $this->repoReserva->store([
        'user_id' => $solicitante->id,
        'titulo' => $dados['titulo'],
        'descricao' => $dados['descricao'] ?? null,
        'situacao' => SituacaoReservaEnum::DEFERIDA->value,
        'data_inicial' => $dados['data_inicial'],
        'data_final' => $dados['data_final'],
    ]);

    // Expandir horários via ExpansaoHorariosService
    $horariosExpandidos = $this->expansaoHorariosService->expandir(
        $dados['horarios'],
        $solicitante->id
    );

    foreach ($horariosExpandidos as $horario) {
        Horario::create([
            'reserva_id' => $reserva->id,
            'agenda_id' => $horario['agenda_id'],
            'data' => $horario['data'],
            'horario_inicio' => $horario['horario_inicio'],
            'horario_fim' => $horario['horario_fim'],
            'situacao' => SituacaoReservaEnum::DEFERIDA->value,
            'origem_avaliacao' => OrigemAvaliacaoEnum::URGENCIA_GESTOR_ESPACO->value,
            'user_id' => $gestorEspaco->id,  // avaliador
        ]);
    }

    // 5) Notificação ao Gestor de Reserva titular (§7.5)
    try {
        $gestorReserva = $reserva->horarios->first()->agenda->user;
        if ($gestorReserva) {
            $gestorReserva->notify(
                new UrgencyReservationApprovedNotification($reserva)
            );
        }
    } catch (\Exception $e) {
        Log::warning('Falha ao notificar Gestor de Reserva de criação com urgência', [
            'reserva_id' => $reserva->id,
            'gestor_espaco_id' => $gestorEspaco->id,
            'error' => $e->getMessage(),
        ]);
    }

    return $reserva;
}
```

**Por que não reutilizar `ProcessarCriacaoReserva`:**

- Aquele job é **assíncrono** — enfileira criação e avaliação em job paralelo.
- Ele aplica a **cascata de auto-aprovação** (compara solicitante com gestor da agenda).
- No Fluxo B, o solicitante é o **aluno/professor atendido**, não o Gestor de Espaço — logo a auto-aprovação não dispara, e a reserva nasceria `em_analise`.
- Seria necessário um **segundo passo** imediato (Gestor de Espaço aprovando por urgência), redundante e com janela de inconsistência.

**Fluxo B é síncrono por natureza:** a pessoa está na frente do atendente esperando resposta. Enfileirar não agrega valor — só atrasa. Recomenda-se um caminho dedicado e síncrono, reaproveitando `ExpansaoHorariosService` para montar os horários, mas **sem** passar pela cascata de auto-aprovação.

---

## 6. Código de Referência — Expediente do Setor

### `SetorPolicy::atualizarExpediente()`

Autorização para editar o expediente de um setor (responsável designado, Gestor de Unidade, Institucional).

```php
public function atualizarExpediente(User $user, Setor $setor): bool
{
    // Institucional: sempre (super-role, P-22)
    if ($user->hasPermissionTo('setores.atualizar') && $user->hasRole('institucional')) {
        return true;
    }

    // Gestor de Unidade: apenas setores da(s) sua(s) unidade(s)
    if ($this->unidadeRepository->getUnidadesGeridasPor($user->id)->contains($setor->unidade_id)) {
        return true;
    }

    // Responsável designado: apenas o próprio setor (D-1)
    return $setor->coordenador_id === $user->id;
}
```

### Delimitação Obrigatória por Campo (risco R-21)

Conforme documento 03 §9.5: responsável designado pode editar expediente, mas não identidade do setor.

| Campo | Institucional | Gestor de Unidade | Responsável designado |
|---|:---:|:---:|:---:|
| `horario_abertura` / `horario_fechamento` / `dias_funcionamento` | ✅ | ✅ | ✅ |
| Exceções de expediente (`setor_excecoes_expediente`) | ✅ | ✅ | ✅ |
| `nome` / `sigla` | ✅ | ✅ | ❌ |
| `unidade_id` (move o setor de campus) | ✅ | ❌ | ❌ |
| `coordenador_id` (quem o designou) | ✅ | ✅ | ❌ |

**Implementação recomendada:** endpoint dedicado e estreito (`PATCH /setores/{setor}/expediente`) em vez de regras condicionais dentro de `UpdateSetorRequest`. Há precedente direto no projeto — `espacos.alterarGestores` já é um endpoint separado, não parte do `update` genérico. Isso evita um FormRequest com validação dependente de papel.

### Algoritmo de Resolução de Expediente — `ExpedienteService::estaEmExpediente()`

Resolve os 3 estados do expediente (verdadeiro, falso, indeterminado).

```php
/**
 * @return bool|null  true = em expediente | false = fora | null = INDETERMINADO (não configurado)
 */
public function estaEmExpediente(Setor $setor, CarbonInterface $quando): ?bool
{
    // 1) Exceção tem precedência absoluta sobre a regra semanal
    $excecao = $setor->excecoesExpediente()
        ->whereDate('data_inicio', '<=', $quando)
        ->whereDate('data_fim', '>=', $quando)
        ->first();

    if ($excecao) {
        if ($excecao->fechado) {
            return false;
        }
        return $quando->between($excecao->horario_abertura, $excecao->horario_fechamento);
    }

    // 2) Sem configuração base => INDETERMINADO (não assume nada)
    if ($setor->horario_abertura === null || $setor->dias_funcionamento === null) {
        return null;
    }

    // 3) Regra semanal padrão
    if (! in_array($quando->dayOfWeekIso, $setor->dias_funcionamento, true)) {
        return false;
    }

    return $quando->between($setor->horario_abertura, $setor->horario_fechamento);
}
```

**O terceiro estado (`null`) é essencial.** `User.setor_id` é nullable (confirmado em `StoreRegisterRequest`) e o expediente também. Um retorno booleano forçaria assumir "sempre disponível" ou "sempre indisponível" — ambos errados. Com `null`, o fluxo de urgência trata explicitamente o caso "não sei": **libera com aviso** (D-2), o que permite o preenchimento gradual do expediente (D-6) sem que a funcionalidade nasça inutilizável.

---

## 7. Correção de Bug Pré-Existente (R-12)

### Descrição

Bug presente em 5 controllers institucionais e em `UserService`: chamada `Auth::user()->setor->unidade->instituicao_id` quebra com `Fatal error` quando `setor_id` é `null`.

**Cenário:**
```php
// app/Http/Controllers/Institucional/InstitucionalUnidadeController.php
$instituicaoId = Auth::user()->setor->unidade->instituicao_id;  // ❌ setor_id = null → Undefined property
```

**Alcance confirmado:**
- `InstitucionalUnidadeController` — todos os métodos que usam este padrão
- `InstitucionalModuloController`
- `InstitucionalAndarController`
- `InstitucionalSetorController`
- `InstitucionalEspacoController`
- `UserService` — métodos de leitura de contexto

### Causa-Raiz

`StoreRegisterRequest` permite `setor_id` nullable (desde sempre — é um campo opcional no cadastro). Porém, os controllers administrativos assumem que **todo usuário autenticado tem um setor designado**, o que não é verdade.

### Solução (P-24, Fechada)

Correção dentro desta iniciativa (v2.0), já que os mesmos arquivos serão tocados para implementação do escopo do Gestor de Unidade.

**Padrão recomendado:**

```php
// Em vez de:
$instituicaoId = Auth::user()->setor->unidade->instituicao_id;

// Usar:
$instituicaoId = Auth::user()->setor?->unidade?->instituicao_id;

// Ou, se é um erro (usuário devia ter setor):
if (! Auth::user()->setor) {
    throw new \Illuminate\Auth\AuthorizationException(
        'Usuário não possui setor designado. Solicite configuração a um Institucional.'
    );
}
$instituicaoId = Auth::user()->setor->unidade->instituicao_id;
```

**Todos os 5 controllers + `UserService` devem ser auditados e corrigidos nesta fase.**

Isso também **não quebra compatibilidade retroativa** — o sistema continua funcionando para usuários com setor; apenas deixa claro o que ocorre quando não há.

---

## Resumo: Fluxos de Integração

### Fluxo Normal (Fluxo A)

1. Usuário solicita reserva via `ReservasPage`
2. `ReservaController::store()` recebe `StoreReservaRequest`
3. `ReservaService::create()` enfileira `ProcessarCriacaoReserva`
4. Job assíncrono aplica auto-aprovação (compara solicitante com gestores)
5. Resultado notificado ao solicitante

### Fluxo de Urgência (Gestor de Espaço)

1. Gestor de Espaço acessa seção de urgência em `/gestor/reservas`
2. Seleciona horários livres do dia nos seus espaços
3. Clica "Aprovar com Urgência"
4. `GestorEspacoReservaUrgenteController::aprovar()` chama `ReservaPolicy::avaliarComUrgencia()`
5. Se aprovado, `ReservaService::avaliarComUrgencia()` marca `origem_avaliacao = urgencia_gestor_espaco`
6. Notificação ao Gestor de Reserva titular (único destinatário — P-14)

### Fluxo B (Atendimento de Balcão — Walk-in)

1. Pessoa chega sem cadastro
2. Gestor de Espaço a orienta a se cadastrar (`/register`)
3. Pessoa cadastra-se, confirma e-mail
4. Gestor busca por e-mail (endpoint estreito, D-3)
5. Gestor abre formulário de Fluxo B com solicitante pré-selecionado
6. `GestorEspacoReservaUrgenteController` chama `ReservaService::criarComUrgencia()`
7. Reserva + Horarios criados **sincronamente** com `origem_avaliacao = urgencia_gestor_espaco`
8. Notificação ao Gestor de Reserva titular

---

## Referências Internas

- `docs/repositories-pattern.md` — Padrão Repository, especialização de queries
- `docs/authorization-policies.md` — Policies, roles do Spatie, prevenção contra IDOR
- `docs/auto-approval-rule.md` — Regra de auto-aprovação para gestores
- `docs/archive-soft-delete-flow.md` — Separação entre cancelamento/avaliação e arquivamento
- `docs/auditoria-gestores-unidade-espaco/03-modelagem-dados-vinculos-precedencia.md` — Diagrama ER, algoritmo de precedência
- `docs/auditoria-gestores-unidade-espaco/06-impacto-paginas-componentes-backend-frontend.md` — Tabela completa de componentes, impact analysis
