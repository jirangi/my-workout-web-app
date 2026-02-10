// 1. 데이터 및 상태 초기화
const savedData = localStorage.getItem('my_workout_routine');
const workoutData = savedData ? JSON.parse(savedData) : null;
const app = document.getElementById('app');

let currentExIdx = 0;   // 현재 종목 번호 (0부터 시작)
let currentSet = 1;     // 현재 세트 번호 (1부터 시작)

const exercises = [
    { name: "푸쉬업", type: "count", sets: 3 },
    { name: "스쿼트", type: "time", workTime: 40, restTime: 20, sets: 4 },
    { name: "런지", type: "count", sets: 3 },
    { name: "플랭크", type: "time", workTime: 30, restTime: 15, sets: 3 }
];

function init() {
    if (workoutData) { renderMain(); } 
    else { renderSetup(); }
}

function renderMain() {
    app.innerHTML = `
        <div class="container">
            <h1>오늘의 루틴</h1>
            <p><strong>${workoutData.name}</strong></p>
            <button class="wide-rect-btn" onclick="startWorkout()">운동 시작</button>
        </div>
    `;
}

// 2. 운동 화면 렌더링
function renderExercise() {
    const ex = exercises[currentExIdx];
    const totalEx = exercises.length;
    
    app.innerHTML = `
        <div class="container">
            <div class="progress-text">전체 종목: (${currentExIdx + 1}/${totalEx})</div>
            <div class="exercise-image-area">
                <span>[ ${ex.name} 가이드 이미지 ]</span>
            </div>
            
            <h1 style="font-size: 45px; margin: 10px 0;">${ex.name}</h1>
            <h2 style="color: #007bff; margin-bottom: 20px;">세트 진행: (${currentSet}/${ex.sets})</h2>
            
            <button class="wide-rect-btn" onclick="handleSetComplete()">
                ${currentSet === ex.sets ? "종목 완료" : "세트 완료"}
            </button>
            
            <div class="bottom-nav">
                <button onclick="location.reload()">중단</button>
            </div>
        </div>
    `;
}

// 3. 세트 및 종목 전환 핵심 로직 (수정됨)
function handleSetComplete() {
    const ex = exercises[currentExIdx];
    
    if (currentSet < ex.sets) {
        // 아직 세트가 남았을 때: 동일 종목 다음 세트 진행
        currentSet++;
        startRest(false); 
    } else {
        // 해당 종목의 모든 세트 완료 시: 다음 종목으로 인덱스 증가
        currentSet = 1; // 세트 번호 초기화
        startRest(true); 
    }
}

function startRest(isNextEx) {
    const ex = exercises[currentExIdx];
    let timeLeft = ex.restTime || 60;
    
    // 휴식 화면 렌더링
    const renderRest = (time) => {
        const nextInfo = isNextEx ? (exercises[currentExIdx + 1]?.name || "종료") : exercises[currentExIdx].name;
        app.innerHTML = `
            <div class="container">
                <h2>휴식 중...</h2>
                <h1 style="font-size: 80px;">${time}s</h1>
                <p>다음: <strong>${nextInfo}</strong> ${isNextEx ? "" : "(다음 세트)"}</p>
                <button class="setup-btn" onclick="skipRest()">건너뛰기</button>
            </div>
        `;
    };

    renderRest(timeLeft);

    const timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            finishRest();
        } else {
            renderRest(timeLeft);
        }
    }, 1000);

    const finishRest = () => {
        clearInterval(timerInterval);
        if (isNextEx) {
            currentExIdx++; // 종목 인덱스 증가
            if (currentExIdx < exercises.length) { renderExercise(); } 
            else { renderFinished(); }
        } else {
            renderExercise(); // 같은 종목 다음 세트
        }
    };

    window.skipRest = finishRest;
}

// 4. 기타 화면 제어
function startWorkout() { renderExercise(); }
function renderFinished() { app.innerHTML = `<div class="container"><h1>🎉 오운완!</h1><button class="setup-btn" onclick="location.reload()">메인으로</button></div>`; }
function renderSetup() { app.innerHTML = `<div class="container"><h1>반가워요!</h1><button class="setup-btn" onclick="saveBasic()">루틴 생성</button></div>`; }
function saveBasic() { localStorage.setItem('my_workout_routine', JSON.stringify({name:"기본 루틴"})); location.reload(); }

init();
