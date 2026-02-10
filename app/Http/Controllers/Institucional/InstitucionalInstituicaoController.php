<?php

namespace App\Http\Controllers\Institucional;

use App\Http\Controllers\Controller;
use App\Models\Instituicao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class InstitucionalInstituicaoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $instituicoes = Instituicao::latest()->paginate(10);

        return Inertia::render('Administrativo/Instituicoes/Instituicoes', [
            'instituicoes' => $instituicoes,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Administrativo/Instituicoes/CadastrarInstituicao');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'sigla' => 'required|string|max:50',
            'endereco' => 'nullable|string|max:255',
        ]);

        Instituicao::create($validated);

        return redirect()->route('institucional.instituicoes.index')->with('success', 'Instituição criada com sucesso.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Instituicao $instituico) // Corrigido o nome do parâmetro para $instituico
    {
        return Inertia::render('Administrativo/Instituicoes/EditarInstituicao', [
            'instituicao' => $instituico,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Instituicao $instituico)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'sigla' => 'required|string|max:50',
            'endereco' => 'nullable|string|max:255',
        ]);

        try {
            $instituico->update([
                'nome' => $validated['nome'],
                'sigla' => $validated['sigla'],
                'endereco' => $validated['endereco'], // Permite que o campo seja nulo
            ]);

            $instituico->save();

            return redirect()->route('institucional.instituicoes.index')->with('success', 'Instituição atualizada com sucesso.');
        } catch (\Throwable $th) {
            return redirect()->route('institucional.instituicoes.index')->with('error', 'Erro ao atualizar a instituição: '.$th->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Instituicao $instituico)
    {
        $request->validate([
            'password' => 'required',
        ]);

        $user = Auth::user(); // Obtém o usuário logado

        // 2. Verificar se o usuário existe e se a senha fornecida corresponde à senha do usuário
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return back()->with('error', 'A senha fornecida está incorreta.');
        }
        $instituico->delete();

        // O 'back()' é útil aqui para que o usuário permaneça na mesma página da paginação
        return back()->with('success', 'Instituição excluída com sucesso.');
    }
}
