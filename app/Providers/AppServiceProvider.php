<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Reserva::class => ReservaPolicy::class, // <-- ADICIONE ESTA LINHA
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        DB::listen(function ($query) {
            Log::info(
                $query->sql, // A consulta SQL executada
                $query->bindings, // Os valores que são ligados aos placeholders (?)
                $query->time // O tempo de execução da consulta
            );
        });
        Inertia::share([
            'auth.user' => function () {
                $user = Auth::user();
                if ($user) {
                    return array_merge($user->toArray(), [
                        'unread_notifications_count' => $user->unreadNotifications->count(),
                        // Você pode adicionar mais dados do usuário aqui se precisar
                    ]);
                }

                return null;
            },
        ]);
    }
}
