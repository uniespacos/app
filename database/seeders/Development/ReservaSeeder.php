<?php

declare(strict_types=1);

namespace Database\Seeders\Development;

use App\Models\Agenda;
use App\Models\Horario;
use App\Models\Reserva;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ReservaSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            $numReservas = rand(1, 2);
            $agenda = Agenda::all()->random();
            $dataAtual = Carbon::today();

            if ($agenda->turno === 'manha') {
                $horarios = ['08:00:00', '09:00:00', '10:00:00', '11:00:00'];
            } elseif ($agenda->turno === 'tarde') {
                $horarios = ['14:00:00', '15:00:00', '16:00:00', '17:00:00'];
            } else {
                $horarios = ['19:00:00', '20:00:00', '21:00:00'];
            }

            for ($i = 0; $i < $numReservas; $i++) {
                $reserva = Reserva::factory()->create([
                    'user_id' => $user->id,
                    'data_inicial' => $dataAtual->format('Y-m-d'),
                    'data_final' => (clone $dataAtual)->addWeek()->format('Y-m-d'),
                ]);

                foreach ($horarios as $inicio) {
                    Horario::factory()->create([
                        'agenda_id' => $agenda->id,
                        'reserva_id' => $reserva->id,
                        'data' => $dataAtual->format('Y-m-d'),
                        'horario_inicio' => $inicio,
                        'horario_fim' => Carbon::parse($inicio)->addMinutes(50)->format('H:i:s'),
                        'situacao' => 'em_analise',
                        'user_id' => $agenda->user_id ?? null,
                    ]);
                }
            }
        }
    }
}
