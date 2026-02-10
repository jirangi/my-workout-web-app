body {
    margin: 0;
    padding: 0;
    font-family: 'Pretendard', sans-serif;
    background-color: #f8f9fa;
    display: flex;
    justify-content: center; /* 가로 중앙 */
    align-items: center;     /* 세로 중앙 */
    height: 100vh;
    overflow: hidden;
}

#app {
    width: 100%;
    max-width: 500px;
    background-color: #ffffff;
    height: 100%;
    box-shadow: 0 0 20px rgba(0,0,0,0.05);
}

.container {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;      /* 내부 요소 중앙 정렬 */
    justify-content: center;   /* 상하 중앙 배치 */
    padding: 20px;
    box-sizing: border-box;
    text-align: center;       /* 텍스트 중앙 정렬 */
}

/* 상단 고정 영역을 위한 스타일 */
.top-info {
    position: absolute;
    top: 40px;
}

/* 가이드 이미지 영역 */
.exercise-image-area {
    width: 100%;
    height: 200px;
    background-color: #eeeeee;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}

/* 파란색 와이드 사각형 버튼 */
.wide-blue-btn {
    width: 100%;
    height: 100px;
    border-radius: 15px;
    border: none;
    background: #007bff;
    color: white;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.wide-blue-btn:active {
    background: #0056b3;
    transform: scale(0.98);
}

.progress-label {
    font-size: 16px;
    color: #999;
    margin-bottom: 5px;
}

.bottom-nav {
    position: absolute;
    bottom: 30px;
}
