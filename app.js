const savedData = localStorage.getItem('my_workout_routine');
const workoutData = savedData ? JSON.parse(savedData) : { name: "기본 루틴", level: "intermediate" }; 
const app = document.getElementById('app');

let currentExIdx = 0;   
let currentSet = 1;     
let isEditing = false; // 편집 모드 상태

// 운동 데이터베이스 확장
let exercises = [
    { name: "벤치프레스", unitType: "weight", weight: 40, count: 12, time: 0, sets: 3 },
    { name: "복근운동", unitType: "count", weight: 0, count: 30, time: 0, sets: 3 },
    { name: "스쿼트", unitType: "time", weight: 0, count: 0, time: 40, sets: 4 }
];

function init() {
    if (workoutData) renderExercise();
    else renderSetup();
}

function getFullLayout(contentHTML, btnHTML) {
    return `
        <div class="header-area">
            <button class="header-btn" onclick="toggleModal(true)">순서 확인</button>
            <span style="font-weight:bold;">종목 (${currentExIdx + 1}/${exercises.length})</span>
            <button class="header-btn exit-btn" onclick="renderReport()">운동 종료</button>
        </div>
        <div class="main-content">${contentHTML}</div>
        <div class="action-area">${btnHTML}</div>
    `;
}

function renderExercise() {
    const ex = exercises[currentExIdx];
    
    // 모드 전환 탭 HTML
    const modeTabs = `
        <div class="mode-tab-container">
            <div class="mode-tab ${ex.unitType==='weight'?'active':''}" onclick="changeMode('weight')">무게+횟수</div>
            <div class="mode-tab ${ex.unitType==='count'?'active':''}" onclick="changeMode('count')">횟수</div>
            <div class="mode-tab ${ex.unitType==='time'?'active':''}" onclick="changeMode('time')">시간</div>
        </div>
    `;

    // 값 표시 영역 (클릭 시 편집모드 활성화)
    let displayHTML = "";
    if (ex.unitType === 'weight') {
        displayHTML = `<div class="display-value" onclick="toggleEdit()">${ex.weight}kg x ${ex.count}개</div>`;
    } else if (ex.unitType === 'count') {
        displayHTML = `<div class="display-value" onclick="toggleEdit()">${ex.count}회</div>`;
    } else {
        displayHTML = `<div class="display-value" onclick="toggleEdit()">${ex.time}초</div>`;
    }

    // 편집 UI (스텝퍼)
    const editUI = `
        <div class="edit-container" style="display: ${isEditing ? 'flex' : 'none'};">
            ${ex.unitType === 'weight' ? `
                <div style="display:flex; gap:20px;">
                    <div>▲<br><input type="number" value="${ex.weight}" onchange="updateVal('weight', this.value)"><br>▼</div>
                    <div>▲<br><input type="number" value="${ex.count}" onchange="updateVal('count', this.value)"><br>▼</div>
                </div>
            ` : `<input type="number" value="${ex.unitType==='count'?ex.count:ex.time}" onchange="updateVal('${ex.unitType}', this.value)">`}
            <button onclick="toggleEdit()" style="margin-top:10px;">확인</button>
        </div>
    `;

    const content = `
        <div class="exercise-image-area" style="height:250px; background:#eee; width:100%; display:flex; align-items:center; justify-content:center;">
            <span>[ ${ex.name} 가이드 ]</span>
        </div>
        ${modeTabs}
        <h1 style="margin:10px 0;">${ex.name}</h1>
        <h2 style="color:#007bff;">Set ${currentSet} / ${ex.sets}</h2>
        ${displayHTML}
        ${editUI}
    `;

    const btn = `
        <button class="wide-blue-btn" onclick="handleSetComplete()">${currentSet === ex.sets ? "종목 완료" : "세트 완료"}</button>
        <button class="skip-ex-btn" onclick="moveToNext()">이 세트 건너뛰기</button>
    `;

    app.innerHTML = getFullLayout(content, btn);
}

function toggleEdit() { isEditing = !isEditing; renderExercise(); }

function updateVal(type, val) {
    const ex = exercises[currentExIdx];
    ex[type] = Number(val);
    // 현재 수정한 값이 모든 세트에 적용되도록 함 (별도 세트별 저장 로직 없을 시 자동 공유)
    renderExercise();
}

function changeMode(newMode) {
    exercises[currentExIdx].unitType = newMode;
    isEditing = false;
    renderExercise();
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

// ... 중략 (startRest, renderReport 등 기존 로직 유지) ...

init();
