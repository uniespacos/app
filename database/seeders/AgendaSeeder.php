<?php

namespace Database\Seeders;

use App\Models\Agenda;
use App\Models\Horario;
use App\Models\User;
use DateTime;
use Illuminate\Database\Seeder;

class AgendaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dataDeInicioDaSemana = now()->startOfWeek();

        for ($i = 1; $i <= 10; $i++) {
            $agenda_manha = Agenda::create([
                'turno' => 'manha',
                'espaco_id' => $i,
                'user_id' => User::pluck('id')->random(),
            ]);
            $reservas_manha = $this->gerarHorariosParaAgenda($agenda_manha->id, $dataDeInicioDaSemana, 'manha');
            if ($reservas_manha > 0) {
                echo "Espaço $i agenda manha: \n";
                print_r($reservas_manha);
            }
            $agenda_tarde = Agenda::create([
                'turno' => 'tarde',
                'espaco_id' => $i,
                'user_id' => User::pluck('id')->random(),
            ]);
            $reservas_tarde = $this->gerarHorariosParaAgenda($agenda_tarde->id, $dataDeInicioDaSemana, 'tarde');
            if ($reservas_tarde > 0) {
                echo "Espaço $i agenda tarde: \n ";
                print_r($reservas_tarde);
            }
            $agenda_noite = Agenda::create([
                'turno' => 'noite',
                'espaco_id' => $i,
                'user_id' => User::pluck('id')->random(),
            ]);
            $reservas_noite = $this->gerarHorariosParaAgenda($agenda_noite->id, $dataDeInicioDaSemana, 'noite');
            if ($reservas_noite > 0) {
                echo "Espaço $i agenda noite: \n ";
                print_r($reservas_noite);
            }
        }
    }

    // Exemplo de como usar a função:
    // É importante definir o timezone para consistência com DateTime,
    // especialmente se seu servidor/aplicação PHP tiver configurações diferentes.
    // date_default_timezone_set('America/Sao_Paulo'); // Ou o timezone relevante

    // $idDaMinhaAgenda = 1;
    // $dataDeInicioDaSemana = new DateTime('2025-06-02'); // Ex: uma segunda-feira

    // $listaDeHorarios = gerarHorariosParaAgenda($idDaMinhaAgenda, $dataDeInicioDaSemana);

    // if (count($listaDeHorarios) > 0) {
    //     echo "Horários gerados para a agenda ID {$idDaMinhaAgenda}:\n";
    //     echo "<pre>";
    //     print_r($listaDeHorarios);
    //     echo "</pre>";

    // Em um contexto Laravel, você poderia então usar esses dados para inserção:
    // DB::table('horarios')->insert($listaDeHorarios);
    // ou, se estiver usando Eloquent e tiver um model Horario:
    // foreach ($listaDeHorarios as $horarioData) {
    //     Horario::create($horarioData);
    // }
    // } else {
    //     echo "Nenhum horário foi aleatoriamente selecionado para a agenda ID {$idDaMinhaAgenda} nesta execução.\n";
    // }
    /**
     * Função para gerar horários aleatoriamente 'ocupados' para uma agenda específica,
     * formatados para inserção na tabela 'horarios' do Laravel.
     *
     * A função itera sobre todos os horários possíveis dentro de um período,
     * mas só cria um registro de horário se ele for aleatoriamente definido como 'ocupado'.
     *
     * @param  int  $agendaId  O ID da agenda (foreignId 'agenda_id').
     * @param  DateTime  $semanaInicio  O dia de início para a geração dos horários.
     * @return array Uma lista de arrays, cada um representando um horário
     *               pronto para ser inserido na tabela 'horarios'.
     */
    public function gerarHorariosParaAgenda(int $agendaId, DateTime $semanaInicio, string $turno): array
    {
        $horariosParaInserir = [];
        switch ($turno) {
            case 'manha':
                $horaDeInicioDia = 7;  // Hora de início das atividades no dia (ex: 7 AM)
                $horaDeFimDia = 12;    // Limite para o início do último horário (ex: slots até 21:00-21:50)
                break;
            case 'tarde':
                $horaDeInicioDia = 13;  // Hora de início das atividades no dia (ex: 7 AM)
                $horaDeFimDia = 18;    // Limite para o início do último horário (ex: slots até 21:00-21:50)
                break;
            case 'noite':
                $horaDeInicioDia = 19;  // Hora de início das atividades no dia (ex: 7 AM)
                $horaDeFimDia = 22;    // Limite para o início do último horário (ex: slots até 21:00-21:50)
                break;
        }

        // Gerar para 7 dias consecutivos a partir de $semanaInicio
        for ($diaOffset = 0; $diaOffset < 7; $diaOffset++) {
            $diaAtual = clone $semanaInicio; // Clonar para não modificar o objeto original
            if ($diaOffset > 0) {
                $diaAtual->modify("+$diaOffset days");
            }

            $dataParaBanco = $diaAtual->format('Y-m-d');
            $horariosParaInserir = [];
            $criarEsteDia = (mt_rand(1, 100) <= 30);
            if ($criarEsteDia) {
                // Gerar para cada hora dentro do intervalo de funcionamento
                for ($hora = $horaDeInicioDia; $hora < $horaDeFimDia; $hora++) {
                    // Decide aleatoriamente se este horário específico será criado (simulando uma ocupação/disponibilidade)
                    // Manteremos a probabilidade de ~20% de um horário ser selecionado
                    $criarEsteHorario = (mt_rand(1, 100) <= 30);

                    if ($criarEsteHorario) {
                        // Formato HH:MM:SS para o tipo TIME do banco de dados
                        $horarioInicioParaBanco = str_pad((string) $hora, 2, '0', STR_PAD_LEFT).':00';
                        // Assumindo que cada slot dura 50 minutos, como no exemplo original
                        $horarioFimParaBanco = str_pad((string) $hora, 2, '0', STR_PAD_LEFT).':50';

                        $horariosParaInserir[] = [
                            'agenda_id' => $agendaId,
                            'horario_inicio' => $horarioInicioParaBanco,
                            'horario_fim' => $horarioFimParaBanco,
                            'data' => $dataParaBanco,
                            // As colunas 'id', 'created_at', 'updated_at' são gerenciadas pelo Laravel/banco.
                        ];
                        Horario::create([
                            'agenda_id' => $agendaId,
                            'horario_inicio' => $horarioInicioParaBanco,
                            'horario_fim' => $horarioFimParaBanco,
                            'data' => $dataParaBanco,
                            // As colunas 'id', 'created_at', 'updated_at' são gerenciadas pelo Laravel/banco.
                        ]);
                    }
                }
            }
        }

        return $horariosParaInserir;
    }
}
