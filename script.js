/** DOM ELEMENTS **/
const board = document.querySelector('.board');
const startButton = document.querySelector('.btn-start');
const restartButton = document.querySelector('.btn-restart');
const modal = document.querySelector('.modal');
const startGameModal = document.querySelector('.start-game');
const gameOverModal = document.querySelector('.game-over');

const highScoreElement = document.querySelector('#high-score');
const scoreElement = document.querySelector('#score');
const timerElement = document.querySelector('#time');
const soundToggleButtons = document.querySelectorAll('.sound-toggle'); 

/** GAME STATE VARIABLES **/
let score = 0
let timer = `00:00`
let intervalId = null
let timerIntervalId = null  
let direction = 'down'
let touchStartX = 0
let touchStartY = 0

// Block/Grid Settings
const blockSize = 35;
const cols = Math.floor(board.clientWidth / blockSize)
const rows = Math.floor(board.clientHeight / blockSize)

// Snake & Food
let snake = [{ x: 3, y: 4}]
let food = {x: Math.floor(Math.random()*rows), y: Math.floor(Math.random()*cols)}
const blocks = []


/** SOUND SYSTEM */
let soundEnabled = localStorage.getItem('soundEnabled');
soundEnabled = soundEnabled === null ? true : soundEnabled === 'true';

soundToggleButtons.forEach(btn => {
    btn.textContent = soundEnabled ? "🔊" : "🔇";
    btn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggleButtons.forEach(b => b.textContent = soundEnabled ? "🔊" : "🔇");
        localStorage.setItem('soundEnabled', soundEnabled);
    });
});

const eatSound = new Audio('./sounds/eat.wav');
const gameOverSound = new Audio('./sounds/gameover.wav');

function playSound(sound) {
    if (!soundEnabled) return;
    sound.currentTime = 0;
    sound.play();
}

/** HIGH SCORE SETUP */
let highScore = localStorage.getItem('highScore') || 0
highScoreElement.textContent = highScore

/** CREATE BOARD GRID */
for(let row=0; row<rows; row++){
    for( let col=0; col<cols; col++){
        const block = document.createElement('div')
        block.classList.add('block')
        board.appendChild(block)
        blocks[`${row}-${col}`] = block
    }
}

/** GAME LOOP (RENDER) */
function render(){
    let head = null

    // Show food
    blocks[`${food.x}-${food.y}`].classList.add('food')

    // Snake movement logic
    if(direction === 'left'){
        head = {x: snake[0].x, y: snake[0].y -1}
    }else if(direction === 'right'){
        head = {x: snake[0].x, y: snake[0].y + 1}
    }else if(direction === 'down'){
        head = {x: snake[0].x + 1, y: snake[0].y}
    }else if(direction === 'up'){
        head = {x: snake[0].x - 1, y: snake[0].y}
    }

    // Wall Collision
    if(head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols ){
        return endGame()
    }

    // Self Collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return endGame()
    }

    /*********** Eating Food ***********/
    if(head.x === food.x && head.y === food.y){
        blocks[`${food.x}-${food.y}`].classList.remove('food')
        food = {x: Math.floor(Math.random()*rows), y: Math.floor(Math.random()*cols)}

        playSound(eatSound)

        snake.unshift(head)
        score += 10
        scoreElement.textContent = score

        if(score > highScore){
            highScore = score
            localStorage.setItem('highScore', highScore)
        }
    }

    snake.forEach(segment =>{
        blocks[`${segment.x}-${segment.y}`].classList.remove('fill')
    })  

    snake.unshift(head)
    snake.pop()

    snake.forEach(segment =>{
        blocks[`${segment.x}-${segment.y}`].classList.add('fill')
    })
}

/** GAME CONTROL FUNCTIONS */
function startGame () {
    modal.style.display = 'none'
    intervalId = setInterval(()=>{
        render()
    }, 300)
    timerIntervalId = setInterval(()=>{
        let [ min, sec] = timer.split(':').map(Number)
        sec++
        if(sec === 60){
            min++
            sec = 0
        }
        timer = `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`
        timerElement.textContent = timer
    }, 1000)
}

function restartGame(){
    blocks[`${food.x}-${food.y}`].classList.remove('food')
    snake.forEach(segment =>{
        blocks[`${segment.x}-${segment.y}`].classList.remove('fill')
    })
    score = 0
    timer = `00:00`
    scoreElement.textContent = score
    timerElement.textContent = timer
    highScoreElement.textContent = highScore

    modal.style.display = 'none'
    snake = [{ x: 3, y: 4}]
    food = {x: Math.floor(Math.random()*rows), y: Math.floor(Math.random()*cols)}
    startGame()
}

function endGame(){
    clearInterval(intervalId)
    playSound(gameOverSound)
    modal.style.display = 'flex'
    gameOverModal.style.display = 'flex'
    startGameModal.style.display = 'none'
}

startButton.addEventListener('click', startGame)
restartButton.addEventListener('click', restartGame)


/** INPUT: KEYBOARD + MOBILE SWIPE */
addEventListener('keydown', (event)=>{
    if (event.key === 'ArrowUp' && direction !== 'down') {
        direction = 'up'
    }else if(event.key === 'ArrowDown' && direction !== 'up'){
        direction = 'down'
    }else if(event.key === 'ArrowLeft' && direction !== 'right'){
        direction = 'left'
    }else if(event.key === 'ArrowRight' && direction !== 'left'){
        direction = 'right'
    }
})

// Prevent scrolling on mobile
document.addEventListener("touchmove", (e) => {
    e.preventDefault();
}, { passive: false });

// Swipe Detection
window.addEventListener("touchstart", (e)=>{
    const touch = e.touches[0]
    touchStartX = touch.clientX
    touchStartY = touch.clientY
})

window.addEventListener('touchend', (e) =>{
    const touch = e.changedTouches[0]
    let dx = touch.clientX - touchStartX
    let dy = touch.clientY - touchStartY

    if(Math.abs(dx) > Math.abs(dy)){
        if(dx > 0 && direction !== 'left'){
            direction = "right"
        } else if( dx < 0 && direction !== "right"){
            direction = "left"
        }
    }else{
        if(dy > 0 && direction !== "up"){
            direction = "down"
        }else if(dy < 0 && direction !== "down"){
            direction = "up"
        }
    }
})