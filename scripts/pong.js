//preloader
window.addEventListener("load", function() {
    var preloader = document.querySelector(".preloader");
    preloader.classList.add("hide");
});

//firebase :3
const firebaseConfig = {
    apiKey: "AIzaSyA1Qba6Nd3D5M-DhG8769JS9i2XtANSDRc",
    authDomain: "big-cookie-pong.firebaseapp.com",
    databaseURL: "https://big-cookie-pong-default-rtdb.firebaseio.com",
    projectId: "big-cookie-pong",
    storageBucket: "big-cookie-pong.appspot.com",
    messagingSenderId: "192798267244",
    appId: "1:192798267244:web:788c27de5c4f10b1614549",
    measurementId: "G-R9ZC7D8SBE"
  };
  // Initialize Firebase
firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var gameStateRef = database.ref('gameState');
var playersRef = database.ref('players');

document.getElementById('google-signin').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
    .then((result) => {
        // Handle successful sign-in
        const user = result.user;
        document.getElementById("user-name").textContent = "Hello, " + user.displayName;

        // Hide the sign-in button
        document.getElementById('google-signin').style.display = 'none';
        // Show the sign-out button
        document.getElementById('sign-out-button').style.display = 'block';

        window.location.reload();
    })
    .catch((error) => {
        // Handle errors
        console.error(error);
    });
});

document.getElementById('sign-out-button').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
      // Reset UI after sign out
    document.getElementById("user-name").textContent = "";
    document.getElementById('google-signin').style.display = 'block';
    document.getElementById('sign-out-button').style.display = 'none';

    window.location.reload();
    })
    .catch((error) => {
    console.error(error);
    });
});

let currentPlayer = null;
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        currentPlayer = {
            uid: user.uid,
            displayName: user.displayName,
            leftPaddleY: screenHeight / 2 - leftPaddleImage.height / 2,
        };
        playersRef.child(user.uid).set(currentPlayer);
        onlinePlayersRef.child(user.uid).set(true);
        document.getElementById("user-name").textContent = "Hello, " + user.displayName;
        document.getElementById('google-signin').style.display = 'none';
        document.getElementById('sign-out-button').style.display = 'block';
        document.getElementById('start-game').style.display = 'block';
        document.getElementById('paddle').style.display = 'none';
        document.getElementById('paddle2').style.display = 'none';
        document.getElementById('ball').style.display = 'none';
        document.getElementById('back-button').style.display = 'none';
    } else {
      // User is not signed in
        if (currentPlayer) {
            playersRef.child(currentPlayer.uid).remove();
            onlinePlayersRef.child(currentPlayer.uid).remove();
        }
        currentPlayer = null;
        document.getElementById("user-name").textContent = "";
        document.getElementById('google-signin').style.display = 'block';  
        document.getElementById('sign-out-button').style.display = 'none';
        document.getElementById('start-game').style.display = 'none';
        document.getElementById('start-game-ai').style.display = 'none';
        document.getElementById('paddle').style.display = 'none';
        document.getElementById('paddle2').style.display = 'none';
        document.getElementById('ball').style.display = 'none';
        document.getElementById('back-button').style.display = 'none';
    }
});

    window.addEventListener("load", function() {
    var preloader = document.querySelector(".preloader");
    preloader.classList.add("hide");
    
});

window.onunload = function () {
    if (currentPlayer) {
        playersRef.child(currentPlayer.uid).remove();
        onlinePlayersRef.child(currentPlayer.uid).remove();
    }
};


//------------------------------------------------------------------------------------------------------------------------------------------------------
// images
const ballImage = document.getElementById("ball");
const leftPaddleImage = document.getElementById("paddle");
const rightPaddleImage = document.getElementById("paddle2");

// screen size
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight - 60;

// Ball setup
let ballWidth = 75;
let ballHeight = 75;
ballImage.width = ballWidth;
ballImage.height = ballHeight;

let ballX = screenWidth/2 - ballWidth/2;
let ballY = screenHeight/2 - ballHeight/2;

let ballVelX = -screenWidth/480;
let ballVelY = screenHeight/270;

// Left paddle setup
let leftPaddleX = 0;
let leftPaddleY;

// Right paddle setup
let rightPaddleY = ballY - ballHeight/2;
let rightPaddleX = screenWidth - rightPaddleImage.width;

// Framerate
let lastTimestamp = 0;
const frameInterval = 1000 / 144;

let gameState = {
    ballX: screenWidth / 2 - ballWidth / 2,
    ballY: screenHeight / 2 - ballHeight / 2,
    ballVelX: -screenWidth / 480,
    ballVelY: screenHeight / 270,
    rightPaddleX: screenWidth - rightPaddleImage.width,
    rightPaddleY: screenHeight / 2 - rightPaddleImage.height / 2,
};

const onlinePlayersRef = database.ref('onlinePlayers');
//------------------------------------------------------------------------------------------------------------------------------------------------------
// Left paddle movement
document.addEventListener('mousemove', (event) => {
    const mouseY = event.clientY;
    leftPaddleY = mouseY - leftPaddleImage.height / 2;
    //push leftPaddleY to database
    playersRef.child(currentPlayer.uid).update({leftPaddleY: leftPaddleY});
    

    if (leftPaddleY >= 60) {
        leftPaddleImage.style.top = `${leftPaddleY}px`;
    } else {
        leftPaddleImage.style.top = "60px";
    }
});

// Right paddle movement
function updateRightPaddlePosition() {
    if (rightPaddleY >= 60) {
        rightPaddleImage.style.top = `${rightPaddleY}px`;
        rightPaddleImage.style.left = `${rightPaddleX}px`;
    } else {
        rightPaddleImage.style.top = "60px";
        rightPaddleImage.style.left = `${rightPaddleX}px`;
    }
}

function moveRightPaddle(dy) {
    rightPaddleY += dy;
    updateRightPaddlePosition();
}

//you get the point
let rightPaddleAnimationId;
function animateRightPaddle() {
    if (ballY > rightPaddleY) {
        moveRightPaddle(3.5);
    } else if (ballY < rightPaddleY) {
        moveRightPaddle(-3.5);
    }

    gameState.rightPaddleX = rightPaddleX;
    gameState.rightPaddleY = rightPaddleY;

    gameStateRef.update(gameState);

    rightPaddleAnimationId = requestAnimationFrame(animateRightPaddle); 
    // cancelAnimationFrame(animationId); //cancel the animation stop the ball
}

function listenForOnlinePlayerCount() {
    onlinePlayersRef.on("value", function (snapshot) {
        const onlinePlayers = snapshot.numChildren();
        document.getElementById("online-player-count").textContent = `Online Players: ${onlinePlayers}`;
    });
}

listenForOnlinePlayerCount();

function initializeGameState() {
    gameState = {
        ballX: screenWidth / 2 - ballWidth / 2,
        ballY: screenHeight / 2 - ballHeight / 2,
        ballVelX: -screenWidth / 480,
        ballVelY: screenHeight / 270,
        rightPaddleX: screenWidth - rightPaddleImage.width,
        rightPaddleY: screenHeight / 2 - rightPaddleImage.height / 2,
    };
}



function updateBallPosition() {
    ballImage.style.transform = `translate(${ballX}px, ${ballY}px)`;
}

function moveBall(dx, dy) {
    ballX += dx;
    ballY -= dy;
    updateBallPosition();
}

let ballAnimationId;
let ballRect = ballImage.getBoundingClientRect();
let leftPaddleRect = leftPaddleImage.getBoundingClientRect();
let rightPaddleRect = rightPaddleImage.getBoundingClientRect();

function animateBall(timestamp) {
    const elapsed = timestamp - lastTimestamp;
    ballAnimationId = requestAnimationFrame(animateBall);

    if (elapsed >= frameInterval) {
        lastTimestamp = timestamp;
    
        moveBall(ballVelX, ballVelY);
        ballRect = ballImage.getBoundingClientRect();
        leftPaddleRect = leftPaddleImage.getBoundingClientRect();
        rightPaddleRect = rightPaddleImage.getBoundingClientRect();

        gameStateRef.ballX = ballX;
        gameStateRef.ballY = ballY;
        gameStateRef.ballVelX = ballVelX;
        gameStateRef.ballVelY = ballVelY;

        gameStateRef.update(gameState);

        playersRef.on('value', function (snapshot) {
            const gameState = snapshot.val();
        
            if (gameState) {

        //collision detection
        if (ballY <= 0 || ballY + ballHeight >= screenHeight) {
            ballVelY *= -1;
        }
    
        if (ballX <= 0){
            if (ballRect.bottom >= leftPaddleRect.top && ballRect.top <= leftPaddleRect.bottom){
                ballVelX *= -1;
            } else {
                endGame();
            }
        }
        if (ballX + ballWidth >= screenWidth){
            if (ballRect.bottom >= rightPaddleRect.top && ballRect.top <= rightPaddleRect.bottom){
                ballVelX *= -1;
            } else {
                endGame();
            }
        }
    }
        });
    }
}

function endGame() {
    cancelAnimationFrame(ballAnimationId);
    document.getElementById('sign-out-button').style.display = 'block';
    document.getElementById('start-game').style.display = 'block';
    document.getElementById('start-game-ai').style.display = 'block';
    document.getElementById('online-player-count').style.display = 'block';
    document.getElementById('paddle').style.display = 'none';
    document.getElementById('paddle2').style.display = 'none';
    document.getElementById('ball').style.display = 'none';
    document.getElementById('back-button').style.display = 'none';
    gameStateRef.remove();
}

function backButton() {
    window.location.reload();
}

document.getElementById('start-game').addEventListener('click', () => {
    initializeGameState();
    gameStateRef.set(gameState);
    startGame();
});


function resetGame(){
    cancelAnimationFrame(ballAnimationId);
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight - 60;

    gameStateRef.set({
        ballX: ballX,
        ballY: ballY,
        ballVelX: ballVelX,
        ballVelY: ballVelY,
        rightPaddleX: rightPaddleX,
        rightPaddleY: rightPaddleY,
    });

    ballX = screenWidth/2 - ballWidth/2;
    ballY = screenHeight/2 - ballHeight/2;
    ballVelX = -screenWidth/480;
    ballVelY = screenHeight/270;
    leftPaddleY = screenHeight/2 - leftPaddleImage.height/2;
    rightPaddleX = screenWidth - rightPaddleImage.width;
    rightPaddleY = screenHeight/2 - rightPaddleImage.height/2;
    updateBallPosition();
    updateRightPaddlePosition();
    animateBall();
    animateRightPaddle();
}

// Start the game
function startGame() {
    resetGame();
    lastTimestamp = performance.now();
    animateBall(lastTimestamp);

    leftPaddleImage.style.display = "block";
    rightPaddleImage.style.display = "block";
    document.getElementById('sign-out-button').style.display = 'none';
    document.getElementById('start-game').style.display = 'none';
    document.getElementById('start-game-ai').style.display = 'none';
    document.getElementById('online-player-count').style.display = 'none';
    document.getElementById('ball').style.display = 'block';
    document.getElementById('back-button').style.display = 'block';

    requestAnimationFrame(animateBall);
}

// need to add AI game
// function startGameAI() {

// }

updateBallPosition();
updateRightPaddlePosition();
animateRightPaddle();