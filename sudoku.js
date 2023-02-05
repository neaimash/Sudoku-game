
// grid variable
var table;
// game number
var gameId = 0;
// puzzle grid
var puzzle = [];
// solution grid 
var solution = [];
// remaining number counts
var remaining = [9, 9, 9, 9, 9, 9, 9, 9, 9];
// stopwatch timer variables
var timer = 0;
var pauseTimer = false;
var intervalId;
var gameOn = false;
function newGame(difficulty) {
    // get random position for numbers from '1' to '9' to generate a random puzzle
    var grid = getGridInit();
    // prepare rows, columns and blocks to solove the initioaled grid
    var rows = grid;
    var cols = getColumns(grid);
    var blks = getBlocks(grid);
    // generate allowed digits for each cell
    var psNum = generatePossibleNumber(rows, cols, blks);
    // solve the grid
    solution = solveGrid(psNum, rows, true);
    timer = 0;
    // empty cells from grid depend on difficulty
    // 64 empty cells for easy
    // 69 empty cells for normal
    // 74 empty cells for hard
    puzzle = makeItPuzzle(solution, difficulty);
    gameOn =true;
    ViewPuzzle(puzzle);
    //start the timer
    if (gameOn)
    {
        startTimer();
    }
}
function getGridInit() {
    var rand = [];
    // for each digits from 1 to 9 find a random row and column 
    for (var i = 1; i <= 9; i++) {
        var row = Math.floor(Math.random() * 9);
        var col = Math.floor(Math.random() * 9);
        var accept = true;
        for (var j = 0; j < rand.length; j++) 
        {
            // if number exist or there is a number already located in then ignore and try again
            if (rand[j][0] == i | (rand[j][1] == row & rand[j][2] == col)) {
                accept = false;
                //new position for this number
                i--;
                break;
            }
        }
        if (accept) 
        {
            rand.push([i, row, col]);
        }
    }
    // initialize new empty grid 
    var result = [];
    for (var i = 0; i < 9; i++) {
        var row = "000000000";
        result.push(row);
    }
    // put numbers in the grid
    for (var i = 0; i < rand.length; i++) {
        result[rand[i][1]] = replaceCharAt(result[rand[i][1]], rand[i][2], rand[i][0]);
    }
    return result;
}
// return columns from a row grid
function getColumns(grid) {
    var result = ["", "", "", "", "", "", "", "", ""];
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++)
            result[j] += grid[i][j];
    }
    return result;
}
// return blocks from a row grid
function getBlocks(grid) {
    var result = ["", "", "", "", "", "", "", "", ""];
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++)
            result[Math.floor(i / 3) * 3 + Math.floor(j / 3)] += grid[i][j];
    }
    return result;
}
// function to replace char in string
function replaceCharAt(string, index, char) {
    if (index > string.length - 1) return string;
    return string.substr(0, index) + char + string.substr(index + 1);
}
// get numbers that can be placed in each cell
function generatePossibleNumber(rows, columns, blocks) {
    var psb = [];
    // for each cell get numbers that are not viewed in a row, column or block
    // if the cell is not empty then, allowed number is the number already exist in it
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            psb[i * 9 + j] = "";
            if (rows[i][j] != 0) {
                psb[i * 9 + j] += rows[i][j];
            } else {
                for (var k = '1'; k <= '9'; k++) {
                    if (!rows[i].includes(k))
                        if (!columns[j].includes(k))
                            if (!blocks[Math.floor(i / 3) * 3 + Math.floor(j / 3)].includes(k))
                                psb[i * 9 + j] += k;
                }
            }
        }
    }
    return psb;
}
function solveGrid(possibleNumber, rows, startFromZero) {
    var solution = [];
    // solve Sudoku with a backtracking algorithm
    // Steps are:
    //  1.  get all allowed numbers that fit in each empty cell
    //  2.  generate all possible rows that fit in the first row depend on the allowed number list
    //` 3.  select one row from possible row list and put it in the first row
    //  4.  go to next row and find all possible number that fit in each cell
    //  5.  generate all possible row fit in this row then go to step 3 until reach the last row or there aren't any possible rows left
    //  6.  if next row hasn't any possible left then go the previous row and try the next possibility from possibility rows' list
    //  7.  if the last row has reached and a row fit in it has found then the grid has solved
    var result = nextStep(0, possibleNumber, rows, solution, startFromZero);
    if (result == 1)
        return solution;
}
// level is current row number in the grid
function nextStep(level, possibleNumber, rows, solution, startFromZero) {
    // get possible number fit in each cell in this row
    var x = possibleNumber.slice(level * 9, (level + 1) * 9);
    // generate possible numbers sequence that fit in the current row
    var y = generatePossibleRows(x);
    if (y.length == 0)
        return 0;
    var start = startFromZero ? 0 : y.length - 1;
    var stop = startFromZero ? y.length - 1 : 0;
    var step = startFromZero ? 1 : -1;
    var condition = startFromZero ? (start <= stop) : (start >= stop);
    // try every numbers sequence in this list and go to next row
    for (var num = start; condition; num += step) {
        var condition = startFromZero ? (num + step <= stop) : (num + step >= stop);
        for (var i = level + 1; i < 9; i++)
            solution[i] = rows[i];
        solution[level] = y[num];
        if (level < 8) {
            var cols = getColumns(solution);
            var blocks = getBlocks(solution);
            var poss = generatePossibleNumber(solution, cols, blocks);
            if (nextStep(level + 1, poss, rows, solution, startFromZero) == 1)
                return 1;
        }
        if (level == 8)
            return 1;
    }
    return -1;
}
// generate possible numbers sequence that fit in the current row
function generatePossibleRows(possibleNumber) {
    var result = [];
    function step(level, PossibleRow) {
        if (level == 9) {
            result.push(PossibleRow);
            return;
        }
        for (var i in possibleNumber[level]) {
            if (PossibleRow.includes(possibleNumber[level][i]))
                continue;
            step(level + 1, PossibleRow + possibleNumber[level][i]);
        }
    }
    step(0, "");
    return result;
}
// empty cell from grid depends on the difficulty to make the puzzle
function makeItPuzzle(grid, difficulty) {
    /*
        difficulty:
        // hard     : 1;
        // Normal   : 2;
        // easy     : 3;
    */
    // empty_cell_count = 5 * difficulty + 20
    // when difficulty = 13, empty_cell_count = 85 > (81 total cells count)
    // so the puzzle is showen as solved grid
    if (!(difficulty < 4 && difficulty > 0))
        difficulty = 13;
    var remainedValues = 81;
    var puzzle = grid.slice(0);
    // function to remove value from a cell and its symmetry then return remained values
    function clearValue(grid, x, y, remainedValues) {
        function getSymmetry(x, y) {
            var symX = 8 - x;  //Symmetry
            var symY = 8 - y;
            return [symX, symY];
        }
        var sym = getSymmetry(x, y);
        if (grid[y][x] != 0) {
            grid[y] = replaceCharAt(grid[y], x, "0")
            remainedValues--;
            if (x != sym[0] && y != sym[1]) {
                grid[sym[1]] = replaceCharAt(grid[sym[1]], sym[0], "0")
                remainedValues--;
            }
        }
        return remainedValues;
    }
    // remove value from a cell and its symmetry to reach the expected empty cells amount
    while (remainedValues > (difficulty * 5 + 20)) {
        var x = Math.floor(Math.random() * 9);
        var y = Math.floor(Math.random() * 9);
        remainedValues = clearValue(puzzle, x, y, remainedValues);
    }
    return puzzle;
}
// view grid in html page
function ViewPuzzle(grid) {
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            var input = table.rows[i].cells[j].getElementsByTagName('input')[0];
            addClassToCell(table.rows[i].cells[j].getElementsByTagName('input')[0]);
            if (grid[i][j] == "0") {
                input.disabled = false;
                input.value = "";
            }
            else {
                input.disabled = true;
                input.value = grid[i][j];
            }
        }
    }
}
// read current grid
function readInput() {
    var result = [];
    for (var i = 0; i < 9; i++) {
        result.push("");
        for (var j = 0; j < 9; j++) {
            var input = table.rows[i].cells[j].getElementsByTagName('input')[0];
            if (input.value == "" || input.value.length > 1 || input.value == "0") {
                input.value = ""
                result[i] += "0";
            }
            else
                result[i] += input.value;
        }
    }
    return result;
}
// check value if it is correct or wrong
// return:
//  0 for value can't be changed
//  1 for correct value
//  2 for value that has a conflict with other values but not wrong
//  3 for value that conflict with value in its row, column or block
//  4 for incorect input
function checkValue(value, row, column, block, defaultValue, currectValue) {
    if (value === "" || value === '0')
        return 0;
    if (!(value > '0' && value < ':'))
        return 4;
    if (value === defaultValue)
        return 0;
    if ((row.indexOf(value) != row.lastIndexOf(value))
        || (column.indexOf(value) != column.lastIndexOf(value))
        || (block.indexOf(value) != block.lastIndexOf(value))) {
        return 3;
    }
    if (value !== currectValue)
        return 2;
    return 1;
}
// remove old class from input and add a new class to represent current cell's state
function addClassToCell(input, className) {
    // remove old class from input
    input.classList.remove("right-cell");
    input.classList.remove("worning-cell");
    input.classList.remove("wrong-cell");
    if (className != undefined)
        input.classList.add(className);
}
// start stopwatch timer
function startTimer() {
    var timerDiv = document.getElementById("timer");
    clearInterval(intervalId);
    // update stopwatch value every one second
    pauseTimer = false;
    intervalId = setInterval(function () {
        if (!pauseTimer) {
            timer++;
            var min = Math.floor(timer / 60);
            var sec = timer % 60;
            timerDiv.innerText = (("" + min).length < 2 ? ("0" + min) : min) + ":" + (("" + sec).length < 2 ? ("0" + sec) : sec);
        }
    }, 1000);
}
// hide more option menu
function hideMoreOptionMenu() {
    var moreOptionList = document.getElementById("more-option-list");
    if (moreOptionList.style.visibility == "visible") {
        moreOptionList.style.maxWidth = "40px";
        moreOptionList.style.minWidth = "40px";
        moreOptionList.style.maxHeight = "10px";
        moreOptionList.style.opacity = "0";
        setTimeout(function () {
            moreOptionList.style.visibility = "hidden";
        }, 175);
    }
}
// UI Comunication functions
// function that must run when document loaded
window.onload = function () {
   //events onclick
    var click=document.getElementById("button_b");
    click.addEventListener("click",moreOptionButtonClick,false);
    var click1=document.getElementById("level_1");
    click1.addEventListener("click",newGame1,false);
    var click2=document.getElementById("level_2");
    click2.addEventListener("click",newGame2,false);
    var click3=document.getElementById("level_3");
    click3.addEventListener("click",newGame3,false);
    var click4=document.getElementById("hint");
    click4.addEventListener("click",hintButtonClick,false);
    var click5=document.getElementById("restart");
    click5.addEventListener("click",restartButtonClick,false);
    var click6=document.getElementById("pause");
    click6.addEventListener("click",pauseGameButtonClick,false);
    var click7=document.getElementById("check");
    click7.addEventListener("click",checkButtonClick,false);
    // assigne table to its value
    table = document.getElementById("puzzle-grid");
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var input = table.rows[i].cells[j].getElementsByTagName('input')[0];
            // add function to remove color from cells and update remaining numbers table when it get changed
            input.onchange = function () {
                //remove color from cell
                addClassToCell(this);
                // check if the new value entered is allowed
                function checkInput(input) {
                    if (input.value[0] < '1' || input.value[0] > '9') {
                        if (input.value != "?" && input.value != "؟") {
                            input.value = "";
                            alert("only numbers [1-9] and question mark '?' are allowed!!");
                            input.focus()
                        }
                    }
                }
                checkInput(this);
                // compare old value and new value then update remaining numbers table 
                if (this.value > 0 && this.value < 10)
                    remaining[this.value - 1]--;
                if (this.oldvalue !== "") {
                    if (this.oldvalue > 0 && this.oldvalue < 10)
                        remaining[this.oldvalue - 1]++;
                }
            };
            //change cell 'old value' when it got focused to track numbers and changes on grid
            input.onfocus = function () {
                this.oldvalue = this.value;
            };
        }
    }
}
// function to hide dialog opened in window
window.onclick = function (event) {
    var m1 = document.getElementById("more-option-list");
     if (m1.style.visibility == "visible") {
        hideMoreOptionMenu();
    }
}
function newGame1()
{
    newGame(3);
}
function newGame2()
{
    newGame(2);
}
function newGame3()
{
    newGame(1);
}
// pause button click function
function pauseGameButtonClick() {
    // hide or show the grid
    if (pauseTimer) {
        table.style.opacity = 1;
    }
    else {
        table.style.opacity = 0;
    }
    pauseTimer = !pauseTimer;
}
// check button click function
function checkButtonClick() {
    // check if game is started
    if (gameOn) 
    {
        // add one minute to the stopwatch as a cost of grid's check
        timer += 60;
        var currentGrid = [];
        // read gritd status
        currentGrid = readInput();
        var columns = getColumns(currentGrid);
        var blocks = getBlocks(currentGrid);
        var errors = 0;
        var currects = 0;
        for (var i = 0; i < currentGrid.length; i++) {
            for (var j = 0; j < currentGrid[i].length; j++) {
                if (currentGrid[i][j] == "0")
                    continue;
                // check value if it is correct or wrong
                var result = checkValue(currentGrid[i][j], currentGrid[i], columns[j], blocks[Math.floor(i / 3) * 3 + Math.floor(j / 3)], puzzle[i][j], solution[i][j]);
                // remove old class from input and add a new class to represent current cell's state
                addClassToCell(table.rows[i].cells[j].getElementsByTagName('input')[0], result === 1 ? "right-cell" : (result === 2 ? "worning-cell" : (result === 3 ? "wrong-cell" : undefined)));
                if (result === 1 || result === 0) {
                    currects++;
                } else if (result === 3) {
                    errors++;
                }
            }
        }
        // if all values are correct and they equal original values then game over and the puzzle has been solved
        // if all values are correct and they aren't equal original values then game over but the puzzle has not been solved yet
        if (currects === 81) 
        {
            gameOn = false;
            pauseTimer = true;
            clearInterval(intervalId);
            alert("Congrats, You solved it.");
        } 
        else if (errors === 0 && currects === 0) {
            alert("Congrats, You solved it, but this is not the solution that I want.");
        }
    }
}
// restart button click function
function restartButtonClick() {
    if (gameOn) {
        // reset remaining number table
        for (var i in remaining)
            remaining[i] = 9;

        // review puzzle
        ViewPuzzle(puzzle);
        // restart the timer
        // -1 is because it take 1 sec to update the timer so it will start from 0
        timer = -1;
    }
}
// hint button click function
function hintButtonClick() {
    if (gameOn) {
        // get list of empty cells and list of wrong cells
        var empty_cells_list = [];
        var wrong_cells_list = [];
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                var input = table.rows[i].cells[j].getElementsByTagName('input')[0];
                if (input.value == "" || input.value.length > 1 || input.value == "0") {
                    empty_cells_list.push([i, j])
                }
                else {
                    if (input.value !== solution[i][j])
                        wrong_cells_list.push([i, j])
                }
            }
        }
        // check if gird is solved if so stop the game
        if (empty_cells_list.length === 0 && wrong_cells_list.length === 0) {
            gameOn = false;
            pauseTimer = true;
            clearInterval(intervalId);
            alert("Congrats, You solved it.");
        } 
        else {
            // add one minute to the stopwatch as a cost for given hint
            timer += 60;
            // get random cell from empty or wrong list and put the currect value in it
            var input
            if ((Math.random() < 0.5 && empty_cells_list.length > 0) || wrong_cells_list.length === 0) {
                var index = Math.floor(Math.random() * empty_cells_list.length)
                input = table.rows[empty_cells_list[index][0]].cells[empty_cells_list[index][1]].getElementsByTagName('input')[0];
                input.oldvalue = input.value;
                input.value = solution[empty_cells_list[index][0]][empty_cells_list[index][1]];
                remaining[input.value - 1]--;
            } else {
                var index = Math.floor(Math.random() * wrong_cells_list.length)
                input = table.rows[wrong_cells_list[index][0]].cells[wrong_cells_list[index][1]].getElementsByTagName('input')[0];
                input.oldvalue = input.value;
                remaining[input.value - 1]++;
                input.value = solution[wrong_cells_list[index][0]][wrong_cells_list[index][1]];
                remaining[input.value - 1]--;
            }
        }
    }
}
// show more option menu
function moreOptionButtonClick() {
    var moreOptionList = document.getElementById("more-option-list");
    // timeout to avoid hide menu immediately in window event
    setTimeout(function () {
        if (moreOptionList.style.visibility == "hidden") {
            moreOptionList.style.visibility = "visible";
            setTimeout(function () {
                moreOptionList.style.maxWidth = "160px";
                moreOptionList.style.minWidth = "160px";
                moreOptionList.style.maxHeight = "160px";
                moreOptionList.style.opacity = "1";
            }, 50);
        }
    }, 50);
}
function hideDialogButtonClick(dialogId) {
    var dialog = document.getElementById(dialogId);
    var dialogBox = document.getElementById(dialogId + "-box");
    dialog.style.opacity = 0;
    dialogBox.style.marginTop = "-500px";

    setTimeout(function () {
        dialog.style.visibility = "collapse";
    }, 500);
}
