const savedData = localStorage.getItem('my_workout_routine');
const workoutData = savedData ? JSON.parse(savedData) : { name: "기본 루틴", level: "intermediate" }; 
const app = document.getElementById('app');

let currentExIdx = 0;   
let currentSet = 1;     
let isEditing = false;
let workoutHistory = [];

let exercises = [
    { name: "벤치프레스", unitType: "weight", weight: 40, count: 12, time: 40, sets: 3 },
    { name: "복근운동", unitType: "count", weight: 0, count: 30, time: 0, sets: 3 },
    { name: "스쿼트", unitType: "time", weight: 0, count: 15, time: 40, sets: 4 }
];

function init() { renderExercise(); }

function getFullLayout(contentHTML, btnHTML) {
    return `
        <div class="header-area" style="height:60px; display:flex; align-items:center; justify-content:space-between; padding:0 15px; border-bottom:1px solid #eee;">
            <button class="header-btn" onclick="toggleModal(true)">순서 확인</button>
            <span style="font-weight:bold;">종목 (${currentExIdx + 1}/${exercises.length})</span>
            <button class="header-btn exit-btn" style="background:#ff4757; color:white; border:none; padding:5px 10px; border-radius:5px;" onclick="renderReport()">종료</button>
        </div>
        <div class="main-content" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px;" onclick="if(isEditing) toggleEdit()">
            ${contentHTML}
        </div>
        <div class="action-area" style="padding:20px;">
            ${btnHTML}
        </div>
    `;
}

function renderExercise() {
    const ex = exercises[currentExIdx];
    
    const modeTabs = `
        <div class="mode-tab-container">
            <div class="mode-tab ${ex.unitType==='weight'?'active':''}" onclick="changeMode('weight', event)">무게+횟수</div>
            <div class="mode-tab ${ex.unitType==='count'?'active':''}" onclick="changeMode('count', event)">횟수</div>
            <div class="mode-tab ${ex.unitType==='time'?'active':''}" onclick="changeMode('time', event)">시간</div>
        </div>
    `;

    let editorHTML = "";
    if (!isEditing) {
        let text = ex.unitType === 'weight' ? `${ex.weight}kg x ${ex.count}개` : ex.unitType === 'count' ? `${ex.count}회` : `${ex.time}초`;
        editorHTML = `<div class="big-value" onclick="toggleEdit(event)">${text}</div>`;
    } else {
        editorHTML = `<div style="display:flex; gap:30px;" onclick="event.stopPropagation()">
            ${ex.unitType !== 'time' ? `
                <div class="big-stepper">
                    <button class="arrow-btn" onclick="adj('weight', 5)">▲</button>
                    <div style="font-size:30px; font-weight:bold;">${ex.weight}kg</div>
                    <button class="arrow-btn" onclick="adj('weight', -5)">▼</button>
                </div>
                <div class="big-stepper">
                    <button class="arrow-btn" onclick="adj('count', 1)">▲</button>
                    <div style="font-size:30px; font-weight:bold;">${ex.count}개</div>
                    <button class="arrow-btn" onclick="adj('count', -1)">▼</button>
                </div>` 
            : `<div class="big-stepper">
                    <button class="arrow-btn" onclick="adj('time', 1)">▲</button>
                    <div style="font-size:30px; font-weight:bold;">${ex.time}초</div>
                    <button class="arrow-btn" onclick="adj('time', -1)">▼</button>
               </div>`}
        </div>`;
    }

    const content = `
        <div class="exercise-image-area" style="width:100%; height:200px; background:#f8f9fa; border-radius:15px; display:flex; align-items:center; justify-content:center; margin-bottom:10px;">
            [ ${ex.name} 가이드 ]
        </div>
        ${modeTabs}
        <h1 style="margin:5px 0;">${ex.name}</h1>
        <h2 style="color:#888;">Set ${currentSet} / ${ex.sets}</h2>
        ${editorHTML}
    `;

    const btn = `
        <button class="wide-blue-btn" onclick="handleSetComplete()" style="width:100%; height:90px; background:#007bff; color:white; border:none; border-radius:15px; font-size:24px; font-weight:bold; cursor:pointer; margin-bottom:10px;">
            ${currentSet === ex.sets ? "종목 완료" : "세트 완료"}
        </button>
        <button class="skip-ex-btn" onclick="moveToNext()" style="width:100%; height:50px; background:#eee; border:none; border-radius:10px; font-size:16px; cursor:pointer; width:100%;">이 세트 건너뛰기</button>
    `;

    app.innerHTML = getFullLayout(content, btn);
}

function adj(field, val) {
    exercises[currentExIdx][field] = Math.max(0, exercises[currentExIdx][field] + val);
    renderExercise();
}

function changeMode(mode, e) {
    e.stopPropagation();
    exercises[currentExIdx].unitType = mode;
    isEditing = true;
    renderExercise();
}

function toggleEdit(e) {
    if(e) e.stopPropagation();
    isEditing = !isEditing;
    renderExercise();
}

function handleSetComplete() {
    isEditing = false;
    const ex = exercises[currentExIdx];
    if (currentSet < ex.sets) { currentSet++; startRest(false); } 
    else { currentSet = 1; startRest(true); }
}

function startRest(isNextEx) {
    let timeLeft = 20;
    const nextName = isNextEx ? (exercises[currentExIdx+1]?.name || "종료") : exercises[currentExIdx].name;
    const timer = setInterval(() => {
        timeLeft--;
        if(timeLeft <= 0) { clearInterval(timer); goNext(); }
        else {
            app.innerHTML = getFullLayout(`
                <h2 style="color:#adb5bd;">휴식 중...</h2>
                <h1 style="font-size:100px; margin:20px 0;">${timeLeft}s</h1>
                <p>다음: <strong>${nextName}</strong></p>
            `, `<button class="wide-blue-btn" onclick="window.skipRest()" style="width:100%; height:90px; background:#007bff; color:white; border:none; border-radius:15px; font-size:24px; font-weight:bold;">휴식 건너뛰기</button>`);
        }
    }, 1000);
    const goNext = () => { clearInterval(timer); if(isNextEx) { currentExIdx++; if(currentExIdx < exercises.length) renderExercise(); else renderReport(); } else renderExercise(); };
    window.skipRest = goNext;
}

function renderReport() { app.innerHTML = `<div style="text-align:center; padding-top:100px;"><h1>🎉 오운완!</h1><button class="wide-blue-btn" onclick="location.reload()" style="width:80%; height:80px; background:#007bff; color:white; border-radius:15px; border:none; font-size:20px;">메인으로</button></div>`; }

init();
