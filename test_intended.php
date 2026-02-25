<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Session;
use Illuminate\Http\Request;

$user = User::first();
$url = URL::temporarySignedRoute(
    'verification.verify',
    Carbon::now()->addMinutes(60),
    [
        'id' => $user->getKey(),
        'hash' => sha1($user->getEmailForVerification()),
    ]
);

// Simulate guest visiting the URL
$request = Request::create($url, 'GET');
// What does the signature validation do if we hit it directly?
// Actually, I just want to see if the session intended URL saves correctly.
Session::put('url.intended', $url);

echo "Intended URL: " . Session::get('url.intended') . "\n";
echo "Original URL: " . $url . "\n";
