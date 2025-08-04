<?php

namespace App\Http\Controllers\Institucional;

use App\Http\Controllers\Controller;
use App\Http\Requests\AlterarGestoresEspacoRequest;
use App\Http\Requests\StoreEspacoRequest;
use App\Http\Requests\UpdateEspacoRequest;
use App\Models\Agenda;
use App\Models\Andar;
use App\Models\Espaco;
use App\Models\Modulo;
use App\Models\Unidade;
use App\Models\User;
use App\Notifications\NotificationModel;
use App\Rules\UsuarioDaMesmaInstituicaoDaAgenda;
use App\Services\GestaoAgendaService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class InstitucionalEspacoController extends Controller
{

    protected $gestaoAgendaService;

    public function __construct(GestaoAgendaService $gestaoAgendaService)
    {
        $this->gestaoAgendaService = $gestaoAgendaService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $instituicao_id = $user->setor->unidade->instituicao_id;

        $users = User::with(['agendas', 'setor'])->get();

        $unidades = Unidade::where('instituicao_id', $instituicao_id)->with('modulos.andars')->get();

        $modulos = Modulo::whereHas('unidade', fn($q) => $q->where('instituicao_id', $instituicao_id))->with(['unidade', 'andars'])->get();

        $andares = Andar::whereHas('modulo.unidade', fn($q) => $q->where('instituicao_id', $instituicao_id))->with(['modulo', 'espacos'])->get();

        $users = User::whereHas('setor.unidade', fn($q) => $q->where('instituicao_id', $instituicao_id))
            ->with(['agendas', 'setor'])
            ->get();
        return Inertia::render('Administrativo/Espacos/GerenciarEspacos', [
            'espacos' =>  Espaco::whereHas(
                'andar.modulo.unidade.instituicao',
                fn($q) => $q->where('instituicao_id', $instituicao_id)
            )->with([
                'andar.modulo.unidade.instituicao',
                'agendas.user'
            ])->get(), // Agora é um objeto paginador
            'andares' => $andares, // Ainda precisa de todos para popular os selects
            'modulos' => $modulos,
            'unidades' => $unidades,
            'users' => $users
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();
        $instituicao_id = $user->setor->unidade->instituicao_id;

        $unidades = Unidade::where('instituicao_id', $instituicao_id)->with('modulos.andars')->get();

        $modulos = Modulo::whereHas('unidade', fn($q) => $q->where('instituicao_id', $instituicao_id))->with(['unidade', 'andars'])->get();

        $andares = Andar::whereHas('modulo.unidade', fn($q) => $q->where('instituicao_id', $instituicao_id))->with(['modulo', 'espacos'])->get();

        return Inertia::render('Administrativo/Espacos/CadastroEspaco', compact('unidades', 'modulos', 'andares'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEspacoRequest $request)
    {
        // A validação já foi feita pela Form Request!
        $validated = $request->validated();
        try {
            // Envolve toda a lógica em uma transação. Ou tudo funciona, ou nada é salvo.
            DB::transaction(function () use ($validated, $request) {

                $storedImagePaths = [];
                $mainImagePath = null;

                if ($request->hasFile('imagens')) {
                    foreach ($request->file('imagens') as $index => $file) {
                        $path = $file->store('espacos_images', 'public');
                        $storedImagePaths[] = $path;

                        // Corrigido: usa o dado validado 'main_image_index'
                        if (isset($validated['main_image_index']) && (int)$validated['main_image_index'] === $index) {
                            $mainImagePath = $path;
                        }
                    }
                    if (!$mainImagePath && !empty($storedImagePaths)) {
                        $mainImagePath = $storedImagePaths[0];
                    }
                }

                // Cria o Espaço
                $espaco = Espaco::create([
                    'nome' => $validated['nome'],
                    'capacidade_pessoas' => $validated['capacidade_pessoas'],
                    'descricao' => $validated['descricao'],
                    'andar_id' => $validated['andar_id'],
                    'imagens' => $storedImagePaths,
                    'main_image_index' => $mainImagePath,
                ]);

                // Cria as 3 agendas de forma mais eficiente usando o relacionamento
                $espaco->agendas()->createMany([
                    ['turno' => 'manha', 'user_id' => null], // Adicionado user_id nulo por padrão
                    ['turno' => 'tarde', 'user_id' => null],
                    ['turno' => 'noite', 'user_id' => null],
                ]);

                return $espaco;
            });

            return redirect()->route('institucional.espacos.index')->with('success', 'Espaço cadastrado com sucesso!');
        } catch (\Exception $e) {
            Log::error("Erro ao criar espaço: " . $e->getMessage());
            return redirect()->back()->with('error', 'Ocorreu um erro inesperado ao criar o espaço.')->withInput();
        }
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
                        'agenda_id' => $agenda->id
                    ];
                }
                // Busca horarios reservados da agenda
                foreach ($agenda->horarios as $horario) {
                    $reserva = $horario->reservas()->where('situacao', 'deferida')->first();
                    if ($reserva) {
                        $user_name = User::find($reserva->user_id);
                        array_push($horarios_reservados[$agenda->turno], ['horario' => $horario, 'autor' => $user_name->name]);
                    }
                };
            }
            if (count($gestores_espaco) <= 0) {
                throw new Exception();
            }
            return Inertia::render('Espacos/VisualizarEspacoPage', compact('espaco', 'agendas', 'modulo', 'andar', 'gestores_espaco', 'horarios_reservados'));
        } catch (Exception $th) {
            return redirect()->route('espacos.index')->with('error', 'Espaço sem gestor cadastrado - Aguardando cadastro');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Espaco $espaco)
    {
        $espaco->load('andar.modulo.unidade');
        $unidades = Unidade::all();
        $modulos = Modulo::with('unidade')->get();
        $andares = Andar::with('modulo.unidade')->get();
        return inertia('Administrativo/Espacos/CadastroEspaco', compact('espaco', 'unidades', 'modulos', 'andares'));
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(UpdateEspacoRequest $request, Espaco $espaco)
    {

        $validated = $request->validated();
        try {
            DB::transaction(function () use ($validated, $request, $espaco) {
                // 1. Pega a lista de imagens atuais do espaço
                $currentImagePaths = $espaco->imagens ?? [];

                // 2. Remove imagens marcadas para exclusão
                if (!empty($validated['images_to_delete'])) {
                    // Deleta os arquivos do storage
                    Storage::disk('public')->delete($validated['images_to_delete']);

                    // Remove os paths da lista atual
                    $currentImagePaths = array_diff($currentImagePaths, $validated['images_to_delete']);
                }

                // 3. Adiciona novas imagens
                $newImagePaths = [];
                if ($request->hasFile('imagens')) {
                    foreach ($request->file('imagens') as $file) {
                        $path = $file->store('espacos_images', 'public');
                        $newImagePaths[] = $path;
                    }
                }

                // 4. Junta as listas de imagens (as antigas que sobraram + as novas)
                // Usar array_values para reindexar o array
                $allImagePaths = array_values(array_merge($currentImagePaths, $newImagePaths));

                // 5. Determina a nova imagem principal
                $mainImagePath = null;
                // O frontend envia o índice baseado na lista combinada (antigas + novas)
                if (isset($validated['main_image_index']) && isset($allImagePaths[$validated['main_image_index']])) {
                    $mainImagePath = $allImagePaths[$validated['main_image_index']];
                } elseif (!empty($allImagePaths)) {
                    // Fallback: se o índice não for válido ou a imagem principal foi removida,
                    // usa a primeira imagem da lista como principal.
                    $mainImagePath = $allImagePaths[0];
                }

                // 6. Atualiza o registro do Espaço
                $espaco->update([
                    'nome' => $validated['nome'],
                    'capacidade_pessoas' => $validated['capacidade_pessoas'],
                    'descricao' => $validated['descricao'],
                    'andar_id' => $validated['andar_id'],
                    'imagens' => $allImagePaths, // Salva o array de paths atualizado
                    'main_image_index' => $mainImagePath, // Salva o path da imagem principal
                ]);
            });
            foreach ($espaco->agendas as $agenda) {
                $agenda->user->notify(new NotificationModel(
                    'Gestão de Espaços',
                    'O espaço ' . $espaco->nome . ' foi atualizado.',
                    route('espacos.show', $espaco->id)
                ));
            }

            return redirect()->route('institucional.espacos.index')->with('success', 'Espaço atualizado com sucesso!');
        } catch (\Exception $e) {
            Log::error("Erro ao atualizar espaço: " . $e->getMessage());
            return redirect()->back()->with('error', 'Ocorreu um erro inesperado ao atualizar o espaço.')->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Espaco $espaco)
    {
        $request->validate([
            'password' => 'required',
        ]);

        $user = Auth::user(); // Obtém o usuário logado

        // 2. Verificar se o usuário existe e se a senha fornecida corresponde à senha do usuário
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return back()->with('error', 'A senha fornecida está incorreta.');
        }
        try {

            $espaco->delete();
            return redirect()->route('institucional.espacos.index')->with('success', 'Espaço excluído com sucesso!');
        } catch (Exception $error) {
            return redirect()->back()->with('error', 'Erro ao excluir, favor tentar novamente');
        }
    }

    /**
     * Alterar gestores de um espaço
     */
    public function alterarGestores(AlterarGestoresEspacoRequest $request, Espaco $espaco)
    {

        $validated = $request->validated();
        try {
            $this->gestaoAgendaService->updateEspacoGestores($espaco, $validated);
            return redirect()->route('institucional.espacos.index')->with('success', 'Gestores atualizados com sucesso!');
        } catch (Exception $e) {
            Log::error("Erro ao atualizar gestores do espaço: " . $e->getMessage());
            return redirect()->back()->with('error', 'Ocorreu um erro ao atualizar os gestores do espaço.');
        }
    }
}
