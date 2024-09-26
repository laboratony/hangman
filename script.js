// The list of vocabulary words along with images
const vocabularyList = [
    { word: "fire fighter", image: "images/fire fighter.png" },
    { word: "pilot", image: "images/pilot.png" },
    { word: "teacher", image: "images/teacher.png" },
    { word: "doctor", image: "images/doctor.png" },
    { word: "nurse", image: "images/nurse.png" },
    { word: "policeman", image: "images/policeman.png" },
    { word: "soldier", image: "images/soldier.png" },
    { word: "postman", image: "images/postman.png" },
    { word: "chef", image: "images/chef.png" },
    { word: "waiter", image: "images/waiter.png" },
    { word: "singer", image: "images/singer.png" },
    { word: "engineer", image: "images/engineer.png" },
];

// Shuffle the vocabulary list to ensure random order
let shuffledVocabularyList = shuffleArray([...vocabularyList]);
let currentWordIndex = 0;
let correctGuesses = 0;
let chosenWord = '';
let hiddenWord = [];
let attempts = 0;
const maxAttempts = 10; // Max attempts before game over
const messageElement = document.getElementById('message');
const wordElement = document.getElementById('word');
const lettersElement = document.getElementById('letters');
const nextButton = document.getElementById('next');
const canvas = document.getElementById('hangmanCanvas');
const ctx = canvas.getContext('2d');
const vocabularyImageElement = document.getElementById('vocabulary-image');

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
}

// Function to draw parts of the hangman
function drawBase() {
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, 320); // Starting point of the base line
    ctx.lineTo(60, 320); // End point of the base line
    ctx.stroke();
}

function drawPole() {
    ctx.lineWidth = 2; 
    ctx.moveTo(20, 320);
    ctx.lineTo(20, 20);
    ctx.stroke();
}

function drawBar() {
    ctx.lineWidth = 2; 
    ctx.moveTo(20, 20);
    ctx.lineTo(100, 20);
    ctx.stroke();
}

function drawRope() {
    ctx.lineWidth = 2; 
    ctx.moveTo(100, 20);
    ctx.lineTo(100, 60);
    ctx.stroke();
}

function drawHead() {
    ctx.lineWidth = 2; 
    ctx.beginPath();
    ctx.arc(100, 80, 20, 0, Math.PI * 2, true); // Head
    ctx.stroke();
}

function drawBody() {
    ctx.lineWidth = 2; 
    ctx.moveTo(100, 100);
    ctx.lineTo(100, 160);
    ctx.stroke();
}

function drawLeftArm() {
    ctx.lineWidth = 2; 
    ctx.moveTo(100, 120);
    ctx.lineTo(70, 140);
    ctx.stroke();
}

function drawRightArm() {
    ctx.lineWidth = 2; 
    ctx.moveTo(100, 120);
    ctx.lineTo(130, 140);
    ctx.stroke();
}

function drawLeftLeg() {
    ctx.lineWidth = 2; 
    ctx.moveTo(100, 160);
    ctx.lineTo(70, 200);
    ctx.stroke();
}

function drawRightLeg() {
    ctx.lineWidth = 2; 
    ctx.moveTo(100, 160);
    ctx.lineTo(130, 200);
    ctx.stroke();
}

function drawDie() {
    ctx.strokeStyle = "red"; 
    ctx.lineWidth = 4; 
    ctx.beginPath();
    ctx.moveTo(30, 30);
    ctx.lineTo(170, 270);
    ctx.moveTo(170, 30);
    ctx.lineTo(30, 270);
    ctx.stroke();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
}

// Function to control the drawing based on attempts
function drawHangman(attempt) {
    switch (attempt) {
        case 1: drawPole(); break;
        case 2: drawBar(); break;
        case 3: drawRope(); break;
        case 4: drawHead(); break;
        case 5: drawBody(); break;
        case 6: drawLeftArm(); break;
        case 7: drawRightArm(); break;
        case 8: drawLeftLeg(); break;
        case 9: drawRightLeg(); break;
        case 10: drawDie(); break;
        default: break;
    }
}

// Load the sound files
const correctSound = new Audio('sounds/correct.mp3');
const wrongSound = new Audio('sounds/wrong.mp3');

// New: Load the background music and set it to loop
const backgroundMusic = new Audio('sounds/About That Oldie.mp3');
backgroundMusic.loop = true; // Make sure the music loops continuously
backgroundMusic.volume = 0;

// New: Load the click sound for the keyboard letters
const clickSound = new Audio('sounds/click.wav');

// Function to start the game
function startGame() {
    // Check if all words have been displayed
    if (currentWordIndex >= shuffledVocabularyList.length) {
        showFinalScore(); // Show the end page if all words have been guessed
        return;
    }

    // Display game container elements if it's not the end
    document.getElementById('game-container').style.display = 'flex';
    document.getElementById('bottom-container').style.display = 'flex'; // Show bottom container only when the game starts
    document.getElementById('letters-container').style.display = 'flex';

    const chosenItem = shuffledVocabularyList[currentWordIndex];
    chosenWord = chosenItem.word;
    hiddenWord = chosenWord.split('').map(char => (char === ' ' ? ' ' : '_'));
    attempts = 0;
    messageElement.textContent = '';
    wordElement.textContent = hiddenWord.join(' ');
    nextButton.style.display = 'none';
    clearCanvas(); // Ensure canvas is cleared at the start of the game

    drawBase(); // Draw the base before starting the game

    // Set up the letter buttons
    lettersElement.innerHTML = '';
    for (let i = 65; i <= 90; i++) {
        const letterButton = document.createElement('button');
        letterButton.textContent = String.fromCharCode(i);
        letterButton.classList.add('letter-btn');

        // New: Add event listener to play the click sound
        letterButton.addEventListener('click', function(event) {
            clickSound.play();
            handleGuess(event);
        });

        lettersElement.appendChild(letterButton);
    }

    // Display the corresponding vocabulary image
    vocabularyImageElement.src = chosenItem.image;
    vocabularyImageElement.style.display = 'block';

    // New: Start playing the background music if not already playing
    if (backgroundMusic.paused) {
        backgroundMusic.play().catch(error => console.error("Error playing background music:", error));
    }
}

// Handle guessing
function handleGuess(event) {
    const guessedLetter = event.target.textContent.toLowerCase();

    if (chosenWord.includes(guessedLetter)) {
        event.target.classList.add('correct');
        for (let i = 0; i < chosenWord.length; i++) {
            if (chosenWord[i] === guessedLetter) {
                hiddenWord[i] = guessedLetter;
            }
        }
        wordElement.textContent = hiddenWord.join(' ');

        if (!hiddenWord.includes("_")) {
            correctGuesses++; // Increment correctGuesses when the word is fully guessed
            messageElement.textContent = '✅✅✅ Correct! ✅✅✅';
            messageElement.classList.remove('incorrect');

            console.log("Playing correct sound");
            correctSound.play().catch(error => console.error("Error playing correct sound:", error)); // Play correct sound
            endGame();
        }
    } else {
        event.target.classList.add('incorrect');
        attempts++;
        drawHangman(attempts);

        if (attempts >= maxAttempts) {
            messageElement.textContent = `❌❌❌ Wrong! The word was "${chosenWord}". ❌❌❌`;
            messageElement.classList.add('incorrect');
            
            // Play the wrong sound only once when the game ends
            console.log("Playing wrong sound at game over");
            wrongSound.play().catch(error => console.error("Error playing wrong sound:", error));
            
            endGame();
        }
    }
}

// End the game
function endGame() {
    const buttons = document.querySelectorAll('.letter-btn');
    buttons.forEach(button => button.disabled = true);

    // Display the next button and ensure it's displayed as a block element
    nextButton.style.display = 'block';
}

// Show the final score and end page
function showFinalScore() {
    // Hide the game container, bottom container, and letters container
    const gameContainer = document.getElementById('game-container');
    gameContainer.style.display = 'none';

    const bottomContainer = document.getElementById('bottom-container');
    const lettersContainer = document.getElementById('letters-container');
    bottomContainer.style.display = 'none';
    lettersContainer.style.display = 'none';

    // Create the end container to display the final score
    const endContainer = document.createElement('div');
    endContainer.id = 'end-container';
    endContainer.style.textAlign = 'center';
    endContainer.innerHTML = `
        <h2>Game Over!</h2>
        <p>Your score</p>
        <h1>${correctGuesses} / ${vocabularyList.length}</h1>
        <button id="play-again">Play Again</button>
    `;
    document.body.appendChild(endContainer);

    // Event listener for the play again button
    document.getElementById('play-again').addEventListener('click', function () {
        resetGame();
    });
}

// Function to reset the game
function resetGame() {
    document.getElementById('end-container').remove();
    currentWordIndex = 0;
    correctGuesses = 0; // Reset the correctGuesses to 0
    shuffledVocabularyList = shuffleArray([...vocabularyList]);

    // Show the welcome container again and hide other containers until the game starts
    document.getElementById('welcome-container').style.display = 'block';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('bottom-container').style.display = 'none';
    document.getElementById('letters-container').style.display = 'none';

    // Stop the background music when the game is reset
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0; // Reset to the beginning of the track
}

// Start the game initially
document.getElementById('start-game').addEventListener('click', function() {
    document.getElementById('welcome-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex'; 
    document.getElementById('bottom-container').style.display = 'flex'; // Display the bottom container when the game starts
    document.getElementById('letters-container').style.display = 'flex';
    startGame();
});

// Event listener to restart the game
nextButton.addEventListener('click', function() {
    currentWordIndex++;
    startGame();
});
