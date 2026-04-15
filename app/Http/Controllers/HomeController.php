<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\HomeService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        protected HomeService $service,
    ) {}

    /**
     * Display the dashboard for the authenticated user based on their permission type.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $data = $this->service->getDashboardData($user);

        $view = match ($user->permission_type_id) {
            1 => 'Dashboard/DashboardInstitucionalPage',
            2 => 'Dashboard/DashboardGestorPage',
            default => 'Dashboard/DashboardUsuarioPage',
        };

        return Inertia::render($view, $data);
    }
}
