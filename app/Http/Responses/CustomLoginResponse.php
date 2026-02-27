<?php

namespace App\Http\Responses;

use Illuminate\Support\Facades\Session;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Fortify;

class CustomLoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        // Check if there's an intended email verification URL in the session
        if (Session::has('url.email-verification.intended')) {
            $intendedUrl = Session::pull('url.email-verification.intended');
            \Illuminate\Support\Facades\Log::info('Redirecting to intended verification URL after login', ['url' => $intendedUrl]);

            return redirect()->to($intendedUrl);
        }

        // Otherwise, proceed with the default Fortify redirect
        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
            : redirect()->intended(Fortify::redirects('login'));
    }
}
