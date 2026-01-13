import "./style.css";

const app = document.querySelector("#app");

let board = Array(9).fill(null); // null | "X" | "O"
let xIsNext = true;
let winner = null;
let mode = "friend";
let computer = "O";
let user = "X";
let computerThinking = false; // adding a buffer before the computer makes a move

const score_key = "ttt_score_v1";

// computer "ai" functions

function emptySpaces(board){
  const out = [];
  for (let i = 0; i < board.length; i++)
    if (!board[i]) out.push(i);
  return out;
}

function aiMove() {
  // pick random empty square
  const empties = emptySpaces(board);
  if (empties.length === 0) return;

  const choice = empties[Math.floor(Math.random() * empties.length)];
  board[choice] = computer;
  xIsNext = true; // after O plays, it's X's turn
  winner = calculateWinner(board);
}




// added leaderboard

function loadScore() {
  try {
    const raw = localStorage.getItem(score_key);
    return raw ? JSON.parse(raw) : {X: 0, O: 0, draws: 0};
  } catch {
    return {X: 0, O: 0, draws: 0 };
  }
}

function saveScore(score) {
  localStorage.setItem(score_key, JSON.stringify(score));
}

function updateScore() { // updates score once game ends
  const w = calculateWinner(board);
  if (w) {
    score[w] += 1;        // score["X"] or score["O"]
    saveScore(score);
    return true;
  }
  if (isDraw(board)) {
    score.draws += 1;
    saveScore(score);
    return true;
  }
  return false;
}



let score = loadScore();

function calculateWinner(b) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];
  for (const [a,b2,c] of lines) {
    if (b[a] && b[a] === b[b2] && b[a] === b[c]) return b[a];
  }
  return null;
}

function isDraw(b) {
  return b.every(Boolean) && !calculateWinner(b);
}

function reset() {
  board = Array(9).fill(null);
  xIsNext = true;
  winner = null;
  computerThinking();
  render();
}

function handleClick(i) {
  if (winner || board[i]) return;

  const current = xIsNext ? "X" : "O";

  // if playing agaisnt computer, only allow the user (X) to click
  if (mode === "computer" && current !== user) return;

  board[i] = current;
  xIsNext = !xIsNext;
  winner = calculateWinner(board);

  if (updateScore()) {
    render();
    return;
  }

  render();

  // if game isn't over and we're in computer mode, let computer play immediately
  if (mode === "computer") {
    computerThinking = true;

    setTimeout(() => {
      // game might have ended or been reset while waiting
      if (winner || isDraw(board)) {
        computerThinking = false;
        render();
        return;
      }

      aiMove(); 
      updateScore(); 

      computerThinking = false;
      render();
    }, 2000);
  }
}


function render() {
  const w = calculateWinner(board);
  const draw = isDraw(board);

  const statusText = w
  ? `Winner: ${w}`
  : draw
    ? "Draw!"
    : mode === "computer" && computerThinking
      ? "Computer is thinking..."
      : `Next: ${xIsNext ? "X" : "O"}`;

  app.innerHTML = `
    <div class="card">
      <h1>Tic Tac Toe</h1>
      <div class="row" style="margin-bottom:12px;">
        <button id="friendMode" ${mode === "friend" ? "disabled" : ""}>2 Player</button>
        <button id="computerMode" ${mode === "computer" ? "disabled" : ""}>Vs Computer</button>
      </div>
      <div class="status">${statusText}</div>
      <div style="display:flex; gap:8px; margin: 0 0 12px;">
        <div style="flex:1; padding:8px; border:1px solid #ddd; border-radius:10px;">X: ${score.X}</div>
        <div style="flex:1; padding:8px; border:1px solid #ddd; border-radius:10px;">O: ${score.O}</div>
        <div style="flex:1; padding:8px; border:1px solid #ddd; border-radius:10px;">Draws: ${score.draws}</div>
    </div>
      <div class="grid">
        ${board.map((v, i) => `
          <button class="cell" data-i="${i}" ${winner || v ? "disabled" : ""}>
            ${v ?? ""}
          </button>
        `).join("")}
      </div>
      <div class="row">
        <button id="reset">Reset Board</button>
        <button id="resetScore">Reset Score</button>
    </div>
    </div>
  `;

  app.querySelectorAll(".cell").forEach(btn => {
    btn.addEventListener("click", () => handleClick(Number(btn.dataset.i)));
  });
  app.querySelector("#reset").addEventListener("click", reset);

  app.querySelector("#resetScore").addEventListener("click", () => {
    score = { X: 0, O: 0, draws: 0 };
    saveScore(score);
    render();
  });

  app.querySelector("#friendMode").addEventListener("click", () => {
    mode = "friend";
    reset();
  });
  
  app.querySelector("#computerMode").addEventListener("click", () => {
    mode = "computer";
    reset();
  });  

}

render();
