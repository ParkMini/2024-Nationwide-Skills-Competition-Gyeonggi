<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if ($jsonArray["type"] == "register") {
        $username = $jsonArray["username"];
        $password = $jsonArray["password"];
        $name = $jsonArray["name"];
        $stmt = $pdo->prepare("INSERT INTO users (username, password, name) VALUES (:username, :password, :name)");
        $stmt->bindParam(":username", $username);
        $stmt->bindParam(":password", $password);
        $stmt->bindParam(":name", $name);
        $stmt->execute();
        echo "가입완료";
    }
    if ($jsonArray["type"] == "login") {
        $username = $jsonArray["username"];
        $password = $jsonArray["password"];
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username AND password = :password");
        $stmt->bindParam(":username", $username);
        $stmt->bindParam(":password", $password);
        $stmt->execute();
        $user = $stmt->fetch();
        if (isset($user["username"])) {
            $_SESSION["user_idx"] = $user["user_idx"];
            $_SESSION["username"] = $user["username"];
            $_SESSION["name"] = $user["name"];
            $_SESSION["mb_level"] = $user["mb_level"];
            echo "로그인 성공";
        } else {
            echo "일치하는 계정 없음";
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if ($_GET["type"] == "duplicateCheck") {
        $username = $_GET["username"];
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
        $stmt->execute(["username" => $username]);
        $user = $stmt->fetch();
        if (isset($user["username"])) {
            echo "존재함";
        } else {
            echo "존재하지 않음";
        }
    }
}