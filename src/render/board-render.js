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

    const value = state.board[i];
    if (isObstacle(value)) {
      const block = document.createElement("div");
      block.className = "obstacle";
      cell.appendChild(block);
    } else if (isGem(value)) {
      if (value.burning) cell.classList.add("cell-burning");
      if (value.frozen) cell.classList.add("cell-frozen");
      const gem = document.createElement("div");
      gem.className = `gem g-${value.color}`;
      if (value.special) gem.classList.add(`sp-${value.special}`);
      if (value.glass) gem.classList.add("glass");
      if (value.burning) gem.classList.add("burning");
      if (value.frozen) gem.classList.add("frozen");
      if (value.lockedTurns > 0) gem.classList.add("locked");
      if (fallAnim.has(i)) gem.classList.add("fall-in");

      const icon = document.createElement("img");
      icon.className = "gem-icon gem-image";
      icon.dataset.animGem = String(value.color);
      icon.src = getAnimatedGemImage(value.color);
      icon.alt = `gem-${value.color}`;
      gem.appendChild(icon);

      if (value.burning) {
        const burnAura = document.createElement("span");
        burnAura.className = "gem-burn-aura";
        gem.appendChild(burnAura);

        const burnTag = document.createElement("span");
        burnTag.className = "gem-status burn";
        burnTag.textContent = "SCORCH";
        gem.appendChild(burnTag);
      }

      if (value.poisonedTurns > 0) {
        gem.classList.add("poisoned");
        const poisonTag = document.createElement("span");
        poisonTag.className = "gem-status poison";
        poisonTag.textContent = `POISON ${value.poisonedTurns}`;
        gem.appendChild(poisonTag);
      }

      if (value.frozen) {
        const frozenTag = document.createElement("span");
        frozenTag.className = "gem-status frozen";
        frozenTag.textContent = "FROZEN";
        gem.appendChild(frozenTag);
      }

      cell.appendChild(gem);
    }

    boardEl.appendChild(cell);
  }
}
