<?php

declare(strict_types=1);

namespace Database\Seeders\Production;

use App\Models\Setor;
use App\Models\Unidade;
use Illuminate\Database\Seeder;

class SetorSeeder extends Seeder
{
    public function run(): void
    {
        $jq = Unidade::where('sigla', 'JQ')->firstOrFail();
        $vca = Unidade::where('sigla', 'VCA')->firstOrFail();
        $ita = Unidade::where('sigla', 'ITA')->firstOrFail();

        Setor::create(['nome' => 'Reitoria', 'sigla' => 'REITORIA', 'unidade_id' => $vca->id]);

        Setor::create(['nome' => 'Pró-Reitoria de Administração', 'sigla' => 'PROAD', 'unidade_id' => $jq->id]);
        Setor::create(['nome' => 'Pró-Reitoria de Administração', 'sigla' => 'PROAD', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Pró-Reitoria de Administração', 'sigla' => 'PROAD', 'unidade_id' => $ita->id]);

        Setor::create(['nome' => 'Pró-Reitoria de Extensão e Assuntos Comunitários', 'sigla' => 'PROEX', 'unidade_id' => $jq->id]);
        Setor::create(['nome' => 'Pró-Reitoria de Extensão e Assuntos Comunitários', 'sigla' => 'PROEX', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Pró-Reitoria de Extensão e Assuntos Comunitários', 'sigla' => 'PROEX', 'unidade_id' => $ita->id]);

        Setor::create(['nome' => 'Pró-Reitoria de Graduação', 'sigla' => 'PROGRAD', 'unidade_id' => $jq->id]);
        Setor::create(['nome' => 'Pró-Reitoria de Graduação', 'sigla' => 'PROGRAD', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Pró-Reitoria de Graduação', 'sigla' => 'PROGRAD', 'unidade_id' => $ita->id]);

        Setor::create(['nome' => 'Pró-Reitoria de Pesquisa e Pós-Graduação', 'sigla' => 'PPG', 'unidade_id' => $jq->id]);
        Setor::create(['nome' => 'Pró-Reitoria de Pesquisa e Pós-Graduação', 'sigla' => 'PPG', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Pró-Reitoria de Pesquisa e Pós-Graduação', 'sigla' => 'PPG', 'unidade_id' => $ita->id]);

        Setor::create(['nome' => 'Assessoria de Comunicação', 'sigla' => 'ASCOM', 'unidade_id' => $jq->id]);
        Setor::create(['nome' => 'Assessoria de Comunicação', 'sigla' => 'ASCOM', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Assessoria de Comunicação', 'sigla' => 'ASCOM', 'unidade_id' => $ita->id]);

        Setor::create(['nome' => 'Assessoria Especial de Gestão de Pessoas', 'sigla' => 'AGP', 'unidade_id' => $jq->id]);
        Setor::create(['nome' => 'Assessoria Especial de Gestão de Pessoas', 'sigla' => 'AGP', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Assessoria Especial de Gestão de Pessoas', 'sigla' => 'AGP', 'unidade_id' => $ita->id]);

        Setor::create(['nome' => 'Assessoria na Gestão de Projetos e Convênios Institucionais', 'sigla' => 'AGESPI', 'unidade_id' => $jq->id]);
        Setor::create(['nome' => 'Assessoria na Gestão de Projetos e Convênios Institucionais', 'sigla' => 'AGESPI', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Assessoria na Gestão de Projetos e Convênios Institucionais', 'sigla' => 'AGESPI', 'unidade_id' => $ita->id]);

        Setor::create(['nome' => 'Assessoria Técnica de Finanças e Planejamento', 'sigla' => 'ASPLAN', 'unidade_id' => $jq->id]);
        Setor::create(['nome' => 'Assessoria Técnica de Finanças e Planejamento', 'sigla' => 'ASPLAN', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Assessoria Técnica de Finanças e Planejamento', 'sigla' => 'ASPLAN', 'unidade_id' => $ita->id]);

        Setor::create(['nome' => 'Assessoria Especial de Acesso, Permanência Estudantil e Ações Afirmativas', 'sigla' => 'AAPA', 'unidade_id' => $jq->id]);
        Setor::create(['nome' => 'Assessoria Especial de Acesso, Permanência Estudantil e Ações Afirmativas', 'sigla' => 'AAPA', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Assessoria Especial de Acesso, Permanência Estudantil e Ações Afirmativas', 'sigla' => 'AAPA', 'unidade_id' => $ita->id]);

        Setor::create(['nome' => 'Departamento de Ciências Exatas e Naturais', 'sigla' => 'DCEN', 'unidade_id' => $ita->id]);
        Setor::create(['nome' => 'Departamento de Ciências Humanas, Educação e Linguagem', 'sigla' => 'DCHEL', 'unidade_id' => $ita->id]);
        Setor::create(['nome' => 'Departamento de Tecnologia Rural e Animal', 'sigla' => 'DTRA', 'unidade_id' => $ita->id]);

        Setor::create(['nome' => 'Departamento de Ciências Biológicas', 'sigla' => 'DCB', 'unidade_id' => $jq->id]);
        Setor::create(['nome' => 'Departamento de Ciências Humanas e Letras', 'sigla' => 'DCHL', 'unidade_id' => $jq->id]);
        Setor::create(['nome' => 'Departamento de Ciências Tecnológicas', 'sigla' => 'DCT', 'unidade_id' => $jq->id]);
        Setor::create(['nome' => 'Departamento de Saúde I', 'sigla' => 'DS I', 'unidade_id' => $jq->id]);
        Setor::create(['nome' => 'Departamento de Saúde II', 'sigla' => 'DS II', 'unidade_id' => $jq->id]);

        Setor::create(['nome' => 'Departamento de Ciências Exatas e Tecnológicas', 'sigla' => 'DCET', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Departamento de Ciências Naturais', 'sigla' => 'DCN', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Departamento de Ciências Sociais Aplicadas', 'sigla' => 'DCSA', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Departamento de Engenharia Agrícola e Solos', 'sigla' => 'DEAS', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Departamento de Estudos Linguísticos e Literários', 'sigla' => 'DELL', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Departamento de Filosofia e Ciências Humanas', 'sigla' => 'DFCH', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Departamento de Fitotecnia e Zootecnia', 'sigla' => 'DFZ', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Departamento de Geografia', 'sigla' => 'DG', 'unidade_id' => $vca->id]);
        Setor::create(['nome' => 'Departamento de História', 'sigla' => 'DH', 'unidade_id' => $vca->id]);
    }
}
