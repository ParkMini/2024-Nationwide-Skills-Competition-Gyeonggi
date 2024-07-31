let stampFileHandle;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let currentQuizData = null;
let currentQuestionIndex = 0;
let quizInProgress = false;

// 비동기적으로 JSON 파일을 로드
async function loadQuizData() {
    try {
        const response = await fetch('./2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/B모듈/JSON/quiz.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading quiz data:', error);
    }
}

function updateCourse() {
    if (quizInProgress) {
        alert("퀴즈가 진행 중입니다. 완료 후 다른 퀴즈를 선택하세요.");
        return;
    }
    setMapImageByCourse();
}

function setMapImage(imageUrl) {
    const mapImage = document.getElementById("mapImage");
    console.log('Setting map image src:', imageUrl);
    mapImage.src = imageUrl;
}

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

async function startQuiz() {
    const selectedCourse = document.querySelector("#selectCourse").value;
    const mapsDiv = document.getElementById("maps");
    let quizData;

    // JSON 데이터를 비동기적으로 로드
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

    // 기존 포인터들과 라인을 제거합니다.
    mapsDiv.querySelectorAll('.pointer, .line').forEach(element => element.remove());

    // 포인터를 생성하고 이동 불가능하게 설정합니다.
    quizData.forEach((item, index) => {
        const pointer = document.createElement("div");
        pointer.className = "pointer";
        pointer.style.top = item.location[1] + "px";
        pointer.style.left = item.location[0] + "px";
        pointer.textContent = item.idx;
        mapsDiv.appendChild(pointer);
    });

    updateLines();
    currentQuizData = quizData;
    currentQuestionIndex = 0;
    quizInProgress = true;

    // 첫 번째 문제 표시
    displayQuestion();
}

function setMapImageByCourse() {
    const selectedCourse = document.querySelector("#selectCourse").value;
    let imageUrl;

    switch (selectedCourse) {
        case "창덕궁 달빛기행":
            imageUrl = "./2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/B모듈/map/창덕궁.png";
            break;
        case "경복궁 달빛기행":
            imageUrl = "./2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/B모듈/map/경복궁.png";
            break;
        case "신라 달빛기행":
            imageUrl = "./2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/B모듈/map/신라.png";
            break;
    }

    setMapImage(imageUrl);
}

function displayQuestion() {
    const questionContainer = document.getElementById("questionContainer");

    if (!currentQuizData || currentQuestionIndex >= currentQuizData.length) {
        alert("모든 문제를 완료했습니다!");
        questionContainer.innerHTML = ''; // 퀴즈 문제와 버튼을 숨김
        quizInProgress = false;
        completeStamp();
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
        answerElement.className = "btn btn-outline-primary m-2"; // Bootstrap 버튼 스타일 추가
        answerElement.onclick = () => checkAnswer(answer);
        questionContainer.appendChild(answerElement);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function checkAnswer(selectedAnswer) {
    const questionData = currentQuizData[currentQuestionIndex];
    if (selectedAnswer === questionData.correct) {
        alert("정답입니다!");
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

    complete(stampNumber);
}

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
            return;
        }

        stampFileHandle = fileHandle;
        console.log('File handle acquired successfully.');
    } catch (error) {
        console.error('Error during the file open process:', error);
    }
}

async function complete(stampNumber) {
    if (![1, 2, 3].includes(stampNumber)) {
        console.error('Invalid stamp number. Only 1, 2, 3 are allowed.');
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
        console.error('Error during the image processing:', error);
    }
}

async function downloadCoupon() {
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

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector("#selectCourse").addEventListener('change', updateCourse);
    document.querySelector("#menus button[data-bs-toggle='modal']").addEventListener('click', () => {
        const couponModal = new bootstrap.Modal(document.getElementById('couponModal'));
        couponModal.show();
    });

    document.getElementById('couponModal').addEventListener('hidden.bs.modal', () => {
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    });

    document.querySelector("#menus button:not([data-bs-toggle='modal'])").addEventListener('click', async () => {
        if (!stampFileHandle) {
            await uploadStampCardImage();
        }
        await startQuiz();
    });

    setMapImageByCourse();
});
