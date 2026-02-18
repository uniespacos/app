<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SetorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // unidade_id -> 1(JQ), 2(VCA), 3(ITA)
        DB::table('setors')->insert([
            'nome' => 'Reitoria',
            'sigla' => 'REITORIA',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Administração',
            'sigla' => 'PROAD',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Administração',
            'sigla' => 'PROAD',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Administração',
            'sigla' => 'PROAD',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Extensão e Assuntos Comunitários',
            'sigla' => 'PROEX',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Extensão e Assuntos Comunitários',
            'sigla' => 'PROEX',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Extensão e Assuntos Comunitários',
            'sigla' => 'PROEX',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Graduação',
            'sigla' => 'PROGRAD',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Graduação',
            'sigla' => 'PROGRAD',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Graduação',
            'sigla' => 'PROGRAD',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Pesquisa e Pós-Graduação',
            'sigla' => 'PPG',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Pesquisa e Pós-Graduação',
            'sigla' => 'PPG',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Pró-Reitoria de Pesquisa e Pós-Graduação',
            'sigla' => 'PPG',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('setors')->insert([
            'nome' => 'Assessoria de Comunicação',
            'sigla' => 'ASCOM',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria de Comunicação',
            'sigla' => 'ASCOM',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria de Comunicação',
            'sigla' => 'ASCOM',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('setors')->insert([
            'nome' => 'Assessoria Especial de Gestão de Pessoas',
            'sigla' => 'AGP',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria Especial de Gestão de Pessoas',
            'sigla' => 'AGP',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria Especial de Gestão de Pessoas',
            'sigla' => 'AGP',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('setors')->insert([
            'nome' => 'Assessoria na Gestão de Projetos e Convênios Institucionais',
            'sigla' => 'AGESPI',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria na Gestão de Projetos e Convênios Institucionais',
            'sigla' => 'AGESPI',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria na Gestão de Projetos e Convênios Institucionais',
            'sigla' => 'AGESPI',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('setors')->insert([
            'nome' => 'Assessoria Técnica de Finanças e Planejamento',
            'sigla' => 'ASPLAN',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria Técnica de Finanças e Planejamento',
            'sigla' => 'ASPLAN',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria Técnica de Finanças e Planejamento',
            'sigla' => 'ASPLAN',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('setors')->insert([
            'nome' => 'Assessoria Especial de Acesso, Permanência Estudantil e Ações Afirmativas',
            'sigla' => 'AAPA',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria Especial de Acesso, Permanência Estudantil e Ações Afirmativas',
            'sigla' => 'AAPA',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Assessoria Especial de Acesso, Permanência Estudantil e Ações Afirmativas',
            'sigla' => 'AAPA',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Exatas e Naturais',
            'sigla' => 'DCEN',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Humanas, Educação e Linguagem',
            'sigla' => 'DCHEL',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Tecnologia Rural e Animal',
            'sigla' => 'DTRA',
            'unidade_id' => '3',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Biológicas',
            'sigla' => 'DCB',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Humanas e Letras',
            'sigla' => 'DCHL',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Tecnológicas',
            'sigla' => 'DCT',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Saúde I',
            'sigla' => 'DS I',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Saúde II',
            'sigla' => 'DS II',
            'unidade_id' => '1',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Exatas e Tecnológicas',
            'sigla' => 'DCET',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Naturais',
            'sigla' => 'DCN',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Ciências Sociais Aplicadas',
            'sigla' => 'DCSA',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Engenharia Agrícola e Solos',
            'sigla' => 'DEAS',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Estudos Linguísticos e Literários',
            'sigla' => 'DELL',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Filosofia e Ciências Humanas',
            'sigla' => 'DFCH',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Fitotecnia e Zootecnia',
            'sigla' => 'DFZ',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de Geografia',
            'sigla' => 'DG',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('setors')->insert([
            'nome' => 'Departamento de História',
            'sigla' => 'DH',
            'unidade_id' => '2',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
