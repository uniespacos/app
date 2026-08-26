<?php

declare(strict_types=1);

use App\Http\Controllers\ChamadoPublicoController;
use App\Http\Controllers\EspacoController;
use App\Http\Controllers\Gestor\GestorChamadoController;
use App\Http\Controllers\Gestor\GestorRelatorioController;
use App\Http\Controllers\Gestor\GestorReservaController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Institucional\InstitucionalChamadoController;
use App\Http\Controllers\Institucional\InstitucionalEspacoController;
use App\Http\Controllers\Institucional\InstitucionalInstituicaoController;
use App\Http\Controllers\Institucional\InstitucionalModuloController;
use App\Http\Controllers\Institucional\InstitucionalPermissionController;
use App\Http\Controllers\Institucional\InstitucionalQrCodeController;
use App\Http\Controllers\Institucional\InstitucionalRelatorioController;
use App\Http\Controllers\Institucional\InstitucionalRoleController;
use App\Http\Controllers\Institucional\InstitucionalSetorController;
use App\Http\Controllers\Institucional\InstitucionalTaxonomiaChamadoController;
use App\Http\Controllers\Institucional\InstitucionalUnidadeController;
use App\Http\Controllers\Institucional\InstitucionalUsuarioController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReservaController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Spatie\Honeypot\ProtectAgainstSpam;

// Página inicial: redireciona para dashboard se autenticado, senão para login
Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

// ---------------------------
// Report publico de chamados (QR Code) — SEM autenticacao
// ---------------------------
Route::get('/reportar/{espaco:public_id}', [ChamadoPublicoController::class, 'create'])
    ->name('chamados.reportar');
Route::post('/reportar/{espaco:public_id}', [ChamadoPublicoController::class, 'store'])
    ->middleware(['throttle:chamados-publico', ProtectAgainstSpam::class])
    ->name('chamados.reportar.store');
Route::get('/reportar/sucesso/{chamado:protocolo}', [ChamadoPublicoController::class, 'sucesso'])
    ->name('chamados.reportar.sucesso');

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
    Route::middleware(['permission:secao.gestao-reservas'])->prefix('gestor')->name('gestor.')->group(function () {
        // GestorReservaController implementa apenas estes três métodos; sem o
        // only(), as rotas create/store/edit/destroy eram registradas apontando
        // para métodos inexistentes e retornavam 500 em vez de 404.
        Route::resource('reservas', GestorReservaController::class)->only(['index', 'show', 'update']);
    });

    // Fila de chamados do gestor
    Route::middleware(['permission:secao.gestao-chamados'])->prefix('gestor')->name('gestor.')->group(function () {
        Route::get('chamados', [GestorChamadoController::class, 'index'])->name('chamados.index');
        Route::patch('chamados/{chamado}', [GestorChamadoController::class, 'update'])->name('chamados.update');
    });

    // ---------------------------
    // Rotas Institucionais
    // ---------------------------

    // Dashboard institucional
    Route::middleware(['permission:secao.dashboard-institucional'])->prefix('institucional')->name('institucional.')->group(function () {
        Route::get('/', function () {
            return Inertia::render('Administrativo/Dashboard');
        })->name('dashboard');
    });

    // Gestão de Usuários
    Route::middleware(['permission:secao.gestao-usuarios'])->prefix('institucional')->name('institucional.')->group(function () {
        Route::resource('usuarios', InstitucionalUsuarioController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::put('usuarios/{user}/edit-permissions', [InstitucionalUsuarioController::class, 'updatePermissions'])
            ->name('usuarios.updatepermissions');
    });

    // Gestão de Instituições
    Route::middleware(['permission:secao.gestao-instituicoes'])->prefix('institucional')->name('institucional.')->group(function () {
        Route::resource('instituicoes', InstitucionalInstituicaoController::class)->except(['show']);
    });

    // Gestão de Unidades
    Route::middleware(['permission:secao.gestao-unidades'])->prefix('institucional')->name('institucional.')->group(function () {
        Route::resource('unidades', InstitucionalUnidadeController::class);
    });

    // Gestão de Módulos
    Route::middleware(['permission:secao.gestao-modulos'])->prefix('institucional')->name('institucional.')->group(function () {
        Route::resource('modulos', InstitucionalModuloController::class);
    });

    // Gestão de Setores
    Route::middleware(['permission:secao.gestao-setores'])->prefix('institucional')->name('institucional.')->group(function () {
        Route::resource('setors', InstitucionalSetorController::class);
    });

    // Gestão de Espaços
    Route::middleware(['permission:secao.gestao-espacos'])->prefix('institucional')->name('institucional.')->group(function () {
        Route::get('chamados', [InstitucionalChamadoController::class, 'index'])
            ->name('chamados.index');
        Route::get('espacos/qrcodes', [InstitucionalQrCodeController::class, 'adesivos'])
            ->name('espacos.qrcodes');
        Route::get('espacos/{espaco}/qrcode', [InstitucionalQrCodeController::class, 'espaco'])
            ->name('espacos.qrcode');
        Route::patch('espacos/{espaco}/alterar-gestores', [InstitucionalEspacoController::class, 'alterarGestores'])
            ->name('espacos.alterarGestores');
        Route::resource('espacos', InstitucionalEspacoController::class);
    });

    // Gestão de Roles e Permissions
    Route::middleware(['permission:secao.gestao-roles'])->prefix('institucional')->name('institucional.')->group(function () {
        Route::resource('roles', InstitucionalRoleController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::put('roles/{role}/permissions', [InstitucionalRoleController::class, 'syncPermissions'])->name('roles.syncpermissions');
        Route::get('permissions', [InstitucionalPermissionController::class, 'index'])->name('permissions.index');
    });

    // Gestão das taxonomias de chamado (tipos e categorias)
    Route::middleware(['permission:secao.gestao-taxonomias-chamado'])->prefix('institucional')->name('institucional.')->group(function () {
        Route::get('taxonomias-chamado', [InstitucionalTaxonomiaChamadoController::class, 'index'])
            ->name('taxonomias-chamado.index');

        Route::post('taxonomias-chamado/tipos', [InstitucionalTaxonomiaChamadoController::class, 'storeTipo'])
            ->name('taxonomias-chamado.tipos.store');
        Route::put('taxonomias-chamado/tipos/{tipo}', [InstitucionalTaxonomiaChamadoController::class, 'updateTipo'])
            ->name('taxonomias-chamado.tipos.update');
        Route::delete('taxonomias-chamado/tipos/{tipo}', [InstitucionalTaxonomiaChamadoController::class, 'destroyTipo'])
            ->name('taxonomias-chamado.tipos.destroy');

        Route::post('taxonomias-chamado/categorias', [InstitucionalTaxonomiaChamadoController::class, 'storeCategoria'])
            ->name('taxonomias-chamado.categorias.store');
        Route::put('taxonomias-chamado/categorias/{categoria}', [InstitucionalTaxonomiaChamadoController::class, 'updateCategoria'])
            ->name('taxonomias-chamado.categorias.update');
        Route::delete('taxonomias-chamado/categorias/{categoria}', [InstitucionalTaxonomiaChamadoController::class, 'destroyCategoria'])
            ->name('taxonomias-chamado.categorias.destroy');
    });

    // Gestão de Relatórios
    Route::middleware(['permission:secao.relatorios'])->prefix('gestor')->name('gestor.')->group(function () {
        Route::get('relatorios', [GestorRelatorioController::class, 'index'])->name('relatorios.index');
        Route::post('relatorios/gerar', [GestorRelatorioController::class, 'gerar'])->name('relatorios.gerar');
        Route::post('relatorios/dados', [GestorRelatorioController::class, 'dados'])->name('relatorios.dados');
    });

    Route::middleware(['permission:secao.relatorios'])->prefix('institucional')->name('institucional.')->group(function () {
        Route::get('relatorios', [InstitucionalRelatorioController::class, 'index'])->name('relatorios.index');
        Route::post('relatorios/gerar', [InstitucionalRelatorioController::class, 'gerar'])->name('relatorios.gerar');
        Route::post('relatorios/dados', [InstitucionalRelatorioController::class, 'dados'])->name('relatorios.dados');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
