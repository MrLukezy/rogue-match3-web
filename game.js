(() => {
  const SIZE = 8;
  const COLORS = 6;
  const TOTAL_FLOORS = 7;
  const META_KEY = "rogue_match3_meta_v4";
  const MOMENTUM_MAX = 100;

  const FLOOR_CONFIG = [
    { target: 280, moves: 16, obstacles: 0 },
    { target: 390, moves: 16, obstacles: 0 },
    { target: 560, moves: 15, obstacles: 1 },
    { target: 760, moves: 15, obstacles: 2 },
    { target: 980, moves: 14, obstacles: 3 },
    { target: 1220, moves: 14, obstacles: 4 },
    { target: 1500, moves: 13, obstacles: 5 },
  ];

  const ITEM_DEFS = {
    hammer: { name: "锤子", desc: "敲掉单格", amount: 1, target: true },
    row: { name: "横扫", desc: "清除一整行", amount: 1, target: true },
    cross: { name: "十字", desc: "清除行+列", amount: 1, target: true },
    color: { name: "染色炸弹", desc: "清除目标颜色", amount: 1, target: true },
    shuffle: { name: "洗牌", desc: "重排宝石", amount: 1, target: false },
  };

  const MODIFIERS = [
    { id: "glass", name: "Glass", desc: "初始生成玻璃层", apply: (s) => (s.modGlass = 8) },
    { id: "heavy", name: "Heavy", desc: "步数-2，连锁加成提高", apply: (s) => { s.movesLeft = Math.max(8, s.movesLeft - 2); s.chainBonus += 0.2; } },
    { id: "color_tax", name: "Color Tax", desc: "一种颜色分值降低", apply: (s) => { s.taxColor = randColor(); } },
    { id: "lucky", name: "Lucky Drop", desc: "道具掉率提高", apply: (s) => { s.dropBoost += 0.12; } },
  ];

  const floorEl = document.getElementById("floor");
  const modifierEl = document.getElementById("modifier");
  const targetScoreEl = document.getElementById("targetScore");
  const movesLeftEl = document.getElementById("movesLeft");
  const floorScoreEl = document.getElementById("floorScore");
  const scoreEl = document.getElementById("score");
  const bestFloorEl = document.getElementById("bestFloor");
  const bestScoreEl = document.getElementById("bestScore");
  const momentumBarEl = document.getElementById("momentumBar");
  const feverTurnsEl = document.getElementById("feverTurns");
  const modeTextEl = document.getElementById("modeText");
  const boardWrapEl = document.getElementById("boardWrap");
  const boardEl = document.getElementById("board");
  const fxLayerEl = document.getElementById("fxLayer");
  const messageEl = document.getElementById("message");
  const restartBtn = document.getElementById("restartBtn");

  const itemWrapEl = document.getElementById("itemWrap");
  const overlayEl = document.getElementById("overlay");
  const overlayTitleEl = document.getElementById("overlayTitle");
  const overlayDescEl = document.getElementById("overlayDesc");
  const choiceWrapEl = document.getElementById("choiceWrap");

  let meta = loadMeta();
  let state = createInitialState();
  let selected = null;
  let inputLocked = false;
  let clearAnim = new Set();
  let fallAnim = new Set();

  bindEvents();
  startRun();

  function createInitialState() {
    return {
      floor: 1,
      score: 0,
      floorScore: 0,
      targetScore: 0,
      movesLeft: 0,
      board: [],
      mode: { type: "normal", item: null },
      items: { hammer: 2, row: 0, cross: 0, color: 0, shuffle: 1 },
      modifier: null,
      modGlass: 0,
      taxColor: null,
      dropBoost: 0,
      chainBonus: 0,
      momentum: 0,
      feverTurns: 0,
      gameOver: false,
      victory: false,
    };
  }

  function loadMeta() {
    try {
      const raw = localStorage.getItem(META_KEY);
      if (!raw) return { bestFloor: 0, bestScore: 0 };
      const parsed = JSON.parse(raw);
      return { bestFloor: Number(parsed.bestFloor || 0), bestScore: Number(parsed.bestScore || 0) };
    } catch {
      return { bestFloor: 0, bestScore: 0 };
    }
  }

  function saveMeta() {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  }

  function bindEvents() {
    restartBtn.addEventListener("click", () => {
      if (window.confirm("确定重新开局吗？")) startRun();
    });
    boardEl.addEventListener("click", onBoardClick);
    itemWrapEl.addEventListener("click", onItemClick);
  }

  function startRun() {
    state = createInitialState();
    selected = null;
    inputLocked = false;
    clearAnim = new Set();
    fallAnim = new Set();
    overlayEl.classList.add("hidden");
    startFloor(1);
    notify("新的一局开始。", "ok");
  }

  function startFloor(floor) {
    state.floor = floor;
    if (state.floor > TOTAL_FLOORS) return onVictory();

    const cfg = FLOOR_CONFIG[state.floor - 1];
    state.targetScore = cfg.target;
    state.movesLeft = cfg.moves;
    state.floorScore = 0;
    state.mode = { type: "normal", item: null };
    state.modifier = randomPick(MODIFIERS);
    state.modGlass = 0;
    state.taxColor = null;
    state.dropBoost = 0;
    state.chainBonus = 0;
    selected = null;

    state.board = createBoard();
    resolveAutoBoard();
    placeObstacles(cfg.obstacles);
    state.modifier.apply(state);
    if (state.modGlass > 0) placeGlass(state.modGlass);

    overlayEl.classList.add("hidden");
    clearAnim.clear();
    fallAnim.clear();

    renderAll();
    notify(`第 ${state.floor} 层开始：${state.modifier.name}。`, "ok");
  }

  function placeObstacles(count) {
    const idxs = collectIndices((c) => c && c.kind === "gem");
    shuffle(idxs);
    for (let i = 0; i < Math.min(count, idxs.length); i += 1) state.board[idxs[i]] = { kind: "obstacle" };
  }

  function placeGlass(count) {
    const idxs = collectIndices((c) => c && c.kind === "gem");
    shuffle(idxs);
    for (let i = 0; i < Math.min(count, idxs.length); i += 1) state.board[idxs[i]].glass = true;
  }

  function collectIndices(predicate) {
    const arr = [];
    for (let i = 0; i < state.board.length; i += 1) if (predicate(state.board[i])) arr.push(i);
    return arr;
  }

  function onItemClick(event) {
    if (inputLocked || state.gameOver || state.victory) return;
    const btn = event.target.closest(".ability");
    if (!btn) return;
    const item = btn.dataset.item;
    if (!item || state.items[item] <= 0) return;

    if (!ITEM_DEFS[item].target) {
      inputLocked = true;
      consumeMove();
      state.items[item] -= 1;
      useShuffle();
      return;
    }

    state.mode = { type: "target_item", item };
    selected = null;
    renderAll();
  }

  async function onBoardClick(event) {
    if (inputLocked || state.gameOver || state.victory) return;
    const cell = event.target.closest(".cell");
    if (!cell) return;
    const idx = Number(cell.dataset.index);

    if (state.mode.type === "target_item") return useTargetItem(state.mode.item, idx);

    if (selected === null) {
      selected = idx;
      return renderBoard();
    }
    if (selected === idx) {
      selected = null;
      return renderBoard();
    }

    const a = selected;
    const b = idx;
    selected = null;

    if (!isAdjacent(a, b)) {
      selected = b;
      return renderBoard();
    }
    await attemptSwap(a, b);
  }

  async function attemptSwap(a, b) {
    const ca = state.board[a];
    const cb = state.board[b];
    if (!isGem(ca) || !isGem(cb)) return notify("障碍格不可交换。", "warn");

    inputLocked = true;
    await playSwapAnimation(a, b);

    if (ca.special && cb.special) {
      swap(a, b);
      consumeMove();
      const comboTargets = specialComboTargets(a, b, ca.special, cb.special);
      await resolveAction(comboTargets, "combo");
      consumePostAction();
      return (inputLocked = false);
    }

    swap(a, b);
    const analysis = analyzeMatches();
    if (analysis.clear.length === 0) {
      swap(a, b);
      await playSwapAnimation(a, b);
      inputLocked = false;
      renderAll();
      return notify("无效交换：未形成消除。", "warn");
    }

    consumeMove();
    await resolveAction(analysis.clear, "normal", analysis.spawnMap, b);
    consumePostAction();
    inputLocked = false;
  }

  async function useTargetItem(item, idx) {
    if (state.items[item] <= 0) return;
    const targets = getItemTargets(item, idx);
    if (targets.length === 0) return notify("该道具在此处无法使用。", "warn");

    inputLocked = true;
    consumeMove();
    state.items[item] -= 1;
    state.mode = { type: "normal", item: null };

    await playItemCastAnimation(item, idx);
    await resolveAction(targets, item);
    consumePostAction();
    inputLocked = false;
  }

  function getItemTargets(item, idx) {
    const r = rowOf(idx);
    const c = colOf(idx);

    if (item === "hammer") return [idx];
    if (item === "row") return indicesInRow(r);
    if (item === "cross") return [...new Set([...indicesInRow(r), ...indicesInCol(c)])];
    if (item === "color") {
      const cell = state.board[idx];
      if (!isGem(cell)) return [];
      return collectIndices((x) => isGem(x) && x.color === cell.color);
    }
    return [];
  }

  async function useShuffle() {
    const gems = collectIndices(isGem).map((i) => state.board[i]);
    shuffle(gems);
    let k = 0;
    for (let i = 0; i < state.board.length; i += 1) {
      if (isGem(state.board[i])) {
        state.board[i] = gems[k++];
        fallAnim.add(i);
      }
    }
    renderAll();
    await sleep(220);
    fallAnim.clear();
    resolveAutoBoard();
    renderAll();
    consumePostAction();
    inputLocked = false;
    notify("使用道具：洗牌", "ok");
  }

  function consumePostAction() {
    if (state.feverTurns > 0) state.feverTurns -= 1;
    checkFloorState();
    renderAll();
  }

  async function resolveAction(initialTargets, source, spawnMap = null, preferSpawnIndex = null) {
    let chain = 1;
    let current = [...new Set(initialTargets)];
    let localSpawnMap = spawnMap;

    while (current.length > 0) {
      const expanded = expandWithSpecialTriggers(current);
      const valid = expanded.filter((idx) => state.board[idx] !== null);
      if (valid.length === 0) break;

      clearAnim = new Set(valid);
      spawnShatterFX(valid);
      shakeBoard();
      renderAll();
      await sleep(180);

      const gemTargets = valid.filter((i) => isGem(state.board[i]));
      const obstacles = valid.filter((i) => isObstacle(state.board[i])).length;

      let gain = calcGain(gemTargets.length, obstacles, chain, source);
      state.floorScore += gain;
      state.score += gain;
      updateMomentum(gemTargets.length, chain);
      spawnFloatText(`+${gain}`, gemTargets[0] ?? valid[0]);

      for (const idx of valid) {
        const cell = state.board[idx];
        if (isGem(cell) && cell.glass) {
          cell.glass = false;
          continue;
        }
        state.board[idx] = null;
      }
      breakAdjacentObstacles(gemTargets);

      if (chain === 1 && localSpawnMap && localSpawnMap.size > 0) {
        const spawnIndex = pickSpawnIndex(localSpawnMap, preferSpawnIndex);
        if (spawnIndex !== null && state.board[spawnIndex] === null) {
          state.board[spawnIndex] = { kind: "gem", color: randColor(), special: localSpawnMap.get(spawnIndex), glass: false };
          spawnShockwaveFX(spawnIndex);
        }
      }

      clearAnim.clear();
      renderAll();
      await sleep(70);

      const moved = collapseBoard();
      const born = refillBoard();
      fallAnim = new Set([...moved, ...born]);
      renderAll();
      await sleep(230);
      fallAnim.clear();

      maybeDropItem(chain);

      chain += 1;
      const next = analyzeMatches();
      current = next.clear;
      localSpawnMap = next.spawnMap;
      source = "normal";
    }

    renderAll();
  }

  function pickSpawnIndex(spawnMap, prefer) {
    if (prefer != null && spawnMap.has(prefer)) return prefer;
    const keys = [...spawnMap.keys()];
    if (keys.length === 0) return null;
    return keys[0];
  }

  function analyzeMatches() {
    const groups = findMatchGroups();
    const clearSet = new Set();
    const spawnMap = new Map();

    for (const g of groups) for (const idx of g.indices) clearSet.add(idx);

    const at = new Map();
    for (const g of groups) {
      for (const idx of g.indices) {
        if (!at.has(idx)) at.set(idx, []);
        at.get(idx).push(g);
      }
    }

    for (const [idx, arr] of at.entries()) {
      const hasH = arr.some((x) => x.dir === "h");
      const hasV = arr.some((x) => x.dir === "v");
      if (hasH && hasV) spawnMap.set(idx, "bomb");
    }

    for (const g of groups) {
      if (g.len >= 5) spawnMap.set(g.indices[2], "rainbow");
      else if (g.len === 4 && !spawnMap.has(g.indices[1])) spawnMap.set(g.indices[1], g.dir === "h" ? "line_h" : "line_v");
    }

    return { clear: [...clearSet], spawnMap };
  }

  function findMatchGroups() {
    const groups = [];
    for (let r = 0; r < SIZE; r += 1) {
      let c = 0;
      while (c < SIZE) {
        const idx = r * SIZE + c;
        const cell = state.board[idx];
        if (!isGem(cell) || cell.special === "rainbow") { c += 1; continue; }
        let len = 1;
        while (c + len < SIZE && sameColor(idx, r * SIZE + c + len)) len += 1;
        if (len >= 3) groups.push({ dir: "h", len, indices: rangeIndices(r, c, len, "h") });
        c += len;
      }
    }

    for (let c = 0; c < SIZE; c += 1) {
      let r = 0;
      while (r < SIZE) {
        const idx = r * SIZE + c;
        const cell = state.board[idx];
        if (!isGem(cell) || cell.special === "rainbow") { r += 1; continue; }
        let len = 1;
        while (r + len < SIZE && sameColor(idx, (r + len) * SIZE + c)) len += 1;
        if (len >= 3) groups.push({ dir: "v", len, indices: rangeIndices(r, c, len, "v") });
        r += len;
      }
    }
    return groups;
  }

  function sameColor(a, b) {
    const ca = state.board[a];
    const cb = state.board[b];
    return isGem(ca) && isGem(cb) && ca.color === cb.color;
  }

  function rangeIndices(r, c, len, dir) {
    const arr = [];
    for (let k = 0; k < len; k += 1) arr.push(dir === "h" ? r * SIZE + (c + k) : (r + k) * SIZE + c);
    return arr;
  }

  function expandWithSpecialTriggers(indices) {
    const set = new Set(indices);
    for (const idx of indices) {
      const cell = state.board[idx];
      if (!isGem(cell) || !cell.special) continue;
      for (const extra of specialTargets(idx, cell.special)) set.add(extra);
      spawnShockwaveFX(idx);
    }
    return [...set];
  }

  function specialTargets(idx, special) {
    const r = rowOf(idx);
    const c = colOf(idx);
    if (special === "line_h") return indicesInRow(r);
    if (special === "line_v") return indicesInCol(c);
    if (special === "bomb") {
      const arr = [];
      for (let rr = r - 1; rr <= r + 1; rr += 1) for (let cc = c - 1; cc <= c + 1; cc += 1) if (inside(rr, cc)) arr.push(rr * SIZE + cc);
      return arr;
    }
    if (special === "rainbow") {
      const cell = state.board[idx];
      const color = cell.color;
      return collectIndices((x) => isGem(x) && x.color === color);
    }
    return [idx];
  }

  function specialComboTargets(a, b, sa, sb) {
    const set = new Set([a, b]);
    if ((sa === "line_h" || sa === "line_v") && (sb === "line_h" || sb === "line_v")) {
      for (const i of indicesInRow(rowOf(a))) set.add(i);
      for (const i of indicesInCol(colOf(a))) set.add(i);
      for (const i of indicesInRow(rowOf(b))) set.add(i);
      for (const i of indicesInCol(colOf(b))) set.add(i);
      return [...set];
    }
    if (sa === "rainbow" || sb === "rainbow") {
      const other = sa === "rainbow" ? state.board[b] : state.board[a];
      if (isGem(other)) {
        for (const i of collectIndices((x) => isGem(x) && x.color === other.color)) set.add(i);
      }
      return [...set];
    }
    for (const i of specialTargets(a, sa)) set.add(i);
    for (const i of specialTargets(b, sb)) set.add(i);
    return [...set];
  }

  function calcGain(gemCount, obstacleCount, chain, source) {
    let base = gemCount * 10 + obstacleCount * 14;
    let chainMul = 1 + (0.25 + state.chainBonus) * (chain - 1);

    if (state.taxColor != null) {
      const taxed = countColor(state.taxColor);
      base -= Math.floor(taxed * 2);
    }
    if (state.feverTurns > 0) chainMul += 0.5;

    if (source === "hammer") base += 8;
    if (source === "row") base += state.feverTurns > 0 ? 26 : 18;
    if (source === "cross") base += state.feverTurns > 0 ? 34 : 24;
    if (source === "color") base += state.feverTurns > 0 ? 40 : 28;
    if (source === "combo") base += 45;

    return Math.max(0, Math.floor(base * chainMul));
  }

  function countColor(color) {
    let n = 0;
    for (const c of state.board) if (isGem(c) && c.color === color) n += 1;
    return Math.floor(n / 6);
  }

  function updateMomentum(gems, chain) {
    const gain = Math.min(26, gems + chain * 4);
    state.momentum = Math.min(MOMENTUM_MAX, state.momentum + gain);
    if (state.momentum >= MOMENTUM_MAX) {
      state.momentum = 0;
      state.feverTurns = 3;
      spawnFloatText("FEVER!", Math.floor((SIZE * SIZE) / 2));
      notify("进入 FEVER：分数与掉落提升！", "ok");
    }
  }

  function maybeDropItem(chain) {
    if (chain < 2) return;
    let chance = 0.16 - (state.floor - 1) * 0.012 + state.dropBoost;
    if (state.feverTurns > 0) chance += 0.1;
    chance = Math.max(0.08, Math.min(0.45, chance));
    if (Math.random() >= chance) return;

    const drops = ["hammer", "row", "cross", "color", "shuffle"];
    const picked = randomPick(drops);
    state.items[picked] += 1;
    spawnFloatText(`+${ITEM_DEFS[picked].name}`, Math.floor(Math.random() * SIZE * SIZE));
  }

  function breakAdjacentObstacles(gemIndices) {
    const broken = new Set();
    for (const idx of gemIndices) {
      const r = rowOf(idx);
      const c = colOf(idx);
      const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
      for (const [nr, nc] of neighbors) {
        if (!inside(nr, nc)) continue;
        const ni = nr * SIZE + nc;
        if (isObstacle(state.board[ni])) broken.add(ni);
      }
    }
    for (const idx of broken) state.board[idx] = null;
  }

  function checkFloorState() {
    if (state.floorScore >= state.targetScore) return onFloorCleared();
    if (state.movesLeft <= 0) return onDefeat();
  }

  function onFloorCleared() {
    if (state.floor >= TOTAL_FLOORS) return onVictory();
    showRewardChoices();
  }

  function onVictory() {
    state.victory = true;
    updateMeta();
    renderAll();
    overlayTitleEl.textContent = "你通关了！";
    overlayDescEl.textContent = `完成 ${TOTAL_FLOORS} 层，最终总分 ${state.score}。`;
    choiceWrapEl.innerHTML = "";
    overlayEl.classList.remove("hidden");
  }

  function onDefeat() {
    state.gameOver = true;
    updateMeta();
    renderAll();
    overlayTitleEl.textContent = "挑战失败";
    overlayDescEl.textContent = `第 ${state.floor} 层未达成目标分。最终总分 ${state.score}。`;
    choiceWrapEl.innerHTML = "";
    overlayEl.classList.remove("hidden");
  }

  function showRewardChoices() {
    const choices = buildRewardChoices();
    overlayTitleEl.textContent = `第 ${state.floor} 层完成`;
    overlayDescEl.textContent = "选择一个奖励：道具或临时增强";
    choiceWrapEl.innerHTML = "";

    for (const reward of choices) {
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.innerHTML = `<strong>${reward.title}</strong><small>${reward.desc}</small>`;
      btn.addEventListener("click", () => {
        reward.apply();
        overlayEl.classList.add("hidden");
        startFloor(state.floor + 1);
      });
      choiceWrapEl.appendChild(btn);
    }

    overlayEl.classList.remove("hidden");
  }

  function buildRewardChoices() {
    const pool = [
      { title: "锤子 +2", desc: "单点拆除", apply: () => (state.items.hammer += 2) },
      { title: "横扫 +1", desc: "清除一整行", apply: () => (state.items.row += 1) },
      { title: "十字 +1", desc: "行列爆破", apply: () => (state.items.cross += 1) },
      { title: "染色炸弹 +1", desc: "清同色", apply: () => (state.items.color += 1) },
      { title: "洗牌 +1", desc: "坏盘翻盘", apply: () => (state.items.shuffle += 1) },
      { title: "额外步数 +2", desc: "本层压力降低", apply: () => (state.movesLeft += 2) },
      { title: "Momentum 注入", desc: "进度 +40", apply: () => (state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 40)) },
    ];
    shuffle(pool);
    return pool.slice(0, 3);
  }

  function consumeMove() {
    state.movesLeft = Math.max(0, state.movesLeft - 1);
  }

  async function playSwapAnimation(a, b) {
    const cellA = boardEl.querySelector(`.cell[data-index="${a}"]`);
    const cellB = boardEl.querySelector(`.cell[data-index="${b}"]`);
    if (!cellA || !cellB) return;

    const ra = cellA.getBoundingClientRect();
    const rb = cellB.getBoundingClientRect();
    const dx = rb.left - ra.left;
    const dy = rb.top - ra.top;

    cellA.style.transition = "transform 140ms ease";
    cellB.style.transition = "transform 140ms ease";
    cellA.style.transform = `translate(${dx}px, ${dy}px)`;
    cellB.style.transform = `translate(${-dx}px, ${-dy}px)`;

    await sleep(145);
    cellA.style.transform = "";
    cellB.style.transform = "";
    await sleep(20);
  }

  async function playItemCastAnimation(item, idx) {
    const fromEl = itemWrapEl.querySelector(`.ability[data-item="${item}"]`);
    const toEl = boardEl.querySelector(`.cell[data-index="${idx}"]`);
    if (!fromEl || !toEl) return;

    const from = fromEl.getBoundingClientRect();
    const to = toEl.getBoundingClientRect();

    const fx = document.createElement("div");
    fx.className = `item-cast-fx item-${item}`;
    fx.textContent = item === "hammer" ? "H" : item === "row" ? "R" : item === "cross" ? "C" : item === "color" ? "O" : "S";

    const sx = from.left + from.width / 2;
    const sy = from.top + from.height / 2;
    const ex = to.left + to.width / 2;
    const ey = to.top + to.height / 2;

    fx.style.left = `${sx}px`;
    fx.style.top = `${sy}px`;
    document.body.appendChild(fx);

    requestAnimationFrame(() => {
      fx.style.transform = `translate(${ex - sx}px, ${ey - sy}px) scale(0.7)`;
      fx.style.opacity = "0.2";
    });

    await sleep(240);
    fx.remove();
  }

  function spawnShatterFX(indices) {
    for (const idx of indices.slice(0, 12)) {
      const cell = boardEl.querySelector(`.cell[data-index="${idx}"]`);
      if (!cell) continue;
      const r = cell.getBoundingClientRect();
      for (let i = 0; i < 6; i += 1) {
        const p = document.createElement("i");
        p.className = "fx-shard";
        p.style.left = `${r.left + r.width / 2}px`;
        p.style.top = `${r.top + r.height / 2}px`;
        p.style.setProperty("--dx", `${(Math.random() - 0.5) * 60}px`);
        p.style.setProperty("--dy", `${(Math.random() - 0.5) * 60}px`);
        fxLayerEl.appendChild(p);
        setTimeout(() => p.remove(), 360);
      }
    }
  }

  function spawnShockwaveFX(index) {
    const cell = boardEl.querySelector(`.cell[data-index="${index}"]`);
    if (!cell) return;
    const r = cell.getBoundingClientRect();
    const wave = document.createElement("i");
    wave.className = "fx-wave";
    wave.style.left = `${r.left + r.width / 2}px`;
    wave.style.top = `${r.top + r.height / 2}px`;
    fxLayerEl.appendChild(wave);
    setTimeout(() => wave.remove(), 320);
  }

  function spawnFloatText(text, index) {
    const cell = boardEl.querySelector(`.cell[data-index="${index}"]`);
    if (!cell) return;
    const r = cell.getBoundingClientRect();
    const el = document.createElement("i");
    el.className = "fx-text";
    el.textContent = text;
    el.style.left = `${r.left + r.width / 2}px`;
    el.style.top = `${r.top + r.height / 2}px`;
    fxLayerEl.appendChild(el);
    setTimeout(() => el.remove(), 540);
  }

  function shakeBoard() {
    boardWrapEl.classList.remove("shake");
    boardWrapEl.offsetWidth;
    boardWrapEl.classList.add("shake");
  }

  function updateMeta() {
    meta.bestFloor = Math.max(meta.bestFloor, state.floor);
    meta.bestScore = Math.max(meta.bestScore, state.score);
    saveMeta();
  }

  function createBoard() {
    const arr = Array(SIZE * SIZE).fill(null);
    for (let i = 0; i < arr.length; i += 1) arr[i] = { kind: "gem", color: randColor(), special: null, glass: false };
    return arr;
  }

  function resolveAutoBoard() {
    let safe = 0;
    while (true) {
      const groups = findMatchGroups();
      if (groups.length === 0) break;
      for (const g of groups) for (const idx of g.indices) {
        if (isGem(state.board[idx])) state.board[idx].color = randColor();
      }
      if (++safe > 80) break;
    }
  }

  function collapseBoard() {
    const moved = [];
    for (let c = 0; c < SIZE; c += 1) {
      const keep = [];
      for (let r = SIZE - 1; r >= 0; r -= 1) {
        const idx = r * SIZE + c;
        const v = state.board[idx];
        if (v !== null) keep.push(v);
      }
      for (let r = SIZE - 1; r >= 0; r -= 1) {
        const idx = r * SIZE + c;
        const next = keep[SIZE - 1 - r] ?? null;
        if (state.board[idx] !== next && next && isGem(next)) moved.push(idx);
        state.board[idx] = next;
      }
    }
    return moved;
  }

  function refillBoard() {
    const born = [];
    for (let i = 0; i < state.board.length; i += 1) {
      if (state.board[i] === null) {
        state.board[i] = { kind: "gem", color: randColor(), special: null, glass: false };
        born.push(i);
      }
    }
    return born;
  }

  function isAdjacent(a, b) {
    return Math.abs(rowOf(a) - rowOf(b)) + Math.abs(colOf(a) - colOf(b)) === 1;
  }

  function rowOf(i) { return Math.floor(i / SIZE); }
  function colOf(i) { return i % SIZE; }
  function inside(r, c) { return r >= 0 && r < SIZE && c >= 0 && c < SIZE; }
  function indicesInRow(r) { return Array.from({ length: SIZE }, (_, x) => r * SIZE + x); }
  function indicesInCol(c) { return Array.from({ length: SIZE }, (_, y) => y * SIZE + c); }

  function swap(a, b) {
    const t = state.board[a];
    state.board[a] = state.board[b];
    state.board[b] = t;
  }

  function randColor() { return Math.floor(Math.random() * COLORS); }
  function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
  function isGem(c) { return c && c.kind === "gem"; }
  function isObstacle(c) { return c && c.kind === "obstacle"; }

  function renderAll() {
    renderHUD();
    renderItems();
    renderBoard();
  }

  function renderHUD() {
    floorEl.textContent = `${state.floor}/${TOTAL_FLOORS}`;
    modifierEl.textContent = state.modifier ? state.modifier.name : "-";
    targetScoreEl.textContent = String(state.targetScore);
    movesLeftEl.textContent = String(state.movesLeft);
    floorScoreEl.textContent = String(state.floorScore);
    scoreEl.textContent = String(state.score);
    bestFloorEl.textContent = String(meta.bestFloor);
    bestScoreEl.textContent = String(meta.bestScore);

    momentumBarEl.style.width = `${(state.momentum / MOMENTUM_MAX) * 100}%`;
    feverTurnsEl.textContent = `Fever ${state.feverTurns}`;

    if (state.mode.type === "normal") modeTextEl.textContent = "模式：普通交换";
    if (state.mode.type === "target_item") modeTextEl.textContent = `模式：道具选点（${ITEM_DEFS[state.mode.item].name}）`;
  }

  function renderItems() {
    itemWrapEl.innerHTML = "";
    const itemOrder = ["hammer", "row", "cross", "color", "shuffle"];
    for (const id of itemOrder) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ability";
      btn.dataset.item = id;
      if (state.mode.type === "target_item" && state.mode.item === id) btn.classList.add("active");
      if (state.items[id] <= 0) btn.classList.add("disabled");
      btn.innerHTML = `<strong>${ITEM_DEFS[id].name}</strong><small>数量 ${state.items[id]} · ${ITEM_DEFS[id].desc}</small>`;
      itemWrapEl.appendChild(btn);
    }
  }

  function renderBoard() {
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
        const gem = document.createElement("div");
        gem.className = `gem g-${value.color}`;
        if (value.special) gem.classList.add(`sp-${value.special}`);
        if (value.glass) gem.classList.add("glass");
        if (clearAnim.has(i)) gem.classList.add("clear-pop");
        if (fallAnim.has(i)) gem.classList.add("fall-in");
        cell.appendChild(gem);
      }

      boardEl.appendChild(cell);
    }
  }

  function notify(text, type = "ok") {
    messageEl.textContent = text;
    if (type === "warn") {
      messageEl.style.background = "#3a2226";
      messageEl.style.borderColor = "#9a3f58";
      return;
    }
    messageEl.style.background = "#16213f";
    messageEl.style.borderColor = "#2f4678";
  }
})();
