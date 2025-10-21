<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Metode ikke tillatt']);
    exit;
}

require __DIR__ . '/database.php';

$email = trim((string)($_POST['email'] ?? ''));
$password = (string)($_POST['password'] ?? '');

if ($email === '' || $password === '') {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Feil e-post eller passord']);
    exit;
}

try {
    $stmt = $pdo->prepare(
        sprintf('SELECT * FROM %s WHERE LOWER(email) = LOWER(:email) LIMIT 1', DB_USERS_TABLE)
    );
    $lookupEmail = strtolower($email);
    $stmt->execute(['email' => $lookupEmail]);
    $user = $stmt->fetch();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Kunne ikke koble til databasen.']);
    exit;
}

if (!$user) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Feil e-post eller passord']);
    exit;
}

$activeFields = ['active', 'is_active', 'enabled'];
foreach ($activeFields as $field) {
    if (array_key_exists($field, $user)) {
        $value = $user[$field];
        if ($value === null) {
            continue;
        }

        $normalized = strtolower(trim((string)$value));
        $inactiveValues = ['0', 'false', 'no', 'inactive', 'disabled'];

        if ($normalized !== '' && in_array($normalized, $inactiveValues, true)) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Feil e-post eller passord']);
            exit;
        }

        break;
    }
}

$passwordHash = (string)($user['password'] ?? '');
if ($passwordHash === '' || !password_verify($password, $passwordHash)) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Feil e-post eller passord']);
    exit;
}

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

session_regenerate_id(true);

$firstname = isset($user['firstname']) ? trim((string)$user['firstname']) : '';
$lastname = isset($user['lastname']) ? trim((string)$user['lastname']) : '';
$name = trim($firstname . ' ' . $lastname);

$company = null;
if (isset($user['company'])) {
    $trimmedCompany = trim((string)$user['company']);
    if ($trimmedCompany !== '') {
        $company = $trimmedCompany;
    }
}

$_SESSION['uid'] = (int)($user['id'] ?? 0);
$_SESSION['name'] = $name;
$_SESSION['email'] = $user['email'] ?? $email;
$_SESSION['company'] = $company;

$response = [
    'ok' => true,
    'user' => [
        'id' => (int)($user['id'] ?? 0),
        'name' => $name,
        'email' => $user['email'] ?? $email,
        'company' => $company,
    ],
];

echo json_encode($response);
