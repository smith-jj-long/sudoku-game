let currentDifficulty = 45;
let selectedCell = null;
let noteMode = false;
let solutionBoard = null;

function createGrid() {
    const grid = document.getElementById('sudoku-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 81; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.addEventListener('touchstart', function (e) {
            e.preventDefault();
            if (!this.hasAttribute('readonly')) {
                selectCell(this);
            }
        }, { passive: false });
        cell.addEventListener('click', function (e) {
            e.preventDefault();
            if (!this.hasAttribute('readonly')) {
                selectCell(this);
            }
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
    inputNumber(num);
}

function generatePuzzle(removeCount) {
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
                do {
                    num = Math.floor(Math.random() * 9) + 1;
                } while (!isSafe(board, row + i, col + j, num));
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

function checkSolution() {
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
        message.textContent = '目前輸入嘅數字正確！';
        message.style.color = document.body.classList.contains('dark-mode') ? '#2ecc71' : '#28a745';
    } else {
        message.textContent = '有數字輸入錯誤，請檢查！';
        message.style.color = document.body.classList.contains('dark-mode') ? '#ff4444' : '#dc3545';
    }

    setTimeout(() => {
        message.classList.add('hidden');
    }, 2000);
}

function showDifficultyDialog() {
    document.getElementById('difficulty-dialog').classList.remove('hidden');
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('number-pad').classList.add('hidden');
    if (selectedCell) {
        selectedCell.classList.remove('selected');
        selectedCell = null;
    }
}

function startGame(removeCount) {
    currentDifficulty = removeCount;
    document.getElementById('difficulty-dialog').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    newGame();
}

// 初始顯示難度選擇畫面
document.getElementById('game-container').classList.add('hidden');
document.getElementById('difficulty-dialog').classList.remove('hidden');

function newGame() {
    createGrid();
    generatePuzzle(currentDifficulty);
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function toggleNoteMode() {
    noteMode = !noteMode;
    const noteToggle = document.getElementById('note-toggle');
    noteToggle.textContent = `筆記模式：${noteMode ? '開' : '關'}`;
    noteToggle.classList.toggle('active', noteMode);
}

function selectCell(cell) {
    if (selectedCell) {
        selectedCell.classList.remove('selected');
    }
    selectedCell = cell;
    selectedCell.classList.add('selected');
    document.getElementById('number-pad').classList.remove('hidden');
}

function inputNumber(num) {
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
            } else if (notes.includes(num)) {
                notes = notes.split(',').filter(n => n !== num).join(',');
                selectedCell.setAttribute('data-notes', notes);
                selectedCell.classList.toggle('notes', notes.length > 0);
                selectedCell.textContent = '';
            } else {
                notes = notes ? `${notes},${num}` : num;
                selectedCell.setAttribute('data-notes', notes);
                selectedCell.classList.add('notes');
                selectedCell.textContent = '';
            }
        } else {
            if (num === '') {
                selectedCell.textContent = '';
            } else {
                selectedCell.textContent = num;
                selectedCell.removeAttribute('data-notes');
                selectedCell.classList.remove('notes');
            }
        }
        document.getElementById('number-pad').classList.add('hidden');
        selectedCell.classList.remove('selected');
        selectedCell = null;
    }
}