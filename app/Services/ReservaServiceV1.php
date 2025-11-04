<?php

namespace App\Services;

use App\Jobs\AvaliarReservaJob;
use App\Jobs\ProcessarCriacaoReserva;
use App\Jobs\UpdateReservaJob;
use App\Models\Agenda;
use App\Models\Reserva;
use App\Models\User;
use App\Notifications\NotificationModel;
use App\Repositories\ReservaRepository;
use App\ReservaServiceInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;


class ReservaServiceV1 implements ReservaServiceInterface
{
    protected ReservaRepository $reservaRepository;
    protected ConflictDetectionService $conflictDetectionService;

    public function __construct(ReservaRepository $reservaRepository, ConflictDetectionService $conflictDetectionService)
    {
        $this->reservaRepository = $reservaRepository;
        $this->conflictDetectionService = $conflictDetectionService;
    }

    public function getDadosToIndexGestor(array $filters, ?string $semanaInput, int $userId): array
    {
        $gestor = User::findOrFail($userId);
        $agendasDoGestorIds = $gestor->agendas()->pluck('id')->toArray();

        $dataReferencia = Carbon::parse($semanaInput ?? 'today')->locale('pt_BR');
        $inicioSemana = $dataReferencia->copy()->startOfWeek(Carbon::MONDAY)->format('Y-m-d');
        $fimSemana = $dataReferencia->copy()->endOfWeek(Carbon::SUNDAY)->format('Y-m-d');

        $reservasParaAvaliar = $this->reservaRepository->getReservasPaginadasDoGestor($agendasDoGestorIds, $fimSemana, $userId);
        $reservaToShow = null;
        if ($filters['reserva'] ?? null) {
            $reservaToShow = $this->reservaRepository->getReservaParaModal(
                $filters['reserva'],
                $inicioSemana,
                $fimSemana
            );
        }
        return [
            'reservas' => $reservasParaAvaliar,
            'filters' => $filters,
            'reservaToShow' => $reservaToShow,
            'semana' => ['inicio' => $inicioSemana, 'fim' => $fimSemana, 'referencia' => $dataReferencia->format('Y-m-d')]
        ];
    }

    public function getDadosToIndexUser(array $filters, ?string $semanaInput, int $userId): array
    {
        $dataReferencia = Carbon::parse($semanaInput ?? 'today')->locale('pt_BR');
        $inicioSemana = $dataReferencia->copy()->startOfWeek(Carbon::MONDAY)->format('Y-m-d');
        $fimSemana = $dataReferencia->copy()->endOfWeek(Carbon::SUNDAY)->format('Y-m-d');

        $reservas = $this->reservaRepository->getReservasPaginadasDoUsuario(
            $userId,
            $inicioSemana,
            $fimSemana,
            $filters
        );

        $reservaToShow = null;
        if ($filters['reserva'] ?? null) {
            $reservaToShow = $this->reservaRepository->getReservaParaModal(
                $filters['reserva'],
                $inicioSemana,
                $fimSemana
            );
        }

        return [
            'reservas' => $reservas,
            'filters' => $filters,
            'reservaToShow' => $reservaToShow,
            'semana' => [
                'inicio' => $inicioSemana,
                'fim' => $fimSemana,
                'referencia' => $dataReferencia->format('Y-m-d'),
            ]
        ];
    }

    public function getDadosToEdit(Reserva $reserva, ?string $semanaInput): array
    {
        $primeiroHorario = $reserva->horarios()->orderBy('data', 'asc')->first();
        $dataPadrao = $primeiroHorario ? $primeiroHorario->data : $reserva->data_inicial;
        $dataReferencia = Carbon::parse($semanaInput ?? $dataPadrao)->locale('pt_BR');
        $inicioSemana = $dataReferencia->copy()->startOfWeek(Carbon::MONDAY)->format('Y-m-d');
        $fimSemana = $dataReferencia->copy()->endOfWeek(Carbon::SUNDAY)->format('Y-m-d');

        $reserva->load([
            'user',
            'horarios' => function ($query) use ($inicioSemana, $fimSemana) {
                $query->whereBetween('data', [$inicioSemana, $fimSemana])
                    ->orderBy('data')->orderBy('horario_inicio')
                    ->with('agenda');
            },
        ]);

        $espaco = $this->reservaRepository->getEspacoParaEditar($reserva, $inicioSemana, $fimSemana);

        return [
            'espaco' => $espaco,
            'reserva' => $reserva,
            'isEditMode' => true,
            'semana' => [
                'inicio' => $inicioSemana,
                'fim' => $fimSemana,
                'referencia' => $dataReferencia->format('Y-m-d'),
            ]
        ];
    }

    public function enfileirarCriacao(array $validatedData, int $userId): void
    {
        $user = User::findOrFail($userId);
        ProcessarCriacaoReserva::dispatch($validatedData, $user);
    }

    public function enfileirarAtualizacao(Reserva $reserva, array $validatedData, int $userId): void
    {
        $user = User::findOrFail($userId);
        UpdateReservaJob::dispatch($reserva, $validatedData, $user);
    }

    public function cancelarReserva(Reserva $reserva, int $userId, string $password): array
    {
        $user = User::findOrFail($userId);
        if (!$user || !Hash::check($password, $user->password)) {
            return ['error' => 'A senha fornecida está incorreta.'];
        }
        DB::transaction(function () use ($reserva, $user) {
                foreach ($reserva->horarios as $horario) {
                    $gestor = Agenda::where('id', '=', $horario['agenda_id'])
                        ->with('user')
                        ->first()
                        ->user;
                    $gestores[] = $gestor;
                    $reserva->horarios()->update([
                        'situacao' => 'inativa'
                    ]);
                }
                $gestores = array_unique($gestores);
                foreach ($gestores as $gestor) {
                    $partesDoNome = explode(' ', $user->name);
                    $doisPrimeirosNomesArray = array_slice($partesDoNome, 0, 2);
                    $resultado = implode(' ', $doisPrimeirosNomesArray);
                    $gestor->notify(
                        new NotificationModel(
                            'Reserva cancelada',
                            'O usuário ' . $resultado .
                            ' cancelou uma reserva.',
                            route('gestor.reservas.index')
                        )
                    );
                }
                $reserva->update(['situacao' => 'inativa']);
            });
            return ['success' => 'Reserva cancelada com sucesso!'];
    }

    public function enfileirarAvaliacao(Reserva $reserva, array $validatedData, int $userId): void
    {
        $gestor = User::findOrFail($userId);
        AvaliarReservaJob::dispatch($reserva, $validatedData, $gestor);
    }

    /**
     * @param Reserva $reserva
     * @param int $userId
     * @param string|null $semanaInput
     * @return array
     */
    public function showReservaAvaliacao(Reserva $reserva, int $userId, ?string $semanaInput): array
    {
        $gestor = User::findOrFail($userId);
        $agendasDoGestorIds = $gestor->agendas()->pluck('id');

        $conflitosMap = $this->conflictDetectionService->findConflictsFor($reserva->id);

        $dataReferencia = Carbon::parse($semanaInput, $reserva->data_inicial)->locale('pt_BR');
        $inicioSemana = $dataReferencia->copy()->startOfWeek(Carbon::MONDAY)->format('Y-m-d');
        $fimSemana = $dataReferencia->copy()->endOfWeek(Carbon::SUNDAY)->format('Y-m-d');

        $horariosDaSemana = $reserva->horarios()
            ->whereIn('agenda_id', $agendasDoGestorIds)
            ->whereBetween('data', [$inicioSemana, $fimSemana])
            ->with('agenda.espaco')
            ->get();

        foreach ($horariosDaSemana as $horario) {
            $horario->is_conflicted = false;
            if ($conflitosMap->has($horario->id)) {
                $conflito = $conflitosMap->get($horario->id);
                $horario->is_conflicted = true;
                $horario->conflict_details = "Conflito com a reserva '{$conflito->conflito_reserva_titulo}' de {$conflito->conflito_user_name}.";
            }
        }

        $reserva->load(['user']);
        $reserva->setRelation('horarios', $horariosDaSemana);

        return [
            'reserva' => $reserva,
            'semana' => ['referencia' => $dataReferencia->format('Y-m-d')],
            'todosOsConflitos' => $conflitosMap,
        ];
    }
}
