const board = document.querySelector('.board');
const startButton = document.querySelector('.btn-start');
const modal = document.querySelector('.modal');
const startGameModal = document.querySelector('.start-game');
const gameOverModal = document.querySelector('.game-over');
const restartButton = document.querySelector('.btn-restart');
const highScoreElement = document.querySelector('#high-score');
const scoreElement = document.querySelector('#score');
const timerElement = document.querySelector('#time');


const blockHeight = 50
const blockWidth = 50

let highScore = localStorage.getItem('highScore') || 0
let score = 0
let timer = `00:00`

highScoreElement.textContent = highScore

const cols = Math.floor(board.clientWidth / blockWidth)
const rows = Math.floor(board.clientHeight / blockHeight)

const blocks = []
let snake = [
    { x: 3, y: 4},
]
let food = {x: Math.floor(Math.random()*rows), y: Math.floor(Math.random()*cols)}
let intervalId = null
let timerIntervalId = null  
let direction = 'down'


for(let row=0; row<rows; row++){
    for( let col=0; col<cols; col++){
        const block = document.createElement('div')
        block.classList.add('block')
        board.appendChild(block)
        blocks[`${row}-${col}`] = block
    }
}

function render(){
    let head = null

    blocks[`${food.x}-${food.y}`].classList.add('food')

    if(direction === 'left'){
        head = {x: snake[0].x, y: snake[0].y -1}
    }else if(direction === 'right'){
        head = {x: snake[0].x, y: snake[0].y + 1}
    }else if(direction === 'down'){
        head = {x: snake[0].x + 1, y: snake[0].y}
    }else if(direction === 'up'){
        head = {x: snake[0].x - 1, y: snake[0].y}
    }

    if(head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols ){
        clearInterval(intervalId)
        modal.style.display = 'flex'
        gameOverModal.style.display = 'flex'
        startGameModal.style.display = 'none'
        
        return
    }

    if(head.x === food.x && head.y === food.y){
        blocks[`${food.x}-${food.y}`].classList.remove('food')
        food = {x: Math.floor(Math.random()*rows), y: Math.floor(Math.random()*cols)}
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


startButton.addEventListener('click', ()=>{
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
})

restartButton.addEventListener('click', restartGame)

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
    intervalId = setInterval(()=>{
        render()
    }, 300)
    
}

addEventListener('keydown', (event)=>{
    if (event.key === 'ArrowUp') {
        direction = 'up'
    }else if(event.key === 'ArrowDown'){
        direction = 'down'
    }else if(event.key === 'ArrowLeft'){
        direction = 'left'
    }else if(event.key === 'ArrowRight'){
        direction = 'right'
    }
})