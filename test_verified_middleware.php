<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

$user = User::factory()->unverified()->create();
Auth::login($user);

$request = Request::create('/dashboard', 'GET');
$response = Route::dispatch($request);

echo "Status Code: " . $response->getStatusCode() . "\n";
if ($response->isRedirect()) {
    echo "Redirect URL: " . $response->headers->get('Location') . "\n";
}
