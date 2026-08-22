<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Reserva;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReservationValidatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Reserva $reserva,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('reserva.'.$this->reserva->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ReservationValidated';
    }

    /**
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->reserva->id,
            'validation_status' => $this->reserva->validation_status,
            'conflict_cache' => $this->reserva->conflict_cache,
        ];
    }
}
