# Tratamento de Erros e Logging Estruturado

Sistema uniforme de resposta a erros (envelope JSON) e rastreamento estruturado de eventos, implementado na PR #263 (issue #112).

## Envelope de Erro JSON

Toda resposta HTTP JSON de erro (status 4xx, 5xx) recebe um envelope padrão que facilita o tratamento no cliente sem necessidade de analisar texto de mensagens.

### Estrutura do Envelope

```json
{
  "error_code": "VALIDATION_FAILED",
  "message": "The given data was invalid.",
  "details": {
    "data_fim": [
      "Data final não pode ser anterior a data inicial."
    ]
  },
  "errors": {
    "data_fim": [
      "Data final não pode ser anterior a data inicial."
    ]
  }
}
```

**Campos:**

- **`error_code`** (string, novo em PR #263): Código estável de erro, derivado do status HTTP. O cliente branchia por esse valor, nunca por mensagem de texto — mensagens mudam conforme traduções, mas o código permanece.
- **`message`** (string): Mensagem de erro em texto. Mantida pelo Laravel no formato padrão.
- **`details`** (object, novo em PR #263): Cópia do bag `errors` para fácil acesso a erros de validação específicos. Mantém compatibilidade com hooks de frontend.
- **`errors`** (object, original): Bag tradicional do Laravel com erros de validação por campo. Inertia's `useForm` depende dele em todos os formulários do app.

### Design Aditivo (Compatibilidade)

O envelope é **aditivo, não destrutivo**: novos campos entram ao lado dos originais. Isso preserva dois contratos existentes:

1. **`resources/js/hooks/use-gerar-relatorio.ts`** lê `data.message` na raiz em respostas 422. Se a mensagem fosse aninhada, o toast de erro falharia silenciosamente.
2. **Inertia's `useForm`** depende do bag `errors` em todo formulário. Remover ou mover esse campo quebraria validação no frontend.

### Quando o Envelope é Disparado

O envelope é aplicado apenas em requisições que esperam JSON (`Accept: application/json` ou `X-Requested-With: XMLHttpRequest`). Requisições Inertia (que enviam `Accept: text/html`) e page loads não recebem o envelope — devolvem HTML padrão ou página de erro do Inertia.

**Implementação:** `app/Exceptions/ErrorEnvelope::apply()`
- Verifica se `$response instanceof JsonResponse` e se status >= 400
- Preserva `error_code` já presente (evita sobrescrita intencional)
- Define `details` a partir de `errors` se não houver valor

## ErrorCode Enum

Mapeamento estável entre status HTTP e códigos de erro que o cliente reconhece.

**Arquivo:** `app/Enums/ErrorCode.php`

```php
enum ErrorCode: string
{
    case UNAUTHENTICATED = 'UNAUTHENTICATED';        // Status 401
    case FORBIDDEN = 'FORBIDDEN';                    // Status 403
    case NOT_FOUND = 'NOT_FOUND';                    // Status 404
    case METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED';  // Status 405
    case PAGE_EXPIRED = 'PAGE_EXPIRED';              // Status 419
    case VALIDATION_FAILED = 'VALIDATION_FAILED';    // Status 422
    case TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS';    // Status 429
    case BAD_REQUEST = 'BAD_REQUEST';                // Default 4xx
    case SERVER_ERROR = 'SERVER_ERROR';              // Default 5xx
}
```

**Método `fromStatus(int $status): self`:**
Deriva o `ErrorCode` a partir do status HTTP. É o status que serve como fonte de verdade, não a classe da exceção, pois várias exceções distintas convergem para o mesmo status após o tratamento do Laravel.

**Exemplo:**

```php
// Numa requisição GET a /reservas/999 que não existe
$response->getStatusCode();  // 404
ErrorCode::fromStatus(404);  // ErrorCode::NOT_FOUND
// O envelope fica: { "error_code": "NOT_FOUND", ... }
```

## Por Que Payload NÃO é Logado

Decisão crítica de segurança: o corpo da requisição **nunca é incluído** no contexto de log automático ou manual.

### Justificativa

`ConfirmPasswordRequest` trafega o campo `password` em texto plano para autorizar o cancelamento de reserva. Logar o payload completo gravaria a senha nos arquivos de log — uma vulnerabilidade grave criada pela própria correção de logging.

```php
// ❌ NUNCA faça isso:
Log::error('Erro ao processar', request()->all());
// ❌ NUNCA inclua payload no contexto ExceptionContext::build():
$context['payload'] = request()->all();
```

### Alternativa Segura

Logar apenas **identificadores e ações**, nunca valores sensíveis:

```php
// ✅ Fazer isso:
Log::warning('Falha ao confirmar cancelamento', [
    'user_id' => auth()->id(),
    'reserva_id' => $reserva->id,
    'action' => 'cancel_reservation_confirmed',
]);

// ✅ Se precisar de um campo específico, valide antes:
Log::info('Atualização de perfil', [
    'user_id' => $user->id,
    'email' => $validatedData['email'],  // email é seguro
    'setor_id' => $validatedData['setor_id'],
]);
```

## Logging Estruturado

Padrão uniforme de logging em todos os layers da aplicação.

### Pattern Base

```php
use Illuminate\Support\Facades\Log;

Log::error('Descrição breve do que falhou', [
    'user_id' => auth()->id(),
    'contexto_chave' => 'valor',
    'exception' => $exception,  // Opcional, para exceções capturadas
]);
```

**Regras:**

1. **Mensagem:** Texto que explica o que falhou, sem detalhes de dados.
2. **Contexto:** Array associativo com:
   - `user_id`: ID do usuário autenticado (ou `null` se não autenticado)
   - `action`: Tipo de ação (ex: `'create_reservation'`, `'evaluate_reservation'`)
   - `duration_ms`: Tempo decorrido (para operações longas)
   - Identificadores: `reserva_id`, `agenda_id`, `espaco_id`
   - **Nunca:** campos com valores, tokens, senhas, ou payload completo

### Níveis de Log

| Nível | Uso |
|-------|-----|
| `Log::error()` | Falha não esperada (PDOException, RuntimeException, falha do queue) |
| `Log::warning()` | Falha esperada mas anormal (falha ao enviar notificação, timeout) |
| `Log::info()` | Evento importante (job iniciado, reserva criada, decisão de negócio) |
| `Log::debug()` | Detalhes de depuração (valor de variável intermediária) |

### Exemplos Reais do Codebase

#### Em Job — Logging com Try-Catch em Notificações

**Arquivo:** `app/Jobs/ProcessarCriacaoReserva.php`

```php
public function handle(ExpansaoHorariosService $expansao): void
{
    Log::info('ProcessarCriacaoReserva started', [
        'solicitante_id' => $this->solicitante->id,
        'titulo' => $this->dadosRequisicao['titulo'],
    ]);

    try {
        // ... lógica do job ...

        Log::info('Reservation created', [
            'reserva_id' => $reserva->id,
            'situacao' => $reserva->situacao,
            'horarios_count' => count($linhas),
        ]);

        // ✅ IMPORTANTE: notify() em try-catch
        // Se a notificação falhar, a exceção é capturada e logada
        // — o job continua e não falha por erro do provedor de email
        foreach ($gestoresUnicos as $gestor) {
            if ($gestor->id !== $this->solicitante->id) {
                try {
                    $gestor->notify(new NewReservationNotification($reserva));
                } catch (Exception $e) {
                    Log::warning('Falha ao notificar gestor sobre nova reserva', [
                        'gestor_id' => $gestor->id,
                        'reserva_id' => $reserva->id,
                        'exception' => $e,
                    ]);
                }
            }
        }
    } catch (Exception $e) {
        Log::error('ProcessarCriacaoReserva failed', [
            'solicitante_id' => $this->solicitante->id,
            'titulo' => $this->dadosRequisicao['titulo'],
            'exception' => $e,
        ]);
        $this->fail($e);
    }
}
```

**Pontos-chave:**

- `notify()` sempre em `try-catch` (rule #3 em CLAUDE.md)
- Falha de notificação não derruba o job
- `Log::warning()` para notificação falha, `Log::error()` para falha crítica
- `exception` adicionado ao contexto para rastreabilidade

#### Em Controller — Logging de Operações

```php
public function store(StoreReservaRequest $request): JsonResponse
{
    Log::info('Reservation store initiated', [
        'user_id' => auth()->id(),
        'action' => 'create_reservation',
        'horarios_count' => count($request->validated()['horarios_solicitados']),
    ]);

    ProcessarCriacaoReserva::dispatch(
        $request->validated(),
        $request->user(),
    );

    return response()->json(['status' => 'queued']);
}
```

## Contexto Automático de Exceções

Toda exceção não capturada (ou passada a `report()`) recebe contexto automático anexado ao log.

**Arquivo:** `app/Exceptions/ExceptionContext.php`

### Contexto Gerado Automaticamente

```php
[
    'user_id' => auth()->id(),           // Null se não autenticado
    'route' => 'reservas.show',          // Nome da rota
    'method' => 'GET',                   // Método HTTP
    'url' => 'https://app.test/...',     // URL completa
    'ip' => '192.168.1.100',             // IP do cliente
]
```

### Âmbito de Aplicação

- **Vale para:** Exceções não capturadas que chegam ao handler global
- **Não vale para:** Chamadas manuais de `Log::error()` — cada uma precisa declarar seus próprios identificadores
- **Razão:** O handler é registrado em `bootstrap/app.php` via `$exceptions->context()`, que é consumido apenas pelo caminho de report de exceção

### Diferença: HTTP vs Console (Jobs, Comandos)

**Durante HTTP:**
Contexto completo com rota, método, URL, IP.

```php
[
    'user_id' => 5,
    'route' => 'reservas.show',
    'method' => 'GET',
    'url' => 'https://app.test/reservas/123',
    'ip' => '192.168.1.100',
]
```

**Durante Console (Jobs, Comandos):**
Apenas `user_id`. Incluir rota/URL seria dado enganoso (um job não faz requisição real).

```php
[
    'user_id' => 5,
]
```

## Exception Handling por Layer

### Layer 1: Configuração Global (`bootstrap/app.php`)

```php
->withExceptions(function (Exceptions $exceptions) {
    // Contexto anexado a toda exceção logada
    $exceptions->context(fn () => ExceptionContext::build());

    // Requisição Inertia com sessão expirada vira redirect 302
    $exceptions->render(function (AuthenticationException $exception, Request $request) {
        if ($request->header('X-Inertia')) {
            return Inertia::location(route('login'));
        }
    });

    // Aplicar envelope em requisições JSON
    $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
        if ($request->expectsJson()) {
            return ErrorEnvelope::apply($response);
        }
        // ... mais tratamento para Inertia e página de erro ...
    });
})
```

**Fluxo:**

1. Exceção é lançada durante requisição
2. Laravel chama o handler global
3. `context()` anexa user_id, rota, etc. via `ExceptionContext::build()`
4. `render()` converte AuthenticationException em redirect para login (Inertia)
5. `respond()` aplica envelope se `expectsJson() === true`

### Layer 2: Validação (`FormRequest`)

Validação falha automaticamente com status 422 (Validation Exception). Não há handler customizado — Laravel gera o erro, o envelope adiciona `error_code` e `details`.

```php
class StoreReservaRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'data_inicial' => 'required|date',
            'data_final' => 'required|date|after_or_equal:data_inicial',
        ];
    }
}

// Requisição com data_final < data_inicial:
// → 422 Validation Exception
// → ErrorEnvelope::apply()
// → Resposta:
// {
//   "error_code": "VALIDATION_FAILED",
//   "message": "The given data was invalid.",
//   "errors": { "data_final": ["..."] },
//   "details": { "data_final": ["..."] }
// }
```

### Layer 3: Jobs

Jobs implementam `ShouldQueue` e possuem retry logic. O handler de exceção envolve o job — se falhar, é retentado até `$tries`.

**Padrão:**

```php
class MeuJob implements ShouldQueue
{
    public int $tries = 3;
    public int $timeout = 360;

    public function handle(): void
    {
        try {
            // Lógica do job
            $this->notificar();
        } catch (Exception $e) {
            Log::error('MeuJob failed', ['exception' => $e]);
            $this->fail($e);  // Marca job como falho, dispara failed()
        }
    }

    private function notificar(): void
    {
        try {
            $user->notify(new MeuNotification());
        } catch (Exception $e) {
            // Falha de notificação não derruba o job
            Log::warning('Notificação falhou', ['exception' => $e]);
        }
    }

    public function failed(Throwable $exception): void
    {
        // Chamado quando $tries é excedido
        Log::error('MeuJob exhausted retries', ['exception' => $exception]);
    }
}
```

**Regras (CLAUDE.md):**

1. **`notify()` sempre em `try-catch`:** Falha do provedor de email não derruba o job
2. **Não relançar exception em notify():** `Log::warning()` e continuar

### Layer 4: Políticas de Autorização

Policies usam `abort(403)` quando não autorizado. Laravel converte para `AuthorizationException`, que o handler global trata:

```php
class ReservaPolicy
{
    public function show(User $user, Reserva $reserva): bool
    {
        return $user->id === $reserva->user_id;
    }
}

// Controller
$this->authorize('show', $reserva);  // Lança AuthorizationException se false
// → Handler global captura
// → ErrorEnvelope::apply()
// → Resposta 403: { "error_code": "FORBIDDEN", ... }
```

## Diferença: Erros Esperados vs Inesperados

| Tipo | Exemplos | Logging | Stack Trace |
|------|----------|---------|------------|
| **Esperados** | Validação falha, usuário não autorizado, taxa excedida | `Log::warning()` ou silencioso | Não |
| **Inesperados** | PDOException, RuntimeException, falha de conexão | `Log::error()` | Sim |

**Inesperados recebem stack trace completo** no log porque ajudam a identificar bugs.

```php
try {
    $model->save();
} catch (PDOException $e) {
    // Inesperado: erro de banco de dados
    Log::error('Database error on save', [
        'model' => get_class($model),
        'exception' => $e,  // Stack trace incluído
    ]);
}
```

## Auditoria e Conformidade

### Campos PII (Identificação Pessoal)

Tratados como seguros para log:

- `user_id`, `email`, `nome`, `cpf`

Tratados como sensíveis (nunca logar):

- `password`, `password_confirmation`, `current_password`
- `_token`, `token` (CSRF/auth tokens)
- Conteúdo de requisição (`request()->all()`)

### Limpeza de Logs Antigos

Laravel produz logs diários por padrão (config `config/logging.php`):

```php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['single', 'daily'],
    ],
    'daily' => [
        'driver' => 'daily',
        'path' => storage_path('logs/laravel.log'),
        'days' => 14,  // Retém últimos 14 dias
    ],
]
```

**Em produção:** Cron job ou scheduler remove logs com mais de 30 dias (conforme política de retenção).

```php
// routes/console.php
Schedule::command('logs:clear')->weekly();
```

### Requisitos de Conformidade

1. **Rastreabilidade:** Toda ação crítica (criar reserva, avaliar, cancelar) tem seu timestamp em log
2. **Identificação:** `user_id` sempre presente permite auditar quem fez o quê
3. **Imutabilidade:** Logs salvos em arquivo (não editáveis pós-escrita)
4. **Retenção:** Mínimo 14 dias (estendível via config)

**Campos recomendados para auditoria:**

```php
Log::info('Ação crítica realizada', [
    'user_id' => auth()->id(),
    'action' => 'cancel_reservation',
    'reserva_id' => $reserva->id,
    'timestamp' => now()->toIso8601String(),
    'previous_status' => $reserva->situacao,
    'new_status' => 'cancelada',
]);
```

## Referências

- **ErrorEnvelope:** `app/Exceptions/ErrorEnvelope.php`
- **ExceptionContext:** `app/Exceptions/ExceptionContext.php`
- **ErrorCode enum:** `app/Enums/ErrorCode.php`
- **Configuração de log:** `config/logging.php`
- **Bootstrap:** `bootstrap/app.php` (handler registrado)
- **Testes:** `tests/Feature/ErrorHandlingTest.php`, `tests/Feature/ExceptionContextTest.php`
- **Issue #112:** Standardized error envelope for JSON responses
- **PR #263:** Implementou envelope de erro
