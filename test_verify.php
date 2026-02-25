<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Carbon;

$user = User::first();
$url = URL::temporarySignedRoute(
    'verification.verify',
    Carbon::now()->addMinutes(60),
    [
        'id' => $user->getKey(),
        'hash' => sha1($user->getEmailForVerification()),
    ]
);
echo $url . "\n";
