<?php
$host = "localhost";
$user = "root";
$password = "";
$dbname = "gyeonggi";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "[DBConnection Error] " . $e->getMessage();
}