<?php

namespace App\Http\Controllers\Institucional;

use App\Http\Controllers\Controller;
use App\Models\Unidade;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class InstitucionalUnidadeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $instituicao_id = $user->setor->unidade->instituicao_id;

        $unidades = Unidade::whereInstituicaoId($instituicao_id)->with(['instituicao'])->latest()->paginate(10);

        return Inertia::render('Administrativo/Unidades/Unidades', [
            'unidades' => $unidades,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();
        $instituicao = $user->setor->unidade->instituicao;

        return Inertia::render('Administrativo/Unidades/CadastrarUnidade', [
            'instituicao' => $instituicao,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'sigla' => 'required|string|max:10',
            'instituicao_id' => 'required|exists:instituicaos,id',
        ]);
        try {
            Unidade::create($validated);

            return redirect()->route('institucional.unidades.index')->with('success', 'Unidade criada com sucesso.');
        } catch (\Throwable $th) {
            return redirect()->route('institucional.unidades.index')->with('error', 'Erro ao criar o unidade: '.$th->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Unidade $unidade) // Corrigido o nome do parâmetro para $instituico
    {
        $user = Auth::user();
        $instituicao = $user->setor->unidade->instituicao;

        return Inertia::render('Administrativo/Unidades/EditarUnidade', [
            'instituicao' => $instituicao,
            'unidade' => $unidade,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Unidade $unidade)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'sigla' => 'required|string|max:10',
            'instituicao_id' => 'required|exists:instituicaos,id',
        ]);

        try {
            $unidade->update([
                'nome' => $validated['nome'],
                'sigla' => $validated['sigla'],
                'instituicao_id' => $validated['instituicao_id'],
            ]);

            $unidade->save();

            return redirect()->route('institucional.unidades.index')->with('success', 'Unidade atualizada com sucesso.');
        } catch (\Throwable $th) {
            return redirect()->route('institucional.unidades.index')->with('error', 'Erro ao atualizar a unidade: '.$th->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Unidade $unidade)
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
            $unidade->delete();

            return back()->with('success', 'Unidade excluída com sucesso.');
        } catch (\Throwable $th) {
            return redirect()->route('institucional.unidades.index')->with('error', 'Erro ao deletar o unidade: '.$th->getMessage());
        }
    }
}
