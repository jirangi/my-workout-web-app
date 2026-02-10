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
    if (workoutData) renderMain();
    else renderSetup();
}

// 레이아웃 엔진: 광고 영역 제거 및 종료 버튼 상시 포함
function getFullLayout(topText, contentHTML, btnHTML) {
    return `
        <div class="header-area">
            <span style="color:#888;">${topText}</span>
            <button class="exit-btn" onclick="renderReport()">운동 종료</button>
        </div>
        <div class="main-content">
            ${contentHTML}
        </div>
        <div class="action-area">
            ${btnHTML}
        </div>
    `;
}

function renderMain() {
    const content = `<h1 style="margin-top:100px;">오늘의 루틴</h1><p style="font-size:20px;">${workoutData.name}</p>`;
    const btn = `<button class="wide-blue-btn" onclick="renderExercise()">운동 시작</button>`;
    app.innerHTML = getFullLayout("Ready", content, btn);
}

function renderExercise() {
    const ex = exercises[currentExIdx];
    let unit = ex.unitType === "weight" ? `${ex.weight}kg x ${ex.count}개` : 
               ex.unitType === "count" ? `${ex.count}회` : `${ex.workTime}초`;

    const content = `
        <div class="exercise-image-area"><span>[ ${ex.name} 가이드 이미지 ]</span></div>
        <h1 style="font-size: 40px; margin: 0;">${ex.name}</h1>
        <h2 style="color: #007bff;">Set ${currentSet} / ${ex.sets}</h2>
        <p style="font-size: 20px; color: #666;">목표: ${unit}</p>
    `;
    const btnText = currentSet === ex.sets ? "종목 완료" : "세트 완료";
    const btn = `<button class="wide-blue-btn" onclick="handleSetComplete()">${btnText}</button>`;
    
    app.innerHTML = getFullLayout(`종목 (${currentExIdx + 1}/${exercises.length})`, content, btn);
}

function handleSetComplete() {
    const ex = exercises[currentExIdx];
    let record = ex.unitType === "weight" ? `${ex.weight}kg x ${ex.count}개` : 
                 ex.unitType === "count" ? `${ex.count}회` : `${ex.workTime}초`;
    
    workoutHistory.push({ name: ex.name, result: record });

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

    // 전면 광고 송출 가상 함수 호출 (추후 여기에 AdMob 등 SDK 연결)
    console.log("휴식 시간: 전면 광고 송출을 준비합니다.");

    const timerFunc = () => {
        const content = `
            <div class="exercise-image-area"><span>[ 휴식 중 ]</span></div>
            <h2 style="color:#adb5bd;">휴식 중...</h2>
            <h1 style="font-size: 80px; margin: 10px 0;">${timeLeft}s</h1>
            <p>다음: <strong>${nextName}</strong></p>
        `;
        const btn = `<button class="wide-blue-btn" onclick="skipRest()">휴식 건너뛰기</button>`;
        app.innerHTML = getFullLayout(`진행 중`, content, btn); 
    };

    timerFunc();
    const timer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) { clearInterval(timer); goNext(); }
        else timerFunc();
    }, 1000);

    const goNext = () => {
        clearInterval(timer);
        if (isNextEx) {
            currentExIdx++;
            if (currentExIdx < exercises.length) renderExercise();
            else renderReport();
        } else renderExercise();
    };
    window.skipRest = goNext;
}

function renderReport() {
    const summary = exercises.map(ex => {
        const setsDone = workoutHistory.filter(h => h.name === ex.name).length;
        if (setsDone === 0) return '';
        return `<div style="text-align:left; border-bottom:1px solid #eee; padding:10px 0;">
                    <strong>${ex.name}</strong>: <span style="color:#007bff;">${setsDone}세트 완료</span>
                </div>`;
    }).join('');

    const content = `<h1>🏆 운동 리포트</h1><div style="width:100%; overflow-y:auto;">${summary || '수행한 운동이 없습니다.'}</div>`;
    const btn = `<button class="wide-blue-btn" onclick="location.reload()">오늘의 운동 완료하기</button>`;
    app.innerHTML = getFullLayout("Result", content, btn);
}

function saveBasic() {
    localStorage.setItem('my_workout_routine', JSON.stringify({name:"기본 루틴"}));
    location.reload();
}

init();
