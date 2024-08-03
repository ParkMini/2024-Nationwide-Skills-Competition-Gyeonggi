<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>날짜 비교 결과</title>
    <style>
        table {
            width: 70%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>

<?php
// 오늘 날짜 설정 (시간 제거)
$today = new DateTime('now');
$today->setTime(0, 0, 0);

// 테스트할 날짜 배열 (시간 제거)
$datesToCompare = [
    '오늘 이전' => new DateTime('2024-07-30'),  // 오늘 이전
    '오늘 동일' => new DateTime('2024-08-03'),  // 오늘과 동일
    '오늘 이후' => new DateTime('2024-08-05'),  // 오늘 이후
];

// 테이블 헤더
echo "<table>";
echo "<tr><th>날짜 케이스</th><th>비교 날짜</th><th>비교 결과</th></tr>";

// 각 날짜에 대해 비교 수행
foreach ($datesToCompare as $label => $date) {
    $date->setTime(0, 0, 0); // 비교 날짜의 시간도 00:00:00으로 설정

    $isEqual = $date == $today ? '오늘과 동일' : '다름';
    $isGreater = $date > $today ? '미래' : '과거 또는 오늘';
    $isLesser = $date < $today ? '과거' : '미래 또는 오늘';
    $isGreaterOrEqual = $date >= $today ? '오늘 또는 미래' : '과거';
    $isLesserOrEqual = $date <= $today ? '오늘 또는 과거' : '미래';

    // 비교 결과 출력
    echo "<tr><td>$label</td><td>" . $date->format('Y-m-d') . "</td>";
    echo "<td>";
    echo "같음: " . $isEqual . "<br>";
    echo "크다(미래): " . $isGreater . "<br>";
    echo "작다(과거): " . $isLesser . "<br>";
    echo "크거나 같다: " . $isGreaterOrEqual . "<br>";
    echo "작거나 같다: " . $isLesserOrEqual;
    echo "</td></tr>";
}

// 테이블 닫기
echo "</table>";
?>

</body>
</html>
