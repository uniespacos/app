<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use App\Models\Espaco;
use App\Models\Reserva;
use App\Models\Unidade;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        switch ($user->permission_type_id) {
            case 1: // Institucional
                // OTIMIZADO: Seleciona colunas da Reserva e limita os horários para 1.
                $reservas = Reserva::select(['id', 'titulo', 'data_inicial', 'situacao', 'user_id'])
                    ->where('user_id', $user->id)
                    ->with([
                        'horarios' => function ($query) {
                            $query->limit(1) // Carrega apenas 1 horário, o suficiente para o nome do espaço
                                ->select('id', 'reserva_id', 'agenda_id')
                                ->with([
                                    'agenda:id,espaco_id',
                                    'agenda.espaco:id,nome,andar_id',
                                    'agenda.espaco.andar:id,nome,modulo_id',
                                    'agenda.espaco.andar.modulo:id,nome',
                                ]);
                        }
                    ])
                    ->latest()
                    ->take(5)
                    ->get();

                $espacosFavoritos = $user->favoritos()->with('andar.modulo')->get();
                $users = User::latest()->take(5)->with(['agendas'])->get();
                $espacos = Espaco::latest()->take(5)->with(['andar.modulo.unidade', 'agendas.user'])->get();
                $estatisticasPainel = [
                    'total_espacos' => Espaco::count(),
                    'total_gestores' => User::where('permission_type_id', 2)->count(),
                    'reservas_mes' => Reserva::whereMonth('created_at', now()->month)->count(),
                ];
                $gestores = User::where('permission_type_id', 2)->latest()->take(5)->get();
                $unidades = Unidade::latest()->take(5)->with('modulos.andars.espacos')->get();

                return Inertia::render('Dashboard/DashboardInstitucionalPage', compact('reservas', 'espacosFavoritos', 'user', 'users', 'gestores', 'espacos', 'unidades', 'estatisticasPainel'));

            case 2: // Gestor
                // OTIMIZADO: Mesma otimização da query de reservas.
                $reservas = Reserva::select(['id', 'titulo', 'data_inicial', 'situacao', 'user_id'])
                    ->where('user_id', $user->id)
                    ->with([
                        'horarios' => function ($query) {
                            $query->limit(1)
                                ->select('id', 'reserva_id', 'agenda_id')
                                ->with([
                                    'agenda:id,espaco_id',
                                    'agenda.espaco:id,nome,andar_id',
                                    'agenda.espaco.andar:id,nome,modulo_id',
                                    'agenda.espaco.andar.modulo:id,nome',
                                ]);
                        }
                    ])
                    ->latest()
                    ->take(5)
                    ->get();

                $espacosFavoritos = $user->favoritos()->with('andar.modulo')->get();
                $agendas = Agenda::whereUserId($user->id)->with(['espaco.andar.modulo'])->get();

                // OTIMIZADO: A view só usa `titulo`, `descricao` e `user`. Não precisamos carregar os horários.
                $reservasPendentes = Reserva::select(['id', 'titulo', 'descricao', 'situacao', 'user_id'])
                    ->whereHas('horarios.agenda', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->where(function ($query) {
                        $query->where('situacao', 'em_analise')
                            ->orWhereHas('horarios', function ($subQuery) {
                                $subQuery->where('situacao', 'em_analise');
                            });
                    })
                    ->with('user:id,name,setor_id', 'user.setor:id,nome') // Carrega apenas o necessário do usuário.
                    ->latest()
                    ->take(5)
                    ->get();

                $baseReservaUserStats = Reserva::whereHas('horarios.agenda', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                });

                $statusDasReservas = [
                    'pendentes' => (clone $baseReservaUserStats)->where('situacao', 'em_analise')->count(),
                    'avaliadas_hoje' => (clone $baseReservaUserStats)->whereIn('situacao', ['deferida', 'parcialmente_deferida', 'indeferida'])->whereDate('updated_at', today())->count(),
                    'total_espacos' => Espaco::whereHas('agendas', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })->count(),
                ];

                return Inertia::render('Dashboard/DashboardGestorPage', compact('user', 'reservas', 'espacosFavoritos', 'agendas', 'reservasPendentes', 'statusDasReservas'));

            default: // Usuario Comum
                // OTIMIZADO: Mesma otimização da query de reservas.
                $reservas = Reserva::select(['id', 'titulo', 'data_inicial', 'situacao', 'user_id'])
                    ->where('user_id', $user->id)
                    ->with([
                        'horarios' => function ($query) {
                            $query->limit(1)
                                ->select('id', 'reserva_id', 'agenda_id')
                                ->with([
                                    'agenda:id,espaco_id',
                                    'agenda.espaco:id,nome,andar_id',
                                    'agenda.espaco.andar:id,nome,modulo_id',
                                    'agenda.espaco.andar.modulo:id,nome',
                                ]);
                        }
                    ])
                    ->latest()
                    ->take(5)
                    ->get();

                // As queries de estatísticas não carregam relacionamentos, então já são eficientes.
                $baseUserReservasQuery = Reserva::where('user_id', $user->id);
                $statusDasReservas = [
                    'em_analise' => (clone $baseUserReservasQuery)->where('situacao', 'em_analise')->count(),
                    'parcialmente_deferida' => (clone $baseUserReservasQuery)->where('situacao', 'parcialmente_deferida')->count(),
                    'deferida' => (clone $baseUserReservasQuery)->where('situacao', 'deferida')->count(),
                    'indeferida' => (clone $baseUserReservasQuery)->where('situacao', 'indeferida')->count(),
                ];

                $espacosFavoritos = $user->favoritos()->with('andar.modulo')->get();

                return Inertia::render('Dashboard/DashboardUsuarioPage', compact('user', 'espacosFavoritos', 'statusDasReservas', 'reservas'));
        }
    }
}