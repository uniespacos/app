<?php

declare(strict_types=1);

namespace App\Http\Controllers\Institucional;

use App\Http\Controllers\Controller;
use App\Repositories\PermissionRepositoryInterface;
use Illuminate\Http\JsonResponse;

class InstitucionalPermissionController extends Controller
{
    public function __construct(
        protected PermissionRepositoryInterface $repoPermission,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'permissions' => $this->repoPermission->getAllGroupedByPrefix(),
        ]);
    }
}
