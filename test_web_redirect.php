<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Auth;

$user = User::where('email', 'phplemos.dev@gmail.com')->first();
Auth::login($user);

// We can't easily dispatch through the full kernel in tinker-like script without issues,
// but we can check if the 'verified' middleware would catch it.
$request = request();
$request->setUserResolver(fn() => $user);

$middleware = new \Illuminate\Auth\Middleware\EnsureEmailIsVerified();
try {
    $response = $middleware->handle($request, function() { return "OK"; });
    echo "Middleware passed: " . ($response === "OK" ? "Yes" : "No") . "\n";
} catch (\Exception $e) {
    echo "Middleware threw: " . $e->getMessage() . "\n";
}
