const savedData = localStorage.getItem('my_workout_routine');
const workoutData = savedData ? JSON.parse(savedData) : { name: "기본 루틴", level: "intermediate" }; 
const app = document.getElementById('app');

let currentExIdx = 0;   
let currentSet = 1;     
let workoutHistory = []; 

const exercises = [
    { name: "벤치프레스", type: "count", unitType: "weight", weight: 40, count: 12, sets: 3, lastUpdate: "2026-01-27" },
    { name: "복근운동", type: "tempo", goalCount: 30, sets: 3, restTime: 60 },
    { name: "스쿼트", type: "time", unitType: "time", workTime: 40, restTime: 20, sets: 4 }
];

function init() {
    applyProgression(); 
    if (workoutData) renderMain();
    else renderSetup();
}

// 중급자용 2주 5kg 자동 증량 로직
function applyProgression() {
    if (workoutData.level !== "intermediate") return;
    const today = new Date();
    exercises.forEach(ex => {
        if (ex.unitType === "weight" && ex.lastUpdate) {
            const lastDate = new Date(ex.lastUpdate);
            const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
            if (diffDays >= 14) {
                ex.weight += 5;
                ex.lastUpdate = today.toISOString().split('T')[0];
            }
        }
    });
}

function getFullLayout(contentHTML, btnHTML) {
    return `
        <div class="header-area">
            <button class="header-btn" onclick="toggleModal(true)">순서 확인</button>
            <span style="font-weight:bold; color:#333;">종목 (${currentExIdx + 1}/${exercises.length})</span>
            <button class="header-btn exit-btn" onclick="renderReport()">운동 종료</button>
        </div>
        <div class="main-content">${contentHTML}</div>
        <div class="action-area">${btnHTML}</div>
    `;
}

function renderExercise() {
    const ex = exercises[currentExIdx];
    let controlHTML = "";

    if (ex.unitType === "weight") {
        controlHTML = `
            <div class="stepper-container">
                <div class="step-box">
                    <button class="step-btn" onclick="adjVal('weight', 5)">▲</button>
                    <input type="number" class="step-input" value="${ex.weight}" onchange="exercises[currentExIdx].weight=Number(this.value)">
                    <button class="step-btn" onclick="adjVal('weight', -5)">▼</button>
                    <span style="font-size:12px; color:#888;">무게(kg)</span>
                </div>
                <div class="step-box">
                    <button class="step-btn" onclick="adjVal('count', 1)">▲</button>
                    <input type="number" class="step-input" value="${ex.count}" onchange="exercises[currentExIdx].count=Number(this.value)">
                    <button class="step-btn" onclick="adjVal('count', -1)">▼</button>
                    <span style="font-size:12px; color:#888;">횟수(개)</span>
                </div>
            </div>
        `;
    }

    const content = `
        <div class="exercise-image-area"><span>[ ${ex.name} 가이드 ]</span></div>
        <h1 style="font-size: 36px; margin: 0;">${ex.name}</h1>
        <h2 style="color: #007bff;">Set ${currentSet} / ${ex.sets}</h2>
        ${controlHTML}
    `;
    const btnText = currentSet === ex.sets ? "종목 완료" : "세트 완료";
    const btn = `
        <button class="wide-blue-btn" onclick="handleSetComplete()">${btnText}</button>
        <button class="skip-ex-btn" onclick="moveToNext(true)">이 세트 건너뛰기</button>
    `;
    app.innerHTML = getFullLayout(content, btn);
}

function adjVal(field, amount) {
    exercises[currentExIdx][field] = Math.max(0, exercises[currentExIdx][field] + amount);
    renderExercise();
}

function handleSetComplete() {
    workoutHistory.push({ name: exercises[currentExIdx].name, status: "completed" });
    moveToNext(false);
}

function moveToNext(isSkip) {
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
    let timeLeft = isNextEx ? 30 : (exercises[currentExIdx].restTime || 20);
    const nextName = isNextEx ? (exercises[currentExIdx + 1]?.name || "종료") : exercises[currentExIdx].name;

    const timerUI = () => {
        app.innerHTML = getFullLayout(`
            <div class="exercise-image-area"><span>[ 휴식 ]</span></div>
            <h2 style="color:#adb5bd;">휴식 시간 클릭하여 수정</h2>
            <input type="number" class="rest-input" value="${timeLeft}" onchange="timeLeft=Number(this.value)">
            <p style="font-size:20px; margin-top:20px;">다음: <strong>${nextName}</strong></p>
        `, `<button class="wide-blue-btn" onclick="skipRest()">휴식 건너뛰기</button>`);
    };

    timerUI();
    const timer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) { clearInterval(timer); goNext(); }
        else timerUI();
    }, 1000);

    const goNext = () => {
        clearInterval(timer);
        if (isNextEx) { currentExIdx++; renderExercise(); }
        else renderExercise();
    };
    window.skipRest = goNext;
}

init();
