// 1. 저장된 운동 데이터 확인 let workoutData = JSON.parse(localStorage.getItem('my_workout_routine')); const app = document.getElementById('app');

// 2. 앱 실행 시 초기화 함수 function init() { if (workoutData) { // 데이터가 있으면: 바로 운동 시작 버튼 화면 renderMainScreen(); } else { // 데이터가 없으면: 초보자 세팅 화면 renderSetupScreen(); } }

// 3. [데이터 있을 때] 메인 화면 구성 function renderMainScreen() { app.innerHTML = <div class="container"> <div class="header"> <h1>오늘의 루틴</h1> <p><strong> + workoutData.name + `</strong></p> </div>

}

// 4. [데이터 없을 때] 초보자 세팅 화면 function renderSetupScreen() { app.innerHTML = <div class="container"> <h1>반가워요!</h1> <p>아직 설정된 운동 데이터가 없습니다.<br>기본 세팅으로 시작하시겠습니까?</p> <button class="setup-btn" onclick="saveBasicRoutine()"> 초보자 추천 세팅으로 시작 </button> </div>; }

// 5. 초보자 기본 데이터 저장 함수 function saveBasicRoutine() { const basic = { name: "초보자 전신 루틴", restTime: 60, exercises: ["푸쉬업", "스쿼트", "런지"] }; localStorage.setItem('my_workout_routine', JSON.stringify(basic)); location.reload(); // 저장 후 화면 갱신 }

// 6. 데이터 초기화 (테스트용) function resetData() { if(confirm("모든 설정을 지우고 처음으로 돌아갈까요?")) { localStorage.removeItem('my_workout_routine'); location.reload(); } }

// 7. 운동 시작 버튼 클릭 시 실행 function startWorkout() { // 다음 단계: 운동 추천 및 타이머 화면으로 전환하는 로직이 들어갈 자리입니다. alert("운동을 시작합니다! 다음 운동 추천 화면으로 이동합니다."); }

// 앱 실행 init();
