// 1. 저장된 운동 데이터 확인 (없으면 null)
let workoutData = JSON.parse(localStorage.getItem('my_workout_routine'));
const app = document.getElementById('app');

// 2. 앱 실행 시 초기화 함수
function init() {
    if (workoutData) {
        // 데이터가 있으면: 메인 운동 시작 화면으로
        renderMainScreen();
    } else {
        // 데이터가 없으면: 초보자 설정 화면으로
        renderSetupScreen();
    }
}

// 3. [데이터 있을 때] 메인 화면: 거대한 운동 시작 버튼
function renderMainScreen() {
    app.innerHTML = `
        <div class="container">
            <div class="header">
                <h1>오늘의 루틴</h1>
                <p><strong>` + (workoutData.name || "기본 루틴") + `</strong></p>
            </div>
            
            <button class="big-start-btn" onclick="startWorkout()">
                운동 시작
            </button>

            <div class="bottom-nav">
                <button onclick="alert('준비 중입니다.')">기록</button>
                <button onclick="resetData()">초기화</button>
                <button onclick="alert('준비 중입니다.')">설정</button>
            </div>
        </div>
    `;
}

// 4. [데이터 없을 때] 초기 설정 화면
function renderSetupScreen() {
    app.innerHTML = `
        <div class="container">
            <h1>반가워요!</h1>
            <p>설정된 루틴이 없습니다.<br>기본 세팅으로 시작할까요?</p>
            <button class="setup-btn" onclick="saveBasicRoutine()">
                초보자 추천 세팅 저장
            </button>
        </div>
    `;
}

// 5. 초보자용 기본 데이터 저장
function saveBasicRoutine() {
    const basic = { 
        name: "초보자 전신 루틴", 
        restTime: 60,
        exercises: ["푸쉬업", "스쿼트", "런지"] 
    };
    localStorage.setItem('my_workout_routine', JSON.stringify(basic));
    location.reload(); // 저장 후 화면 갱신
}

// 6. 데이터 초기화 (테스트용)
function resetData() {
    if(confirm("모든 데이터를 지우고 처음으로 돌아갈까요?")) {
        localStorage.removeItem('my_workout_routine');
        location.reload();
    }
}

// 7. 운동 시작 클릭 시 (다음 기능 구현 예정)
function startWorkout() {
    alert("운동을 시작합니다! 이제 실시간 타이머 기능을 추가해볼게요.");
}

// 앱 구동
init();
