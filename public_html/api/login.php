<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Metode ikke tillatt.']);
    exit;
}

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

require __DIR__ . '/database.php';

$email = trim((string)($_POST['email'] ?? ''));
$password = (string)($_POST['password'] ?? '');

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'E-post og passord må fylles ut.']);
    exit;
}

try {
    $stmt = $pdo->prepare(
        sprintf('SELECT id, email, password_hash, name, active FROM %s WHERE email = :email LIMIT 1', DB_USERS_TABLE)
    );
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Databasefeil under innlogging.']);
    exit;
}

if (!$user || (int)($user['active'] ?? 0) !== 1) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Feil brukernavn eller passord.']);
    exit;
}

$passwordHash = (string)($user['password_hash'] ?? '');
$verified = $passwordHash !== '' && password_verify($password, $passwordHash);

if (!$verified && $passwordHash !== '') {
    // Støtt migrering fra klartekst-passord.
    if (hash_equals($passwordHash, $password)) {
        $verified = true;
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        try {
            $update = $pdo->prepare(
                sprintf('UPDATE %s SET password_hash = :hash WHERE id = :id', DB_USERS_TABLE)
            );
            $update->execute(['hash' => $passwordHash, 'id' => $user['id']]);
        } catch (PDOException $e) {
            // Ignorer oppdateringsfeil for å unngå å hindre innlogging.
        }
    }
}

if (!$verified) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Feil brukernavn eller passord.']);
    exit;
}

if (password_needs_rehash($passwordHash, PASSWORD_DEFAULT)) {
    $newHash = password_hash($password, PASSWORD_DEFAULT);
    try {
        $rehash = $pdo->prepare(
            sprintf('UPDATE %s SET password_hash = :hash WHERE id = :id', DB_USERS_TABLE)
        );
        $rehash->execute(['hash' => $newHash, 'id' => $user['id']]);
    } catch (PDOException $e) {
        // Ignorer rehash-feil.
    }
}

session_regenerate_id(true);

$_SESSION['uid'] = (int)$user['id'];
$_SESSION['name'] = $user['name'] ?? '';
$_SESSION['email'] = $user['email'];

$responseUser = [
    'id' => (int)$user['id'],
    'name' => $user['name'] ?? '',
    'email' => $user['email'],
];

echo json_encode(['ok' => true, 'user' => $responseUser]);
