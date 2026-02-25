<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Frontend Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration for the frontend application, specifically
    | variables that are injected into the window object for the client-side
    | JavaScript to use.
    |
    */

    'reverb' => [
        'app_key' => env('VITE_REVERB_APP_KEY', env('REVERB_APP_KEY')),
        'host' => env('VITE_REVERB_HOST', parse_url(env('APP_URL'), PHP_URL_HOST)),
        'port' => env('VITE_REVERB_PORT', 443),
        'scheme' => env('VITE_REVERB_SCHEME', 'https'),
    ],

];
