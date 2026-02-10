// 1. 로컬 스토리지에서 데이터 체크
const savedRoutine = localStorage.getItem('workout_routine');

const appContainer = document.getElementById('app');

function render() {
    if (savedRoutine) {
        // 데이터가 있는 경우: 바로 운동 시작 화면
        appContainer.innerHTML = `
            <div class="main-screen">
                <h2>오늘의 운동: 가슴/삼두</h2>
                <button class="start-btn" onclick="startWorkout()">운동 시작</button>
                <div class="bottom-menu">
                    <span>설정</span> | <span>기록</span>
                </div>
            </div>
        `;
    } else {
        // 데이터가 없는 경우: 초보자 가이드/선택 화면
        appContainer.innerHTML = `
            <div class="setup-screen">
                <h2>반가워요! 운동 루틴을 정해볼까요?</h2>
                <button onclick="setBasicRoutine()">초보자 추천 세팅으로 시작</button>
            </div>
        `;
    }
}

// 초보자 세팅 저장 함수
function setBasicRoutine() {
    const basicData = { type: 'beginner', restTime: 60 };
    localStorage.setItem('workout_routine', JSON.stringify(basicData));
    location.reload(); // 저장 후 화면 갱신
}

render();
