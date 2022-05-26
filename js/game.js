const ALIEN = '👽';
const ASTRO = '👩🏻‍🚀';
const FAILED = '👾';
const WON = '🇺🇸';

const winSound = new Audio('sounds/space-win.wav');
const hitSound = new Audio('sounds/space-lose.wav');


const gLevels = [
    { id: 0, size: 4, mines: 3, bestTime: localStorage.getItem('bestTime-0') },
    { id: 1, size: 8, mines: 12, bestTime: localStorage.getItem('bestTime-1') },
    { id: 2, size: 12, mines: 30, bestTime: localStorage.getItem('bestTime-2') }
];

//time
var gTimeInterval;
var gSecCounter;

var gLevel = gLevels[0];
var gBoard;

var gGame;


function initGame(level) {
    gLevel = gLevels[level];
    gGame = setNewGameData();
    gBoard = buildBoard(gLevel.size);

    renderBoard(gBoard);
    console.table(gBoard);
    renderRoundData();
    resetTime();
}

function setNewGameData() {
    var data = {
        isOn: true,
        shownCount: 0,
        flagsAvailable: gLevel.mines,
        FlaggedMines: 0,
        livesLeft: 3,
        safeClicksLeft: 3,
        hintsLeft: 3,
        isHint: false,
        gameSecs: 0
    };
    return data;
}

function renderRoundData() {
    renderFieldSize()
    document.querySelector('.flags-left').innerText = gGame.flagsAvailable;
    document.querySelector('.lives-left').innerText = gGame.livesLeft;
    document.querySelector('.safe-clicks-left').innerText = gGame.safeClicksLeft;
    document.querySelector('.hints-left').innerText = gGame.hintsLeft;
    document.querySelector('.restart-btn').innerText = ASTRO;
    var elEndMsg = document.querySelector('.end-msg');
    elEndMsg.style.opacity = 0;
}

function cellClicked(elCell, i, j) {
    var cell = gBoard[i][j];
    if (!gGame.isOn || cell.isMarked || cell.isShown) return;
    if (gGame.isHint) {
        giveHint(i, j);
        gGame.isHint = false;
        return;
    }

    if (cell.isMine) {
        document.querySelector('.lives-left').innerText = --gGame.livesLeft;
        hitSound.play();
        elCell.classList.add('warning');
        setTimeout(() => elCell.classList.remove('warning'), 700);
        if (gGame.livesLeft === 0) gameOver();
    }

    if (!cell.isMine || gGame.livesLeft === 0) {
        gGame.shownCount++;
        cell.isShown = true;
        elCell.classList.add('flipped');
        elCell.querySelector('span').classList.add('shown');
        checkVictory();
    }

    console.log(gGame);

    //if its the first cell, start time and place mines
    if (gGame.shownCount === 1) {
        placeMines(gBoard);
        renderMinesAndNegsCount(gBoard);
        startTime();
    }

    var elCellTxt = elCell.querySelector('span').innerText;
    if (+elCellTxt === 0 && !gBoard[i][j].isMine) expendOpen(i, j);
}

function expendOpen(posI, posJ) {
    var neighbor;
    var elNeighbor;
    var elNeighborTxt;

    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (i === posI && j === posJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;

            neighbor = gBoard[i][j];
            elNeighbor = document.querySelector(`.cell-${i}-${j}`);
            elNeighborTxt = elNeighbor.querySelector('span').innerText;
            if (+elNeighborTxt === 0) {
                cellClicked(elNeighbor, i, j);
            };
        }
    }
}

function cellMarked(elCell, i, j) {
    var cell = gBoard[i][j];
    if (cell.isShown || !gGame.isOn) return;

    if (cell.isMarked) {
        if (cell.isMine) gGame.FlaggedMines--;

        gGame.flagsAvailable++;
        cell.isMarked = false;
        elCell.classList.remove('marked');

    } else { //(cell is not already marked)
        if (gGame.flagsAvailable === 0) return;
        if (cell.isMine) gGame.FlaggedMines++;
        gGame.flagsAvailable--;
        cell.isMarked = true;

        elCell.classList.add('marked');
        checkVictory();
    }

    document.querySelector('.flags-left').innerText = gGame.flagsAvailable;
    console.log(gGame);
}

function safeClick() {
    if (!gGame.isOn || gGame.safeClicksLeft === 0) return;
    var cell;
    var elCell;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            cell = gBoard[i][j];

            if (!cell.isMine && !cell.isShown) {
                elCell = document.querySelector(`.cell-${i}-${j}`);
                elCell.classList.add('safe');
                setTimeout(() => elCell.classList.remove('safe'), 700);
                gGame.safeClicksLeft--;
                document.querySelector('.safe-clicks-left').innerText = gGame.safeClicksLeft;
                return;
            }
        }
    }
}

function hintClick() {
    if (!gGame.isOn || gGame.isHint || gGame.hintsLeft === 0) return;
    gGame.isHint = true;
    document.querySelector('.hints-left').innerText = --gGame.hintsLeft;
}

function giveHint(posI, posJ) {

    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (gBoard[i][j].isShown) continue;

            let elCell = document.querySelector(`.cell-${i}-${j}`);
            let elCellTxt = elCell.querySelector('span');
            //show cell
            elCell.classList.add('flipped');
            elCellTxt.classList.add('shown');
            //cover cel
            setTimeout(() => {
                elCell.classList.remove('flipped');
                elCellTxt.classList.remove('shown');
            }, 1000);
        }
    }
}

function checkVictory() {
    //  if all cells accept the mines are flipped,
    //  and all the mines are flagged, game won.
    if (gGame.shownCount === (Math.pow(gLevel.size, 2) - gLevel.mines) &&
        gGame.FlaggedMines === gLevel.mines) gameOver();
}

function gameOver() {
    stopTime();
    gGame.isOn = false;
    var isVictory = gGame.FlaggedMines === gLevel.mines;
    var elEndMsg = document.querySelector('.end-msg');
    var elRsButton = document.querySelector('.restart-btn');

    elRsButton.innerText = isVictory ? WON : FAILED;
    elEndMsg.innerText = isVictory ? 'YOU DID IT!' : 'YOU FAILED!';
    if (isVictory) checkIfBestTime();
    elEndMsg.style.opacity = 1;

    if (isVictory) winSound.play();
}


//time keeping
function runTime() {
    gSecCounter++;

    var mins = Math.floor(gSecCounter / 60);
    if (mins === 60) {
        gameOver(); //limit game to an hour max
        return;
    }
    var secs = gSecCounter % 60;

    if (mins < 10) mins = '0' + mins;
    if (secs < 10) secs = '0' + secs;

    gGame.gameSecs = gSecCounter;
    document.querySelector('.mins').innerText = mins;
    document.querySelector('.secs').innerText = secs;
}

function startTime() {
    gTimeInterval = setInterval(runTime, 1000);
}

function stopTime() {
    clearInterval(gTimeInterval);
}

function resetTime() {
    clearInterval(gTimeInterval);
    gSecCounter = 0;
    gGame.gameSecs = 0;
    document.querySelector('.mins').innerText = '00';
    document.querySelector('.secs').innerText = '00';
}

function checkIfBestTime() {
    if (gGame.gameSecs < gLevel.bestTime || gLevel.bestTime === null) {
        localStorage.setItem(`bestTime-${gLevel.id}`, gGame.gameSecs);
        gLevel.bestTime = localStorage.getItem(`bestTime-${gLevel.id}`);

        document.querySelector('.end-msg').innerText += ' - LEVEL TIME RECORD!';
    }
}