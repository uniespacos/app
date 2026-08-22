<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Events\ReservationValidatedEvent;
use App\Models\Reserva;
use App\Services\ConflictDetectionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ValidateReservationConflictsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Reserva $reserva,
    ) {}

    /**
     * Execute the job — runs conflict detection and caches the result on the reservation.
     */
    public function handle(ConflictDetectionService $conflictService): void
    {
        Log::info('ValidateReservationConflictsJob started', ['reserva_id' => $this->reserva->id]);

        try {
            $this->reserva->update(['validation_status' => 'processing']);

            $conflitos = $conflictService->findConflictsFor($this->reserva->id);

            $this->reserva->update([
                'conflict_cache' => $conflitos,
                'validation_status' => 'completed',
            ]);

            Log::info('ValidateReservationConflictsJob completed', [
                'reserva_id' => $this->reserva->id,
                'conflicts_found' => $conflitos->count(),
            ]);

            ReservationValidatedEvent::dispatch($this->reserva);

        } catch (Throwable $e) {
            Log::error('ValidateReservationConflictsJob failed', [
                'reserva_id' => $this->reserva->id,
                'exception' => $e,
            ]);
            $this->reserva->update(['validation_status' => 'failed']);
            $this->fail($e);
        }
    }

    /**
     * Handle a job failure after all retries are exhausted.
     */
    public function failed(Throwable $exception): void
    {
        Log::error('ValidateReservationConflictsJob exhausted all retries', [
            'reserva_id' => $this->reserva->id,
            'exception' => $exception,
        ]);
        $this->reserva->update(['validation_status' => 'failed']);
    }
}
