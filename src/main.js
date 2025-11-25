import './style.css';

let score = 0;
const container = document.getElementById('game-container');
const scoreBoard = document.getElementById('score-board');
const refillBtn = document.getElementById('refill-btn');

// --- 1. 오디오 설정 (모바일 호환성 강화) ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playPopSound() {
    // 모바일은 사용자 제스처 후 오디오 컨텍스트가 활성화되어야 함
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'triangle'; // 소리를 약간 더 둔탁하게(뽁뽁이 느낌)
    oscillator.frequency.setValueAtTime(300 + Math.random() * 100, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);
}

// --- 2. 뽁뽁이 생성 (화면 꽉 채우기) ---
function createBubbles() {
    container.innerHTML = '';

    // 컨테이너 크기 계산
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 뽁뽁이 하나 크기 (CSS grid gap 포함 대략적 계산)
    const bubbleSize = 67; // 55px + gap 12px

    const cols = Math.floor(containerWidth / bubbleSize);
    const rows = Math.floor(containerHeight / bubbleSize);

    // 화면을 꽉 채울 개수만큼만 생성
    const totalBubbles = cols * rows;

    for (let i = 0; i < totalBubbles; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');

        // Pointer Event 사용 (마우스/터치 통합, 반응속도 가장 빠름)
        bubble.addEventListener('pointerdown', (e) => {
            // 멀티터치 등 이벤트 전파 방지
            e.preventDefault();
            popBubble(bubble);
        });

        container.appendChild(bubble);
    }
}

// --- 3. 터뜨리기 로직 ---
function popBubble(element) {
    if (element.classList.contains('popped')) return;

    element.classList.add('popped');
    score++;
    scoreBoard.innerText = score; // 숫자만 깔끔하게 표시

    playPopSound();

    // 모바일 햅틱 피드백 (지원 기기만)
    if (navigator.vibrate) navigator.vibrate(15);

    // TODO: 서버 전송 로직 (배치 전송 권장)
    // if (score % 10 === 0) sendScoreToServer(score);
}

// --- 4. 리필 및 초기화 ---
function refillBubbles() {
    createBubbles();
    // 리필 시 약간 더 긴 진동
    if (navigator.vibrate) navigator.vibrate(40);
}

// 화면 크기 바뀌면(가로모드 등) 다시 계산
window.addEventListener('resize', () => {
    // 너무 잦은 리렌더링 방지 (Debounce)
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(createBubbles, 200);
});

// 초기 실행
createBubbles();
refillBtn.addEventListener('click', refillBubbles);

// iOS 사파리 오디오 잠금 해제용 (첫 터치 시 오디오 활성화)
document.body.addEventListener('touchstart', function () {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}, { once: true });