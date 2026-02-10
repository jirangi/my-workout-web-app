// 1. 초기 데이터 설정 확인
const savedData = localStorage.getItem('my_workout_routine');
const workoutData = savedData ? JSON.parse(savedData) : null;
const app = document.getElementById('app');

// 2. 실행 함수
function init() {
    if (workoutData) {
        renderMain();
    } else {
        renderSetup();
    }
}

// 3. 메인 화면 (운동 시작 버튼)
function renderMain() {
    app.innerHTML = `
        <div class="container">
            <h1>오늘의 루틴</h1>
            <p><strong>${workoutData.name}</strong></p>
            <button class="big-start-btn" onclick="startWorkout()">운동 시작</button>
            <div class="bottom-nav">
                <button onclick="resetData()">초기화</button>
            </div>
        </div>
    `;
}

// 4. 세팅 화면
function renderSetup() {
    app.innerHTML = `
        <div class="container">
            <h1>반가워요!</h1>
            <p>루틴을 먼저 만들어주세요.</p>
            <button class="setup-btn" onclick="saveBasic()">기본 루틴 저장</button>
        </div>
    `;
}

// 5. 기능 함수들
function saveBasic() {
    const basic = { name: "초보자 가이드", restTime: 60 };
    localStorage.setItem('my_workout_routine', JSON.stringify(basic));
    location.reload();
}

function resetData() {
    localStorage.removeItem('my_workout_routine');
    location.reload();
}

function startWorkout() {
    alert("운동을 시작합니다!");
}

// 앱 실행
init();
