let selectedCell = null;

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
    bindNumberPadEvents();
}

function bindNumberPadEvents() {
    const buttons = document.querySelectorAll('.num-btn');
    buttons.forEach(button => {
        button.addEventListener('touchstart', handleNumberPadTouch, { passive: false });
        button.addEventListener('click', handleNumberPadTouch);
    });
}

function handleNumberPadTouch(e) {
    e.preventDefault();
    const num = this.getAttribute('data-num');
    inputNumber(num);
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
        selectedCell.textContent = num;
        document.getElementById('number-pad').classList.add('hidden');
        selectedCell.classList.remove('selected');
        selectedCell = null;
    }
}

// 假設 generatePuzzle() 已實現，這裡僅展示關鍵修復部分
function generatePuzzle(removeCount) {
    // 生成數獨邏輯...
    const cells = document.querySelectorAll('.cell');
    // 更新格子內容...
}