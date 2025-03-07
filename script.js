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

function checkSolution(autoCheck = false) {
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
            triggerConfetti(); // 觸發拉炮特效
            setTimeout(() => {
                if (confirm('答案全部正確！是否想重置遊戲再玩？')) {
                    newGame();
                }
                message.classList.add('hidden');
            }, 2000);
            return;
        }
    } else {
        message.textContent = '有數字輸入錯誤，請檢查！';
        message.style.color = document.body.classList.contains('dark-mode') ? '#ff4444' : '#dc3545';
    }

    setTimeout(() => {
        message.classList.add('hidden');
    }, 2000);
}

function triggerConfetti() {
    const container = document.getElementById('confetti-container');
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`; // 隨機顏色
        confetti.style.animationDelay = Math.random() * 2 + 's'; // 隨機延遲
        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000); // 3秒後移除
    }
}

function showDifficultyDialog() {
    if (!document.getElementById('game-container').classList.contains('hidden')) {
        if (!confirm('確定要離開當前遊戲嗎？進度將不會保存。')) {
            return;
        }
    }
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

document.getElementById('game-container').classList.add('hidden');
document.getElementById('difficulty-dialog').classList.remove('hidden');

function newGame() {
    createGrid();
    generatePuzzle(currentDifficulty);
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

function selectCell(cell) {
    if (selectedCell) {
        selectedCell.classList.remove('selected');
    }
    selectedCell = cell;
    selectedCell.classList.add('selected');
    document.getElementById('number-pad').classList.remove('hidden');
    const numButtons = document.querySelectorAll('.num-btn');
    numButtons.forEach(button => button.classList.add('active'));
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

        // 檢查是否所有格子已填滿
        const cells = document.querySelectorAll('.cell');
        const allFilled = Array.from(cells).every(cell => cell.textContent !== '');
        if (allFilled) {
            if (confirm('所有格子已填滿，是否完成遊戲？')) {
                checkSolution(true); // 自動檢查答案
            }
        }
    }
}