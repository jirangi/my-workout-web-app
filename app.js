const savedData = localStorage.getItem('my_workout_routine');
const workoutData = savedData ? JSON.parse(savedData) : null;
const app = document.getElementById('app');

let currentExIdx = 0;   
let currentSet = 1;     
let workoutHistory = []; // 운동 기록을 담을 배열

// 운동 리스트: unitType(weight: 무게+횟수, count: 횟수전용, time: 시간전용)
const exercises = [
    { name: "벤치프레스", type: "count", unitType: "weight", weight: 40, count: 12, sets: 3 },
    { name: "푸쉬업", type: "count", unitType: "count", count: 20, sets: 3 },
    { name: "스쿼트", type: "time", unitType: "time", workTime: 40, restTime: 20, sets: 4 },
    { name: "플랭크", type: "time", unitType: "time", workTime: 30, restTime: 15, sets: 3 }
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
    
    // 단위 표시 변환 로직
    let unitDisplay = "";
    if (ex.unitType === "weight") unitDisplay = `${ex.weight}kg x ${ex.count}개`;
    else if (ex.unitType === "count") unitDisplay = `${ex.count}회`;
    else if (ex.unitType === "time") unitDisplay = `${ex.workTime}초`;

    app.innerHTML = `
        <div class="container">
            <div class="top-progress">종목 진행 (${currentExIdx + 1}/${exercises.length})</div>
            <div class="exercise-image-area">
                <span style="color:#aaa;">[ ${ex.name} 가이드 ]</span>
            </div>
            <h1 style="font-size: 50px; margin: 10px 0;">${ex.name}</h1>
            <h2 style="color: #007bff; margin-bottom: 10px;">Set ${currentSet} / ${ex.sets}</h2>
            <p style="font-size: 24px; color: #555; margin-bottom: 30px;">목표: ${unitDisplay}</p>
            <button class="wide-blue-btn" onclick="handleSetComplete()">
                ${currentSet === ex.sets ? "종목 완료" : "세트 완료"}
            </button>
        </div>
    `;
}

function handleSetComplete() {
    const ex = exercises[currentExIdx];
    
    // 기록 저장 (현재 세트 정보 저장)
    let record = "";
    if (ex.unitType === "weight") record = `${ex.weight}kg x ${ex.count}개`;
    else if (ex.unitType === "count") record = `${ex.count}회`;
    else if (ex.unitType === "time") record = `${ex.workTime}초`;
    
    workoutHistory.push({ name: ex.name, set: currentSet, result: record });

    if (currentSet < ex.sets) {
        currentSet++;
        startRest(false); 
    } else {
        currentSet = 1;
        startRest(true); 
    }
}

function startRest(isNextEx) {
    let timeLeft = isNextEx ? 30 : (exercises[currentExIdx].restTime || 20);
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
        if (timeLeft <= 0) { clearInterval(timer); goNext(); } 
        else { renderRestUI(timeLeft); }
    }, 1000);

    const goNext = () => {
        clearInterval(timer);
        if (isNextEx) {
            currentExIdx++;
            if (currentExIdx < exercises.length) renderExercise();
            else renderReport(); // 모든 종목 종료 시 리포트 화면으로
        } else {
            renderExercise();
        }
    };
    window.skipRest = goNext;
}

// 최종 운동 결과 화면 (Report)
function renderReport() {
    // 종목별로 묶어서 요약
    const summary = exercises.map(ex => {
        const setsDone = workoutHistory.filter(h => h.name === ex.name).length;
        let unit = "";
        if (ex.unitType === "weight") unit = `${ex.weight}kg x ${ex.count}개`;
        else if (ex.unitType === "count") unit = `${ex.count}회`;
        else if (ex.unitType === "time") unit = `${ex.workTime}초`;
        return `<div style="margin-bottom:15px; text-align:left; width:100%; border-bottom:1px solid #eee; padding-bottom:5px;">
                    <strong style="font-size:20px;">${ex.name}</strong><br>
                    <span style="color:#007bff;">${setsDone}세트 완료</span> (${unit})
                </div>`;
    }).join('');

    app.innerHTML = `
        <div class="container" style="justify-content: flex-start; padding-top: 50px; overflow-y: auto;">
            <h1 style="margin-bottom: 30px;">🏆 오늘의 운동 결과</h1>
            <div style="width: 100%; margin-bottom: 40px;">
                ${summary}
            </div>
            <button class="wide-blue-btn" onclick="finishWorkout()">오늘의 운동 완료하기</button>
        </div>
    `;
}

function finishWorkout() {
    alert("수고하셨습니다! 메인으로 돌아갑니다.");
    location.reload(); 
}

function startWorkout() { renderExercise(); }
function renderSetup() { app.innerHTML = `<div class="container"><h1>반가워요!</h1><button class="wide-blue-btn" onclick="saveBasic()">루틴 생성</button></div>`; }
function saveBasic() { localStorage.setItem('my_workout_routine', JSON.stringify({name:"기본 루틴"})); location.reload(); }

init();
