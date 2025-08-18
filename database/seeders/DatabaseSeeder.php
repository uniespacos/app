<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Agenda;
use App\Models\Espaco;
use App\Models\Horario;
use App\Models\Instituicao;
use App\Models\PermissionType;
use App\Models\Reserva;
use App\Models\Setor;
use App\Models\Unidade;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */


    public function run(): void
    {
        // Desativa a verificação de chaves estrangeiras para limpeza
        DB::statement("SET session_replication_role = 'replica';");
        // Limpa as tabelas na ordem correta para evitar erros de FK

        Reserva::truncate();
        Horario::truncate();
        Agenda::truncate();
        Espaco::truncate();
        User::truncate(); // Assumindo que você queira limpar os usuários
        Instituicao::truncate();
        Unidade::truncate();

        DB::statement("SET session_replication_role = 'origin';");


        echo "Tabelas limpas.\n";

        $this->call([
            PermissionTypeSeeder::class,
        ]);

        DB::beginTransaction();
        DB::table('instituicaos')->insert([
            'nome' => 'Universidade Estadual do Sudoeste da Bahia',
            'sigla' => 'UESB',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('instituicaos')->insert([
            'nome' => 'Outra Instituição',
            'sigla' => 'outra',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('instituicaos')->insert([
            'nome' => 'Nenhuma',
            'sigla' => 'nenhuma',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('unidades')->insert([
            'nome' => 'Campus Jequié',
            'sigla' => 'JQ',
            'instituicao_id' => 1,
        ]);
        DB::table('unidades')->insert([
            'nome' => 'Campus Vitória da Conquista',
            'sigla' => 'VCA',
            'instituicao_id' => 1,
        ]);
        DB::table('unidades')->insert([
            'nome' => 'Campus Itapetinga',
            'sigla' => 'ITA',
            'instituicao_id' => 1,

        ]);
        DB::table('setors')->insert([
            'nome' => 'Reitoria',
            'sigla' => 'REITORIA',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Administração',
            'sigla' => 'PROAD',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Administração',
            'sigla' => 'PROAD',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Administração',
            'sigla' => 'PROAD',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Extensão e Assuntos Comunitários',
            'sigla' => 'PROEX',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Extensão e Assuntos Comunitários',
            'sigla' => 'PROEX',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Extensão e Assuntos Comunitários',
            'sigla' => 'PROEX',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Graduação',
            'sigla' => 'PROGRAD',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Graduação',
            'sigla' => 'PROGRAD',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Graduação',
            'sigla' => 'PROGRAD',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Pesquisa e Pós-Graduação',
            'sigla' => 'PPG',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Pesquisa e Pós-Graduação',
            'sigla' => 'PPG',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Pesquisa e Pós-Graduação',
            'sigla' => 'PPG',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        DB::table('setors')->insert([
            'nome' => 'Assessoria de Comunicação',
            'sigla' => 'ASCOM',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria de Comunicação',
            'sigla' => 'ASCOM',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria de Comunicação',
            'sigla' => 'ASCOM',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        DB::table('setors')->insert([
            'nome' => 'Assessoria Especial de Gestão de Pessoas',
            'sigla' => 'AGP',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria Especial de Gestão de Pessoas',
            'sigla' => 'AGP',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria Especial de Gestão de Pessoas',
            'sigla' => 'AGP',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        DB::table('setors')->insert([
            'nome' => 'Assessoria na Gestão de Projetos e Convênios Institucionais',
            'sigla' => 'AGESPI',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria na Gestão de Projetos e Convênios Institucionais',
            'sigla' => 'AGESPI',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria na Gestão de Projetos e Convênios Institucionais',
            'sigla' => 'AGESPI',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        DB::table('setors')->insert([
            'nome' => 'Assessoria Técnica de Finanças e Planejamento',
            'sigla' => 'ASPLAN',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria Técnica de Finanças e Planejamento',
            'sigla' => 'ASPLAN',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria Técnica de Finanças e Planejamento',
            'sigla' => 'ASPLAN',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        DB::table('setors')->insert([
            'nome' => 'Assessoria Especial de Acesso, Permanência Estudantil e Ações Afirmativas',
            'sigla' => 'AAPA',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria Especial de Acesso, Permanência Estudantil e Ações Afirmativas',
            'sigla' => 'AAPA',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria Especial de Acesso, Permanência Estudantil e Ações Afirmativas',
            'sigla' => 'AAPA',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now()
        ]);


        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Exatas e Naturais',
            'sigla' => 'DCEN',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Humanas, Educação e Linguagem',
            'sigla' => 'DCHEL',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Tecnologia Rural e Animal',
            'sigla' => 'DTRA',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Biológicas',
            'sigla' => 'DCB',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Humanas e Letras',
            'sigla' => 'DCHL',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Tecnológicas',
            'sigla' => 'DCT',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Saúde I',
            'sigla' => 'DS I',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Saúde II',
            'sigla' => 'DS II',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Exatas e Tecnológicas',
            'sigla' => 'DCET',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Naturais',
            'sigla' => 'DCN',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Sociais Aplicadas',
            'sigla' => 'DCSA',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Engenharia Agrícola e Solos',
            'sigla' => 'DEAS',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Estudos Linguísticos e Literários',
            'sigla' => 'DELL',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Filosofia e Ciências Humanas',
            'sigla' => 'DFCH',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Fitotecnia e Zootecnia',
            'sigla' => 'DFZ',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Geografia',
            'sigla' => 'DG',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de História',
            'sigla' => 'DH',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        DB::commit();

        // --- ETAPA 1: Criar a infraestrutura e os horários disponíveis ---
        // Também cria alguns usuários avulsos que poderão fazer reservas.

        echo "Criando usuários...\n";
        $users = User::factory()->count(10)->create([
            'password' => Hash::make('123123123'), // Senha padrão para todos os usuários
            'setor_id' => Setor::pluck('id')->random(),
        ]);

        // Ao criar o Espaco, o EspacoFactory cria as Agendas,
        // e o novo AgendaFactory cria todos os Horários.
        echo "Criando Espaços, Agendas e Horários...\n";
        Espaco::factory()->count(5)->create();



        echo "Infraestrutura criada com sucesso.\n";

        // --- ETAPA 2: Criar as Reservas e vincular aos Horários ---

        echo "Criando reservas e vinculando aos horários...\n";


        // Para cada usuário, cria uma ou duas reservas
        foreach ($users as $user) {
            $numReservas = rand(1, 2);
            $agenda = Agenda::all()->random();
            $dataAtual = Carbon::today();
            // Define os horários de início com base no turno da agenda
            if ($agenda->turno === 'manha') {
                $horarios = ['08:00:00', '09:00:00', '10:00:00', '11:00:00'];
            } elseif ($agenda->turno === 'tarde') {
                $horarios = ['14:00:00', '15:00:00', '16:00:00', '17:00:00'];
            } else { // 'noite'
                $horarios = ['19:00:00', '20:00:00', '21:00:00'];
            }
            for ($i = 0; $i < $numReservas; $i++) {
                // Cria a reserva
                $reserva = Reserva::factory()->create([
                    'user_id' => $user->id,
                    'data_inicial' => $dataAtual->format('Y-m-d'),
                    'data_final' =>  (clone $dataAtual)->addWeek()->format('Y-m-d'),
                ]);
                foreach ($horarios as $inicio) {
                    Horario::factory()->create([
                        'agenda_id' => $agenda->id,
                        'reserva_id' => $reserva->id,
                        'data' => $dataAtual->format('Y-m-d'),
                        'horario_inicio' => $inicio,
                        'horario_fim' => Carbon::parse($inicio)->addMinutes(50)->format('H:i:s'),
                        'situacao' => 'em_analise',
                        'user_id' => $agenda->user_id ?? null, // Usa o user_id da agenda (pode ser null)
                    ]);
                }
            }
        }

        echo "Atribuindo setores aos usuarios";
        DB::transaction(function () {
            // 1. Pega todos os IDs dos setores disponíveis.
            // Usar `pluck('id')` é muito mais eficiente do que `all()`
            // porque carrega apenas a coluna de ID na memória.
            $setoresIds = Setor::pluck('id');

            // 2. Verifica se existem setores para atribuir.
            // Se não houver setores, exibe um aviso e interrompe o seeder.
            if ($setoresIds->isEmpty()) {
                $this->command->warn('Nenhum setor encontrado. Nenhum usuário foi atualizado.');
                return;
            }

            // 3. Pega todos os usuários que ainda não têm um setor_id definido.
            $usuariosSemSetor = User::whereNull('setor_id')->get();

            $this->command->info("Atribuindo setores para {$usuariosSemSetor->count()} usuários...");

            // 4. Itera sobre cada usuário e atribui um ID de setor aleatório.
            foreach ($usuariosSemSetor as $usuario) {
                // O método `random()` da Collection do Laravel é perfeito para isso.
                $usuario->setor_id = $setoresIds->random();
                $usuario->save();
            }

            $this->command->info('Setores atribuídos com sucesso!');
        });

        echo "Seed concluído com sucesso!\n";
    }
}
