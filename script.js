window.addEventListener('DOMContentLoaded', () => { 
    const tiles = Array.from(document.querySelectorAll('.tile'));
    const statusDisplay = document.querySelector('.status');
    const resetButton = document.querySelector('#reset');
    const wLine = document.querySelector('.line');
    const gameContainer = document.querySelector('.game-container');
    const startScreen = document.querySelector('.start-screen');
    const twoPlayerBtn = document.querySelector('#twoPlayer');
    const vsComputerBtn = document.querySelector('#vsComputer');

    const playerXTokenBox = document.querySelector('#playerXTokens');
    const playerOTokenBox = document.querySelector('#playerOTokens');
    const vsComputerTokenBox = document.querySelector('#vsComputerTokens');

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let isGameActive = true;
    let vsComputer = false;
    let firstMoveMade = false;
    let difficulty = null;

    // Token system
    let playerXTokens = 0; 
    let playerOTokens = 0; 
    let vsComputerTokens = 0; 

    const PLAYERX_WON = 'PLAYERX_WON';
    const PLAYERO_WON = 'PLAYERO_WON';
    const TIE = 'TIE';

    const winningConditions = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];

    function updateTokenDisplay() {
        playerXTokenBox.innerText = playerXTokens;
        playerOTokenBox.innerText = playerOTokens;
        vsComputerTokenBox.innerText = vsComputerTokens;
    }

    function isDeadTie(board) {
        for (let [a, b, c] of winningConditions) {
            const line = [board[a], board[b], board[c]];
            if (line.every(cell => cell === 'X' || cell === '')) return false;
            if (line.every(cell => cell === 'O' || cell === '')) return false;
        }
        return true;
    }

    function handleResultValidation() {
        let winningIndices = [];

        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i].map(index => board[index]);
            if (a === '' || b === '' || c === '') continue;
            if (a === b && b === c) winningIndices.push(i);
        }

        if (winningIndices.length > 0) {
            winningIndices.forEach(idx => drawLine(idx));
            announce(currentPlayer === 'X' ? PLAYERX_WON : PLAYERO_WON);
            isGameActive = false;

            // Token logic
            if (!vsComputer) {
                if (currentPlayer === 'X') playerXTokens += 5;
                else playerOTokens += 5;
            } else {
                if (currentPlayer === 'X') {
                    if (difficulty === "easy") vsComputerTokens += 1;
                    if (difficulty === "medium") vsComputerTokens += 5;
                    if (difficulty === "hard") vsComputerTokens += 10;
                }
            }
            updateTokenDisplay();
            return;
        }

        if (!board.includes('') || isDeadTie(board)) {
            announce(TIE);
            isGameActive = false;
        }
    }

    const announce = (type) => {
        switch(type){
            case PLAYERX_WON:
                statusDisplay.innerHTML = 'Player <span class="playerX">X</span> Won';
                break;
            case PLAYERO_WON:
                statusDisplay.innerHTML = 'Player <span class="playerO">O</span> Won';
                break;
            case TIE:
                statusDisplay.innerText = 'Tie';
                break;
        }
    };

    const isValidAction = (tile) => !tile.innerText;
    const updateBoard = (index) => { board[index] = currentPlayer; };
    const changePlayer = () => {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.innerHTML = `Player <span class="player${currentPlayer}">${currentPlayer}</span>'s Turn`;
    };

    const userAction = (tile, index) => {
        if (vsComputer && difficulty === null) return;

        if (isValidAction(tile) && isGameActive) {
            if (!firstMoveMade) {
                hideModeButtons();
                hideDifficultyButtons();
                firstMoveMade = true;
            }
            tile.innerText = currentPlayer;
            tile.classList.add(`player${currentPlayer}`);
            updateBoard(index);
            handleResultValidation();

            if (isGameActive) {
                changePlayer();
                if (vsComputer && currentPlayer === 'O' && isGameActive) setTimeout(AIAction, 500);
            }
        }
    };

    function drawLine(index) {
        const line = document.createElement('div');
        line.classList.add('line');
        document.querySelector('.board').appendChild(line);
        line.style.opacity = "1";
        line.style.transform = "translate(-50%, -50%)";
        switch(index) {
            case 0: line.style.transform += " rotate(0deg)"; line.style.top="16%"; break;
            case 1: line.style.transform += " rotate(0deg)"; line.style.top="50%"; break;
            case 2: line.style.transform += " rotate(0deg)"; line.style.top="84%"; break;
            case 3: line.style.transform += " rotate(90deg)"; line.style.left="16%"; break;
            case 4: line.style.transform += " rotate(90deg)"; line.style.left="50%"; break;
            case 5: line.style.transform += " rotate(90deg)"; line.style.left="84%"; break;
            case 6: line.style.transform += " rotate(45deg)"; break;
            case 7: line.style.transform += " rotate(-45deg)"; break;
        }
    }

    // AI Logic
    function getMediumMove(board) {
        for (let [a,b,c] of winningConditions) {
            if (board[a] === 'O' && board[b] === 'O' && board[c] === '') return c;
            if (board[a] === 'O' && board[c] === 'O' && board[b] === '') return b;
            if (board[b] === 'O' && board[c] === 'O' && board[a] === '') return a;
        }
        for (let [a,b,c] of winningConditions) {
            if (board[a] === 'X' && board[b] === 'X' && board[c] === '') return c;
            if (board[a] === 'X' && board[c] === 'X' && board[b] === '') return b;
            if (board[b] === 'X' && board[c] === 'X' && board[a] === '') return a;
        }
        if (board[4] === '') return 4;
        for (let corner of [0,2,6,8]) if (board[corner] === '') return corner;
        for (let side of [1,3,5,7]) if (board[side] === '') return side;
    }

    const openingStrategies = [
        { xMove: [0], oResponse: 4 },
        { xMove: [2], oResponse: 4 },
        { xMove: [6], oResponse: 4 },
        { xMove: [8], oResponse: 4 },
        { xMove: [1], oResponse: 4 },
        { xMove: [3], oResponse: 4 },
        { xMove: [5], oResponse: 4 },
        { xMove: [7], oResponse: 4 },
        { xMove: [4], oResponse: 0 }
    ];

    function getHardMove(board) {
        const xPositions = board.map((v,i) => v==='X'?i:null).filter(v=>v!==null);
        const oPositions = board.map((v,i) => v==='O'?i:null).filter(v=>v!==null);
        if (xPositions.length===1 && oPositions.length===0) {
            for (let strat of openingStrategies) if(strat.xMove[0]===xPositions[0]) return strat.oResponse;
        }
        for (let [a,b,c] of winningConditions) {
            if(board[a]==='O'&&board[b]==='O'&&board[c]==='') return c;
            if(board[a]==='O'&&board[c]==='O'&&board[b]==='') return b;
            if(board[b]==='O'&&board[c]==='O'&&board[a]==='') return a;
        }
        for (let [a,b,c] of winningConditions) {
            if(board[a]==='X'&&board[b]==='X'&&board[c]==='') return c;
            if(board[a]==='X'&&board[c]==='X'&&board[b]==='') return b;
            if(board[b]==='X'&&board[c]==='X'&&board[a]==='') return a;
        }
        if(board[4]==='') return 4;
        for (let corner of [0,2,6,8]) if(board[corner]==='') return corner;
        for (let side of [1,3,5,7]) if(board[side]==='') return side;
    }

    function AIAction() {
        let move = -1;
        if(difficulty==='easy'){
            const available = board.map((v,i)=>v===''?i:null).filter(v=>v!==null);
            move = available[Math.floor(Math.random()*available.length)];
        } else if(difficulty==='medium'){ move = getMediumMove(board); }
        else if(difficulty==='hard'){ move = getHardMove(board); }
        if(move!==undefined && move!==-1 && board[move]===''){
            tiles[move].innerText = currentPlayer;
            tiles[move].classList.add(`player${currentPlayer}`);
            updateBoard(move);
            handleResultValidation();
            if(isGameActive) changePlayer();
        }
    }

    const resetBoard = () => {
        board = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        currentPlayer = 'X';
        firstMoveMade = false;
        statusDisplay.innerHTML = `Player <span class="playerX">X</span>'s Turn`;
        document.querySelectorAll('.line').forEach(line => line.remove());
        wLine.style.opacity = "0";
        tiles.forEach(tile => { tile.innerText=''; tile.classList.remove('playerX','playerO'); });
        showOppositeButton();
        if(vsComputer) showDifficultyButtons();
        updateTokenDisplay();
    }

    function hideModeButtons() { twoPlayerBtn.style.display="none"; vsComputerBtn.style.display="none"; }
    function showOppositeButton() {
        if(vsComputer){ twoPlayerBtn.style.display="inline-block"; vsComputerBtn.style.display="none"; }
        else { vsComputerBtn.style.display="inline-block"; twoPlayerBtn.style.display="none"; }
    }
    function showDifficultyButtons(){ document.querySelector('#difficultyOptions').classList.remove('hide'); difficulty=null; }
    function hideDifficultyButtons(){ document.querySelector('#difficultyOptions').classList.add('hide'); }

    tiles.forEach((tile,index)=>tile.addEventListener('click',()=>userAction(tile,index)));
    resetButton.addEventListener('click',resetBoard);

    twoPlayerBtn.addEventListener('click',()=>{
        vsComputer=false;
        startScreen.classList.add('hide');
        startTitle.classList.add('hide');
        gameContainer.classList.remove('hide');
        statusDisplay.innerHTML=`Player <span class="playerX">X</span>'s Turn`;
        hideModeButtons();
        hideDifficultyButtons();
        updateTokenDisplay();
    });

    vsComputerBtn.addEventListener('click',()=>{
        vsComputer=true;
        startScreen.classList.add('hide');
        startTitle.classList.add('hide');
        gameContainer.classList.remove('hide');
        statusDisplay.innerHTML=`Player <span class="playerX">X</span>'s Turn`;
        hideModeButtons();
        showDifficultyButtons();
        updateTokenDisplay();
    });

    document.querySelector('#easy').addEventListener('click',()=>{ difficulty="easy"; hideDifficultyButtons(); });
    document.querySelector('#medium').addEventListener('click',()=>{ difficulty="medium"; hideDifficultyButtons(); });
    document.querySelector('#hard').addEventListener('click',()=>{ difficulty="hard"; hideDifficultyButtons(); });

    updateTokenDisplay();
});
