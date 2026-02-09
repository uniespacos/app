<?php

namespace Tests\Feature;

use App\Http\Middleware\ReservaMiddleware; // Certifique-se que este é o nome correto do seu middleware
use App\Models\Agenda;    // Adicione se sua factory `getValidRequestData` ou o setup precisar
use App\Models\User;   // Adicione se sua factory `getValidRequestData` ou o setup precisar
// Adicione se estiver usando factories que tocam o BD
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException; // Adicionado para datas dinâmicas
use Tests\TestCase;

class ReservaMiddlewareTest extends TestCase
{
    private ReservaMiddleware $middleware;

    private string $user_id;

    private string $agenda_id;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new ReservaMiddleware; // Instancia o middleware uma vez
        $this->user_id = User::pluck('id')->random();
        $this->agenda_id = Agenda::pluck('id')->random();
    }

    /**
     * @test
     */
    public function test_validando_formulario_correto(): void
    {
        $requestData = [
            'titulo' => 'qwe',
            'descricao' => 'qwe',
            'recorrencia' => 'unica',
            'data_inicio' => '2025-06-01T16:37:22.527Z',
            'data_final' => '2025-07-01T16:37:22.527Z',
            'user_id' => $this->user_id,
            'horarios_solicitados' => [
                [
                    'id' => '2025-05-27-07:00:00',
                    'agenda_id' => $this->agenda_id,
                    'horario_inicio' => '07:00:00',
                    'horario_fim' => '07:50:00',
                    'data' => '2025-05-27T03:00:00.000Z',
                    'status' => 'livre',
                    'autor' => null,
                ],
            ],
        ];

        $request = Request::create(route('reserva.store', $requestData));

        $next = function ($request) {
            return response('Validou corretamente');
        };

        // Quando
        $middleware = new ReservaMiddleware;
        $response = $middleware->handle($request, $next);
        $this->assertEquals(Response::HTTP_OK, $response->getStatusCode());
        $this->assertEquals('Validou corretamente', $response->getContent());
    }

    /**
     * Novo teste: Falha quando 'horario_inicio' está ausente em um item de 'horarios_solicitados'.
     *
     * @test
     */
    public function test_falha_validacao_quando_horario_inicio_esta_ausente(): void
    {
        // Espera que uma ValidationException seja lançada
        $this->expectException(ValidationException::class);

        $requestData = [
            'titulo' => 'qwe',
            'descricao' => 'qwe',
            'recorrencia' => 'unica',
            'data_inicio' => Carbon::now()->addDay()->toIso8601String(),
            'data_final' => Carbon::now()->addDays(2)->toIso8601String(),
            'user_id' => $this->user_id,
            'horarios_solicitados' => [
                [
                    'id' => '2025-05-27-07:00:00',
                    'agenda_id' => $this->agenda_id,
                    // "horario_inicio" => "07:00:00", // CAMPO AUSENTE!
                    'horario_fim' => '07:50:00',
                    'data' => Carbon::now()->addDay()->toIso8601String(),
                    'status' => 'livre',
                ],
            ],
        ];

        $request = Request::create('/teste-middleware', 'POST', $requestData);

        $next = function ($request) {
            return response('Validou corretamente');
        };
        try {
            $this->middleware->handle($request, $next);
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('horarios_solicitados.0.horario_inicio', $e->errors());
            $this->assertContains(
                'validation.required', // Ajuste se sua mensagem for diferente
                $e->validator->errors()->get('horarios_solicitados.0.horario_inicio')
            );
            throw $e; // Re-lança a exceção para que $this->expectException() a capture
        }

        // Se a exceção não for lançada, o teste deve falhar
        $this->fail('ValidationException nao foi lancada para horario_inicio ausente.');
    }
}
