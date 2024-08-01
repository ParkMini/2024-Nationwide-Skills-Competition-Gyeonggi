let stampFileHandle;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
let currentQuizData = null;
let currentQuestionIndex = 0;
let quizInProgress = false;
const defaultMetadata = { quiz1: false, quiz2: false, quiz3: false, used: false };

// JSON 파일로부터 퀴즈 데이터를 로드하는 함수
async function loadQuizData() {
    try {
        const response = await fetch('./2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/B모듈/JSON/quiz.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('퀴즈 데이터를 로드하는 중 오류 발생:', error);
    }
}

// 코스를 업데이트하는 함수
function updateCourse(event) {
    if (quizInProgress) {
        alert("이미 퀴즈가 시작되었습니다!");
        event.stopPropagation();
        event.preventDefault();
        return;
    }
    setMapImageByCourse();
}

// 지도 이미지를 설정하는 함수
function setMapImage(imageUrl) {
    const mapImage = document.getElementById("mapImage");
    console.log('지도 이미지 소스를 설정 중:', imageUrl);
    mapImage.src = imageUrl;
}

// 포인터 사이의 연결선을 업데이트하는 함수
function updateLines() {
    const pointers = Array.from(document.querySelectorAll('.pointer'));
    const lines = document.querySelectorAll('.line');
    lines.forEach(line => line.remove());

    for (let i = 0; i < pointers.length - 1; i++) {
        const startPointer = pointers[i];
        const endPointer = pointers[i + 1];

        const startX = startPointer.offsetLeft + startPointer.offsetWidth / 2;
        const startY = startPointer.offsetTop + startPointer.offsetHeight / 2;
        const endX = endPointer.offsetLeft + endPointer.offsetWidth / 2;
        const endY = endPointer.offsetTop + endPointer.offsetHeight / 2;

        const line = document.createElement('div');
        line.className = 'line';
        line.style.width = Math.hypot(endX - startX, endY - startY) + 'px';
        line.style.height = '2px';
        line.style.left = startX + 'px';
        line.style.top = startY + 'px';
        line.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX)}rad)`;
        document.getElementById('maps').appendChild(line);
    }
}

// 퀴즈를 시작하는 함수
async function startQuiz(event) {
    if (quizInProgress) {
        alert("이미 퀴즈가 시작되었습니다!");
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        return;
    }

    if (!stampFileHandle) {
        const uploadSuccess = await uploadStampCardImage();
        if (!uploadSuccess) {
            return;
        }
    }

    // 기존 메타데이터를 로드하거나 없으면 초기화
    await initializeMetadata();

    // 선택한 코스에 대한 메타데이터 확인
    const metadata = await getMetadata();
    const selectedCourse = document.querySelector("#selectCourse").value;
    let quizData;

    // 이미 푼 퀴즈인지 확인
    if (
        (selectedCourse === "창덕궁 달빛기행" && metadata.quiz1) ||
        (selectedCourse === "경복궁 달빛기행" && metadata.quiz2) ||
        (selectedCourse === "신라 달빛기행" && metadata.quiz3)
    ) {
        alert("이미 푼 퀴즈입니다.");
        return;
    }

    // JSON 파일로부터 퀴즈 데이터를 로드
    const quiz = await loadQuizData();

    switch (selectedCourse) {
        case "창덕궁 달빛기행":
            quizData = quiz.find(item => item.name === "창덕궁 달빛기행").quiz;
            break;
        case "경복궁 달빛기행":
            quizData = quiz.find(item => item.name === "경복궁 달빛기행").quiz;
            break;
        case "신라 달빛기행":
            quizData = quiz.find(item => item.name === "신라 달빛기행").quiz;
            break;
    }

    currentQuizData = quizData;
    currentQuestionIndex = 0;
    quizInProgress = true;

    // 첫 번째 문제 표시
    displayQuestion();
}

// 선택한 코스에 따라 지도 이미지를 설정하는 함수
async function setMapImageByCourse() {
    const selectedCourse = document.querySelector("#selectCourse").value;
    let imageUrl;
    let quizData;

    // JSON 파일로부터 퀴즈 데이터를 로드
    const quiz = await loadQuizData();

    switch (selectedCourse) {
        case "창덕궁 달빛기행":
            imageUrl = "./2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/B모듈/map/창덕궁.png";
            quizData = quiz.find(item => item.name === "창덕궁 달빛기행").quiz;
            break;
        case "경복궁 달빛기행":
            imageUrl = "./2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/B모듈/map/경복궁.png";
            quizData = quiz.find(item => item.name === "경복궁 달빛기행").quiz;
            break;
        case "신라 달빛기행":
            imageUrl = "./2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/B모듈/map/신라.png";
            quizData = quiz.find(item => item.name === "신라 달빛기행").quiz;
            break;
    }

    setMapImage(imageUrl);

    // 포인터를 초기화하고 그리기
    initializePointers(quizData);
}

// 지도에 포인터를 초기화하는 함수
function initializePointers(quizData) {
    const mapsDiv = document.getElementById("maps");

    // 기존 포인터와 라인을 제거
    mapsDiv.querySelectorAll('.pointer, .line').forEach(element => element.remove());

    // 포인터 생성
    quizData.forEach((item, index) => {
        const pointer = document.createElement("div");
        pointer.className = "pointer";
        pointer.style.top = item.location[1] + "px";
        pointer.style.left = item.location[0] + "px";
        pointer.textContent = item.idx;
        pointer.style.backgroundColor = 'red'; // 색상 초기화
        mapsDiv.appendChild(pointer);
    });

    updateLines();
}

// 문제를 표시하는 함수
function displayQuestion() {
    const questionContainer = document.getElementById("questionContainer");

    if (!currentQuizData || currentQuestionIndex >= currentQuizData.length) {
        alert("모든 문제를 완료했습니다!");
        questionContainer.innerHTML = ''; // 퀴즈 영역 초기화
        quizInProgress = false;
        completeStamp();
        animateCharacter();
        return;
    }

    const questionData = currentQuizData[currentQuestionIndex];
    questionContainer.innerHTML = '';

    const questionElement = document.createElement("div");
    questionElement.textContent = questionData.question;
    questionContainer.appendChild(questionElement);

    const answers = [...questionData.incorrect, questionData.correct];
    shuffleArray(answers);

    answers.forEach(answer => {
        const answerElement = document.createElement("button");
        answerElement.textContent = answer;
        answerElement.className = "btn btn-outline-primary m-2"; // Bootstrap 스타일 추가
        answerElement.onclick = () => checkAnswer(answer);
        questionContainer.appendChild(answerElement);
    });
}

// 배열 요소를 섞는 함수
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 사용자의 답변을 확인하는 함수
function checkAnswer(selectedAnswer) {
    const questionData = currentQuizData[currentQuestionIndex];
    if (selectedAnswer === questionData.correct) {
        const pointer = document.querySelector(`.pointer:nth-of-type(${currentQuestionIndex + 1})`);
        if (pointer) {
            pointer.style.backgroundColor = 'green';
        }
        currentQuestionIndex++;
        displayQuestion();
    } else {
        alert("틀렸습니다. 다시 시도하세요.");
    }
}

// 퀴즈 완료 후 스탬프를 추가하는 함수
function completeStamp() {
    const selectedCourse = document.querySelector("#selectCourse").value;
    let stampNumber;

    switch (selectedCourse) {
        case "창덕궁 달빛기행":
            stampNumber = 1;
            break;
        case "경복궁 달빛기행":
            stampNumber = 2;
            break;
        case "신라 달빛기행":
            stampNumber = 3;
            break;
    }

    // 완료된 퀴즈에 대한 메타데이터 업데이트
    updateMetadata(stampNumber);

    complete(stampNumber);
}

// 스탬프 카드 이미지를 업로드하는 함수
async function uploadStampCardImage() {
    try {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'PNG file',
                accept: { 'image/png': ['.png'] }
            }],
            excludeAcceptAllOption: true,
            multiple: false
        });

        const file = await fileHandle.getFile();
        if (file.name !== 'stamp_card.png') {
            alert('파일명이 stamp_card.png여야 합니다.');
            return false;
        }

        stampFileHandle = fileHandle;
        console.log('File handle acquired successfully.');
        return true;
    } catch (error) {
        console.error('파일 열기 과정에서 오류 발생:', error);
        return false;
    }
}

// 이미지에 스탬프를 추가하고 파일을 저장하는 함수
async function complete(stampNumber) {
    if (![1, 2, 3].includes(stampNumber)) {
        console.error('유효하지 않은 스탬프 번호입니다. 1, 2, 3만 허용됩니다.');
        return;
    }

    try {
        const stampImg = new Image();
        const couponImg = new Image();

        const stampFile = await stampFileHandle.getFile();
        const stampUrl = URL.createObjectURL(stampFile);

        stampImg.src = './2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/B모듈/coupon/stamp.png';
        couponImg.src = stampUrl;

        await Promise.all([
            new Promise((resolve, reject) => {
                stampImg.onload = resolve;
                stampImg.onerror = reject;
            }),
            new Promise((resolve, reject) => {
                couponImg.onload = resolve;
                couponImg.onerror = reject;
            })
        ]);

        canvas.width = couponImg.width;
        canvas.height = couponImg.height;
        ctx.drawImage(couponImg, 0, 0);

        const baseX = 55;
        const baseY = 168;
        const offsetX = (stampNumber - 1) * 215;

        const topLeftX = baseX + offsetX;
        const topLeftY = baseY;

        ctx.drawImage(stampImg, topLeftX, topLeftY, 158, 158);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const writable = await stampFileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        console.log('Complete!');
    } catch (error) {
        console.error('이미지 처리 중 오류 발생:', error);
    }
}

// 쿠폰을 다운로드하는 함수
async function downloadCoupon(event) {
    if (quizInProgress) {
        alert('이미 퀴즈가 시작되어 쿠폰을 발급 받을 수 없습니다!');
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        return;
    }

    const userName = document.getElementById("userName").value;
    if (userName.trim() === "") {
        alert("이름을 입력하세요.");
        return;
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const img = new Image();
    img.src = './2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/B모듈/coupon/stamp_card.png';
    img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = 700;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);

        ctx.font = '20px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(userName, 520, 50);
        ctx.fillText(dateStr, 520, 100);

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'stamp_card.png';
        link.click();

        const couponModal = document.getElementById('couponModal');
        const modalInstance = bootstrap.Modal.getInstance(couponModal);
        modalInstance.hide();
    };
}

// 퀴즈 경로를 따라 캐릭터를 애니메이션으로 움직이는 함수
function animateCharacter() {
    const pointers = Array.from(document.querySelectorAll('.pointer'));
    if (pointers.length === 0) return;

    const character = document.createElement('img');
    character.src = './2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/B모듈/character.png';
    character.style.position = 'absolute';
    character.style.width = '80px'; // 크기 증가
    character.style.height = '80px'; // 크기 증가
    character.style.zIndex = '9999'; // z-index 설정
    character.style.top = pointers[0].offsetTop + 'px';
    character.style.left = pointers[0].offsetLeft + 'px';
    document.getElementById('maps').appendChild(character);

    let index = 0;

    function moveCharacter() {
        if (index >= pointers.length - 1) {
            character.remove();
            return;
        }

        const startPointer = pointers[index];
        const endPointer = pointers[index + 1];

        const startX = startPointer.offsetLeft;
        const startY = startPointer.offsetTop;
        const endX = endPointer.offsetLeft;
        const endY = endPointer.offsetTop;

        const distance = Math.hypot(endX - startX, endY - startY);
        const duration = distance / 200; // 속도 조절 (200px/s)

        character.style.transition = `top ${duration}s linear, left ${duration}s linear`;
        character.style.top = endY + 'px';
        character.style.left = endX + 'px';

        index++;
        setTimeout(moveCharacter, duration * 1000);
    }

    moveCharacter();
}

// 메타데이터를 초기화하는 함수
async function initializeMetadata() {
    try {
        const metadata = await getMetadata();

        if (!metadata) {
            console.log('기존 메타데이터가 없습니다. 기본 메타데이터를 초기화합니다.');
            await saveMetadataToFile(defaultMetadata);
        } else {
            console.log('기존 메타데이터:', metadata);
        }
    } catch (error) {
        console.error('메타데이터 초기화 중 오류 발생:', error);
    }
}

// 이미지로부터 메타데이터를 가져오는 함수
async function getMetadata() {
    try {
        const file = await stampFileHandle.getFile();
        const imageBitmap = await createImageBitmap(file);
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        ctx.drawImage(imageBitmap, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        const metadataString = readMetadataFromPixels(pixels);
        return metadataString ? JSON.parse(metadataString) : null;
    } catch (error) {
        console.error('메타데이터를 가져오는 중 오류 발생:', error);
        return null;
    }
}

// 이미지 픽셀로부터 메타데이터를 읽어오는 함수
function readMetadataFromPixels(pixels) {
    let metadataString = '';

    try {
        // 픽셀 배열의 끝에서 시작하여 뒤로 이동하면서 읽기
        for (let i = pixels.length - 4 * 100; i < pixels.length; i += 4) {
            const charCode = pixels[i]; // red 채널만 읽기
            if (charCode === 0) break; // 메타데이터의 끝
            metadataString += String.fromCharCode(charCode);
        }
        return metadataString;
    } catch (error) {
        console.error("픽셀에서 메타데이터를 읽는 중 오류 발생:", error);
        return null;
    }
}

// 이미지 파일에 메타데이터를 저장하는 함수
async function saveMetadataToFile(metadata) {
    try {
        const metadataString = JSON.stringify(metadata);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // 이전 메타데이터 지우기
        for (let i = pixels.length - 4 * 100; i < pixels.length; i += 4) {
            pixels[i] = 0;
        }

        // 새로운 메타데이터 쓰기
        for (let i = 0; i < metadataString.length; i++) {
            pixels[pixels.length - 4 * 100 + i * 4] = metadataString.charCodeAt(i);
        }

        pixels[pixels.length - 4 * 100 + metadataString.length * 4] = 0; // 메타데이터의 끝

        ctx.putImageData(imageData, 0, 0);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const writable = await stampFileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        console.log('메타데이터가 성공적으로 저장되었습니다!');
    } catch (error) {
        console.error('메타데이터를 저장하는 중 오류 발생:', error);
    }
}

// 퀴즈 진행에 따라 메타데이터를 업데이트하는 함수
async function updateMetadata(stampNumber) {
    try {
        const metadata = await getMetadata() || defaultMetadata;

        if (stampNumber === 1) metadata.quiz1 = true;
        if (stampNumber === 2) metadata.quiz2 = true;
        if (stampNumber === 3) metadata.quiz3 = true;
        metadata.used = true;

        console.log('업데이트된 메타데이터:', metadata);

        await saveMetadataToFile(metadata);
    } catch (error) {
        console.error('메타데이터를 업데이트하는 중 오류 발생:', error);
    }
}

// 메타데이터를 로드하고 표시하는 함수
async function loadMeta() {
    try {
        const metadata = await getMetadata();
        alert(`메타데이터: ${JSON.stringify(metadata)}`);
    } catch (error) {
        console.error('메타데이터를 로드하는 중 오류 발생:', error);
    }
}

$(document).ready(async function () {
    const quizData = await loadQuizData();
    currentQuizData = quizData;

    $("#selectCourse").change(function (event) {
        updateCourse(event);
    });

    $("#couponButton").click(function (event) {
        if (quizInProgress) {
            alert('이미 퀴즈가 시작되어 쿠폰을 발급 받을 수 없습니다!');
            event.stopPropagation();
            event.preventDefault();
            return;
        }
        $('#couponModal').modal('hide'); // 모달이 표시되지 않도록 방지
    });

    $("#startQuizButton").click(async function (event) {
        await startQuiz(event);
    });

    $("#loadMetaButton").click(async function () {
        await loadMeta();
    });

    $("#couponModal").on('hidden.bs.modal', function () {
        $('.modal-backdrop').remove();
    });

    setMapImageByCourse();
});
