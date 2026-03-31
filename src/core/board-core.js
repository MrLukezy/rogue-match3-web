export function createBoard(boardSize, randColor) {
  const arr = Array(boardSize * boardSize).fill(null);
  for (let i = 0; i < arr.length; i += 1) arr[i] = { kind: "gem", color: randColor(), special: null, glass: false, burning: false, poisonedTurns: 0, frostedTurns: 0, frozen: false, lockedTurns: 0, holyMarked: false, voidMarked: false, slippery: false };
  return arr;
}

export function resolveAutoBoard(state, findMatchGroups, isGem, randColor) {
  let safe = 0;
  while (true) {
    const groups = findMatchGroups();
    if (groups.length === 0) break;
    for (const g of groups) {
      for (const idx of g.indices) {
        if (isGem(state.board[idx])) state.board[idx].color = randColor();
      }
    }
    if (++safe > 80) break;
  }
}

export function collapseBoard(state, boardSize, isGem) {
  const moved = [];
  for (let c = 0; c < boardSize; c += 1) {
    const keep = [];
    for (let r = boardSize - 1; r >= 0; r -= 1) {
      const idx = r * boardSize + c;
      const v = state.board[idx];
      if (v !== null) keep.push(v);
    }
    for (let r = boardSize - 1; r >= 0; r -= 1) {
      const idx = r * boardSize + c;
      const next = keep[boardSize - 1 - r] ?? null;
      if (state.board[idx] !== next && next && isGem(next)) moved.push(idx);
      state.board[idx] = next;
    }
  }
  return moved;
}

export function refillBoard(state, randColor) {
  const born = [];
  for (let i = 0; i < state.board.length; i += 1) {
    if (state.board[i] === null) {
      state.board[i] = { kind: "gem", color: randColor(), special: null, glass: false, burning: false, poisonedTurns: 0, frostedTurns: 0, frozen: false, lockedTurns: 0, holyMarked: false, voidMarked: false, slippery: false };
      born.push(i);
    }
  }
  return born;
}

export const rowOf = (boardSize, i) => Math.floor(i / boardSize);
export const colOf = (boardSize, i) => i % boardSize;
export const inside = (boardSize, r, c) => r >= 0 && r < boardSize && c >= 0 && c < boardSize;
export const indicesInRow = (boardSize, r) => Array.from({ length: boardSize }, (_, x) => r * boardSize + x);
export const indicesInCol = (boardSize, c) => Array.from({ length: boardSize }, (_, y) => y * boardSize + c);

export function isAdjacent(boardSize, a, b) {
  return Math.abs(rowOf(boardSize, a) - rowOf(boardSize, b)) + Math.abs(colOf(boardSize, a) - colOf(boardSize, b)) === 1;
}

export function swap(state, a, b) {
  const t = state.board[a];
  state.board[a] = state.board[b];
  state.board[b] = t;
}

export function hasPossibleMatchSwap(board, boardSize, isGem, isObstacle = null) {
  const canPlayerSwapCell = (cell) => {
    if (!isGem(cell)) return false;
    if (isObstacle && isObstacle(cell)) return false;
    if (cell.lockedTurns > 0 || cell.frozen) return false;
    return true;
  };

  const hasLineMatchAt = (index) => {
    const cell = board[index];
    if (!isGem(cell) || cell.special === "rainbow") return false;

    const color = cell.color;
    const row = rowOf(boardSize, index);
    const col = colOf(boardSize, index);

    let horizontal = 1;
    for (let c = col - 1; c >= 0; c -= 1) {
      const next = board[row * boardSize + c];
      if (!isGem(next) || next.special === "rainbow" || next.color !== color) break;
      horizontal += 1;
    }
    for (let c = col + 1; c < boardSize; c += 1) {
      const next = board[row * boardSize + c];
      if (!isGem(next) || next.special === "rainbow" || next.color !== color) break;
      horizontal += 1;
    }
    if (horizontal >= 3) return true;

    let vertical = 1;
    for (let r = row - 1; r >= 0; r -= 1) {
      const next = board[r * boardSize + col];
      if (!isGem(next) || next.special === "rainbow" || next.color !== color) break;
      vertical += 1;
    }
    for (let r = row + 1; r < boardSize; r += 1) {
      const next = board[r * boardSize + col];
      if (!isGem(next) || next.special === "rainbow" || next.color !== color) break;
      vertical += 1;
    }
    return vertical >= 3;
  };

  for (let r = 0; r < boardSize; r += 1) {
    for (let c = 0; c < boardSize; c += 1) {
      const index = r * boardSize + c;
      const cell = board[index];
      if (!canPlayerSwapCell(cell)) continue;

      const neighbors = [];
      if (c + 1 < boardSize) neighbors.push(index + 1);
      if (r + 1 < boardSize) neighbors.push(index + boardSize);

      for (const nextIndex of neighbors) {
        const next = board[nextIndex];
        if (!canPlayerSwapCell(next)) continue;
        if (cell.special && next.special) return true;

        [board[index], board[nextIndex]] = [board[nextIndex], board[index]];
        const matched = hasLineMatchAt(index) || hasLineMatchAt(nextIndex);
        [board[index], board[nextIndex]] = [board[nextIndex], board[index]];

        if (matched) return true;
      }
    }
  }

  return false;
}

export const randColor = (COLORS) => Math.floor(Math.random() * COLORS);
export const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const isGem = (c) => c && c.kind === "gem";
export const isObstacle = (c) => c && c.kind === "obstacle";
