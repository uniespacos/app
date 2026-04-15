<?php

declare(strict_types=1);

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
        if ($this->app->environment('development') && class_exists(\Laravel\Telescope\TelescopeServiceProvider::class)) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }
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

        if ($this->app->environment('development')) {
            DB::listen(fn ($query) => Log::info($query->sql, $query->bindings));
        }

        Inertia::share([
            'auth.user' => function () {
                $user = Auth::user();

                if ($user) {
                    return array_merge($user->toArray(), [
                        'unread_notifications_count' => $user->unreadNotifications->count(),
                    ]);
                }

                return null;
            },
        ]);

        if ($this->app->environment('testing')) {
            Vite::macro('shouldBeIgnored', fn () => true);
        }

        $this->validateEnvVariables();
    }

    /**
     * Validate essential environment variables on boot.
     * Skipped during CLI commands that do not require a full environment.
     */
    protected function validateEnvVariables(): void
    {
        if ($this->app->runningInConsole()) {
            return;
        }

        $requiredEnvVariables = [
            'APP_NAME',
            'APP_ENV',
            'APP_URL',
            'APP_URL_WITHOUT_SCHEME',
            'DB_CONNECTION',
            'DB_HOST',
            'DB_PORT',
            'DB_DATABASE',
            'DB_USERNAME',
            'DB_PASSWORD',
            'SESSION_DRIVER',
            'BROADCAST_DRIVER',
            'CACHE_STORE',
            'REVERB_APP_ID',
            'REVERB_APP_KEY',
            'REVERB_APP_SECRET',
            'REVERB_HOST',
            'REVERB_PORT',
            'REVERB_SCHEME',
            'VITE_APP_NAME',
            'VITE_REVERB_APP_KEY',
            'VITE_REVERB_HOST',
            'VITE_REVERB_PORT',
            'VITE_REVERB_SCHEME',
        ];

        foreach ($requiredEnvVariables as $variable) {
            /** @phpstan-ignore larastan.noEnvCallsOutsideOfConfig */
            if (! env($variable)) {
                throw new \Exception("Missing required environment variable: {$variable}");
            }
        }
    }
}
