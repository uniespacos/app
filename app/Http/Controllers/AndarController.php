<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreAndarRequest;
use App\Models\Andar;
use App\Services\AndarService;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;

class AndarController extends Controller
{
    public function __construct(
        protected AndarService $service,
    ) {}

    /**
     * Store a newly created floor in storage.
     */
    public function store(StoreAndarRequest $request): RedirectResponse
    {
        try {
            $andar = $this->service->store($request->validated());

            return redirect()->back()
                ->withInput(['novo_andar' => $andar, 'id_novo_andar' => $andar->id])
                ->with('success', 'Andar cadastrado com sucesso!');
        } catch (QueryException $error) {
            if ($error->errorInfo[0] === '23505') {
                return redirect()->back()->with('error', 'Já existe andar cadastrado.');
            }

            return redirect()->back()->with('error', "Erro ao cadastrar o andar: {$error->getMessage()}");
        } catch (\Exception $error) {
            return redirect()->back()->with('error', "Erro ao cadastrar o andar: {$error->getMessage()}");
        }
    }

    /**
     * Display a listing of floors.
     */
    public function index(): void {}

    /**
     * Show the form for creating a new floor.
     */
    public function create(): void {}

    /**
     * Display the specified floor.
     */
    public function show(Andar $andar): void {}

    /**
     * Show the form for editing the specified floor.
     */
    public function edit(Andar $andar): void {}

    /**
     * Update the specified floor in storage.
     */
    public function update(StoreAndarRequest $request, Andar $andar): void {}

    /**
     * Remove the specified floor from storage.
     */
    public function destroy(Andar $andar): void {}
}
