# Auto-Aprovação de Reserva

## Invariante

Quando um solicitante é o **único gestor de TODAS as agendas** incluídas em sua reserva, a reserva nasce automaticamente com `situacao='deferida'` (aprovada).

**Lógica subjacente:** Quem gerencia uma agenda pode sempre usá-la — não faz sentido colocar em análise uma reserva feita por seu próprio gestor.

**Resultado:** Os horários da reserva nascem já deferidos, pulando o fluxo de avaliação.

## Localização no Código

**Arquivo:** `app/Jobs/ProcessarCriacaoReserva.php`

**Implementação em duas camadas:**

### 1. Nível de Horário (linhas 90–92)

Callback passado para `ExpansaoHorariosService::montar()`:

```php
fn (Agenda $agenda) => $agenda->user && $agenda->user->id === $this->solicitante->id
    ? 'deferida'
    : 'em_analise',
```

Cada `Horario` recebe `situacao='deferida'` se o solicitante é o gestor daquela agenda, ou `'em_analise'` caso contrário.

### 2. Nível de Reserva (linhas 103–107)

Após a criação dos horários, a `Reserva` tem sua `situacao` atualizada conforme:

```php
if ($gestoresUnicos->count() === 1 && $gestoresUnicos->first()->id === $this->solicitante->id) {
    $reserva->update(['situacao' => 'deferida']);
} elseif ($gestoresUnicos->contains(fn ($g) => $g->id === $this->solicitante->id)) {
    $reserva->update(['situacao' => 'parcialmente_deferida']);
}
```

- **Deferida:** Um único gestor (de TODAS as agendas) e é o solicitante.
- **Parcialmente deferida:** O solicitante é gestor de ALGUMAS agendas (mas não todas).
- **Em análise:** O solicitante não é gestor de nenhuma agenda.

## Condição Requerida: "TODAS" as Agendas

A auto-aprovação exige que:

1. `count($gestoresUnicos) === 1` — há apenas um gestor diferente entre todas as agendas reservadas.
2. Esse gestor é `$this->solicitante` — o gestor único é quem fez a requisição.

Se a reserva inclui múltiplas agendas e o solicitante não é gestor de todas, a reserva fica `parcialmente_deferida` (se gestor de algumas) ou `em_analise` (se gestor de nenhuma).

## Implicação para Edição

A função `ReservaService::resolveDataAncora()` busca o **primeiro horário em ordem de data**:

```php
public function resolveDataAncora(Reserva $reserva): string
{
    $firstSlot = $reserva->horarios()->orderBy('data', 'asc')->first();
    return Carbon::parse($firstSlot ? $firstSlot->data : $reserva->data_inicial)->format('Y-m-d');
}
```

**Por que não filtrar por `situacao='em_analise'`?**

Em uma reserva auto-aprovada, **todos os horários nascem `deferida`** — não há nenhum em `em_analise`. Se buscasse apenas horários em análise, retornaria `null` e falharia na validação de `data_inicial` editável.

**Solução:** Buscar o primeiro horário (independente da `situacao`), mesmo que seja futuro ou deferido. Isso garante um ponto de referência válido para edição.

## Implicação para Notificações

Uma reserva auto-aprovada dispara `ReservationCreatedNotification` normalmente, mas o método `via()` de `BaseNotification` suprime o canal `mail`:

```php
// BaseNotification::via()
if ($isApplicant && $isSoleManager) {
    return ['database', 'broadcast'];  // Sem mail
}
// Caso contrário:
return ['database', 'broadcast', 'mail'];
```

**Comportamento:**

- **Email:** Não é enviado
- **Notificação de banco de dados:** Enviada
- **Broadcast (WebSocket):** Enviado

**Razão:** Não faz sentido enviar notificação por email dizendo "sua reserva foi aprovada" quando você mesmo (o gestor) é quem a aprovou implicitamente.

## Cenários de Uso

### Cenário 1: Gestor de Sala Única
- Usuário é gestor da Sala A
- Cria reserva apenas na Sala A
- **Resultado:** `reserva.situacao = 'deferida'`, `horarios[].situacao = 'deferida'`
- **Notificação:** Nenhum email enviado

### Cenário 2: Gestor de Múltiplas Salas
- Usuário é gestor da Sala A e Sala B
- Cria reserva em Sala A + Sala B
- **Resultado:** `reserva.situacao = 'deferida'`, todos `horarios[].situacao = 'deferida'`
- **Notificação:** Nenhum email enviado

### Cenário 3: Gestor Parcial
- Usuário é gestor da Sala A (mas não de B)
- Cria reserva em Sala A + Sala B
- **Resultado:** `reserva.situacao = 'parcialmente_deferida'`, `horarios` em Sala A = `'deferida'`, em Sala B = `'em_analise'`
- **Notificação:** Email enviado (gestor de B precisa avaliar)

### Cenário 4: Usuário Comum
- Usuário não é gestor de nenhuma sala
- Cria reserva em qualquer sala
- **Resultado:** `reserva.situacao = 'em_analise'`, todos `horarios[].situacao = 'em_analise'`
- **Notificação:** Email enviado para todos os gestores

## Notas de Precaução

### Loop Infinito de Notificação

Esta regra previne que:
- Um gestor receba email "sua reserva foi aprovada" quando ele mesmo é o único gestor
- A validação de e-mail fique redundante (auto-aprovação não precisa de "confirmação" por email)

### Invariante de Manutenção

Se a lógica de aprovação for modificada no futuro:

1. Manter a simetria entre `Horario.situacao` (nível individual) e `Reserva.situacao` (nível agregado)
2. Garantir que `BaseNotification::via()` continua verificando `isSoleManager` antes de suprimir email
3. Validar que `resolveDataAncora()` encontra o primeiro horário mesmo em reservas 100% deferidas

### Testes Esperados

- ✓ Auto-aprovação nunca dispara email redundante
- ✓ `resolveDataAncora()` retorna data válida mesmo com todos os horários deferidos
- ✓ `parcialmente_deferida` dispara email para gestores não-aprovadores
- ✓ Gestor como solicitante recebe apenas notificação de banco de dados (broadcast, sem mail)
