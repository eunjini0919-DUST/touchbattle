import './style.css';

let score = 0;
const container = document.getElementById('game-container');
const scoreBoard = document.getElementById('score-board');
const refillBtn = document.getElementById('refill-btn');

// --- 1. 오디오 설정 ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playPopSound() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(300 + Math.random() * 100, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);
}

// --- 2. 뽁뽁이 생성 (수정됨) ---
function createBubbles() {
    container.innerHTML = '';

    // 컨테이너 크기 계산
    // clientWidth가 0이면(아직 로딩중이면) window 크기를 대신 사용 (안전장치 1)
    const containerWidth = container.clientWidth || window.innerWidth;
    const containerHeight = container.clientHeight || (window.innerHeight - 200);

    const bubbleSize = 67; // 55px + gap 12px

    const cols = Math.floor(containerWidth / bubbleSize);
    const rows = Math.floor(containerHeight / bubbleSize);

    let totalBubbles = cols * rows;

    // 계산 결과가 0개면 강제로 30개라도 만들기 (안전장치 2)
    if (totalBubbles <= 0 || isNaN(totalBubbles)) {
        totalBubbles = 30;
    }

    for (let i = 0; i < totalBubbles; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');

        bubble.addEventListener('pointerdown', (e) => {
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
    scoreBoard.innerText = score;

    playPopSound();

    if (navigator.vibrate) navigator.vibrate(15);
}

// --- 4. 리필 및 초기화 ---
function refillBubbles() {
    createBubbles();
    if (navigator.vibrate) navigator.vibrate(40);
}

// 화면 크기 바뀌면 다시 계산
window.addEventListener('resize', () => {
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(createBubbles, 200);
});

// [중요 수정] 브라우저가 레이아웃을 잡을 시간을 0.1초 줍니다.
setTimeout(() => {
    createBubbles();
}, 100);

refillBtn.addEventListener('click', refillBubbles);

document.body.addEventListener('touchstart', function () {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}, { once: true });