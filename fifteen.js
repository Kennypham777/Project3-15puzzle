document.addEventListener("DOMContentLoaded", function () {
    const gridSize = 4;
    const puzzleContainer = document.getElementById("puzzle-container");
    const shuffleButton = document.getElementById("shuffle-btn");
    const imageUrl = 'background1.png'; // image for tiles

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
        // calculate row and column of the empty tile
        const row = Math.floor(emptyIndex / gridSize);
        const col = emptyIndex % gridSize;

        const neighbors = []; // empty array that will hold neighbors

        // check for valid neighbors (if there is a row/column up, down, left, right of the empty tile)
        if (row > 0) neighbors.push(emptyIndex - gridSize); // up
        if (row < gridSize - 1) neighbors.push(emptyIndex + gridSize); // down
        if (col > 0) neighbors.push(emptyIndex - 1); // left
        if (col < gridSize - 1) neighbors.push(emptyIndex + 1); // right

        return neighbors; // return array of neighbors to the empty tile
    }

    function displayEndNotification() {
        // create an overlay
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
    
        // create a congratulatory message
        const message = document.createElement("div");
        message.style.color = "white";
        message.style.fontSize = "36px";
        message.style.textAlign = "center";
        message.innerHTML = `
            <h1>Congratulations! You solved the puzzle! 🎉</h1>
            <button id="restart-button" style="
                padding: 10px 20px;
                font-size: 18px;
                cursor: pointer;
                background-color: #ffc107;
                color: white;
                border: none;
                border-radius: 5px;
                margin-top: 20px;">Restart</button>
        `;
    
        overlay.appendChild(message);
        document.body.appendChild(overlay);
    
        // Add functionality to restart button
        const restartButton = document.getElementById("restart-button");
        restartButton.addEventListener("click", () => {
            overlay.remove(); // Remove the overlay
            createTiles(); // Reset the game
            highlightNeighbors(); // Reset the highlights
        });
    }
    
    function checkCompletion() {
        const tiles = Array.from(puzzleContainer.getElementsByClassName("puzzle-tile")); // get all tiles
    
        // check if all tiles are in the correct order
        for (let i = 0; i < tiles.length; i++) {
            if (parseInt(tiles[i].dataset.id) !== i) {
                return false; // ff any tile is out of order, the game is not complete
            }
        }
    
        // empty tile is at index 15 (last position)
        const emptyTile = document.querySelector(".empty-tile");
        const emptyIndex = tiles.indexOf(emptyTile);
        if (emptyIndex !== 15) {
            return false; // ff the empty tile is not in the last position, the game is not complete
        }
    
        return true; // all tiles are in the correct order, and the empty tile is in the last position
    }
    
    
    // moving pieces
    function movingTileClick(event) {
        const clickedTile = event.target.closest(".puzzle-tile"); // directly get the clicked tile
        if (!clickedTile || !clickedTile.classList.contains("puzzle-tile")) {
            return;
        }

        const tiles = Array.from(puzzleContainer.getElementsByClassName("puzzle-tile")); // get all tiles
        const clickedIndex = tiles.indexOf(clickedTile); // find index of the clicked tile
        const emptyTile = document.querySelector(".empty-tile"); // find the empty tile
        if (!emptyTile) {
            return;
        }
        const emptyIndex = tiles.indexOf(emptyTile); // find index of the empty tile
        if (clickedIndex === -1 || emptyIndex === -1) return;
        const neighbors = getEmptyTileNeighbors(emptyIndex);
    
        // check if the clicked tile is adjacent to the empty tile
        if (neighbors.includes(clickedIndex)) {
            // swap the content and background position of the clicked tile and the empty tile
            [clickedTile.textContent, emptyTile.textContent] = [emptyTile.textContent, clickedTile.textContent];
            [clickedTile.style.backgroundPosition, emptyTile.style.backgroundPosition] =
                [emptyTile.style.backgroundPosition, clickedTile.style.backgroundPosition];
            [clickedTile.dataset.id, emptyTile.dataset.id] = [emptyTile.dataset.id, clickedTile.dataset.id];
    
            // update the class to reflect the new empty tile position
            clickedTile.classList.add("empty-tile");
            emptyTile.classList.remove("empty-tile");
            
             // check if the game is completed
            if (checkCompletion()) {
                displayEndNotification();
            }
        }
    }
    // highlight the other tile 
    function highlightNeighbors() {
        const tiles = Array.from(puzzleContainer.getElementsByClassName("puzzle-tile"));
        const emptyTile = document.querySelector(".empty-tile");
        const emptyIndex = tiles.indexOf(emptyTile);
    
        // remove the highlight class from all tiles
        tiles.forEach(tile => tile.classList.remove("highlight"));
    
        // get neighbors of the empty tile and add the highlight class
        const neighbors = getEmptyTileNeighbors(emptyIndex);
        neighbors.forEach(index => {
            tiles[index].classList.add("highlight");
        });
    }
        
    // shuffle the tiles by moving random neighbors to the empty space
    function shuffleTiles() {
        const tiles = Array.from(puzzleContainer.getElementsByClassName("puzzle-tile")); // array of all tiles by getting elements with puzzle-tile class
        let emptyIndex = tiles.findIndex(tile => tile.classList.contains("empty-tile")); // locate the empty tile initially
        const movesCount = 100; // number of moves to make for shuffling

        for (let i = 0; i < movesCount; i++) { // loop based on movesCount
            const neighbors = getEmptyTileNeighbors(emptyIndex); // gets an array of all neighbors of the empty tile
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)]; // randomly pick a neighbor to swap empty tile with

            // swap the empty tile with the randomly selected neighbor (swapping position, number, background, id)
            [tiles[emptyIndex].textContent, tiles[randomNeighbor].textContent] = 
                [tiles[randomNeighbor].textContent, tiles[emptyIndex].textContent];
            [tiles[emptyIndex].style.backgroundPosition, tiles[randomNeighbor].style.backgroundPosition] = 
                [tiles[randomNeighbor].style.backgroundPosition, tiles[emptyIndex].style.backgroundPosition];
            [tiles[emptyIndex].dataset.id, tiles[randomNeighbor].dataset.id] = 
                [tiles[randomNeighbor].dataset.id, tiles[emptyIndex].dataset.id];

            // update the empty-tile class to the new position
            tiles[randomNeighbor].classList.add("empty-tile");
            tiles[emptyIndex].classList.remove("empty-tile");

            // after swapping, update the empty tile to the new position
            emptyIndex = randomNeighbor;
        }
    }

    shuffleButton.addEventListener("click", shuffleTiles); // shuffle tiles when the button is clicked
    puzzleContainer.addEventListener("click", movingTileClick);  // click listener for tiles
    puzzleContainer.addEventListener("click", () => {
        highlightNeighbors();
    });
    shuffleButton.addEventListener("click", () => {
        highlightNeighbors();
    });
    // create the tiles initially
    createTiles();
});
