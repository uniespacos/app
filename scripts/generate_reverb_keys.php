<?php

function generateReverbCredentials()
{
    $appId = rand(100000, 999999);
    $appKey = bin2hex(random_bytes(10));    // 20 characters
    $appSecret = bin2hex(random_bytes(10)); // 20 characters

    return [
        'REVERB_APP_ID' => $appId,
        'REVERB_APP_KEY' => $appKey,
        'REVERB_APP_SECRET' => $appSecret,
    ];
}

$creds = generateReverbCredentials();

echo 'REVERB_APP_ID='.$creds['REVERB_APP_ID'].PHP_EOL;
echo 'REVERB_APP_KEY='.$creds['REVERB_APP_KEY'].PHP_EOL;
echo 'REVERB_APP_SECRET='.$creds['REVERB_APP_SECRET'].PHP_EOL;
