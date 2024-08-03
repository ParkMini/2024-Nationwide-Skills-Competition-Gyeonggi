<!-- 메인 라우터 -->
<?php
include "./config/DBConnection.php";
$request = $_SERVER['REQUEST_URI'];
$resource = explode("/", $request);

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
        default:
            echo "<h1>잘못된 접근입니다.</h1>";
            return;
    }
    include "./components/header.php";
    include $page;
    include "./components/footer.php";
} else {
    switch ($resource[2]) {
        default:
            return "잘못된 API 접근입니다.";
    }
}