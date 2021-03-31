let ballX = 75;
let ballY = 75;
let ballSpeedX = 5;
let ballSpeedY = 7;

const BRICK_W = 80;
const BRICK_H = 20;
const BRICK_GAP = 2;
const BRICK_COLS = 10;
const BRICK_ROWS = 14;
var brickGrid = new Array(BRICK_COLS*BRICK_ROWS);
var bricksLeft = 0;

const PADDLE_WIDTH = 100;
const PADDLE_THICKNESS = 10;
const PADDLE_DIST_FROM_EDGE = 60;
let paddleX = 400;
// let paddleY = 0;

let canvas, canvasContext;
let mouseX = -1;
let mouseY = -1;

function updateMousePos(evt){
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;

    mouseX = evt.clientX - rect.left - root.scrollLeft;
    mouseY = evt.clientY - rect.top - root.scrollTop;

    paddleX = mouseX - PADDLE_WIDTH/2;

    // // cheat / hack to test ball in any position
    // ballX = mouseX;
    // ballY = mouseY;
    // ballSpeedX = 5;
    // ballSpeedY = -4;
}

function brickReset(){
    bricksLeft = 0;
    for (var i = 0; i<3 * BRICK_COLS; i++){
        brickGrid[i] = false;
    }
    for (var i = 3 * BRICK_COLS; i < BRICK_COLS*BRICK_ROWS; i++){
    //     if (Math.random() < 0.5){
    //         brickGrid[i] = true;
    //     } else {
    //         brickGrid[i] = false;
    //     } // end of else (rand check)
        brickGrid[i] = true;
        bricksLeft++;
    } // end of for each brick

} // end of brickReset func
window.onload = function(){
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');

    var framesPerSecond = 30;
    setInterval(updateAll, 1000/framesPerSecond);

    canvas.addEventListener('mousemove', updateMousePos);

    brickReset();
    ballReset();
}
function updateAll(){
    moveAll();
    drawAll();
}
function ballReset(){
    ballX = canvas.width/2;
    ballY = canvas.height/2;
}

function ballMove(){
    ballX+= ballSpeedX;
    ballY+= ballSpeedY;

    if (ballX < 0 && ballSpeedX < 0.0){ // left
        ballSpeedX *= -1;
    }
    if(ballX>canvas.width && ballSpeedX > 0.0){ // right
        ballSpeedX *= -1;
    }
    if (ballY < 0 && ballSpeedY < 0.0){ // top
        ballSpeedY *= -1;
    }
    if(ballY>canvas.height){ // bottom
        ballReset();
        brickReset();
    }
}

function isBrickAtRowCol(col,row){
    if (col >= 0 && col < BRICK_COLS &&
        row >= 0 && row < BRICK_ROWS) {
        var brickIndexUnderCoord = rowColToArrayIndex(col, row);
        return brickGrid[brickIndexUnderCoord];
    } else {
        return false;
    }

}

function ballBrickHandling(){
    var ballBrickCol = Math.floor(ballX / BRICK_W);
    var ballBrickRow = Math.floor(ballY / BRICK_H);
    var brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);

    if (ballBrickCol >= 0 && ballBrickCol < BRICK_COLS &&
        ballBrickRow >= 0 && ballBrickRow < BRICK_ROWS){
        if (isBrickAtRowCol(ballBrickCol,ballBrickRow)){
            brickGrid[brickIndexUnderBall] = false;
            bricksLeft--;

            var prevBallX = ballX - ballSpeedX;
            var prevBallY = ballY - ballSpeedY;
            var prevBrickCol = Math.floor(prevBallX / BRICK_W);
            var prevBrickRow = Math.floor(prevBallY / BRICK_H);

            var bothTestFailed = true;

            if (prevBrickCol != ballBrickCol){
                if (isBrickAtRowCol(prevBrickCol, ballBrickRow) == false){
                    ballSpeedX *= -1;
                    bothTestFailed = false;
                }
            }
            if(prevBrickRow != ballBrickRow){
                if (isBrickAtRowCol(ballBrickCol, prevBrickRow) == false){
                    ballSpeedY *= -1;
                    bothTestFailed = false;
                }
            }

            if (bothTestFailed){ // armpit case, prevents ball from going right through
                ballSpeedX *= -1;
                ballSpeedY *= -1;
            }
        } // end of brick found
    } // end of valid col and row
}// end of ballBrickHandling func

function ballPaddleHandling(){
    var paddleTopEdgeY = canvas.height-PADDLE_DIST_FROM_EDGE;
    var paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;
    var paddleLeftEdgeX = paddleX;
    var paddleRightEdgeX = paddleLeftEdgeX + PADDLE_WIDTH;
    if (ballY > paddleTopEdgeY && // below the top of paddle
        ballY < paddleBottomEdgeY && // above bottom of paddle
        ballX > paddleLeftEdgeX &&  // right of the left side of paddle
        ballX < paddleRightEdgeX){ // left of the right side of paddle

        ballSpeedY *= -1;
        var centerOfPaddleX = paddleX + PADDLE_WIDTH/2;
        var ballDistFromPaddleCenterX = ballX - centerOfPaddleX;
        ballSpeedX = ballDistFromPaddleCenterX * 0.35;

        if (bricksLeft == 0){
            brickReset();
        } // out of bricks
    } // ball center over inside paddle
} // end of ballPaddleHandling

function moveAll(){
    ballMove();
    ballBrickHandling();
    ballPaddleHandling();
}

function rowColToArrayIndex(col, row){
    return BRICK_COLS * row + col;
}

function drawBricks(){
    for (var eachRow = 0; eachRow < BRICK_ROWS; eachRow++){
        for (var eachCol = 0; eachCol < BRICK_COLS; eachCol++){
            var arrayIndex = rowColToArrayIndex(eachCol, eachRow);
            if (brickGrid[arrayIndex]){
                colorRect(BRICK_W*eachCol,BRICK_H*eachRow,
                    BRICK_W-BRICK_GAP, BRICK_H-BRICK_GAP, 'blue');
            } // end of this brick
        } // end of for each brick
    } // end of for eachRow brick
} // end of drawBricks func

function drawAll(){

    colorRect(0, 0, canvas.width, canvas.height, 'black');

    colorCircle(ballX,ballY, 10, 'white'); // draw ball

    colorRect(paddleX, canvas.height-PADDLE_DIST_FROM_EDGE,
            PADDLE_WIDTH, PADDLE_THICKNESS, 'white');

    drawBricks();

    var mouseBrickCol = Math.floor(mouseX / BRICK_W);
    var mouseBrickRow = Math.floor(mouseY / BRICK_H);
    var brickIndexUnderMouse = rowColToArrayIndex(mouseBrickCol, mouseBrickRow);
    colorText(
        mouseBrickCol+","+mouseBrickRow+":"+brickIndexUnderMouse,
        mouseX,mouseY,
        'yellow'
    );

}

function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor){
    canvasContext.fillStyle = fillColor;
    canvasContext.fillRect(topLeftX,topLeftY,boxWidth, boxHeight);
}
function colorCircle(centerX,centerY, radius, fillColor){
    canvasContext.fillStyle = fillColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX,centerY, 10, 0, Math.PI*2, true);
    canvasContext.fill();
}

function colorText(showWords, textX,textY, fillColor){
    canvasContext.fillStyle = fillColor;
    canvasContext.fillText(showWords, textX,textY)
}
