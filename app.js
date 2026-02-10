const savedData = localStorage.getItem('my_workout_routine');
const workoutData = savedData ? JSON.parse(savedData) : null;
const app = document.getElementById('app');

let currentExIdx = 0;   
let currentSet = 1;     

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
            <p style="font-size: 20px; margin-bottom: 40px;"><strong>${workoutData.name}</strong></p>
            <button class="wide-blue-btn" onclick="startWorkout()">운동 시작</button>
        </div>
    `;
}

function renderExercise() {
    const ex = exercises[currentExIdx];
    app.innerHTML = `
        <div class="container">
            <div class="top-progress">종목 진행 (${currentExIdx + 1}/${exercises.length})</div>
            <div class="exercise-image-area">
                <span style="color:#aaa;">[ ${ex.name} 동작 GIF 가이드 ]</span>
            </div>
            <h1 style="font-size: 50px; margin: 10px 0;">${ex.name}</h1>
            <h2 style="color: #007bff; margin-bottom: 40px;">Set ${currentSet} / ${ex.sets}</h2>
            <button class="wide-blue-btn" onclick="handleSetComplete()">
                ${currentSet === ex.sets ? "종목 완료" : "세트 완료"}
            </button>
        </div>
    `;
}

function handleSetComplete() {
    const ex = exercises[currentExIdx];
    if (currentSet < ex.sets) {
        currentSet++;
        startRest(false); 
    } else {
        currentSet = 1;
        startRest(true); 
    }
}

function startRest(isNextEx) {
    let timeLeft = isNextEx ? 60 : (exercises[currentExIdx].restTime || 20);
    const nextName = isNextEx ? (exercises[currentExIdx + 1]?.name || "종료") : exercises[currentExIdx].name;

    const renderRestUI = (time) => {
        app.innerHTML = `
            <div class="container">
                <h2 style="color:#adb5bd;">휴식 중...</h2>
                <h1 style="font-size: 110px; margin: 20px 0;">${time}s</h1>
                <p style="font-size: 22px; margin-bottom: 50px;">다음: <strong>${nextName}</strong></p>
                <button class="wide-blue-btn" onclick="skipRest()">휴식 건너뛰기</button>
            </div>
        `;
    };

    renderRestUI(timeLeft);

    const timer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(timer);
            goNext();
        } else {
            renderRestUI(timeLeft);
        }
    }, 1000);

    const goNext = () => {
        clearInterval(timer);
        if (isNextEx) {
            currentExIdx++;
            if (currentExIdx < exercises.length) renderExercise();
            else renderFinished();
        } else {
            renderExercise();
        }
    };
    window.skipRest = goNext;
}

function startWorkout() { renderExercise(); }
function renderFinished() { app.innerHTML = `<div class="container"><h1>🎉 오운완!</h1><button class="wide-blue-btn" onclick="location.reload()">처음으로</button></div>`; }
function renderSetup() { app.innerHTML = `<div class="container"><h1>반가워요!</h1><button class="wide-blue-btn" onclick="saveBasic()">루틴 생성</button></div>`; }
function saveBasic() { localStorage.setItem('my_workout_routine', JSON.stringify({name:"기본 루틴"})); location.reload(); }

init();
