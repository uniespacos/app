<?php

namespace App\Console\Commands;

use App\Jobs\ValidateReservationConflictsJob;
use App\Models\Reserva;
use Illuminate\Console\Command;

class FixStuckReservationsValidation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservas:fix-validations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Encontra reservas com validação pendente e despacha os jobs de validação de conflitos.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando a busca por reservas com validação pendente...');

        // Encontra todas as reservas que ainda estão com o status 'pending'
        $reservasParaValidar = Reserva::where('validation_status', 'pending')->get();

        if ($reservasParaValidar->isEmpty()) {
            $this->info('Nenhuma reserva com validação pendente foi encontrada. Tudo certo!');

            return 0;
        }

        $count = $reservasParaValidar->count();
        $this->info("Encontradas {$count} reservas para revalidar.");

        // Cria uma barra de progresso para acompanharmos o processo
        $bar = $this->output->createProgressBar($count);
        $bar->start();

        foreach ($reservasParaValidar as $reserva) {
            // Para cada reserva encontrada, despacha o job de validação
            ValidateReservationConflictsJob::dispatch($reserva);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Todos os jobs de validação para as reservas antigas foram despachados para a fila!');
        $this->warn('Certifique-se de que seu queue worker está rodando para processá-los (`php artisan queue:work`).');

        return 0;
    }
}
