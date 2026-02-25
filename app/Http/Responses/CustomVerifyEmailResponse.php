<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Laravel\Fortify\Contracts\VerifyEmailResponse as VerifyEmailResponseContract;
use Laravel\Fortify\Fortify;

class CustomVerifyEmailResponse implements VerifyEmailResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        \Illuminate\Support\Facades\Log::info('Verification hit', [
            'scheme' => $request->getScheme(),
            'is_secure' => $request->isSecure(),
            'headers' => $request->headers->all(),
            'url' => $request->fullUrl()
        ]);

        // If the user is not authenticated when they hit the verification link,
        // store the full URL (including query params) in session and redirect to login.
        if (! Auth::check()) {
            \Illuminate\Support\Facades\Log::info('Unauthenticated user hit verification link, redirecting to login', ['url' => $request->fullUrl()]);
            Session::put('url.email-verification.intended', $request->fullUrl());

            return redirect()->guest(route('login'));
        }

        \Illuminate\Support\Facades\Log::info('Authenticated user verified, redirecting to dashboard', ['user_id' => Auth::id()]);

        // If the user is already authenticated, proceed with the default Fortify redirect
        // after verification (which might already be done).
        return $request->wantsJson()
            ? new JsonResponse('', 204)
            : redirect('/dashboard?verified=1');
    }
}
