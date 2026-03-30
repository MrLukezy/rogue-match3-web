export function renderBoardView({
  boardEl,
  state,
  selected,
  isObstacle,
  isGem,
  clearAnim,
  fallAnim,
  getAnimatedGemImage,
}) {
  boardEl.innerHTML = "";
  const targeting = state.mode.type === "target_item";

  for (let i = 0; i < state.board.length; i += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.dataset.index = String(i);
    if (selected === i) cell.classList.add("selected");
    if (targeting) cell.classList.add("targeting");
    if ((state.tideRows || []).includes(Math.floor(i / state.boardSize))) cell.classList.add("cell-tide-row");
    if ((state.tideCols || []).includes(i % state.boardSize)) cell.classList.add("cell-tide-col");
    const telegraph = state.bossTelegraph;
    if (telegraph) {
      const row = Math.floor(i / state.boardSize);
      const col = i % state.boardSize;
      if ((telegraph.rows || []).includes(row)) cell.classList.add("cell-telegraph-row");
      if ((telegraph.cols || []).includes(col)) cell.classList.add("cell-telegraph-col");
      if ((telegraph.indices || []).includes(i)) cell.classList.add("cell-telegraph-hit");
      if (telegraph.center === i) cell.classList.add("cell-telegraph-center");
    }

    const value = state.board[i];
    if (isObstacle(value)) {
      const block = document.createElement("div");
      block.className = `obstacle${value.ash ? " ash" : ""}`;
      cell.appendChild(block);
    } else if (isGem(value)) {
      const gem = document.createElement("div");
      gem.className = `gem g-${value.color}`;
      if (value.special) gem.classList.add(`sp-${value.special}`);
      if (fallAnim.has(i)) gem.classList.add("fall-in");
      if (clearAnim.has(i)) gem.classList.add("clearing");

      const overlayDefs = [];
      if (value.glass) overlayDefs.push("glass");
      if (value.burning) overlayDefs.push("burning");
      if (value.poisonedTurns > 0) overlayDefs.push("poisoned");
      if (value.frozen) overlayDefs.push("frozen");
      if (value.lockedTurns > 0) overlayDefs.push("locked");
      if (value.holyMarked) overlayDefs.push("holy-marked");
      if (value.voidMarked) overlayDefs.push("void-marked");
      if (value.slippery) overlayDefs.push("slippery");

      for (const overlayType of overlayDefs) {
        const overlay = document.createElement("span");
        overlay.className = `cell-effect effect-${overlayType}`;
        cell.appendChild(overlay);
      }

      const icon = document.createElement("img");
      icon.className = "gem-icon gem-image";
      icon.dataset.animGem = String(value.color);
      icon.src = getAnimatedGemImage(value.color);
      icon.alt = `gem-${value.color}`;
      gem.appendChild(icon);

      cell.appendChild(gem);
    }

    boardEl.appendChild(cell);
  }
}
