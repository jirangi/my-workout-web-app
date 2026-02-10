const savedData = localStorage.getItem('my_workout_routine');
const workoutData = savedData ? JSON.parse(savedData) : null;
const app = document.getElementById('app');

let currentExIdx = 0;   
let currentSet = 1;     
let workoutHistory = []; 

// 박자 관련 상태 변수
let tempo = 1.0; // 기본 1초
let currentBeat = 0; // 0: One, 1: Two
let currentCount = 0; // 현재 수행 개수
let tempoTimer = null;

const exercises = [
    { name: "복근운동", type: "tempo", goalCount: 30, sets: 3, restTime: 60 },
    { name: "벤치프레스", type: "count", unitType: "weight", weight: 40, count: 12, sets: 3 },
    { name: "스쿼트", type: "time", unitType: "time", workTime: 40, restTime: 20, sets: 4 }
];

function init() {
    if (workoutData) renderMain();
    else renderSetup();
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

function renderExercise() {
    const ex = exercises[currentExIdx];
    
    // 일반 운동과 박자 운동(tempo) 구분 렌더링
    if (ex.type === "tempo") {
        renderTempoExercise();
    } else {
        renderStandardExercise();
    }
}

// [박자 운동 전용 화면]
function renderTempoExercise() {
    const ex = exercises[currentExIdx];
    const content = `
        <div class="exercise-image-area"><span id="beatDisplay" class="beat-text">Ready!</span></div>
        <h1 style="font-size: 40px; margin: 0;">${ex.name}</h1>
        <h2 style="color: #007bff; margin-bottom: 5px;">Set ${currentSet} / ${ex.sets}</h2>
        
        <div class="tempo-controller">
            <button class="tempo-btn" onclick="adjustTempo(-0.1)">▲</button>
            <div class="tempo-value" id="tempoVal">${tempo.toFixed(1)}s</div>
            <button class="tempo-btn" onclick="adjustTempo(0.1)">▼</button>
            <div class="tempo-label">박자 조절</div>
        </div>

        <h1 style="font-size: 60px; margin-top: 10px;" id="countDisplay">(${currentCount}/${ex.goalCount})</h1>
    `;
    const btn = `<button class="wide-blue-btn" id="tempoActionBtn" onclick="startTempoCounter()">카운트 시작</button>`;
    app.innerHTML = getFullLayout(content, btn);
}

// 템포 조절 함수
function adjustTempo(val) {
    tempo = Math.max(0.1, Math.min(5.0, tempo + val)); // 0.1초 ~ 5초 제한
    const valDisplay = document.getElementById('tempoVal');
    if (valDisplay) valDisplay.innerText = `${tempo.toFixed(1)}s`;
    
    // 운동 중이면 타이머 재설정
    if (tempoTimer) {
        clearInterval(tempoTimer);
        startTempoCounter(true);
    }
}

// 음성 및 카운트 로직
function startTempoCounter(isResumed = false) {
    const ex = exercises[currentExIdx];
    const btn = document.getElementById('tempoActionBtn');
    if (btn) btn.style.display = 'none'; // 시작하면 버튼 숨김

    if (!isResumed) {
        currentCount = 0;
        currentBeat = 0;
    }

    tempoTimer = setInterval(() => {
        const text = currentBeat === 0 ? "One" : "Two";
        document.getElementById('beatDisplay').innerText = text;
        speak(text);

        if (currentBeat === 1) { // 'Two'일 때 개수 증가
            currentCount++;
            document.getElementById('countDisplay').innerText = `(${currentCount}/${ex.goalCount})`;
            
            if (currentCount >= ex.goalCount) {
                clearInterval(tempoTimer);
                tempoTimer = null;
                speak("Finish!");
                handleSetComplete();
            }
        }
        currentBeat = (currentBeat === 0) ? 1 : 0;
    }, tempo * 1000);
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.5; // 속도 약간 빠르게
    window.speechSynthesis.speak(utterance);
}

// [기본 운동/시간제 운동 렌더링 생략 - 이전 버전과 동일]
function renderStandardExercise() {
    const ex = exercises[currentExIdx];
    const content = `
        <div class="exercise-image-area"><span>[ ${ex.name} 가이드 ]</span></div>
        <h1 style="font-size: 40px; margin: 0;">${ex.name}</h1>
        <h2 style="color: #007bff;">Set ${currentSet} / ${ex.sets}</h2>
        <p style="font-size: 20px; color: #666;">목표 수행</p>
    `;
    const btnText = currentSet === ex.sets ? "종목 완료" : "세트 완료";
    const btn = `<button class="wide-blue-btn" onclick="handleSetComplete()">${btnText}</button>`;
    app.innerHTML = getFullLayout(content, btn);
}

function handleSetComplete() {
    if (tempoTimer) clearInterval(tempoTimer);
    tempoTimer = null;
    
    const ex = exercises[currentExIdx];
    workoutHistory.push({ name: ex.name });

    if (currentSet < ex.sets) {
        currentSet++;
        startRest(false);
    } else {
        currentSet = 1;
        startRest(true);
    }
}

// [나머지 startRest, renderReport 등은 v0.6.2와 동일]
function startRest(isNextEx) {
    let timeLeft = isNextEx ? 30 : (exercises[currentExIdx].restTime || 20);
    const nextName = isNextEx ? (exercises[currentExIdx + 1]?.name || "종료") : exercises[currentExIdx].name;

    const timerFunc = () => {
        const content = `
            <div class="exercise-image-area"><span>[ 휴식 중 ]</span></div>
            <h2 style="color:#adb5bd;">휴식 중...</h2>
            <h1 style="font-size: 80px; margin: 10px 0;">${timeLeft}s</h1>
            <p>다음: <strong>${nextName}</strong></p>
        `;
        const btn = `<button class="wide-blue-btn" onclick="skipRest()">휴식 건너뛰기</button>`;
        app.innerHTML = getFullLayout(content, btn); 
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

function renderMain() {
    const content = `<h1 style="margin-top:100px;">오늘의 루틴</h1><p style="font-size:20px;">${workoutData.name}</p>`;
    const btn = `<button class="wide-blue-btn" onclick="renderExercise()">운동 시작</button>`;
    app.innerHTML = getFullLayout(content, btn);
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
    const btn = `<button class="wide-blue-btn" onclick="location.reload()">완료 및 메인으로</button>`;
    app.innerHTML = `
        <div class="header-area" style="justify-content:center;"><span style="font-weight:bold;">운동 종료</span></div>
        <div class="main-content">${content}</div>
        <div class="action-area">${btn}</div>
    `;
}

function renderSetup() {
    const content = `<h1>반가워요!</h1><p>루틴을 생성해주세요.</p>`;
    const btn = `<button class="wide-blue-btn" onclick="saveBasic()">루틴 생성</button>`;
    app.innerHTML = getFullLayout(content, btn);
}

function saveBasic() {
    localStorage.setItem('my_workout_routine', JSON.stringify({name:"기본 루틴"}));
    location.reload();
}

function toggleModal(show) {
    const modal = document.getElementById('routineModal');
    const list = document.getElementById('modalList');
    if (show) {
        list.innerHTML = exercises.map((ex, idx) => `
            <div class="routine-item ${idx === currentExIdx ? 'current' : ''}">
                <span>${idx + 1}. ${ex.name}</span>
                <span>${ex.sets}세트</span>
            </div>
        `).join('');
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
    }
}

init();
