let currentDifficulty = 45;
let selectedCell = null;
let noteMode = false;

function createGrid() {
    const grid = document.getElementById('sudoku-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 81; i++) {
        const input = document.createElement('input');
        input.className = 'cell';
        input.type = 'text';
        input.readOnly = true; // 禁用鍵盤輸入
        input.addEventListener('touchstart', function (e) {
            e.preventDefault();
            if (!this.hasAttribute('readonly')) {
                selectCell(this);
            }
        });
        input.addEventListener('keydown', function (e) {
            e.preventDefault(); // 阻止鍵盤輸入
        });
        grid.appendChild(input);
    }
    document.getElementById('number-pad').classList.add('hidden');
    bindNumberPadEvents();
}

function bindNumberPadEvents() {
    const buttons = document.querySelectorAll('.num-btn');
    buttons.forEach(button => {
        button.removeEventListener('touchstart', handleNumberPadTouch);
        button.addEventListener('touchstart', handleNumberPadTouch);
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
    const puzzle = removeCells(board, removeCount);

    const cells = document.querySelectorAll('.cell');
    puzzle.forEach((num, index) => {
        cells[index].value = num === 0 ? '' : num;
        if (num !== 0) cells[index].setAttribute('readonly', 'readonly');
    });
}

function checkSolution() {
    const cells = document.querySelectorAll('.cell');
    const userInput = Array.from(cells).map(cell => {
        const value = cell.value;
        return value && !cell.classList.contains('notes') ? parseInt(value) : 0;
    });
    const message = document.getElementById('message');

    function isValidSudoku(board) {
        for (let row = 0; row < 9; row++) {
            if (!isValidUnit(board.slice(row * 9, row * 9 + 9))) return false;
        }
        for (let col = 0; col < 9; col++) {
            const column = [];
            for (let row = 0; row < 9; row++) column.push(board[row * 9 + col]);
            if (!isValidUnit(column)) return false;
        }
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const box = [];
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        box.push(board[(boxRow * 3 + i) * 9 + (boxCol * 3 + j)]);
                    }
                }
                if (!isValidUnit(box)) return false;
            }
        }
        return true;
    }

    function isValidUnit(unit) {
        const seen = new Set();
        for (let num of unit) {
            if (num === 0) return false;
            if (seen.has(num)) return false;
            seen.add(num);
        }
        return true;
    }

    if (isValidSudoku(userInput)) {
        message.textContent = '恭喜！答案正確！';
        message.style.color = document.body.classList.contains('dark-mode') ? '#2ecc71' : '#28a745';
    } else {
        message.textContent = '答案有誤，請再試一次。';
        message.style.color = document.body.classList.contains('dark-mode') ? '#ff4444' : '#dc3545';
    }
}

function showDifficultyDialog() {
    document.getElementById('difficulty-dialog').classList.remove('hidden');
    document.getElementById('number-pad').classList.add('hidden');
}

function startGame(removeCount) {
    currentDifficulty = removeCount;
    document.getElementById('difficulty-dialog').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    newGame();
}

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
    noteToggle.classList.toggle('active', noteMode); // 切換 active 類
}

function selectCell(cell) {
    if (selectedCell === cell) return;
    if (selectedCell) selectedCell.blur();
    selectedCell = cell;
    selectedCell.focus();
    document.getElementById('number-pad').classList.remove('hidden');
}

function inputNumber(num) {
    if (selectedCell && !selectedCell.hasAttribute('readonly')) {
        if (noteMode) {
            let notes = selectedCell.getAttribute('data-notes') || '';
            if (num === '') {
                // 移除最後一個筆記數字
                let notesArray = notes.split(',').filter(Boolean);
                notesArray.pop();
                notes = notesArray.join(',');
                selectedCell.setAttribute('data-notes', notes);
                selectedCell.classList.toggle('notes', notes.length > 0);
                selectedCell.value = '';
            } else if (notes.includes(num)) {
                // 移除已存在的數字
                notes = notes.split(',').filter(n => n !== num).join(',');
                selectedCell.setAttribute('data-notes', notes);
                selectedCell.classList.toggle('notes', notes.length > 0);
                selectedCell.value = '';
            } else {
                // 添加新數字，用逗號分隔
                notes = notes ? `${notes},${num}` : num;
                selectedCell.setAttribute('data-notes', notes);
                selectedCell.classList.add('notes');
                selectedCell.value = '';
            }
        } else {
            if (num === '') {
                // 只清除正常數字，不影響筆記
                selectedCell.value = '';
            } else {
                selectedCell.value = num;
                selectedCell.removeAttribute('data-notes');
                selectedCell.classList.remove('notes');
            }
        }
        document.getElementById('number-pad').classList.add('hidden');
        selectedCell.blur();
        selectedCell = null;
    }
}