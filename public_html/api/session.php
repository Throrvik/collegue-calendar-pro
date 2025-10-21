<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => 'minturnus.no',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

if (isset($_SESSION['uid'])) {
    $user = [
        'id' => (int)$_SESSION['uid'],
        'name' => $_SESSION['name'] ?? '',
        'email' => $_SESSION['email'] ?? '',
    ];
    echo json_encode(['ok' => true, 'user' => $user]);
    exit;
}

echo json_encode(['ok' => false]);
