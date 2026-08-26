<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\CategoriaChamado;
use App\Models\Chamado;
use App\Models\Instituicao;
use App\Models\Modulo;
use App\Models\Reserva;
use App\Models\Role;
use App\Models\Setor;
use App\Models\TipoChamado;
use App\Models\Unidade;
use App\Policies\ChamadoPolicy;
use App\Policies\InstituicaoPolicy;
use App\Policies\ModuloPolicy;
use App\Policies\ReservaPolicy;
use App\Policies\RolePolicy;
use App\Policies\SetorPolicy;
use App\Policies\TaxonomiaChamadoPolicy;
use App\Policies\UnidadePolicy;
use App\Repositories\AgendaRepositoryEloquent;
use App\Repositories\AgendaRepositoryInterface;
use App\Repositories\AndarRepositoryEloquent;
use App\Repositories\AndarRepositoryInterface;
use App\Repositories\CategoriaChamadoRepositoryEloquent;
use App\Repositories\CategoriaChamadoRepositoryInterface;
use App\Repositories\ChamadoRepositoryEloquent;
use App\Repositories\ChamadoRepositoryInterface;
use App\Repositories\EspacoRepositoryEloquent;
use App\Repositories\EspacoRepositoryInterface;
use App\Repositories\HorarioRepositoryEloquent;
use App\Repositories\HorarioRepositoryInterface;
use App\Repositories\InstituicaoRepositoryEloquent;
use App\Repositories\InstituicaoRepositoryInterface;
use App\Repositories\ModuloRepositoryEloquent;
use App\Repositories\ModuloRepositoryInterface;
use App\Repositories\PermissionRepositoryEloquent;
use App\Repositories\PermissionRepositoryInterface;
use App\Repositories\ReservaRepositoryEloquent;
use App\Repositories\ReservaRepositoryInterface;
use App\Repositories\RoleRepositoryEloquent;
use App\Repositories\RoleRepositoryInterface;
use App\Repositories\SetorRepositoryEloquent;
use App\Repositories\SetorRepositoryInterface;
use App\Repositories\TipoChamadoRepositoryEloquent;
use App\Repositories\TipoChamadoRepositoryInterface;
use App\Repositories\UnidadeRepositoryEloquent;
use App\Repositories\UnidadeRepositoryInterface;
use App\Repositories\UserRepositoryEloquent;
use App\Repositories\UserRepositoryInterface;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(RoleRepositoryInterface::class, RoleRepositoryEloquent::class);
        $this->app->bind(PermissionRepositoryInterface::class, PermissionRepositoryEloquent::class);
        $this->app->bind(AgendaRepositoryInterface::class, AgendaRepositoryEloquent::class);
        $this->app->bind(AndarRepositoryInterface::class, AndarRepositoryEloquent::class);
        $this->app->bind(EspacoRepositoryInterface::class, EspacoRepositoryEloquent::class);
        $this->app->bind(HorarioRepositoryInterface::class, HorarioRepositoryEloquent::class);
        $this->app->bind(InstituicaoRepositoryInterface::class, InstituicaoRepositoryEloquent::class);
        $this->app->bind(ModuloRepositoryInterface::class, ModuloRepositoryEloquent::class);
        $this->app->bind(ReservaRepositoryInterface::class, ReservaRepositoryEloquent::class);
        $this->app->bind(SetorRepositoryInterface::class, SetorRepositoryEloquent::class);
        $this->app->bind(UnidadeRepositoryInterface::class, UnidadeRepositoryEloquent::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepositoryEloquent::class);
        $this->app->bind(ChamadoRepositoryInterface::class, ChamadoRepositoryEloquent::class);
        $this->app->bind(TipoChamadoRepositoryInterface::class, TipoChamadoRepositoryEloquent::class);
        $this->app->bind(CategoriaChamadoRepositoryInterface::class, CategoriaChamadoRepositoryEloquent::class);

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
        Gate::policy(Chamado::class, ChamadoPolicy::class);
        Gate::policy(Reserva::class, ReservaPolicy::class);
        Gate::policy(Instituicao::class, InstituicaoPolicy::class);
        Gate::policy(Unidade::class, UnidadePolicy::class);
        Gate::policy(Modulo::class, ModuloPolicy::class);
        Gate::policy(Setor::class, SetorPolicy::class);
        Gate::policy(Role::class, RolePolicy::class);
        Gate::policy(TipoChamado::class, TaxonomiaChamadoPolicy::class);
        Gate::policy(CategoriaChamado::class, TaxonomiaChamadoPolicy::class);

        // Report publico de chamados: rota anonima, protegida por IP.
        RateLimiter::for('chamados-publico', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        if ($this->app->environment('development')) {
            DB::listen(fn ($query) => Log::info($query->sql, $query->bindings));
        }

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
