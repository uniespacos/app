<?php

namespace App\Providers;

use App\Models\Reserva;
use App\Policies\ReservaPolicy;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
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
        Gate::policy(Reserva::class, ReservaPolicy::class);

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

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
        if ($this->app->environment('testing')) {
            Vite::macro('shouldBeIgnored', fn () => true);
        }
    }
}
