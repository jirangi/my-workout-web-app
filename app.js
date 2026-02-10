const savedData = localStorage.getItem('my_workout_routine');
const workoutData = savedData ? JSON.parse(savedData) : null;
const app = document.getElementById('app');

let currentExIdx = 0;   
let currentSet = 1;     
let workoutHistory = []; 

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

function getLayoutHTML(topText, contentHTML, btnHTML) {
    return `
        <div class="header-area">
            <div class="top-progress-text">${topText}</div>
        </div>
        <div class="container">
            <div class="main-content">
                ${contentHTML}
            </div>
            <div class="action-area">
                ${btnHTML}
            </div>
        </div>
    `;
}

function renderMain() {
    const content = `<h1>오늘의 루틴</h1><p style="font-size: 22px;"><strong>${workoutData.name}</strong></p>`;
    const btn = `<button class="wide-blue-btn" onclick="startWorkout()">운동 시작</button>`;
    app.innerHTML = getLayoutHTML("Ready", content, btn);
}

function renderExercise() {
    const ex = exercises[currentExIdx];
    let unitDisplay = ex.unitType === "weight" ? `${ex.weight}kg x ${ex.count}개` : 
                      ex.unitType === "count" ? `${ex.count}회` : `${ex.workTime}초`;

    const content = `
        <div class="exercise-image-area"><span>[ ${ex.name} 가이드 ]</span></div>
        <h1 style="font-size: 48px; margin: 10px 0;">${ex.name}</h1>
        <h2 style="color: #007bff; margin-bottom: 10px;">Set ${currentSet} / ${ex.sets}</h2>
        <p style="font-size: 24px; color: #555;">목표: ${unitDisplay}</p>
    `;
    const btnText = currentSet === ex.sets ? "종목 완료" : "세트 완료";
    const btn = `<button class="wide-blue-btn" onclick="handleSetComplete()">${btnText}</button>`;
    
    app.innerHTML = getLayoutHTML(`종목 진행 (${currentExIdx + 1}/${exercises.length})`, content, btn);
}

function handleSetComplete() {
    const ex = exercises[currentExIdx];
    let record = ex.unitType === "weight" ? `${ex.weight}kg x ${ex.count}개` : 
                 ex.unitType === "count" ? `${ex.count}회` : `${ex.workTime}초`;
    
    workoutHistory.push({ name: ex.name, set: currentSet, result: record });

    if (currentSet < ex.sets) { currentSet++; startRest(false); } 
    else { currentSet = 1; startRest(true); }
}

// 휴식 로직 수정 (이미지 가이드 유지 기능 추가)
function startRest(isNextEx) {
    let timeLeft = isNextEx ? 30 : (exercises[currentExIdx].restTime || 20);
    
    // 다음에 할 운동 정보 가져오기 (세트 반복 시 현재운동, 종목 전환 시 다음운동)
    const nextExObj = isNextEx ? exercises[currentExIdx + 1] : exercises[currentExIdx];
    const nextName = nextExObj ? nextExObj.name : "종료";

    const runTimer = () => {
        // 휴식 중에도 이미지 영역을 유지하고 다음 운동 가이드를 표시
        const content = `
            <div class="exercise-image-area" style="opacity: 0.7;">
                <span>[ ${nextName} 가이드 ]</span>
            </div>
            <h2 style="color:#adb5bd; margin: 0;">휴식 중...</h2>
            <h1 style="font-size: 90px; margin: 10px 0;">${timeLeft}s</h1>
            <p style="font-size: 22px;">다음: <strong>${nextName}</strong> ${isNextEx ? "" : "(다음 세트)"}</p>
        `;
        const btn = `<button class="wide-blue-btn" onclick="skipRest()">휴식 건너뛰기</button>`;
        app.innerHTML = getLayoutHTML(`종목 진행 (${currentExIdx + 1}/${exercises.length})`, content, btn);
    };

    runTimer();
    const timer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) { clearInterval(timer); goNext(); } 
        else { runTimer(); }
    }, 1000);

    const goNext = () => {
        clearInterval(timer);
        if (isNextEx) {
            currentExIdx++;
            if (currentExIdx < exercises.length) renderExercise();
            else renderReport();
        } else { renderExercise(); }
    };
    window.skipRest = goNext;
}

function renderReport() {
    const summary = exercises.map(ex => {
        const setsDone = workoutHistory.filter(h => h.name === ex.name).length;
        let unit = ex.unitType === "weight" ? `${ex.weight}kg x ${ex.count}개` : 
                   ex.unitType === "count" ? `${ex.count}회` : `${ex.workTime}초`;
        return `<div style="margin-bottom:15px; text-align:left; border-bottom:1px solid #eee; padding-bottom:5px;">
                    <strong style="font-size:20px;">${ex.name}</strong><br>
                    <span style="color:#007bff;">${setsDone}세트 완료</span> (${unit})
                </div>`;
    }).join('');

    const content = `<h1 style="margin-bottom: 10px;">🏆 운동 결과</h1><div class="report-list">${summary}</div>`;
    const btn = `<button class="wide-blue-btn" onclick="location.reload()">오늘의 운동 완료하기</button>`;
    
    app.innerHTML = getLayoutHTML("Finished", content, btn);
}

function startWorkout() { renderExercise(); }
function renderSetup() { app.innerHTML = `<div class="container"><h1>반가워요!</h1><button class="wide-blue-btn" onclick="saveBasic()">루틴 생성</button></div>`; }
function saveBasic() { localStorage.setItem('my_workout_routine', JSON.stringify({name:"기본 루틴"})); location.reload(); }

init();
