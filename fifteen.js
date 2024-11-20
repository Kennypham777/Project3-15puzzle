document.addEventListener("DOMContentLoaded", function () {
    const gridSize = 4;
    const puzzleContainer = document.getElementById("puzzle-container");
    const shuffleButton = document.getElementById("shuffle-btn");
    const imageUrl = 'background1.png'; // image for tiles

    // creates tiles with appropriate background image slice
    function createTiles() {
        puzzleContainer.innerHTML = ''; // clear existing tiles

        let tileId = 0; // used for labeling tiles and tracking their positions
        for (let row = 0; row < gridSize; row++) { //loop through each row
            for (let col = 0; col < gridSize; col++) { //loop through each column in current row
                const tile = document.createElement("div"); //creates div element (our tiles)
                tile.classList.add("puzzle-tile"); //add tile styling from css to div
                
                // shifting background in tile based on position
                const posX = col * 100; 
                const posY = row * 100;

                // set the background image and position
                tile.style.backgroundImage = `url(${imageUrl})`;
                tile.style.backgroundPosition = `-${posX}px -${posY}px`;

                // adding numbers for each tile
                if (tileId < gridSize * gridSize - 1) {
                    tile.textContent = tileId + 1;
                }

                tile.setAttribute("data-id", tileId); // giving each tile a tileId for future tracking
                puzzleContainer.appendChild(tile); //adds the created tile (div) to container
                tileId++; //move on to making next tile
            }
        }
    }

    // get the neighbors of the empty tile (which is on index 15)
    function getEmptyTileNeighbors(emptyIndex) {
        // calculate row and column of empty tile
        const row = Math.floor(emptyIndex / gridSize);
        const col = emptyIndex % gridSize;

        const neighbors = []; // empty array that will hold neighbors

        // check for valid neighbors (if there is a row/column up, down, left, right of empty tile)
        if (row > 0) neighbors.push(emptyIndex - gridSize); // up
        if (row < gridSize - 1) neighbors.push(emptyIndex + gridSize); // down
        if (col > 0) neighbors.push(emptyIndex - 1); // left
        if (col < gridSize - 1) neighbors.push(emptyIndex + 1); // right

        return neighbors; //returns array of neighbors to empty tile
    }

    // shuffle the tiles by moving random neighbors to the empty space
    function shuffleTiles() {
        const tiles = Array.from(puzzleContainer.getElementsByClassName("puzzle-tile")); //array of all tiles by getting stuff with puzzle-tile class
        let emptyIndex = tiles.length - 1; // initially, the empty tile is at the last position
        const movesCount = 100; // amount of moves to make for shuffling

        for (let i = 0; i < movesCount; i++) { //loop based on movesCount
            const neighbors = getEmptyTileNeighbors(emptyIndex); //gets an array of all neighbors of empty tile
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)]; //randomly pick a neighbor to swap empty tile with

            // swap the empty tile with the randomly selected neighbor (swapping position, number, background, id)
            [tiles[emptyIndex].textContent, tiles[randomNeighbor].textContent] = [tiles[randomNeighbor].textContent, tiles[emptyIndex].textContent];
            [tiles[emptyIndex].style.backgroundPosition, tiles[randomNeighbor].style.backgroundPosition] = 
                [tiles[randomNeighbor].style.backgroundPosition, tiles[emptyIndex].style.backgroundPosition];
            [tiles[emptyIndex].dataset.id, tiles[randomNeighbor].dataset.id] = [tiles[randomNeighbor].dataset.id, tiles[emptyIndex].dataset.id];


            // after swapping, update empty tile to the new position
            emptyIndex = randomNeighbor;
        }
    }

    shuffleButton.addEventListener("click", function () {
        shuffleTiles(); // shuffle tiles when button is clicked
    });

    // create the tiles initially
    createTiles();
});
