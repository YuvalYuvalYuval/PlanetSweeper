// prevent pop up menu on right click
document.addEventListener('contextmenu', event => event.preventDefault());

function countNeighborMines(location, board) {
    var neighborsCount = 0;
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (i === location.i && j === location.j) continue;
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].isMine) neighborsCount++;
        }
    }
    return neighborsCount;
}

function buildBoard(size) {
    var cell;
    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([]);
        for (var j = 0; j < size; j++) {
            cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
            board[i][j] = cell;
        }
    }
    return board;
}

function renderBtns() {
    strHTML = '';
    for (var i = 0; i < 3; i++) {
        strHTML += `<button onclick="initGame(${i})">World ${i + 1}</button>`
    }
    strHTML += `<br><button onclick="initGame(gLevel.id)" class="restart-btn">👩🏻‍🚀</span></button>`
    var elBtnContainer = document.querySelector('.btn-container');
    elBtnContainer.innerHTML = strHTML;
}

function renderBoard(board) {
    var strHTML = '';
    var cell;
    var cellClass;
    var innerTxtClass;

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[i].length; j++) {
            cell = board[i][j];
            cellClass = `cell cell-${i}-${j}`;

            innerTxtClass = cell.isShown ? 'shown' : '';

            strHTML += `\t<td class="${cellClass}"
                onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,${i},${j})">
                \t<span class=${innerTxtClass}>${cell.isMine ? ALIEN : ''} </span>
            </td>\n`
        }
        strHTML += '\n</tr>\n'
        // console.log('strHTML: ', strHTML)
    }
    var elTable = document.querySelector('.board')
    elTable.innerHTML = strHTML
}

function renderFieldSize() {
    document.querySelector('.field-size').innerText = `${gLevel.size}X${gLevel.size}`;
}


function renderCellTxt(location, value) {
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    var elCellTxt = elCell.querySelector('span')

    if (elCellTxt.innerText === ALIEN) return;
    elCellTxt.innerText = value;
}

function placeMines(board) {
    var numOfMines = gLevel.mines;
    var cell;
    var randomI, randomJ;

    //get a random free cell
    for (var i = 0; i < numOfMines; i++) {
        randomI = getRandomIntInc(0, board.length - 1);
        randomJ = getRandomIntInc(0, board.length - 1);
        cell = gBoard[randomI][randomJ];

        while (cell.isMine || cell.isShown) { //prevent double mine placing
            randomI = getRandomIntInc(0, board.length - 1);
            randomJ = getRandomIntInc(0, board.length - 1);
            cell = gBoard[randomI][randomJ];
        }
        cell.isMine = true;
    }
}

function renderMinesAndNegsCount(board) {
    var cell;
    var minesAroundCell;

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            cell = gBoard[i][j];

            minesAroundCell = countNeighborMines({ i, j }, board);

            cell.minesAroundCount = minesAroundCell;
            cell.isMine ? renderCellTxt({ i, j }, ALIEN) :
                renderCellTxt({ i, j }, minesAroundCell);
        }
    }
}

function getRandomIntInc(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min)
}