<?php

declare(strict_types=1);

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Auth\Middleware\EnsureEmailIsVerified;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'verified' => EnsureEmailIsVerified::class,
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Issue #119 / #112: sem isto, um abort(403) numa visita Inertia devolve
        // HTML que o cliente não sabe renderizar, e o usuário vê o modal de erro
        // cru do Inertia com a página de exceção do Symfony dentro.
        //
        // Os ambientes local e testing ficam de fora de propósito: em local
        // preserva a página de debug do Laravel; em testing mantém o 403 puro,
        // para que assertForbidden() não dependa do bundle do React.
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            if (app()->environment(['local', 'testing'])) {
                return $response;
            }

            // Endpoints JSON (notificações, relatórios) devem continuar
            // respondendo JSON. Requisições Inertia não caem aqui: elas enviam
            // Accept: text/html, então expectsJson() é false — e o page load
            // direto (o vetor real do IDOR) também recebe a página estilizada.
            if ($request->expectsJson()) {
                return $response;
            }

            if (! in_array($response->getStatusCode(), [403, 404, 419, 500, 503], true)) {
                return $response;
            }

            return Inertia::render('Errors/ErrorPage', ['status' => $response->getStatusCode()])
                ->toResponse($request)
                ->setStatusCode($response->getStatusCode());
        });
    })->create();
