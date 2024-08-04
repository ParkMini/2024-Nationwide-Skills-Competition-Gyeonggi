<?php
include "./config/DBConnection.php";
$request = $_SERVER['REQUEST_URI'];
$queryString = explode("?", $request);
$resource = explode("/", $queryString[0]);
$jsonArray = json_decode(file_get_contents('php://input'), true);

$page = "";
if ($resource[1] != "api") {
    switch ($resource[1]) {
        case "":
            $page = "./pages/index.html";
            break;
        case "quiz":
            $page = "./pages/quiz.html";
            break;
        case "sub01":
            $page = "./pages/sub01.html";
            break;
        case "sub02":
            $page = "./pages/sub02.html";
            break;
        case "register":
            $page = "./pages/register.html";
            break;
        case "login":
            $page = "./pages/login.html";
            break;

        default:
            echo "<h1>잘못된 접근입니다.</h1>";
            return;
    }
    include "./components/header.php";
    include $page;
    include "./components/footer.php";
} else {
    switch ($resource[2]) {
        case "auth":
            $page = "./controller/auth.php";
            break;
        default:
            echo "잘못된 API 접근입니다.";
            return;
    }
    include $page;
}