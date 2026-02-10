<?php

namespace App\Http\Controllers\Institucional;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreModuloRequest;
use App\Http\Requests\UpdateModuloRequest;
use App\Models\Modulo;
use App\Models\Unidade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class InstitucionalModuloController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $instituicao_id = $user->setor->unidade->instituicao_id;

        $modulos = Modulo::whereHas('unidade', fn ($q) => $q->where('instituicao_id', $instituicao_id))->with(['andars', 'unidade.instituicao'])->latest()->paginate(10);

        return Inertia::render('Administrativo/Modulos/Modulos', [
            'modulos' => $modulos,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();
        $instituicao = $user->setor->unidade->instituicao;
        $unidades = Unidade::whereInstituicaoId($instituicao->id)->with(['instituicao'])->get();

        return Inertia::render('Administrativo/Modulos/CadastrarModulo', [
            'instituicao' => $instituicao,
            'unidades' => $unidades,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreModuloRequest $request)
    {
        $request->validated(); // Valida os dados usando a Form Request
        try {
            DB::beginTransaction();

            // Criar o módulo
            $modulo = Modulo::create([
                'nome' => $request->validated('nome'),
                'unidade_id' => $request->validated('unidade_id'),
            ]);

            // Criar os andares
            foreach ($request->validated('andares') as $andarData) {
                $modulo->andars()->create([
                    'nome' => $andarData['nome'],
                    'tipo_acesso' => $andarData['tipo_acesso'],
                ]);
            }

            DB::commit();

            return redirect()
                ->route('institucional.modulos.index')
                ->with('success', 'Módulo cadastrado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->with(['error' => 'Erro ao cadastrar módulo: '.$e->getMessage()])->withInput();
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Modulo $modulo) // Corrigido o nome do parâmetro para $instituico
    {
        $user = Auth::user();
        $instituicao = $user->setor->unidade->instituicao;
        $unidades = Unidade::whereInstituicaoId($instituicao->id)->with(['instituicao'])->get();
        $modulo->load(['andars', 'unidade.instituicao']); // Carrega a unidade e a instituição associada ao módulo

        return Inertia::render('Administrativo/Modulos/EditarModulo', [
            'instituicao' => $instituicao,
            'unidades' => $unidades,
            'modulo' => $modulo,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateModuloRequest $request, Modulo $modulo)
    {
        $dadosValidados = $request->validated();
        try {
            DB::beginTransaction();

            // Atualizar dados básicos do módulo
            $modulo->update([
                'nome' => $dadosValidados['nome'],
                'unidade_id' => $dadosValidados['unidade_id'],
            ]);

            // Pega os nomes dos andares que vieram da request.
            // Usar uma Collection do Laravel facilita a manipulação.
            $nomesDosAndaresRequest = collect($dadosValidados['andares'])->pluck('nome');

            $andaresAtuais = $modulo->andars;
            $andaresParaRemover = $andaresAtuais->whereNotIn('nome', $nomesDosAndaresRequest);

            foreach ($andaresParaRemover as $andar) {
                // **IMPORTANTE: Verificação de segurança!**
                // Não permite remover um andar se ele já tiver espaços vinculados.
                // Isso previne a perda de dados que era o problema original.
                if ($andar->espacos()->exists()) {
                    // Lança uma exceção que será capturada pelo bloco catch.
                    throw new \Exception(
                        "Não é possível remover o andar '{$andar->nome}' pois ele já possui espaços cadastrados."
                    );
                }
                // Se não tiver espaços, pode deletar com segurança.
                $andar->delete();
            }
            // **ETAPA DE ATUALIZAÇÃO E CRIAÇÃO**
            // Itera sobre os andares enviados no formulário.
            foreach ($dadosValidados['andares'] as $andarData) {
                // Usa o método updateOrCreate para sincronizar.
                // 1º argumento: As condições para encontrar o registro (chave única).
                // 2º argumento: Os valores para atualizar (se encontrar) ou criar (se não encontrar).
                $modulo->andars()->updateOrCreate(
                    [
                        'nome' => $andarData['nome'], // Procura por um andar com este nome...
                    ],
                    [
                        // ...e atualiza/cria com estes dados.
                        'tipo_acesso' => $andarData['tipo_acesso'],
                    ]
                );
            }

            DB::commit();

            return redirect()
                ->route('institucional.modulos.index')
                ->with('success', 'Módulo atualizado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->with(['error' => 'Erro ao atualizar módulo: '.$e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Modulo $modulo)
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
            DB::beginTransaction();

            // Remover andares primeiro (devido à foreign key)
            $modulo->andars()->delete();

            // Remover o módulo
            $modulo->delete();

            DB::commit();

            return redirect()
                ->route('institucional.modulos.index')
                ->with('success', 'Módulo removido com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->withErrors(['error' => 'Erro ao remover módulo: '.$e->getMessage()]);
        }
    }
}
