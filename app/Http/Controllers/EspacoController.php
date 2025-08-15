<?php

namespace App\Http\Controllers;

use App\Models\Andar;
use App\Models\Espaco;
use App\Models\Modulo;
use App\Models\Unidade;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EspacoController extends Controller
{

    /**
     * Exibe uma lista dos recursos.
     */
    public function index()
    {
        $user = Auth::user();
        // Pega os parâmetros de filtro da URL (query string)
        $filters = Request::only(['search', 'unidade', 'modulo', 'andar', 'capacidade']);
        $user = Auth::user();
        $instituicao_id = $user->setor->unidade->instituicao_id;

        $espacos = Espaco::query()
            // O join com 'andars' e 'modulos' é necessário para filtrar por eles
            ->join('andars', 'espacos.andar_id', '=', 'andars.id')
            ->join('modulos', 'andars.modulo_id', '=', 'modulos.id')
            ->join('unidades', 'modulos.unidade_id', '=', 'unidades.id')
            ->when(function ($query) use ($instituicao_id) {
                // Filtra os espaços apenas da unidade do usuário autenticado
                $query->where('unidades.instituicao_id', $instituicao_id);
            })
            // Começa a aplicar os filtros
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('espacos.nome', 'like', '%' . $search . '%')
                        ->orWhere('andars.nome', 'like', '%' . $search . '%')
                        ->orWhere('modulos.nome', 'like', '%' . $search . '%');
                });
            })
            ->when($filters['unidade'] ?? null, function ($query, $unidade) {
                $query->where('modulos.unidade_id', $unidade);
            })
            ->when($filters['modulo'] ?? null, function ($query, $modulo) {
                $query->where('andars.modulo_id', $modulo);
            })
            ->when($filters['andar'] ?? null, function ($query, $andar) {
                $query->where('espacos.andar_id', $andar);
            })
            ->when($filters['capacidade'] ?? null, function ($query, $capacidade) {
                $query->where('espacos.capacidade_pessoas', $capacidade);

            })
            // Seleciona as colunas de espacos para evitar conflitos de 'id'
            ->select('espacos.*')
            ->with([
                'andar.modulo.unidade', // Carrega a unidade do módulo do andar
                'agendas' => function ($query) {
                    $query->with([
                        'user.setor', // Carrega o gestor (user) da agenda e seu setor
                        'horarios' => function ($q) {
                            // Carrega as reservas dos horários APROVADOS (deferidos)
                            $q->where('situacao', 'deferida')
                                ->with(['reserva.user', 'avaliador']);
                        }
                    ]);
                }
            ])
            ->latest('espacos.created_at')
            ->paginate(6)
            // Adiciona a query string à paginação para que os filtros sejam mantidos ao mudar de página
            ->withQueryString();
        $unidades = Unidade::where('instituicao_id', $instituicao_id)->with('modulos.andars')->get();

        $modulos = Modulo::whereHas('unidade', fn($q) => $q->where('instituicao_id', $instituicao_id))->with(['unidade', 'andars'])->get();

        $andares = Andar::whereHas('modulo.unidade', fn($q) => $q->where('instituicao_id', $instituicao_id))->with(['modulo', 'espacos'])->get();
        $capacidadeEspacos = Espaco::query()
            ->select('capacidade_pessoas')
            ->distinct()
            ->orderBy('capacidade_pessoas')
            ->pluck('capacidade_pessoas');
        return Inertia::render('Espacos/EspacosPage', [
            'espacos' => $espacos, // Agora é um objeto paginador
            'andares' => $andares, // Ainda precisa de todos para popular os selects
            'modulos' => $modulos,
            'unidades' => $unidades,
            'filters' => $filters, // Envia os filtros de volta para a view
            'user' => $user,
            'capacidadeEspacos' => $capacidadeEspacos
        ]);
    }

    /**
     * Exibe o recurso especificado.
     */
    public function show(Espaco $espaco)
    {
        // 1. Carrega todos os dados necessários de forma aninhada.
        $espaco->load([
            'andar.modulo.unidade.instituicao', // Carrega a hierarquia completa
            'agendas' => function ($query) {
                $query->with([
                    'user.setor', // Carrega o gestor (user) da agenda e seu setor
                    'horarios' => function ($q) {
                        // Carrega as reservas dos horários APROVADOS (deferidos)
                        $q->where('situacao', 'deferida')
                            ->with(['reserva.user', 'avaliador']);
                    }
                ]);
            }
        ]);

        // 2. Verifica se o espaço tem pelo menos uma agenda (e, portanto, um gestor).
        if (
            $espaco->agendas()->whereNotNull('user_id')->count() === 0
        ) {
            return redirect()->route('espacos.index')->with('error', 'Este espaço ainda não possui um gestor definido.');
        }

        // 3. Renderiza a view, passando APENAS o objeto 'espaco'.
        // O frontend agora é responsável por processar e exibir os dados aninhados.
        return Inertia::render('Espacos/VisualizarEspacoPage', [
            'espaco' => $espaco,
        ]);
    }
    public function favoritar(Espaco $espaco)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->favoritos()->where('espaco_id', $espaco->id)->exists()) {
            $user->favoritos()->attach($espaco->id);
            return redirect()->back()->with('success', 'Espaço adicionado aos favoritos!');
        }

        return redirect()->back()->with('error', 'Espaço já está nos seus favoritos.');
    }

    public function desfavoritar(Espaco $espaco)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->favoritos()->where('espaco_id', $espaco->id)->exists()) {
            $user->favoritos()->detach($espaco->id);
            return redirect()->back()->with('success', 'Espaço removido dos favoritos!');
        }

        return redirect()->back()->with('error', 'Espaço não encontrado nos seus favoritos.');
    }

    // Método para listar os espaços favoritados de um usuário
    public function meusFavoritos()
    {

        $user = Auth::user();
        $favoritos = $user->favoritos()->with([
            'andar.modulo.unidade.instituicao', // Carrega a hierarquia completa
            'agendas.user' // Se você precisa dos gestores por turno
        ])->paginate(9); // Exemplo: 9 espaços por página
        // Passa os dados para o componente React via Inertia
        return Inertia::render('Espacos/FavoritosPage', [
            'favoritos' => $favoritos,
            // Também é útil passar o tipo de permissão do usuário, como você já faz em EspacosPage
            'user' => [
                'permission_type_id' => $user->permission_type_id,
            ],
        ]);
    }
}
