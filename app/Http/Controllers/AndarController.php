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

    public function index(): void {}

    public function create(): void {}

    public function show(Andar $andar): void {}

    public function edit(Andar $andar): void {}

    public function update(StoreAndarRequest $request, Andar $andar): void {}

    public function destroy(Andar $andar): void {}
}
