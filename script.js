// 퀴즈 페이지
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
    if (!stampFileHandle) {
        const stampValid = await uploadStampCardImage();
        if (!stampValid) {
            return;
        }
        await saveUploadedStampCard();
    }

    const selectedCourse = document.querySelector("#selectCourse").value;
    const mapsDiv = document.getElementById("maps");
    let quizData;

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

    mapsDiv.querySelectorAll('.pointer, .line').forEach(element => element.remove());

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
        questionContainer.innerHTML = '';
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
        answerElement.className = "btn btn-outline-primary m-2";
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
                description: 'PNG file', accept: {'image/png': ['.png']}
            }], excludeAcceptAllOption: true, multiple: false
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
        console.error('Error during the file open process:', error);
        return false;
    }
}

async function saveUploadedStampCard() {
    try {
        const stampFile = await stampFileHandle.getFile();
        const stampUrl = URL.createObjectURL(stampFile);

        const img = new Image();
        img.src = stampUrl;

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const writable = await stampFileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        console.log('Uploaded stamp card saved successfully.');
    } catch (error) {
        console.error('Error saving uploaded stamp card:', error);
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

        await Promise.all([new Promise((resolve, reject) => {
            stampImg.onload = resolve;
            stampImg.onerror = reject;
        }), new Promise((resolve, reject) => {
            couponImg.onload = resolve;
            couponImg.onerror = reject;
        })]);

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

// 로그인 페이지
function registerPageSetup() {
    let isShiftActive = false;
    let isCapsLockActive = false;

    const keysLayout = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let currentLayout = []; // To store the shuffled layout

    // Shuffle the keyboard layout initially
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Render the keyboard without changing the layout
    function renderKeyboard() {
        const keyboardRow = $('#virtualKeyboard .keyboard-row');
        keyboardRow.empty(); // Clear existing keys

        // Use the currentLayout to render keys
        currentLayout.forEach(key => {
            const keyElement = $('<div class="keyboard-key"></div>').text(key);
            keyElement.on('click', function (event) {
                event.stopPropagation(); // Prevent hiding keyboard on click
                let char;
                if (isShiftActive || isCapsLockActive) {
                    char = key.toUpperCase();
                } else {
                    char = key.toLowerCase();
                }
                const passwordField = $('#password');
                passwordField.val(passwordField.val() + char);

                if (isShiftActive) {
                    toggleShift(); // Reset shift after one use
                }
            });
            keyboardRow.append(keyElement);
        });

        // Update key display for Shift and CapsLock states
        if (isShiftActive || isCapsLockActive) {
            $('.keyboard-key').each(function () {
                const currentKey = $(this).text();
                $(this).text(currentKey.toUpperCase());
            });
        } else {
            $('.keyboard-key').each(function () {
                const currentKey = $(this).text();
                $(this).text(currentKey.toLowerCase());
            });
        }
    }

    function toggleShift() {
        isShiftActive = !isShiftActive;
        $('#shiftKey').toggleClass('active', isShiftActive);
        renderKeyboard(); // Re-render keyboard to update key cases, not layout
    }

    function toggleCapsLock() {
        isCapsLockActive = !isCapsLockActive;
        $('#capsLockKey').toggleClass('active', isCapsLockActive);
        renderKeyboard(); // Re-render keyboard to update key cases, not layout
    }

    // Disable physical keyboard input for password field
    $('#password').on('keydown', function (e) {
        e.preventDefault(); // Prevent default key input
    });

    // Show keyboard when password field is focused
    $('#password').on('focus', function (event) {
        event.stopPropagation(); // Prevent bubbling that might hide the keyboard
        if (currentLayout.length === 0) {
            // Shuffle and render the keyboard for the first time
            currentLayout = shuffle(keysLayout.split(''));
            renderKeyboard(); // Render keyboard with shuffled keys
        }
        $('#virtualKeyboard').show();
    });

    // Hide keyboard when clicking outside
    $(document).on('click', function (event) {
        if (!$(event.target).closest('#password, #virtualKeyboard').length) {
            $('#virtualKeyboard').hide();
        }
    });

    // Shift key toggle
    $('#shiftKey').on('click', function (event) {
        event.stopPropagation(); // Prevent hiding keyboard on click
        toggleShift();
    });

    // CapsLock key toggle
    $('#capsLockKey').on('click', function (event) {
        event.stopPropagation(); // Prevent hiding keyboard on click
        toggleCapsLock();
    });

    // Backspace key functionality
    $('#backspaceKey').on('click', function (event) {
        event.stopPropagation(); // Prevent hiding keyboard on click
        const passwordField = $('#password');
        passwordField.val(passwordField.val().slice(0, -1));
    });

    $('#username').on('input', function () {
        const username = $(this).val();

        if (username) {
            $.ajax({
                url: '/api/auth',
                type: 'GET',
                data: {
                    type: 'duplicateCheck',
                    username: username
                },
                success: function (response) {
                    if (response === '존재함') {
                        $('#usernameFeedback').text('중복된 아이디입니다.').css('color', 'red');
                        $('#registerBtn').prop('disabled', true);
                    } else {
                        $('#usernameFeedback').text('사용할 수 있는 아이디입니다.').css('color', 'green');
                        $('#registerBtn').prop('disabled', false);
                    }
                },
                error: function (xhr, status, error) {
                    $('#usernameFeedback').text('오류 발생: ' + error).css('color', 'red');
                }
            });
        } else {
            $('#usernameFeedback').text('');
            $('#registerBtn').prop('disabled', true);
        }
    });

    $('#registerForm').on('submit', function (e) {
        e.preventDefault();

        const username = $('#username').val();
        const password = $('#password').val();
        const name = $('#name').val();

        $.ajax({
            url: '/api/auth',
            type: 'POST',
            data: JSON.stringify({
                type: 'register',
                username: username,
                password: password,
                name: name
            }),
            contentType: 'application/json',
            success: function (response) {
                $('#message').text(response);
            },
            error: function (xhr, status, error) {
                $('#message').text('오류 발생: ' + error);
            }
        });
    });
}

function loginPageSetup() {
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        const username = $('#username').val();
        const password = $('#password').val();

        if (username && password) {
            // Show CAPTCHA modal
            setupCaptcha();
            $('#captchaModal').modal('show');
        }
    });

    // Initialize slider and puzzle
    let puzzlePosition = 0;
    let sliderPosition = 0;
    let isDragging = false;
    const maxSliderValue = 250; // Slider range

    function setupCaptcha() {
        // Randomly select an image
        const images = [
            '2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/C모듈/capcha/1.jpg',
            '2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/C모듈/capcha/2.jpg',
            '2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/C모듈/capcha/3.jpg',
            '2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/C모듈/capcha/4.jpg',
            '2024_웹디자인및개발_전국기능경기대회문제(경기)_최종버전/제공파일/C모듈/capcha/5.jpg'
        ];
        const selectedImage = images[Math.floor(Math.random() * images.length)];
        $('.puzzle-image').attr('src', selectedImage);

        // Randomly set the puzzle piece position
        puzzlePosition = Math.floor(Math.random() * (maxSliderValue - 50) + 25);

        // Set the puzzle piece to the correct position
        $('#puzzlePiece').css({
            'left': '0px',  // Start from the left
            'top': '50px',  // Fixed top position for puzzle piece
            'background-image': 'url(' + selectedImage + ')',
            'background-position': `-${puzzlePosition}px -50px`  // Match the cut-out area
        });

        // Set the puzzle hole position with a solid color
        $('#puzzleHole').css({
            'left': puzzlePosition + 'px',
            'top': '50px'
        });

        // Create a solid color to fill the hole
        $('.puzzle-image').css({
            'clip-path': `polygon(${puzzlePosition}% 0%, ${puzzlePosition}% 100%, ${puzzlePosition + 16.67}% 100%, ${puzzlePosition + 16.67}% 0%)`  // Mask area
        });

        // Reset slider position
        sliderPosition = 0;
        $('#sliderThumb').css('left', sliderPosition + 'px');
        $('#accuracy').text('정확도: 0%');

        // Bind slider events
        $('#sliderThumb').on('mousedown', function (event) {
            isDragging = true;
        });

        $(document).on('mouseup', function () {
            if (isDragging) {
                isDragging = false;
                // Calculate accuracy when user stops dragging
                calculateAccuracy();
            }
        });

        $(document).on('mousemove', function (event) {
            if (isDragging) {
                sliderPosition = event.pageX - $('#slider').offset().left;
                if (sliderPosition < 0) sliderPosition = 0;
                if (sliderPosition > maxSliderValue) sliderPosition = maxSliderValue;
                $('#sliderThumb').css('left', sliderPosition + 'px');

                // Update puzzle piece position
                $('#puzzlePiece').css('left', sliderPosition + 'px');

                // Update accuracy display in real-time
                const accuracy = 100 - Math.abs(sliderPosition - puzzlePosition) / maxSliderValue * 100;
                $('#accuracy').text('정확도: ' + accuracy.toFixed(2) + '%');
            }
        });
    }

    function calculateAccuracy() {
        const accuracy = 100 - Math.abs(sliderPosition - puzzlePosition) / maxSliderValue * 100;
        if (accuracy >= 90) {
            // If the accuracy is 90% or more, proceed with login
            $('#captchaModal').modal('hide'); // Close the modal
            performLogin();
        } else {
            $('#message').text('로그인이 거부되었습니다. 정확도가 90% 이상이어야 합니다.');
            $('#captchaModal').modal('hide'); // Close the modal
        }
    }

    function performLogin() {
        const username = $('#username').val();
        const password = $('#password').val();

        $.ajax({
            url: './api/auth',
            type: 'POST',
            data: JSON.stringify({
                type: 'login',
                username: username,
                password: password
            }),
            contentType: 'application/json',
            success: function (response) {
                $('#message').text(response);
                if (response.includes('성공')) {
                    window.location.href = '/';
                }
            },
            error: function (xhr, status, error) {
                $('#message').text('오류 발생: ' + error);
            }
        });
    }
}
