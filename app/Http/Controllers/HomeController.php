<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use App\Models\Espaco;
use App\Models\Reserva;
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
                $users = User::all();
                $espacos = Espaco::with(['agendas.horarios.reservas'])->get();
                $reservas = Reserva::with(['horarios.agenda.espaco'])->get();
                return Inertia::render('Dashboard/DashboardInstitucionalPage', compact('user', 'users', 'espacos', 'reservas'));
            case 2: // Gestor
                $agendas = Agenda::whereUserId($user->id)->with(['espaco.andar.modulo'])->get();
                $reservasPendentes = Reserva::whereHas('horarios.agenda', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->where(function ($query) {
                    $query->where('situacao', 'em_analise')
                        ->orWhereHas('horarios', function ($subQuery) {
                            $subQuery->where('situacao', 'em_analise');
                        });
                })->with(['horarios.agenda.espaco','user'])->get();
                $baseReservaUserStats = Reserva::whereHas('horarios.agenda', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ;

                $statusDasReservas = [
                    'pendentes' => (clone $baseReservaUserStats)->where('situacao', 'em_analise')->count(),
                    'avaliadas_hoje' => (clone $baseReservaUserStats)->whereIn('situacao', ['deferida', 'parcialmente_deferida', 'indeferida'])->whereDate('updated_at', today())->count(),
                    'total_espacos' => Espaco::whereHas('agendas', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })->count(),
                ];
                return Inertia::render('Dashboard/DashboardGestorPage', compact('user', 'agendas', 'reservasPendentes', 'statusDasReservas'));
            default: // Usuario Comum
                $baseUserReservasQuery = Reserva::where('user_id', $user->id)->with(['horarios.agenda.espaco.andar.modulo']);
                $reservas = (clone $baseUserReservasQuery)->get();
                $statusDasReservas = [
                    'em_analise' => (clone $baseUserReservasQuery)->where('situacao', 'em_analise')->count(),
                    'parcialmente_deferida' => (clone $baseUserReservasQuery)->where('situacao', 'parcialmente_deferida')->count(), // Novo status adicionado
                    'deferida' => (clone $baseUserReservasQuery)->where('situacao', 'deferida')->count(),
                    'indeferida' => (clone $baseUserReservasQuery)->where('situacao', 'indeferida')->count(),
                ];

                $espacosFavoritos = $user->favoritos->load('andar.modulo');
                return Inertia::render('Dashboard/DashboardUsuarioPage', compact('user', 'espacosFavoritos', 'statusDasReservas', 'reservas'));
        }
    }
}
