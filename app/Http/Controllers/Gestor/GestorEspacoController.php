<?php

namespace App\Http\Controllers\Gestor;

use App\Http\Controllers\Controller;
use App\Models\Agenda;
use App\Models\Espaco;
use App\Models\Modulo;
use App\Models\Setor;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GestorEspacoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $espacos = Espaco::all();
        $user = Auth::user();
        $modulos = Modulo::all();
        $setores = Setor::all();

        return Inertia::render('Espacos/EspacosPage', compact('espacos', 'user', 'modulos', 'setores'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Espaco $espaco)
    {
        try {
            $agendas = Agenda::whereEspacoId($espaco->id)->get();
            $andar = $espaco->andar;
            $modulo = $andar->modulo;
            $gestores_espaco = [];
            foreach ($agendas as $agenda) {
                $horarios_reservados[$agenda->turno] = [];

                // Busca informações do gestor caso haja
                if ($agenda->user_id != null) {
                    $user = User::whereId($agenda->user_id)->get();
                    $gestores_espaco[$agenda->turno] = [
                        'nome' => $user->first()->name,
                        'email' => $user->first()->email,
                        'setor' => $user->first()->setor()->get()->first()->nome,
                        'agenda_id' => $agenda->id,
                    ];
                }
                // Busca horarios reservados da agenda
                foreach ($agenda->horarios as $horario) {
                    $reserva = $horario->reservas()->where('situacao', 'deferida')->first();
                    if ($reserva) {
                        $user_name = User::find($reserva->user_id);
                        array_push($horarios_reservados[$agenda->turno], ['horario' => $horario, 'autor' => $user_name->name]);
                    }
                }
            }
            if (count($gestores_espaco) <= 0) {
                throw new Exception;
            }

            return Inertia::render('Espacos/VisualizarEspacoPage', compact('espaco', 'agendas', 'modulo', 'andar', 'gestores_espaco', 'horarios_reservados'));
        } catch (Exception $th) {
            return redirect()->route('espacos.index')->with('error', 'Espaço sem gestor cadastrado - Aguardando cadastro');
        }
    }
}
