<?php

namespace Tests\Unit\Jobs;

use App\Jobs\UpdateReservaJob;
use App\Models\Reserva;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class UpdateReservaJobTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_persists_changes_even_if_notification_fails()
    {
        $user = User::factory()->create();
        $reserva = Reserva::factory()->create([
            'user_id' => $user->id,
            'titulo' => 'Original Title',
        ]);

        $validatedData = [
            'titulo' => 'Updated Title',
            'descricao' => 'Updated Description',
            'data_inicial' => $reserva->data_inicial,
            'data_final' => $reserva->data_final,
            'recorrencia' => $reserva->recorrencia,
            'edit_scope' => 'single',
            'edited_week_date' => $reserva->data_inicial,
            'horarios_solicitados' => [],
        ];

        // Simulate notification failure
        Notification::shouldReceive('send')
            ->once()
            ->andThrow(new \Exception('Mail server error'));

        $job = new UpdateReservaJob($reserva, $validatedData, $user);

        // This should not throw an exception anymore because of the try-catch
        $job->handle();

        $this->assertEquals('Updated Title', $reserva->fresh()->titulo);
    }
}
