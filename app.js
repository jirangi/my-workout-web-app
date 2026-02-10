// 1. 초기 데이터 및 상태 설정
const savedData = localStorage.getItem('my_workout_routine');
const workoutData = savedData ? JSON.parse(savedData) : null;
const app = document.getElementById('app');

// 현재 운동 진행 상태 (인덱스)
let currentExerciseIndex = 0;
const exercises = ["푸쉬업", "스쿼트", "런지", "플랭크"]; // 기본 루틴 예시

function init() {
    if (workoutData) {
        renderMain();
    } else {
        renderSetup();
    }
}

// 2. 메인 화면
function renderMain() {
    app.innerHTML = `
        <div class="container">
            <h1>오늘의 루틴</h1>
            <p><strong>${workoutData.name}</strong></p>
            <button class="big-start-btn" onclick="startWorkout()">운동 시작</button>
            <div class="bottom-nav">
                <button onclick="resetData()">초기화</button>
            </div>
        </div>
    `;
}

// 3. 운동 진행 화면 (핵심 기능)
function startWorkout() {
    renderExercise();
}

function renderExercise() {
    const exerciseName = exercises[currentExerciseIndex];
    const nextExercise = exercises[currentExerciseIndex + 1] || "모든 운동 완료!";

    app.innerHTML = `
        <div class="container">
            <h2>현재 운동</h2>
            <h1 style="font-size: 50px; color: #007bff;">${exerciseName}</h1>
            <p style="color: #666;">다음 예정: ${nextExercise}</p>
            
            <button class="big-start-btn" onclick="startRest()">운동 완료</button>
            
            <div class="bottom-nav">
                <button onclick="location.reload()">중단하기</button>
            </div>
        </div>
    `;
}

// 4. 휴식 타이머 화면
function startRest() {
    let timeLeft = workoutData.restTime || 60;
    
    // 화면 업데이트
    function updateTimer() {
        app.innerHTML = `
            <div class="container">
                <h2>휴식 중...</h2>
                <h1 style="font-size: 80px;">${timeLeft}s</h1>
                <p>다음 운동: <strong>${exercises[currentExerciseIndex + 1] || "종료"}</strong></p>
                
                <button class="setup-btn" onclick="skipRest()">휴식 건너뛰기</button>
            </div>
        `;
    }

    updateTimer();

    const timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            nextExercise();
        } else {
            updateTimer();
        }
    }, 1000);

    // 전역 함수로 등록하여 버튼 클릭 가능하게 함
    window.skipRest = () => {
        clearInterval(timerInterval);
        nextExercise();
    };
}

// 5. 다음 운동으로 이동 로직
function nextExercise() {
    currentExerciseIndex++;
    if (currentExerciseIndex < exercises.length) {
        renderExercise();
    } else {
        renderFinished();
    }
}

// 6. 모든 운동 완료 화면
function renderFinished() {
    app.innerHTML = `
        <div class="container">
            <h1>오운완! 🎉</h1>
            <p>오늘 준비된 모든 운동을 마쳤습니다.</p>
            <button class="setup-btn" onclick="location.reload()">메인으로</button>
        </div>
    `;
}

// 7. 기타 기능
function renderSetup() {
    app.innerHTML = `
        <div class="container">
            <h1>반가워요!</h1>
            <p>루틴을 먼저 만들어주세요.</p>
            <button class="setup-btn" onclick="saveBasic()">기본 루틴 저장</button>
        </div>
    `;
}

function saveBasic() {
    const basic = { name: "초보자 가이드", restTime: 60 };
    localStorage.setItem('my_workout_routine', JSON.stringify(basic));
    location.reload();
}

function resetData() {
    if(confirm("초기화하시겠습니까?")) {
        localStorage.removeItem('my_workout_routine');
        location.reload();
    }
}

init();
