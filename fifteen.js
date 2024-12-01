document.addEventListener("DOMContentLoaded", function () {
    const gridSize = 4;
    const puzzleContainer = document.getElementById("puzzle-container");
    const shuffleButton = document.getElementById("shuffle-btn");
    const timerDisplay = document.getElementById("timer");
    const movesDisplay = document.getElementById("moves");
    const backgroundMusic = document.getElementById("background-music");
    const imageUrl = localStorage.getItem("selectedBackground") || 'background1.png'; // image for tiles
    
    let timer = 0; // time in seconds
    let moves = 0; // move counter
    let currentTime = 0; // Tracks time in seconds
    let currentMoves = 0; // Tracks the number of moves
    let timerInterval; // to keep track of the timer
    let bestTime = parseInt(localStorage.getItem("bestTime")) || null;
    let bestMoves = parseInt(localStorage.getItem("bestMoves")) || null;

    // Start the game timer

    function incrementMoves() {
        currentMoves++;
        document.getElementById("currentMoves").textContent = currentMoves;
    }

    function startTimer() {
        // Avoid starting multiple intervals
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        const backgroundMusic = document.getElementById("backgroundMusic");
    backgroundMusic.play().catch(error => {
        console.error("Music playback was blocked:", error);
    });

        // Increment timer every second
        timerInterval = setInterval(() => {
            currentTime++;
            document.getElementById("currentTime").textContent = currentTime;
        }, 1000);
    }
    
    function stopTimer() {
        clearInterval(timerInterval);
    }
    

    function updateBestScore() {
        // If no best time/moves stored, set initial best scores
        if (bestTime === null || bestMoves === null) {
            bestTime = currentTime;
            bestMoves = currentMoves;
        } else {
            // Compare and update the best time
            if (currentTime < bestTime) {
                bestTime = currentTime;
            }
            // Compare and update the best moves
            if (currentMoves < bestMoves) {
                bestMoves = currentMoves;
            }
        }
    
        // Save the best scores to localStorage for persistence
        localStorage.setItem("bestTime", bestTime);
        localStorage.setItem("bestMoves", bestMoves);
    
        // Update the UI to reflect the best scores
        document.getElementById("bestTime").textContent = bestTime;
        document.getElementById("bestMoves").textContent = bestMoves;
    }
    

    function resetGame() {
        // Stop the timer immediately
        stopTimer();
    
        // Update the best scores using the current values
        updateBestScore();
    
        // Reset the timer and moves for the new game
        currentTime = 0;
        currentMoves = 0;
    
        // Update the UI with reset values
        document.getElementById("currentTime").textContent = currentTime;
        document.getElementById("currentMoves").textContent = currentMoves;
    
        // Ensure best scores are displayed properly
        document.getElementById("bestTime").textContent = bestTime !== null ? bestTime : "--";
        document.getElementById("bestMoves").textContent = bestMoves !== null ? bestMoves : "--";
    
        // Recreate and shuffle the puzzle for the new game
        createTiles();
        shuffleTiles();
    
        // Start the timer for the new game
        startTimer();
    }
    


    // creates tiles with appropriate background image slice
    function createTiles() {
        puzzleContainer.innerHTML = ''; // clear existing tiles

        let tileId = 0; // used for labeling tiles and tracking their positions
        for (let row = 0; row < gridSize; row++) { // loop through each row
            for (let col = 0; col < gridSize; col++) { // loop through each column in the current row
                const tile = document.createElement("div"); // create div element (our tiles)
                tile.classList.add("puzzle-tile"); // add tile styling from CSS to div
                
                // shifting background in tile based on position
                const posX = col * 100; 
                const posY = row * 100;

                // set the background image and position
                tile.style.backgroundImage = `url(${imageUrl})`;
                tile.style.backgroundPosition = `-${posX}px -${posY}px`;

                // adding numbers for each tile
                if (tileId < gridSize * gridSize - 1) {
                    tile.textContent = tileId + 1;
                } else {
                    tile.classList.add("empty-tile");
                }

                tile.setAttribute("data-id", tileId); // giving each tile a tileId for future tracking
                puzzleContainer.appendChild(tile); // add the created tile (div) to container
                tileId++; // move on to making the next tile
            }
        }
    }

    // get the neighbors of the empty tile (which is on index 15)
    function getEmptyTileNeighbors(emptyIndex) {
        const row = Math.floor(emptyIndex / gridSize);
        const col = emptyIndex % gridSize;

        const neighbors = []; // empty array that will hold neighbors

        if (row > 0) neighbors.push(emptyIndex - gridSize); // up
        if (row < gridSize - 1) neighbors.push(emptyIndex + gridSize); // down
        if (col > 0) neighbors.push(emptyIndex - 1); // left
        if (col < gridSize - 1) neighbors.push(emptyIndex + 1); // right

        return neighbors; // return array of neighbors to the empty tile
    }

    function displayEndNotification() {
        stopTimer();
        updateBestScore();
        const overlay = document.createElement("div");
        overlay.id = "game-over-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = 1000;

        const message = document.createElement("div");
        message.style.color = "white";
        message.style.fontSize = "36px";
        message.style.textAlign = "center";
        message.innerHTML = `
            <h1>Congratulations! You solved the puzzle! 🎉</h1>
            <button id="restart-button" style="padding: 10px 20px; font-size: 18px; cursor: pointer; background-color: #ffc107; color: white; border: none; border-radius: 5px; margin-top: 20px;">Restart</button>
        `;

        overlay.appendChild(message);
        document.body.appendChild(overlay);

        const restartButton = document.getElementById("restart-button");
        restartButton.addEventListener("click", () => {
            overlay.remove(); // Remove the overlay
            resetGame();
        });
    }



    function checkCompletion() {
        const tiles = Array.from(puzzleContainer.getElementsByClassName("puzzle-tile"));

        for (let i = 0; i < tiles.length; i++) {
            if (parseInt(tiles[i].dataset.id) !== i) {
                return false;
            }
        }

        const emptyTile = document.querySelector(".empty-tile");
        const emptyIndex = tiles.indexOf(emptyTile);
        if (emptyIndex !== 15) {
            return false;
        }

        return true;
    }

    function movingTileClick(event) {
        const clickedTile = event.target.closest(".puzzle-tile");
        if (!clickedTile || !clickedTile.classList.contains("puzzle-tile")) {
            return;
        }

        const tiles = Array.from(puzzleContainer.getElementsByClassName("puzzle-tile"));
        const clickedIndex = tiles.indexOf(clickedTile);
        const emptyTile = document.querySelector(".empty-tile");
        const emptyIndex = tiles.indexOf(emptyTile);
        if (clickedIndex === -1 || emptyIndex === -1) return;
        const neighbors = getEmptyTileNeighbors(emptyIndex);

        if (neighbors.includes(clickedIndex)) {
            [clickedTile.textContent, emptyTile.textContent] = [emptyTile.textContent, clickedTile.textContent];
            [clickedTile.style.backgroundPosition, emptyTile.style.backgroundPosition] =
                [emptyTile.style.backgroundPosition, clickedTile.style.backgroundPosition];
            [clickedTile.dataset.id, emptyTile.dataset.id] = [emptyTile.dataset.id, clickedTile.dataset.id];

            clickedTile.classList.add("empty-tile");
            emptyTile.classList.remove("empty-tile");

            incrementMoves();
            highlightNeighbors();
            
            if (checkCompletion()) {
                displayEndNotification();
            }
        }
    }

    function highlightNeighbors() {
        const tiles = Array.from(puzzleContainer.children);
        const emptyTile = document.querySelector(".empty-tile");
        const emptyIndex = tiles.indexOf(emptyTile);
    
        // clear existing highlights
        tiles.forEach(tile => tile.classList.remove("highlight"));
    
        // get neighbors and apply the highlight class
        const neighbors = getEmptyTileNeighbors(emptyIndex);
        neighbors.forEach(index => {
            tiles[index].classList.add("highlight");
        });
    }
    
    function shuffleTiles() {
        const tiles = Array.from(puzzleContainer.getElementsByClassName("puzzle-tile"));
        let emptyIndex = tiles.findIndex(tile => tile.classList.contains("empty-tile"));
        const movesCount = 100;

        for (let i = 0; i < movesCount; i++) {
            const neighbors = getEmptyTileNeighbors(emptyIndex);
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];

            [tiles[emptyIndex].textContent, tiles[randomNeighbor].textContent] = 
                [tiles[randomNeighbor].textContent, tiles[emptyIndex].textContent];
            [tiles[emptyIndex].style.backgroundPosition, tiles[randomNeighbor].style.backgroundPosition] = 
                [tiles[randomNeighbor].style.backgroundPosition, tiles[emptyIndex].style.backgroundPosition];
            [tiles[emptyIndex].dataset.id, tiles[randomNeighbor].dataset.id] = 
                [tiles[randomNeighbor].dataset.id, tiles[emptyIndex].dataset.id];

            tiles[randomNeighbor].classList.add("empty-tile");
            tiles[emptyIndex].classList.remove("empty-tile");
            emptyIndex = randomNeighbor;
        }
    }

    
    // Event Listeners
    shuffleButton.addEventListener("click", () => {
        resetGame();
    });

    puzzleContainer.addEventListener("click", movingTileClick);
    createTiles(); // Initialize game board
    shuffleTiles(); // Shuffle tiles initially
    highlightNeighbors();
    startTimer(); // Start timer once game begins
});
