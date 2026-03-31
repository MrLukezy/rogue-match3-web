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

  function appendOverlayDecor(overlay, overlayType) {
    if (overlayType === "burning") {
      // 热浪背景层
      const haze = document.createElement("span");
      haze.className = "effect-burning-haze";
      overlay.appendChild(haze);

      // 火星粒子层
      const emberLayer = document.createElement("span");
      emberLayer.className = "effect-burning-embers";
      overlay.appendChild(emberLayer);

      // 火焰八帧动画
      const flameBase = "assets/images/effects/flame4_frame";
      for (let n = 0; n < 8; n += 1) {
        const img = document.createElement("img");
        img.className = `effect-burning-img flame-img-${n + 1}`;
        img.src = `${flameBase}${n + 1}.png`;
        img.alt = "flame";
        overlay.appendChild(img);
      }
      return;
    }

    if (overlayType === "frozen") {
      // 冰晶八帧动画
      const iceBase = "assets/images/effects/frz_frame";
      for (let n = 0; n < 8; n += 1) {
        const img = document.createElement("img");
        img.className = `effect-frozen-img ice-img-${n + 1}`;
        img.src = `${iceBase}${n + 1}.png`;
        img.alt = "ice";
        overlay.appendChild(img);
      }
      return;
    }

    if (overlayType === "poisoned") {
      const base = "assets/images/effects/poison_frame";
      for (let n = 0; n < 8; n += 1) {
        const img = document.createElement("img");
        img.className = `effect-poisoned-img poison-img-${n + 1}`;
        img.src = `${base}${n + 1}.png`;
        img.alt = "poison";
        overlay.appendChild(img);
      }
      return;
    }

    if (overlayType === "locked") {
      const base = "assets/images/effects/lock_frame";
      for (let n = 0; n < 8; n += 1) {
        const img = document.createElement("img");
        img.className = `effect-locked-img lock-img-${n + 1}`;
        img.src = `${base}${n + 1}.png`;
        img.alt = "lock";
        overlay.appendChild(img);
      }
      return;
    }

    if (overlayType === "holy-marked") {
      const base = "assets/images/effects/holy_frame";
      for (let n = 0; n < 8; n += 1) {
        const img = document.createElement("img");
        img.className = `effect-holy-img holy-img-${n + 1}`;
        img.src = `${base}${n + 1}.png`;
        img.alt = "holy";
        overlay.appendChild(img);
      }
      return;
    }

    if (overlayType === "void-marked") {
      const base = "assets/images/effects/void_frame";
      for (let n = 0; n < 8; n += 1) {
        const img = document.createElement("img");
        img.className = `effect-void-img void-img-${n + 1}`;
        img.src = `${base}${n + 1}.png`;
        img.alt = "void";
        overlay.appendChild(img);
      }
      return;
    }

    if (overlayType === "slippery") {
      const base = "assets/images/effects/slip_frame";
      for (let n = 0; n < 8; n += 1) {
        const img = document.createElement("img");
        img.className = `effect-slippery-img slip-img-${n + 1}`;
        img.src = `${base}${n + 1}.png`;
        img.alt = "slippery";
        overlay.appendChild(img);
      }
    }
  }

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
        appendOverlayDecor(overlay, overlayType);
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
