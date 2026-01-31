const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const bgImg = new Image();
bgImg.src = "../img/flappybirdbg.png";

const birdImg = new Image();
birdImg.src = "../img/flappybird.png";

const topPipeImg = new Image();
topPipeImg.src = "../img/toppipe.png";

const bottomPipeImg = new Image();
bottomPipeImg.src = "../img/bottompipe.png";

const GRAVITY = 0.6;
const JUMP = -9;
const PIPE_GAP = 150;
const PIPE_SPEED = 2;

let frame = 0;
let score = 0;
let bestScore = Number(localStorage.getItem("bestScore")) || 0;
let gameOver = false;

const bird = {
    x: 60,
    y: canvas.height / 2,
    width: 34,
    height: 24,
    velocity: 0,

    draw() {
        ctx.drawImage(birdImg, this.x, this.y, this.width, this.height);
    },

    update() {
        this.velocity += GRAVITY;
        this.y += this.velocity;
    },

    jump() {
        this.velocity = JUMP;
    },

    reset() {
        this.y = canvas.height / 2;
        this.velocity = 0;
    }
};

let pipes = [];

function createPipe() {
    const topHeight = Math.random() * 200 + 50;

    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: topHeight + PIPE_GAP,
        width: 52,
        passed: false
    });
}

function drawPipes() {
    pipes.forEach(pipe => {

        ctx.drawImage(
            topPipeImg,
            pipe.x,
            pipe.top - 320,
            pipe.width,
            320
        );

        ctx.drawImage(
    bottomPipeImg,
    pipe.x,
    pipe.bottom,
    pipe.width,
    canvas.height - pipe.bottom
);

    });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= PIPE_SPEED;

        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            pipe.passed = true;
            score++;
        }

        if (
            bird.x < pipe.x + pipe.width &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)
        ) {
            endGame();
        }
    });

    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
}

function checkBounds() {
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }
}

function endGame() {
    gameOver = true;

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
    }
}

function resetGame() {
    score = 0;
    frame = 0;
    pipes = [];
    gameOver = false;
    bird.reset();
}

document.addEventListener("keydown", e => {
    if (e.code === "Space") {
        gameOver ? resetGame() : bird.jump();
    }
});

document.addEventListener("click", () => {
    gameOver ? resetGame() : bird.jump();
});

function drawScore() {
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Record: ${bestScore}`, 10, 55);
}

function drawGameOver() {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = "16px Arial";
    ctx.fillText(
        "Clique ou pressione ESPAÇO para reiniciar",
        canvas.width / 2,
        canvas.height / 2 + 20
    );

    ctx.textAlign = "left";
}
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        bird.update();

        if (frame % 90 === 0) {
            createPipe();
        }

        updatePipes();
        checkBounds();
        frame++;
    }

    drawPipes();
    bird.draw();
    drawScore();

    if (gameOver) {
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}

bgImg.onload = () => gameLoop();
