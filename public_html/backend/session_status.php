<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => 'minturnus.no',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

if (isset($_SESSION['uid'])) {
    $name = isset($_SESSION['name']) ? trim((string)$_SESSION['name']) : '';
    $company = null;
    if (isset($_SESSION['company'])) {
        $trimmedCompany = trim((string)$_SESSION['company']);
        if ($trimmedCompany !== '') {
            $company = $trimmedCompany;
        }
    }
    echo json_encode([
        'ok' => true,
        'user' => [
            'id' => (int)$_SESSION['uid'],
            'name' => $name,
            'email' => $_SESSION['email'] ?? '',
            'company' => $company,
        ],
    ]);
    exit;
}

echo json_encode(['ok' => false]);
