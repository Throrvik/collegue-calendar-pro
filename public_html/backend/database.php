<?php
declare(strict_types=1);

const DB_HOST = '127.0.0.1';
const DB_PORT = '3306';
const DB_NAME = 'minturnus';
const DB_USER = 'minturnus';
const DB_PASS = '';
const DB_CHARSET = 'utf8mb4';
const DB_USERS_TABLE = 'users';

$host = getenv('DB_HOST') ?: DB_HOST;
$port = getenv('DB_PORT') ?: DB_PORT;
$name = getenv('DB_NAME') ?: DB_NAME;
$user = getenv('DB_USER') ?: DB_USER;
$pass = getenv('DB_PASS') ?: DB_PASS;
$charset = getenv('DB_CHARSET') ?: DB_CHARSET;

$dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', $host, $port, $name, $charset);

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'Kunne ikke koble til databasen.']);
    exit;
}
