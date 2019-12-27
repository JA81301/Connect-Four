// This all assumes a grid with 6 rows and 7 columns.
// In this program, the pieces the players put down are represented as 1s and -1s.

// Checks if a given list has four 1s or -1s in a row.
function checkList(list) { 
    var runningCount = 0;
    if (list[0] !== 0) {
        runningCount = 1;
    }
    for (var a = 1; a < list.length; a++) {
        if (list[a] !== 0) {
            if (list[a] === list[a - 1]) {
                runningCount += 1;
                if (runningCount === 4) {
                    return list[a];
                }
            } else {
                runningCount = 1;
            }
        } else {
            runningCount = 0;
        }
    }
    return 0;
}

// Checks a given row of the game board for a winner.
function checkRow(grid, row) { 
    var subList = grid[row];
    return checkList(subList);
}

// Checks a given column of the game board for a winner.
function checkColumn(grid, column) { 
    var subList = [];
    for (var a = 0; a < grid.length; a++) {
        subList.push(grid[a][column]);
    }
    return checkList(subList);
}

// Checks a specific diagonal that start in upper left and go to lower right for a winner.
function checkForwardDiagonal(grid, r0, c0) { 
    var xLength = 6 - r0;
    var yLength = 7 - c0;
    var DiagLength = Math.min(xLength, yLength);
    var subList = [];
    for (var a = 0; a < DiagLength; a++) {
        subList.push(grid[r0 + a][c0 + a]);
    }
    return checkList(subList);
}

// Same as checkForwardDiagonal but for diagonals that go from lower left to upper right.
function checkReverseDiagonal(grid, r0, c0) { 
    var xLength = 6 - r0;
    var yLength = c0 + 1;
    var DiagLength = Math.min(xLength, yLength);
    var subList = [];
    for (var a = 0; a < DiagLength; a++) {
        subList.push(grid[r0 + a][c0 - a]);
    }
    return checkList(subList);
}

// Checks all diagonals for a winner. I just listed out all of the row and column starting points
function checkAllDiagonals(grid) { 
    var rNums = [2, 1, 0, 0, 0, 0];
    var cNums = [0, 0, 0, 1, 2, 3];
    for (var a = 0; a < rNums.length; a++) {
        if (checkForwardDiagonal(grid, rNums[a], cNums[a]) !== 0) {
            return checkForwardDiagonal(grid, rNums[a], cNums[a]);
        }
        if (checkReverseDiagonal(grid, rNums[a], 6 - cNums[a]) !== 0) {
            return checkReverseDiagonal(grid, rNums[a], 6 - cNums[a]);
        }
    }
    return 0;
}

function checkAllRows(grid) {
    var results = [];
    for (var a = 0; a < 6; a++) {
        results.push(checkRow(grid, a));
    }
    if (results.includes(1)) {
        return 1;
    }
    if (results.includes(-1)) {
        return -1;
    }
    return 0;
}

function checkAllColumns(grid) {
    var results = [];
    for (var a = 0; a < 7; a++) {
        results.push(checkColumn(grid, a));
    }
    if (results.includes(1)) {
        return 1;
    }
    if (results.includes(-1)) {
        return -1;
    }
    return 0;
}

/*
Based on the current state of the grid, returns a 0 if there is no winner, a 1 if 1 has won, and a -1 if -1 has won.
*/
function checkWin(grid) { 
    if (checkAllColumns(grid) !== 0) {
        return checkAllColumns(grid);
    }
    if (checkAllRows(grid) !== 0) {
        return checkAllRows(grid);
    }
    if (checkAllDiagonals(grid) !== 0) {
        return checkAllDiagonals(grid);
    }
    return 0;
}

// Checks if a move at a given row and column is valid.
function canMove(grid, r, c) { 
    return r === (5 - fillLevel(grid, c));
}

/*
Given a grid and coordinates for a move, returns a new grid in which a move has been made at the coordinates by the player corresponding to "value".
The checkValidity parameter controls whether or not the move being made is checked to make sure it is a legal move. This is needed because one method used for evaluating positions is to see how many "potential wins" a player has--how many squares there are for which they would win if they managed to place a piece there. Therefore, I needed a way to make a hypothetical move that may not be legal now but could be played sometime in the future.
*/
function move(grid, coords, value, checkValidity = true) { 
    invalid = false;
    if (checkValidity) {
        if (canMove(grid, coords[0], coords[1])) {
            var result = copyList(grid);
            result[coords[0]][coords[1]] = value;
            return result;
        } else {
            console.log("That move was invalid");
            invalid = true;
            return grid;
        }
    } else {
        var result = copyList(grid);
        result[coords[0]][coords[1]] = value;
        return result;
    }
}

// Returns a copy of a two-dimensional list to avoid issues with list references.
function copyList(list) { 
    var result = [];
    for (var a = 0; a < list.length; a++) {
        result.push([]);
        for (var b = 0; b < list[a].length; b++) {
            result[a].push(list[a][b]);
        }
    }
    return result;
}

// Returns the number of pieces in a column.
function fillLevel(grid, column) { 
    var result = 0;
    for (var a = 5; a > -1; a--) {
        if (grid[a][column] !== 0) {
            result += 1;
        }
    }
    return result;
}

// Returns all the coordinates in where a legal move can be made.
function possibleMoves(grid) { 
    var result = [];
    for (var a = 0; a < 6; a++) {
        for (var b = 0; b < 7; b++) {
            if (canMove(grid, a, b)) {
                result.push([a, b]);
            }
        }
    }
    return result;
}

/*
Based on the results from the possibleMoves function, returns all the positions that could exist after the next move.
*/
function possiblePositions(grid, player) { 
    var posMoves = possibleMoves(grid);
    var result = [];
    for (var a = 0; a < posMoves.length; a++) {
        result.push(move(grid, posMoves[a], player));
    }
    return result;
}

/*
This function is a means of evaluating a position for which no player has won. This is important because in many instances the program does not search far enough in the game tree to find a guaranteed best move. The way the function works is by counting the difference in the number of winning squares between the two players, and weighting those potential wins by the row in which they occur. A "winning square" is as a square in which a given player would win if they placed a number there. It seems reasonable that a player that has more such squares is more likely to win. In addition, winning squares that occur in lower rows are seen as more valuable because these squares will come into play earlier than ones on higher rows--a player with a lot of potential wins in the lower rows will likely be able to win before a second player with a lot of wins in higher rows will get a chance to reach their own winning squares.
*/
function posWinsDifferential(grid) { 
    var result = 0;
    var positions = [];
    for (var a = 0; a < 6; a++) {
        for (var b = 0; b < 7; b++) {
            if (grid[a][b] === 0) {
                if (checkWin(move(grid, [a, b], 1, false)) === 1) {
                    result += 1 * Math.pow(.9, 5 - a);
                } else if (checkWin(move(grid, [a, b], -1, false)) === -1) {
                    result -= 1 * Math.pow(.9, 5 - a);
                }
            }
        }
    }
    return result;
}

/*
This function is the implmentation of the minimax algorithm. To find the value of a position, it searches the game tree to see if that positions will lead to a win, loss, or draw eventually, assuming both players make the best possible move. However, there are far too many possible moves for the program to search all the way to the end of the game tree every move. The parameter branchNumLimit represents the maximum number of moves ahead the program will search, and currentBranchNum represents that number of moves ahead that have been searched already. Each time the function is called recursivlely, currentBranchNum is incrimented until it reaches branchNumLimit. At this point, the posWinsDifferential function is used to evaluate positions.
*/
function getPosValue(grid, player, currentBranchNum, branchNumLimit) { 
    if (checkWin(grid) !== 0) {
        return checkWin(grid);
    }
    if (currentBranchNum === branchNumLimit) {
        return getGridValue(grid, player); // This incorporates posWinsDifferential.
    }
    var posPositions = possiblePositions(grid, player);
    var posPositionsValues = [];
    if (posPositions.length === 0) {
        return 0;
    } else {
        for (var a = 0; a < posPositions.length; a++) {
            count += 1;
            posPositionsValues.push(.9 * getPosValue(posPositions[a], player * -1, currentBranchNum + 1, branchNumLimit));
            // Because of the .9, the program sees wins that are farther away as worse than wins that are closer because their value decreases with each multiplication. For this reason, the program will pick the move that leads to the fastest guaranteed win. Similarly, losses have a negative value, so losses that are farther away are seen as less bad than losses that are closer. This is important because it means the program will try to delay losing for as long as possible even if it sees that a position is a guaranteed loss, which gives a human opponent more time to make a mistake.
        }
        if (player === 1) {
            return Math.max(...posPositionsValues);
        } else {
            return Math.min(...posPositionsValues);
        }
    }
}

// Returns the index of the highest element in an array.
function maxIndex(arr) {
    var maxValue = Math.max(...arr);
    return arr.indexOf(maxValue);
}

// Returns the index of the highest element in an array.
function minIndex(arr) {
    var minValue = Math.min(...arr);
    return arr.indexOf(minValue);
}

/*
This function combines the checkWin function with the posWinsDifferential function to evaluate a position. If a position is a win it gets a value of plus or minus 1, if not the position is evaluated based on the method described in poswinsDifferential.
*/
function getGridValue(grid, player) { 
    var checkWinNum = checkWin(grid);
    if (checkWinNum !== 0) {
        return checkWinNum;
    } else {
        return posWinsDifferential(grid) / 100; // The division by 100 ensures that this value will always be significantly less than 1. This means that when looking ahead many moves, the program will always prioritize a guaranteed win first over any result coming from posWinsDifferential.
    }
}

// Picks the best move by using getPosValue.
function bestMove(grid, player, branchNumLimit) { 
    var posMoves = possibleMoves(grid);
    var posPositions = possiblePositions(grid, player);
    var posPositionValues = [];
    var bestIndex;
    for (var a = 0; a < posPositions.length; a++) {
        if (getGridValue(posPositions[a]) === player) {
            return move(grid, posMoves[a], player);
        }
        posPositionValues.push(getPosValue(posPositions[a], player * -1, 0, branchNumLimit));
    }
    if (player === 1) {
        bestIndex = maxIndex(posPositionValues);
    } else {
        bestIndex = minIndex(posPositionValues);
    }
    return move(grid, posMoves[bestIndex], player);
}

function reset() {
    return [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0]
    ];
}

// Draws the lines of the board.
function drawGridlines() { 
    for (var a = 0; a < 6; a++) {
        ctx.moveTo(0, 100 * a);
        ctx.lineTo(700, 100 * a);
        ctx.stroke();
    }
    for (var b = 0; b < 7; b++) {
        ctx.moveTo(100 * b, 0);
        ctx.lineTo(100 * b, 600);
        ctx.stroke();
    }
}

// Draws red and blue circles to represent the pieces on the board.
function fillGrid(grid) { 
    for (var a = 0; a < 6; a++) {
        for (var b = 0; b < 7; b++) {
            if (grid[a][b] === 1) {
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.arc(b * 100 + 50, a * 100 + 50, 40, 0, 2 * Math.PI);
                ctx.fill();
            }
            if (grid[a][b] === -1) {
                ctx.fillStyle = "blue";
                ctx.beginPath();
                ctx.arc(b * 100 + 50, a * 100 + 50, 40, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
}

function drawGame(grid) {
    ctx.clearRect(0, 0, 700, 600);
    drawGridlines();
    fillGrid(grid);
}

// Changes the text on top of the board if the game is over.
function winResponse(grid) { 
    if (checkWin(grid) === 1) {
        win = 1;
        heading.innerHTML = "Computer Wins";
    } else if (checkWin(grid) === -1) {
        heading.innerHTML = "Player Wins";
        win = -1;
    } else if (possibleMoves(grid).length === 0) {
        heading.innerHTML = "Tie";
    }
}

/*
This function controls how many moves ahead the program will search. As the number of non-full columns decreases, there are less possible moves, so the game tree increases in size more slowly. This enables the computer to search farther ahead in the same amount of time. The specific numbers returned were tested so each move would take about the same time throughout the game.
*/
function getSearchDepth(grid) {
    var numMoves = possibleMoves(grid).length; // This is the number of open columns.
    if (numMoves === 7) {
        return 5;
    }
    if (numMoves === 6) {
        return 6;
    }
    if (numMoves === 5) {
        return 7;
    }
    if (numMoves === 4) {
        return 9;
    }
    if (numMoves === 3) {
        return 12;
    }
    if (numMoves === 2) {
        return 18; // This specific value does not matter since the program can search to the end of the game at this point.
    }
    if (numMoves === 1) {
        return 18; // This specific value does not matter since the program can search to the end of the game at this point.
    }
}

// Adjusts the search depth based on the difficulty level selected.
function levelAdjust(evt) {
    if (adjust === -1) {
        adjust = -4;
        levelButton.innerHTML = "Current Difficulty: Very Easy";
    } else if (adjust === -4) {
        adjust = -3;
        levelButton.innerHTML = "Current Difficulty: Easy";
    } else if (adjust === -3) {
        adjust = -2;
        levelButton.innerHTML = "Current Difficulty: Medium";
    } else if (adjust === -2) {
        adjust = -1;
        levelButton.innerHTML = "Current Difficulty: Hard";
        alert("On the \"hard\" difficulty setting, the computer may take 10 or more seconds to move.");
    }
}

// Deals with click events on the board.
function clickHandler(evt) { 
    if (turn % 2 === 0 && win === 0) {
        var mousePos = getMousePos(evt);
        var rNum = Math.floor(mousePos[1] / 100);
        var cNum = Math.floor(mousePos[0] / 100);
        gameGrid = move(gameGrid, [rNum, cNum], -1);
        if (invalid === false) {
            drawGame(gameGrid);
            turn += 1;
            heading.innerHTML = "Computer's Turn";
            winResponse(gameGrid); // Changes the text over the board if the game is over.
        }
    }
}

// The computer moves by seeing how many moves ahead to search and using the bestMove function.
function computerMove() { 
    if (turn % 2 === 1 && win === 0) {
        searchDepth = getSearchDepth(gameGrid) + adjust;
        gameGrid = bestMove(gameGrid, 1, searchDepth);
        drawGame(gameGrid);
        turn += 1;
        heading.innerHTML = "Player's Turn";
        winResponse(gameGrid);
    }
}

function resetGame(){
    document.location.reload()
}

// Gets mouse position after a click event.
function getMousePos(evt) { 
    var border = canvas.getBoundingClientRect();
    return [evt.clientX - border.left, evt.clientY - border.top];
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var heading = document.getElementById("heading");
var levelButton = document.getElementById("levelSet");
var resetButton = document.getElementById("resetButton")

var gameGrid = reset();
var turn = 0;
var win = 0;
var searchDepth;
var invalid = false;
var count = 0;
var adjust = -2;

drawGridlines();

var option = confirm("Click Okay to Go First and Cancel to Go Second");
if (option === true) {
    turn = 0;
}
if (option === false) {
    gameGrid = move(gameGrid, [5, 3], 1); // The computer's first move is always to go in the center.
    drawGame(gameGrid);
}
heading.innerHTML = "Player's Turn";

canvas.addEventListener("mousedown", clickHandler);
canvas.addEventListener("mouseup",computerMove);
levelButton.addEventListener("click", levelAdjust);
resetButton.addEventListener("click", resetGame)
