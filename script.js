let currentDifficulty = 45;
let selectedCell = null;
let noteMode = false;
let solutionBoard = null;
let mahjongDeck = [];
let players = [[], [], [], []]; // 0: 玩家, 1-3: AI
let discardedTiles = [];
let selectedTile = null;
let currentPlayer = 0; // 莊家從 0 開始
let solitaireDeck = [];
let stockPile = [];
let wastePile = [];
let foundations = [[], [], [], []];
let tableau = [[], [], [], [], [], [], []];

function startGame(game) {
    document.getElementById('game-selection').classList.add('hidden');
    document.getElementById('sudoku-container').classList.remove('active');
    document.getElementById('mahjong-container').classList.remove('active');
    document.getElementById('solitaire-container').classList.remove('active');

    if (game === 'sudoku') {
        document.getElementById('sudoku-container').classList.add('active');
        document.getElementById('difficulty-dialog').classList.remove('hidden');
        document.getElementById('sudoku-game').classList.add('hidden');
    } else if (game === 'mahjong') {
        document.getElementById('mahjong-container').classList.add('active');
        startMahjong();
    } else if (game === 'solitaire') {
        document.getElementById('solitaire-container').classList.add('active');
        startSolitaire();
    }
}

function confirmBackToSelection() {
    if (confirm('確定要返回遊戲選單嗎？當前進度將不會保存。')) {
        backToSelection();
    }
}

function backToSelection() {
    document.getElementById('sudoku-container').classList.remove('active');
    document.getElementById('mahjong-container').classList.remove('active');
    document.getElementById('solitaire-container').classList.remove('active');
    document.getElementById('game-selection').classList.remove('hidden');
}

// 數獨遊戲
function createSudokuGrid() {
    const grid = document.getElementById('sudoku-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 81; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.addEventListener('touchstart', function (e) {
            e.preventDefault();
            if (!this.hasAttribute('readonly')) selectSudokuCell(this);
        }, { passive: false });
        cell.addEventListener('click', function (e) {
            e.preventDefault();
            if (!this.hasAttribute('readonly')) selectSudokuCell(this);
        });
        grid.appendChild(cell);
    }
    document.getElementById('number-pad').classList.add('hidden');
    bindNumberPadEvents();
}

function bindNumberPadEvents() {
    const buttons = document.querySelectorAll('.num-btn');
    buttons.forEach(button => {
        button.removeEventListener('touchstart', handleNumberPadTouch);
        button.removeEventListener('click', handleNumberPadTouch);
        button.addEventListener('touchstart', handleNumberPadTouch, { passive: false });
        button.addEventListener('click', handleNumberPadTouch);
    });
}

function handleNumberPadTouch(e) {
    e.preventDefault();
    const num = this.getAttribute('data-num');
    inputSudokuNumber(num);
}

function generateSudokuPuzzle(removeCount) {
    let board = Array(81).fill(0);
    function fillDiagonal() {
        for (let i = 0; i < 9; i += 3) {
            fillBox(i, i);
        }
    }
    function fillBox(row, col) {
        let num;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                do { num = Math.floor(Math.random() * 9) + 1; }
                while (!isSafe(board, row + i, col + j, num));
                board[(row + i) * 9 + (col + j)] = num;
            }
        }
    }
    function isSafe(board, row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (board[row * 9 + x] === num || board[x * 9 + col] === num) return false;
        }
        let startRow = row - row % 3, startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[(startRow + i) * 9 + (startCol + j)] === num) return false;
            }
        }
        return true;
    }
    function solveSudoku(board) {
        let empty = findEmpty(board);
        if (!empty) return true;
        let [row, col] = empty;
        for (let num = 1; num <= 9; num++) {
            if (isSafe(board, row, col, num)) {
                board[row * 9 + col] = num;
                if (solveSudoku(board)) return true;
                board[row * 9 + col] = 0;
            }
        }
        return false;
    }
    function findEmpty(board) {
        for (let i = 0; i < 81; i++) {
            if (board[i] === 0) return [Math.floor(i / 9), i % 9];
        }
        return null;
    }
    function removeCells(board, count) {
        let puzzle = board.slice();
        while (count > 0) {
            let cell = Math.floor(Math.random() * 81);
            if (puzzle[cell] !== 0) {
                puzzle[cell] = 0;
                count--;
            }
        }
        return puzzle;
    }
    fillDiagonal();
    solveSudoku(board);
    solutionBoard = board.slice();
    const puzzle = removeCells(board, removeCount);
    const cells = document.querySelectorAll('.cell');
    puzzle.forEach((num, index) => {
        cells[index].textContent = num === 0 ? '' : num;
        if (num !== 0) cells[index].setAttribute('readonly', 'readonly');
    });
}

function checkSudokuSolution(autoCheck = false) {
    const cells = document.querySelectorAll('.cell');
    const userInput = Array.from(cells).map(cell => {
        const value = cell.textContent;
        return value && !cell.classList.contains('notes') ? parseInt(value) : 0;
    });
    const message = document.getElementById('message');
    let isCorrect = true;
    let hasInput = false;
    for (let i = 0; i < 81; i++) {
        if (userInput[i] !== 0) {
            hasInput = true;
            if (userInput[i] !== solutionBoard[i]) {
                isCorrect = false;
                break;
            }
        }
    }
    message.classList.remove('hidden');
    if (!hasInput) {
        message.textContent = '請先輸入一些數字！';
        message.style.color = '#ff9800';
    } else if (isCorrect) {
        message.textContent = autoCheck ? '答案全部正確！' : '目前輸入嘅數字正確！';
        message.style.color = document.body.classList.contains('dark-mode') ? '#2ecc71' : '#28a745';
        if (autoCheck) {
            triggerConfetti();
            setTimeout(() => {
                if (confirm('答案全部正確！是否想重置遊戲再玩？')) startSudoku(currentDifficulty);
                message.classList.add('hidden');
            }, 2000);
            return;
        }
    } else {
        message.textContent = '有數字輸入錯誤，請檢查！';
        message.style.color = document.body.classList.contains('dark-mode') ? '#ff4444' : '#dc3545';
    }
    setTimeout(() => message.classList.add('hidden'), 2000);
}

function triggerConfetti() {
    const container = document.getElementById('confetti-container');
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
}

function showSudokuDifficultyDialog() {
    if (!document.getElementById('sudoku-game').classList.contains('hidden')) {
        if (!confirm('確定要離開當前遊戲嗎？進度將不會保存。')) return;
    }
    document.getElementById('difficulty-dialog').classList.remove('hidden');
    document.getElementById('sudoku-game').classList.add('hidden');
    document.getElementById('number-pad').classList.add('hidden');
    if (selectedCell) {
        selectedCell.classList.remove('selected');
        selectedCell = null;
    }
}

function startSudoku(removeCount) {
    currentDifficulty = removeCount;
    document.getElementById('difficulty-dialog').classList.add('hidden');
    document.getElementById('sudoku-game').classList.remove('hidden');
    newSudokuGame();
}

function newSudokuGame() {
    createSudokuGrid();
    generateSudokuPuzzle(currentDifficulty);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '☀️';
}

function toggleNoteMode() {
    noteMode = !noteMode;
    const noteToggle = document.getElementById('note-toggle');
    noteToggle.textContent = `筆記模式：${noteMode ? '開' : '關'}`;
    noteToggle.classList.toggle('active', noteMode);
}

function selectSudokuCell(cell) {
    if (selectedCell) selectedCell.classList.remove('selected');
    selectedCell = cell;
    selectedCell.classList.add('selected');
    document.getElementById('number-pad').classList.remove('hidden');
    const numButtons = document.querySelectorAll('.num-btn');
    numButtons.forEach(button => button.classList.add('active'));
}

function inputSudokuNumber(num) {
    if (selectedCell && !selectedCell.hasAttribute('readonly')) {
        if (noteMode) {
            let notes = selectedCell.getAttribute('data-notes') || '';
            if (num === '') {
                let notesArray = notes.split(',').filter(Boolean);
                notesArray.pop();
                notes = notesArray.join(',');
                selectedCell.setAttribute('data-notes', notes);
                selectedCell.classList.toggle('notes', notes.length > 0);
                selectedCell.textContent = '';
            } else {
                let notesArray = notes.split(',').filter(Boolean);
                if (notesArray.includes(num)) {
                    notesArray = notesArray.filter(n => n !== num);
                } else {
                    notesArray.push(num);
                }
                notes = notesArray.join(',');
                selectedCell.setAttribute('data-notes', notes);
                selectedCell.classList.add('notes');
                selectedCell.textContent = '';
            }
        } else {
            if (num === '') {
                selectedCell.textContent = '';
                selectedCell.removeAttribute('data-notes');
                selectedCell.classList.remove('notes');
            } else {
                selectedCell.textContent = num;
                selectedCell.removeAttribute('data-notes');
                selectedCell.classList.remove('notes');
            }
        }
        document.getElementById('number-pad').classList.add('hidden');
        selectedCell.classList.remove('selected');
        selectedCell = null;
        const cells = document.querySelectorAll('.cell');
        const allFilled = Array.from(cells).every(cell => cell.textContent !== '');
        if (allFilled) {
            if (confirm('所有格子已填滿，是否完成遊戲？')) checkSudokuSolution(true);
        }
    }
}

// 香港麻雀
function startMahjong() {
    mahjongDeck = generateMahjongDeck();
    players = [[], [], [], []];
    discardedTiles = [];
    selectedTile = null;
    currentPlayer = 0; // 莊家
    dealMahjongHands();
    renderMahjongTable();
    enableMahjongDrag();
    aiPlay();
}

function generateMahjongDeck() {
    const suits = ['萬', '筒', '條'];
    const honors = ['東', '南', '西', '北', '中', '發', '白'];
    let deck = [];
    for (let suit of suits) {
        for (let i = 1; i <= 9; i++) {
            for (let j = 0; j < 4; j++) deck.push(`${i}${suit}`);
        }
    }
    for (let honor of honors) {
        for (let i = 0; i < 4; i++) deck.push(honor);
    }
    return shuffle(deck);
}

function dealMahjongHands() {
    players[0] = mahjongDeck.splice(0, 14); // 莊家 14 張
    for (let i = 1; i < 4; i++) {
        players[i] = mahjongDeck.splice(0, 13); // 閒家 13 張
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderMahjongTable() {
    const discardArea = document.getElementById('mahjong-discard');
    discardArea.innerHTML = '';
    discardedTiles.forEach(tile => {
        const tileDiv = document.createElement('div');
        tileDiv.className = 'mahjong-tile discarded';
        tileDiv.textContent = tile;
        discardArea.appendChild(tileDiv);
    });

    for (let i = 0; i < 4; i++) {
        const playerDiv = document.getElementById(`player-${i}`);
        playerDiv.innerHTML = '';
        players[i].forEach((tile, index) => {
            const tileDiv = document.createElement('div');
            tileDiv.className = 'mahjong-tile';
            tileDiv.textContent = i === 0 ? tile : '🀄'; // 玩家顯示牌面，AI 隱藏
            tileDiv.dataset.index = index;
            tileDiv.dataset.player = i;
            playerDiv.appendChild(tileDiv);
        });
    }
}

function enableMahjongDrag() {
    const tiles = document.querySelectorAll('#player-0 .mahjong-tile');
    tiles.forEach(tile => {
        tile.draggable = true;
        tile.addEventListener('dragstart', (e) => {
            if (currentPlayer === 0) {
                selectedTile = parseInt(e.target.dataset.index);
                e.target.classList.add('selected');
            }
        });
        tile.addEventListener('dragend', (e) => {
            e.target.classList.remove('selected');
        });
        tile.addEventListener('click', (e) => {
            if (currentPlayer === 0) {
                selectedTile = parseInt(e.target.dataset.index);
                tiles.forEach(t => t.classList.remove('selected'));
                e.target.classList.add('selected');
            }
        });
    });
}

function drawMahjongTile() {
    if (currentPlayer !== 0) return showMessage('請等待輪到你！');
    if (mahjongDeck.length > 0) {
        players[0].push(mahjongDeck.shift());
        renderMahjongTable();
        enableMahjongDrag();
    } else {
        showMessage('牌庫已空！');
    }
}

function discardSelectedTile() {
    if (currentPlayer !== 0) return showMessage('請等待輪到你！');
    if (selectedTile !== null) {
        discardedTiles.push(players[0].splice(selectedTile, 1)[0]);
        selectedTile = null;
        renderMahjongTable();
        enableMahjongDrag();
        checkMahjongWin(0);
        if (mahjongDeck.length > 0) {
            currentPlayer = (currentPlayer + 1) % 4;
            aiPlay();
        }
    } else {
        showMessage('請先選擇一張牌！');
    }
}

function aiPlay() {
    while (currentPlayer !== 0 && mahjongDeck.length > 0) {
        players[currentPlayer].push(mahjongDeck.shift());
        const discardIndex = Math.floor(Math.random() * players[currentPlayer].length);
        discardedTiles.push(players[currentPlayer].splice(discardIndex, 1)[0]);
        renderMahjongTable();
        checkMahjongWin(currentPlayer);
        currentPlayer = (currentPlayer + 1) % 4;
    }
    if (currentPlayer === 0) enableMahjongDrag();
}

function checkMahjongWin(playerIndex) {
    const hand = [...players[playerIndex]].sort();
    if (hand.length === 14) {
        let sets = 0, pair = false;
        for (let i = 0; i < hand.length;) {
            if (i + 2 < hand.length && hand[i] === hand[i + 1] && hand[i] === hand[i + 2]) {
                sets++;
                i += 3;
            } else if (i + 1 < hand.length && hand[i] === hand[i + 1]) {
                if (!pair) {
                    pair = true;
                    i += 2;
                } else {
                    return false;
                }
            } else {
                i++;
            }
        }
        if (sets === 4 && pair) {
            showMessage(`玩家 ${playerIndex} 胡牌了！`);
            triggerConfetti();
        }
    }
}

// 紙牌接龍（略，保持不變）
function startSolitaire() {/* 原有代碼 */}
function generateSolitaireDeck() {/* 原有代碼 */}
function dealSolitaireTableau() {/* 原有代碼 */}
function renderSolitaireTable() {/* 原有代碼 */}
function enableSolitaireDrag() {/* 原有代碼 */}
function drawSolitaireCard() {/* 原有代碼 */}
function moveSolitaireCard(fromPile, fromIndex, toPile, toIndex) {/* 原有代碼 */}
function isValidMove(card, target) {/* 原有代碼 */}
function checkSolitaireWin() {/* 原有代碼 */}

function showMessage(text) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.classList.remove('hidden');
    setTimeout(() => message.classList.add('hidden'), 2000);
}