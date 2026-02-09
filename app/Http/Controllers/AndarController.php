<?php

namespace App\Http\Controllers;

use App\Models\Andar;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class AndarController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $messages = [
            'nome' => 'Erro: Nome ja cadastrado ou campo em branco!',
            'tipo_acesso' => 'Campo "Tipo de acesso" não pode vir em branco',
        ];
        try {
            $form_validado = $request->validate([
                'nome' => ['required', 'string'],
                'tipo_acesso' => 'required',
                'modulo_id' => 'required',
            ], $messages);
            $novo_andar = Andar::create([
                'nome' => $form_validado['nome'], // Normaliza nome antes de cadastrar
                'nome_normalizado' => Andar::normalizarNome($form_validado['nome']), // Normaliza nome antes de cadastrar
                'tipo_acesso' => $form_validado['tipo_acesso'],
                'modulo_id' => $form_validado['modulo_id'],
            ]);
            $id_novo_andar = $novo_andar->id;

            return redirect()->back()->withInput(compact('novo_andar', 'id_novo_andar'))->with('success', 'Andar cadastrado com sucesso!');
        } catch (QueryException $error) {
            if ($error->errorInfo[0] == '23505') {
                return redirect()->back()->with('error', 'Ja existe andar cadastrado');
            }

            return redirect()->back()->with('error', "Erro ao cadastrar o andar: {$error->getMessage()} ");
        } catch (Exception $error) {
            return redirect()->back()->with('error', "Erro ao cadastrar o andar: {$error->getMessage()} ");
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Andar $andar)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Andar $andar)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Andar $andar)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Andar $andar)
    {
        //
    }
}
