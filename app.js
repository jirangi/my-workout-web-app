// 1. 초기 데이터 및 상세 운동 루틴 설정
const savedData = localStorage.getItem('my_workout_routine');
const workoutData = savedData ? JSON.parse(savedData) : null;
const app = document.getElementById('app');

let currentExIdx = 0;   // 현재 종목 인덱스
let currentSet = 1;     // 현재 세트 번호

// 운동 리스트: 종목수와 세트수를 포함하도록 확장
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

function renderExercise() {
    const ex = exercises[currentExIdx];
    const totalEx = exercises.length;
    
    app.innerHTML = `
        <div class="container">
            <div class="progress-text">종목 진행: (${currentExIdx + 1}/${totalEx})</div>
            <div class="exercise-image-area">
                <span>[ ${ex.name} 동작 가이드 이미지 ]</span>
            </div>
            
            <h1 style="font-size: 45px; color: #333; margin: 10px 0;">${ex.name}</h1>
            <h2 style="color: #007bff; margin-bottom: 20px;">Set ${currentSet} / ${ex.sets}</h2>
            
            <button class="wide-rect-btn" onclick="handleSetComplete()">
                ${currentSet === ex.sets ? "종목 완료" : "세트 완료"}
            </button>
            
            <div class="bottom-nav">
                <button onclick="location.reload()">중단하기</button>
            </div>
        </div>
    `;

    // 시간제 운동일 경우 자동으로 타이머/음성 로직 실행 (생략 가능)
    if (ex.type === "time") {
        // 이전에 구현한 startTimedExercise 로직을 여기에 연결 가능
    }
}

// [세트 완료 버튼 클릭 시]
function handleSetComplete() {
    const ex = exercises[currentExIdx];
    
    if (currentSet < ex.sets) {
        // 아직 세트가 남았으면 휴식 후 같은 운동 재개
        currentSet++;
        startRest(false); // 같은 종목 반복
    } else {
        // 모든 세트 완료 시 다음 종목으로
        currentSet = 1;
        startRest(true); // 다음 종목으로 이동
    }
}

function startRest(isNextEx) {
    const ex = exercises[currentExIdx];
    let timeLeft = ex.restTime || 60;
    
    const restInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(restInterval);
            if (isNextEx) { nextExercise(); } 
            else { renderExercise(); }
        } else {
            renderRestUI(timeLeft, isNextEx);
        }
    }, 1000);

    window.skipRest = () => {
        clearInterval(restInterval);
        if (isNextEx) { nextExercise(); } 
        else { renderExercise(); }
    };
}

function renderRestUI(time, isNextEx) {
    const nextInfo = isNextEx ? (exercises[currentExIdx + 1]?.name || "종료") : exercises[currentExIdx].name;
    app.innerHTML = `
        <div class="container">
            <h2>휴식 중...</h2>
            <h1 style="font-size: 80px;">${time}s</h1>
            <p>준비: <strong>${nextInfo}</strong></p>
            <button class="setup-btn" onclick="window.skipRest()">휴식 건너뛰기</button>
        </div>
    `;
}

function nextExercise() {
    currentExIdx++;
    if (currentExIdx < exercises.length) { renderExercise(); } 
    else { renderFinished(); }
}

function startWorkout() { renderExercise(); }
function renderFinished() { app.innerHTML = `<div class="container"><h1>🎉 오운완!</h1><button class="setup-btn" onclick="location.reload()">메인으로</button></div>`; }
function renderSetup() { app.innerHTML = `<div class="container"><h1>반가워요!</h1><button class="setup-btn" onclick="saveBasic()">루틴 생성</button></div>`; }
function saveBasic() { localStorage.setItem('my_workout_routine', JSON.stringify({name:"기본 루틴"})); location.reload(); }

init();
