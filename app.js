let workoutData = JSON.parse(localStorage.getItem('my_workout_routine')); const app = document.getElementById('app');

function init() { if (workoutData) { renderMainScreen(); } else { renderSetupScreen(); } }

function renderMainScreen() { app.innerHTML = <div class="container"> <div> <h1>오늘의 루틴</h1> <p><strong> + workoutData.name + </strong></p> </div> <button class="big-start-btn" onclick="startWorkout()">운동 시작</button> <div class="bottom-nav"> <button onclick="alert('기록 서비스 준비중')">기록</button> <button onclick="resetData()">초기화</button> <button onclick="alert('설정 서비스 준비중')">설정</button> </div> </div> ; }

function renderSetupScreen() { app.innerHTML = <div class="container"> <h1>반가워요!</h1> <p>설정된 루틴이 없습니다.</p> <button class="setup-btn" onclick="saveBasicRoutine()">기본 세팅으로 시작</button> </div>; }

function saveBasicRoutine() { const basic = { name: "초보자 가이드", restTime: 60 }; localStorage.setItem('my_workout_routine', JSON.stringify(basic)); location.reload(); }

function resetData() { if(confirm("루틴을 삭제하시겠습니까?")) { localStorage.removeItem('my_workout_routine'); location.reload(); } }

function startWorkout() { alert("운동 시작! 다음 단계 코드를 짜드릴게요."); }

init();
