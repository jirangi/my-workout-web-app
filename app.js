// 1. 초기 데이터 및 운동 데이터베이스 설정
const savedData = localStorage.getItem('my_workout_routine');
const workoutData = savedData ? JSON.parse(savedData) : { name: "기본 루틴", level: "intermediate" }; 
const app = document.getElementById('app');

let currentExIdx = 0;   
let currentSet = 1;     
let workoutHistory = []; 

// 박자 관련 상태 변수
let tempo = 1.0; 
let currentBeat = 0; 
let currentCount = 0; 
let tempoTimer = null;

// 운동 데이터베이스 (부위별 분류)
const exerciseDB = {
    "하체": {
        "대퇴사두": ["스쿼트", "레그 프레스", "레그 익스텐션"],
        "대퇴이두": ["스티프 데드리프트", "레그 컬"],
        "종아리": ["카프 레이즈"],
        "둔근": ["힙 쓰러스트", "아웃타이"]
    },
    "가슴": {
        "상부": ["인클라인 벤치프레스", "인클라인 덤벨 프레스"],
        "중부": ["벤치프레스", "체스트 프레스", "덤벨 플라이"],
        "하부": ["딥스", "디클라인 프레스"]
    },
    "등": {
        "광배근": ["렛풀다운", "원암 덤벨 로우"],
        "승모근/두께": ["바벨 로우", "시티드 로우"],
        "기립근": ["데드리프트", "백 익스텐션"]
    },
    "어깨": {
        "전면": ["밀리터리 프레스", "덤벨 숄더 프레스"],
        "측면": ["사이드 레터럴 레이즈"],
        "후면": ["벤트오버 레터럴 레이즈", "페이스 풀"]
    },
    "이두": { "장두/단두": ["바벨 컬", "덤벨 컬", "해머 컬"] },
    "삼두": { "내측/외측/장두": ["푸쉬다운", "라잉 트라이셉스 익스텐션", "딥스"] },
    "복근": { "상/하복부/외복사근": ["크런치", "레그 레이즈", "플랭크", "바이시클 크런치"] }
};

// 현재 사용자의 활성 루틴
let exercises = [
    { name: "벤치프레스", category: "가슴", detail: "중부", type: "count", unitType: "weight", weight: 40, count: 12, sets: 3, lastUpdate: "2026-01-27" },
    { name: "복근운동", category: "복근", detail: "상/하복부", type: "tempo", goalCount: 30, sets: 3, restTime: 60 },
    { name: "스쿼트", category: "하체", detail: "대퇴사두", type: "time", unitType: "time", workTime: 40, restTime: 20, sets: 4 }
];

function init() {
    applyProgression(); 
    if (workoutData) renderMain();
    else renderSetup();
}

// 2주마다 5kg 자동 증량 (중급자 전용)
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
    const totalEx = exercises.length;
    return `
        <div class="header-area">
            <button class="header-btn" onclick="toggleModal(true)">순서 확인</button>
            <span style="font-weight:bold; color:#333;">종목 (${currentExIdx + 1}/${totalEx})</span>
            <button class="header-btn exit-btn" onclick="renderReport()">운동 종료</button>
        </div>
        <div class="main-content">${contentHTML}</div>
        <div class="action-area">${btnHTML}</div>
    `;
}

function renderMain() {
    const content = `<h1 style="margin-top:100px;">오늘의 루틴</h1><p style="font-size:20px;">${workoutData.name}</p>`;
    const btn = `<button class="wide-blue-btn" onclick="renderExercise()">운동 시작</button>`;
    app.innerHTML = getFullLayout(content, btn);
}

function renderExercise() {
    const ex = exercises[currentExIdx];
    if (ex.type === "tempo") return renderTempoExercise();

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
        <p style="color:#888; margin:0;">${ex.category} > ${ex.detail}</p>
        <h1 style="font-size: 36px; margin: 5px 0;">${ex.name}</h1>
        <h2 style="color: #007bff;">Set ${currentSet} / ${ex.sets}</h2>
        ${controlHTML}
    `;
    const btnText = currentSet === ex.sets ? "종목 완료" : "세트 완료";
    app.innerHTML = getFullLayout(content, `
        <button class="wide-blue-btn" onclick="handleSetComplete()">${btnText}</button>
        <button class="skip-ex-btn" onclick="moveToNext(true)">이 세트 건너뛰기</button>
    `);
}

function renderTempoExercise() {
    const ex = exercises[currentExIdx];
    const content = `
        <div class="exercise-image-area"><span id="beatDisplay" style="font-size:40px; font-weight:900; color:#ff4757;">Ready!</span></div>
        <h1 style="font-size: 40px; margin: 0;">${ex.name}</h1>
        <h2 style="color: #007bff;">Set ${currentSet} / ${ex.sets}</h2>
        <div class="tempo-controller" style="display:flex; flex-direction:column; align-items:center; margin:10px 0;">
            <button class="tempo-btn" onclick="adjustTempo(-0.1)" style="font-size:30px; color:#007bff; background:none; border:none;">▲</button>
            <div class="tempo-value" id="tempoVal" style="font-size:24px; font-weight:bold;">${tempo.toFixed(1)}s</div>
            <button class="tempo-btn" onclick="adjustTempo(0.1)" style="font-size:30px; color:#007bff; background:none; border:none;">▼</button>
        </div>
        <h1 style="font-size: 60px;" id="countDisplay">(${currentCount}/${ex.goalCount})</h1>
    `;
    app.innerHTML = getFullLayout(content, `<button class="wide-blue-btn" id="tempoActionBtn" onclick="startTempoCounter()">카운트 시작</button>`);
}

function adjustTempo(val) {
    tempo = Math.max(0.1, Math.min(5.0, tempo + val));
    document.getElementById('tempoVal').innerText = `${tempo.toFixed(1)}s`;
    if (tempoTimer) { clearInterval(tempoTimer); startTempoCounter(true); }
}

function startTempoCounter(isResumed = false) {
    const ex = exercises[currentExIdx];
    document.getElementById('tempoActionBtn').style.display = 'none';
    if (!isResumed) { currentCount = 0; currentBeat = 0; }
    tempoTimer = setInterval(() => {
        const text = currentBeat === 0 ? "One" : "Two";
        document.getElementById('beatDisplay').innerText = text;
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-US'; utter.rate = 1.5; window.speechSynthesis.speak(utter);
        if (currentBeat === 1) {
            currentCount++;
            document.getElementById('countDisplay').innerText = `(${currentCount}/${ex.goalCount})`;
            if (currentCount >= ex.goalCount) { clearInterval(tempoTimer); handleSetComplete(); }
        }
        currentBeat = (currentBeat === 0) ? 1 : 0;
    }, tempo * 1000);
}

function adjVal(field, amount) {
    exercises[currentExIdx][field] = Math.max(0, exercises[currentExIdx][field] + amount);
    renderExercise();
}

function handleSetComplete() {
    if (tempoTimer) clearInterval(tempoTimer);
    workoutHistory.push({ name: exercises[currentExIdx].name, status: "completed" });
    moveToNext();
}

function moveToNext() {
    const ex = exercises[currentExIdx];
    if (currentSet < ex.sets) { currentSet++; startRest(false); }
    else { currentSet = 1; startRest(true); }
}

function startRest(isNextEx) {
    let timeLeft = isNextEx ? 30 : (exercises[currentExIdx].restTime || 20);
    const nextName = isNextEx ? (exercises[currentExIdx + 1]?.name || "종료") : exercises[currentExIdx].name;
    const timerUI = () => {
        app.innerHTML = getFullLayout(`
            <div class="exercise-image-area"><span>[ 휴식 ]</span></div>
            <h2 style="color:#adb5bd;">휴식 시간 클릭하여 수정</h2>
            <input type="number" class="rest-input" value="${timeLeft}" onchange="timeLeft=Number(this.value)" style="font-size:80px; text-align:center; width:180px; border:none; border-bottom:2px dashed #007bff;">
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
        if (isNextEx) { currentExIdx++; if(currentExIdx < exercises.length) renderExercise(); else renderReport(); }
        else renderExercise();
    };
    window.skipRest = goNext;
}

function renderReport() {
    const summary = exercises.map(ex => {
        const setsDone = workoutHistory.filter(h => h.name === ex.name).length;
        return setsDone > 0 ? `<div style="text-align:left; border-bottom:1px solid #eee; padding:10px 0;"><strong>${ex.name}</strong>: <span style="color:#007bff;">${setsDone}세트 완료</span></div>` : '';
    }).join('');
    app.innerHTML = `<div class="header-area" style="justify-content:center;"><span style="font-weight:bold;">운동 종료</span></div><div class="main-content"><h1>🏆 리포트</h1>${summary}</div><div class="action-area"><button class="wide-blue-btn" onclick="location.reload()">완료</button></div>`;
}

function toggleModal(show) {
    const modal = document.getElementById('routineModal');
    if (show) {
        document.getElementById('modalList').innerHTML = exercises.map((ex, idx) => `<div style="display:flex; justify-content:space-between; padding:10px 0; ${idx === currentExIdx ? 'color:#007bff; font-weight:bold;' : ''}"><span>${idx + 1}. ${ex.name}</span><span>${ex.sets}세트</span></div>`).join('');
        modal.style.display = 'flex';
    } else modal.style.display = 'none';
}

function saveBasic() { localStorage.setItem('my_workout_routine', JSON.stringify({name:"기본 루틴", level: "intermediate"})); location.reload(); }
function renderSetup() { app.innerHTML = `<div class="container" style="height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center;"><h1>반가워요!</h1><button class="wide-blue-btn" onclick="saveBasic()">루틴 생성</button></div>`; }

init();
