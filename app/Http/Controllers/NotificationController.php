<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Limite para um número razoável de notificações, ex: as 20 mais recentes
        $notifications = $user->notifications()->latest()->limit(20)->get();

        return response()->json($notifications);
    }

    public function markAsRead(Request $request)
    {
        $user = Auth::user();

        // Opcional: Marcar todas ou apenas as selecionadas
        if ($request->has('ids')) {
            $user->unreadNotifications->whereIn('id', $request->input('ids'))->markAsRead();
        } else {
            // Marcar todas as não lidas como lidas
            $user->unreadNotifications->markAsRead();
        }

        return back()->with('success', 'Notificações marcadas como lidas.');
    }
}
