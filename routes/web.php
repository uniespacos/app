<?php

use App\Http\Controllers\EspacoController;
use App\Http\Controllers\Gestor\GestorReservaController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Institucional\InstitucionalEspacoController;
use App\Http\Controllers\Institucional\InstitucionalInstituicaoController;
use App\Http\Controllers\Institucional\InstitucionalModuloController;
use App\Http\Controllers\Institucional\InstitucionalSetorController;
use App\Http\Controllers\Institucional\InstitucionalUnidadeController;
use App\Http\Controllers\Institucional\InstitucionalUsuarioController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReservaController;
use App\Http\Middleware\GestorMiddleware;
use App\Http\Middleware\InstitucionalMiddleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Página inicial: redireciona para dashboard se autenticado, senão para login
Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    // ---------------------------
    // Painel Geral
    // ---------------------------
    Route::get('dashboard', [HomeController::class, 'index'])->name('dashboard');

    // Rota para buscar as notificações do usuário logado
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');

    // Rota para marcar notificações como lidas
    Route::post('/notifications/mark-as-read', [NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');

    // ---------------------------
    // Visualização de Espaços
    // ---------------------------
    Route::get('/espacos/favoritos', [EspacoController::class, 'meusFavoritos'])->name('espacos.favoritos');
    Route::post('/espacos/{espaco}/favoritar', [EspacoController::class, 'favoritar'])->name('espacos.favoritar');
    Route::delete('/espacos/{espaco}/desfavoritar', [EspacoController::class, 'desfavoritar'])->name('espacos.desfavoritar');
    Route::get('espacos', [EspacoController::class, 'index'])->name('espacos.index');
    Route::get('espacos/{espaco}', [EspacoController::class, 'show'])->name('espacos.show');

    // ---------------------------
    // Reservas
    // ---------------------------

    Route::resource('reservas', ReservaController::class);

    // ---------------------------
    // Rotas para Usuário Gestor
    // ---------------------------
    Route::middleware([GestorMiddleware::class])->prefix('gestor')->name('gestor.')->group(function () {
        Route::resource('reservas', GestorReservaController::class);
    });

    // ---------------------------
    // Rotas Institucionais
    // ---------------------------
    Route::middleware([InstitucionalMiddleware::class])->prefix('institucional')->name('institucional.')->group(function () {

        Route::get('/', function () {
            return Inertia::render('Administrativo/Dashboard');
        })->name('dashboard');

        // Usuários
        Route::resource('usuarios', InstitucionalUsuarioController::class);
        Route::put('usuarios/{user}/edit-permissions', [InstitucionalUsuarioController::class, 'updatePermissions'])
            ->name('usuarios.updatepermissions');

        // Instituições
        Route::resource('instituicoes', InstitucionalInstituicaoController::class)->except(['show']);

        // Unidades
        Route::resource('unidades', InstitucionalUnidadeController::class);

        // Módulos
        Route::resource('modulos', InstitucionalModuloController::class);

        // Setores
        Route::resource('setors', InstitucionalSetorController::class);

        // Espaços
        Route::patch('espacos/{espaco}/alterar-gestores', [InstitucionalEspacoController::class, 'alterarGestores'])
            ->name('espacos.alterarGestores');

        Route::resource('espacos', InstitucionalEspacoController::class);
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
