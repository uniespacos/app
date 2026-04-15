<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Returns the 20 most recent notifications for the authenticated user.
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        $notifications = $user->notifications()->latest()->limit(20)->get();

        return response()->json($notifications);
    }

    /**
     * Marks notifications as read — all unread or only the specified IDs.
     */
    public function markAsRead(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if ($request->has('ids')) {
            $user->unreadNotifications->whereIn('id', $request->input('ids'))->markAsRead();
        } else {
            $user->unreadNotifications->markAsRead();
        }

        return back()->with('success', 'Notificações marcadas como lidas.');
    }
}
