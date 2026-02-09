<?php

namespace App\Http\Controllers;

use App\Models\Andar;
use App\Models\Espaco;
use App\Models\Modulo;
use App\Models\Unidade;
use Carbon\Carbon; // Importar Carbon
use Illuminate\Http\Request; // Alterado para a classe correta
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EspacoController extends Controller
{
    /**
     * Exibe uma lista dos recursos.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $filters = $request->only(['search', 'unidade', 'modulo', 'andar', 'capacidade']);
        $instituicao_id = $user->setor->unidade->instituicao_id;

        $espacos = Espaco::query()
            ->whereHas('andar.modulo.unidade', function ($query) use ($instituicao_id) {
                $query->where('instituicao_id', $instituicao_id);
            })
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nome', 'like', '%'.$search.'%')
                        ->orWhereHas('andar', fn ($q) => $q->where('nome', 'like', '%'.$search.'%'))
                        ->orWhereHas('andar.modulo', fn ($q) => $q->where('nome', 'like', '%'.$search.'%'));
                });
            })
            ->when($filters['unidade'] ?? null, fn ($q, $unidade) => $q->whereHas('andar.modulo', fn ($q) => $q->where('unidade_id', $unidade)))
            ->when($filters['modulo'] ?? null, fn ($q, $modulo) => $q->whereHas('andar', fn ($q) => $q->where('modulo_id', $modulo)))
            ->when($filters['andar'] ?? null, fn ($q, $andar) => $q->where('andar_id', $andar))
            ->when($filters['capacidade'] ?? null, fn ($q, $capacidade) => $q->where('capacidade_pessoas', '>=', $capacidade))
            ->with([
                'andar:id,nome,modulo_id',
                'andar.modulo:id,nome,unidade_id',
                'andar.modulo.unidade:id,sigla',
            ])
            ->latest('created_at')
            ->paginate(6)
            ->withQueryString();

        $unidades = Unidade::where('instituicao_id', $instituicao_id)->get(['id', 'nome', 'sigla']);
        $modulos = Modulo::whereHas('unidade', fn ($q) => $q->where('instituicao_id', $instituicao_id))->get(['id', 'nome', 'unidade_id']);
        $andares = Andar::whereHas('modulo.unidade', fn ($q) => $q->where('instituicao_id', $instituicao_id))->get(['id', 'nome', 'modulo_id']);
        $capacidadeEspacos = Espaco::query()
            ->whereHas('andar.modulo.unidade', fn ($q) => $q->where('instituicao_id', $instituicao_id))
            ->select('capacidade_pessoas')
            ->distinct()
            ->orderBy('capacidade_pessoas')
            ->pluck('capacidade_pessoas');

        return Inertia::render('Espacos/EspacosPage', compact('espacos', 'andares', 'modulos', 'unidades', 'filters', 'user', 'capacidadeEspacos'));
    }

    /**
     * Exibe o recurso especificado com horários filtrados por semana.
     */
    public function show(Request $request, Espaco $espaco)
    {
        // Lógica para carregar horários apenas da semana selecionada
        $dataReferencia = Carbon::parse($request->input('semana', 'today'))->locale('pt_BR');
        $inicioSemana = $dataReferencia->copy()->startOfWeek(Carbon::MONDAY)->format('Y-m-d');
        $fimSemana = $dataReferencia->copy()->endOfWeek(Carbon::SUNDAY)->format('Y-m-d');

        $espaco->load([
            'andar.modulo.unidade.instituicao',
            'agendas' => function ($query) use ($inicioSemana, $fimSemana) {
                $query->with([
                    'user.setor',
                    'horarios' => function ($q) use ($inicioSemana, $fimSemana) {
                        $q->where('situacao', 'deferida')
                            ->whereBetween('data', [$inicioSemana, $fimSemana])
                            ->with(['reserva.user', 'avaliador']);
                    },
                ]);
            },
        ]);

        if ($espaco->agendas()->whereNotNull('user_id')->count() === 0) {
            return redirect()->route('espacos.index')->with('error', 'Este espaço ainda não possui um gestor definido.');
        }

        return Inertia::render('Espacos/VisualizarEspacoPage', [
            'espaco' => $espaco,
            // Passa as informações da semana para o frontend
            'semana' => [
                'inicio' => $inicioSemana,
                'fim' => $fimSemana,
                'referencia' => $dataReferencia->format('Y-m-d'),
            ],
        ]);
    }

    // ... (métodos favoritar e desfavoritar permanecem iguais)
    public function favoritar(Espaco $espaco)
    {
        Auth::user()->favoritos()->attach($espaco->id);

        return redirect()->back()->with('success', 'Espaço adicionado aos favoritos!');
    }

    public function desfavoritar(Espaco $espaco)
    {
        Auth::user()->favoritos()->detach($espaco->id);

        return redirect()->back()->with('success', 'Espaço removido dos favoritos!');
    }

    public function meusFavoritos()
    {
        $user = Auth::user();
        // OTIMIZAÇÃO: Removido 'agendas.user' pois o EspacoCard não utiliza essa informação.
        $favoritos = $user->favoritos()->with([
            'andar:id,nome,modulo_id',
            'andar.modulo:id,nome,unidade_id',
            'andar.modulo.unidade:id,sigla',
        ])->paginate(9);

        return Inertia::render('Espacos/FavoritosPage', [
            'favoritos' => $favoritos,
            'user' => ['permission_type_id' => $user->permission_type_id],
        ]);
    }
}
