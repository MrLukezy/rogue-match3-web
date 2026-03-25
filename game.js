import {
  MIN_BOARD_SIZE,
  MAX_BOARD_SIZE,
  BOARD_SIZE_BY_FLOOR,
  TOTAL_FLOORS,
  META_KEY,
  MOMENTUM_MAX,
  MAX_SKILL_CHAIN,
  MAX_ACTIVE_SHARDS,
  FLOOR_CONFIG,
  FLOOR_DIFFICULTY,
  CHAPTER_THEMES,
  EVENT_NODE_FLOORS,
  ELITE_FLOORS,
} from "./src/config/game-config.js";
import {
  MAX_ITEM_TYPES,
  ITEM_DEFS,
  ITEM_ANIM_FRAMES,
  ITEM_ORDER,
  ITEM_BASE_COUNTS,
  ITEM_BASE_LEVEL,
  RARITY_LABELS,
} from "./src/config/items-config.js";
import { GUIDE_DEFS, GEM_IMAGE_BY_COLOR, GEM_ANIM_FRAMES, GEM_POOL_BY_FLOOR, GEM_COLOR_NAMES } from "./src/config/gems-config.js";
import { UI_IMAGES, BOSS_ANIM_FRAMES, BOSS_SKILLS } from "./src/config/boss-ui-config.js";
import { BLESSING_DEFS } from "./src/config/blessings-config.js";
import { renderItemsView, renderPerksView } from "./src/render/items-render.js";
import { renderBoardView } from "./src/render/board-render.js";
import {
  createInitialState as buildInitialState,
  seedStartingItems,
  getItemCount as readItemCount,
  getItemLevel as readItemLevel,
  getAnimatedItemImage as pickAnimatedItemImage,
  getAnimatedGemImage as pickAnimatedGemImage,
  getAnimatedBossImage as pickAnimatedBossImage,
  syncAnimatedVisuals,
  hasItemType as checkHasItemType,
  getCarriedItems as listCarriedItems,
  itemSlotAvailable as checkItemSlotAvailable,
  ensureItemType as ensureStateItemType,
  addItemCharges as addStateItemCharges,
  upgradeItem as upgradeStateItem,
  spendItemCharge as spendStateItemCharge,
  boostAllItemLevels,
  grantDragonHoardBonus as applyDragonHoardBonus,
  defaultCodex,
  loadMeta as loadMetaState,
  saveMeta as persistMeta,
  recordCodex as patchCodex,
} from "./src/core/state-meta-items.js";
import {
  createBoard as createBoardState,
  resolveAutoBoard as resolveAutoBoardState,
  collapseBoard as collapseBoardState,
  refillBoard as refillBoardState,
  rowOf as getRowOf,
  colOf as getColOf,
  inside as isInside,
  indicesInRow as getIndicesInRow,
  indicesInCol as getIndicesInCol,
  isAdjacent as checkIsAdjacent,
  swap as swapBoardCells,
  randColor as pickRandColor,
  randomPick as pickRandom,
  shuffle as shuffleArray,
  sleep as wait,
  isGem as checkIsGem,
  isObstacle as checkIsObstacle,
} from "./src/core/board-core.js";
import {
  playSwapAnimation as runSwapAnimation,
  playItemCastAnimation as runItemCastAnimation,
  spawnShatterFX as runShatterFX,
  spawnShockwaveFX as runShockwaveFX,
  spawnFloatText as runFloatText,
  spawnScreenPulse as runScreenPulse,
  shakeBoard as runShakeBoard,
} from "./src/fx/board-fx.js";
import { getDomRefs, bindCoreEvents } from "./src/bootstrap/dom.js";

(() => {
  const MODIFIERS = [
    { id: "glass", name: "Glass", desc: "Start with extra glass layers", apply: (s) => (s.modGlass = 8) },
    { id: "heavy", name: "Heavy", desc: "Lose 2 moves, gain stronger chains", apply: (s) => { s.movesLeft = Math.max(8, s.movesLeft - 2); s.chainBonus += 0.2; } },
    { id: "color_tax", name: "Color Tax", desc: "One color scores less", apply: (s) => { s.taxColor = randColor(); } },
    { id: "lucky", name: "Lucky Drop", desc: "Item drop chance is higher", apply: (s) => { s.dropBoost += 0.12; } },
    { id: "frost_seal", name: "Frost Seal", desc: "Several gems begin locked", apply: (s) => { s.modLocks = 4; } },
    { id: "stormfront", name: "Stormfront", desc: "Builds momentum faster but trims one move", apply: (s) => { s.movesLeft = Math.max(8, s.movesLeft - 1); s.chainBonus += 0.12; s.dropBoost += 0.04; } },
    { id: "rich_vein", name: "Rich Vein", desc: "Gain score and extra tool density on this floor", apply: (s) => { s.floorScore += 80; s.dropBoost += 0.08; } },
  ];

  const PERK_DEFS = {
    combo_forge: { title: "Combo Forge", desc: "4-matches can upgrade into bomb gems", rarity: "common", apply: (s) => { s.perks.combo_forge = true; } },
    fever_loop: { title: "Fever Loop", desc: "Fever lasts +1 turn", rarity: "common", apply: (s) => { s.perks.fever_loop = true; } },
    relic_magnet: { title: "Relic Magnet", desc: "Item drop chance is higher", rarity: "common", apply: (s) => { s.perks.relic_magnet = true; } },
    glass_breaker: { title: "Glass Breaker", desc: "Breaking glass grants bonus points", rarity: "common", apply: (s) => { s.perks.glass_breaker = true; } },
    overcharge: { title: "Overcharge", desc: "Each floor begins with bonus momentum", rarity: "common", apply: (s) => { s.perks.overcharge = true; } },
    pressure_valve: { title: "Pressure Valve", desc: "Boss pressure removes fewer moves", rarity: "common", apply: (s) => { s.perks.pressure_valve = true; } },
    blast_core: { title: "Blast Core", desc: "Specials and blasts score more", rarity: "rare", apply: (s) => { s.perks.blast_core = true; } },
    score_bloom: { title: "Score Bloom", desc: "Every gem cleared grants bonus score", rarity: "rare", apply: (s) => { s.perks.score_bloom = true; } },
    quick_hands: { title: "Quick Hands", desc: "Target items gain bonus charge when upgraded", rarity: "rare", apply: (s) => { s.perks.quick_hands = true; } },
    fever_smith: { title: "Fever Smith", desc: "Legend skills grant extra momentum", rarity: "rare", apply: (s) => { s.perks.fever_smith = true; } },
    arcane_stockpile: { title: "Arcane Stockpile", desc: "Item drops can include legendary skills", rarity: "epic", apply: (s) => { s.perks.arcane_stockpile = true; } },
    boss_hunter: { title: "Boss Hunter", desc: "Damage the boss charge more whenever you use a legend skill", rarity: "epic", apply: (s) => { s.perks.boss_hunter = true; } },
    vault_expander: { title: "Vault Expander", desc: "New item types arrive with bonus charges", rarity: "epic", apply: (s) => { s.perks.vault_expander = true; } },
    prism_heart: { title: "Prism Heart", desc: "Rainbow gems score more and spawn more often", rarity: "epic", apply: (s) => { s.perks.prism_heart = true; } },
    sovereign_circuit: { title: "Sovereign Circuit", desc: "All equipped items gain +1 level instantly", rarity: "legendary", apply: (s) => { s.perks.sovereign_circuit = true; boostAllItemLevels(s); } },
    dragon_hoard: { title: "Dragon Hoard", desc: "Your highest-level item gains charges every floor", rarity: "legendary", apply: (s) => { s.perks.dragon_hoard = true; } },
  };

  const {
    floorEl,
    modifierEl,
    movesLeftEl,
    floorScoreEl,
    scoreEl,
    boardTargetScoreEl,
    boardFloorScoreEl,
    bestFloorEl,
    bestScoreEl,
    momentumBarEl,
    feverTurnsEl,
    bossMeterEl,
    bossBarEl,
    bossSkillHintEl,
    bossTitleEl,
    bossStateEl,
    bossThreatEl,
    bossPatternEl,
    modeTextEl,
    boardWrapEl,
    boardEl,
    fxLayerEl,
    itemTooltipEl,
    messageEl,
    restartBtn,
    codexBtn,
    guideBtn,
    itemWrapEl,
    perkWrapEl,
    overlayEl,
    overlayTitleEl,
    overlayDescEl,
    choiceWrapEl,
    overlayActionsEl,
    codexModalEl,
    codexContentEl,
    codexCloseBtn,
    guideModalEl,
    guideModalTitleEl,
    guideModalDescEl,
    guideModalContentEl,
    guideCloseBtn,
  } = getDomRefs(document);

  let meta = loadMeta();
  let state = createInitialState();
  let selected = null;
  let inputLocked = false;
  let clearAnim = new Set();
  let fallAnim = new Set();
  let activeShards = 0;
  let boardSize = MIN_BOARD_SIZE;
  let guideQueue = [];
  let guideActive = false;
  let itemAnimFrameIndex = 0;
  let itemAnimTimer = null;

  bindEvents();
  startItemIconAnimation();
  startRun();

  function createInitialState() {
    const initial = buildInitialState({ MIN_BOARD_SIZE, ITEM_ORDER });
    seedStartingItems(initial, { ITEM_BASE_LEVEL, ITEM_BASE_COUNTS });
    return initial;
  }

  function getItemCount(id) {
    return readItemCount(state, id);
  }

  function getItemLevel(id) {
    return readItemLevel(state, id);
  }

  function getAnimatedItemImage(id, frameIndex = itemAnimFrameIndex) {
    return pickAnimatedItemImage(id, frameIndex, ITEM_ANIM_FRAMES, ITEM_DEFS);
  }

  function getAnimatedGemImage(color, frameIndex = itemAnimFrameIndex) {
    return pickAnimatedGemImage(color, frameIndex, GEM_ANIM_FRAMES, GEM_IMAGE_BY_COLOR);
  }

  function getAnimatedBossImage(frameIndex = itemAnimFrameIndex) {
    return pickAnimatedBossImage(frameIndex, BOSS_ANIM_FRAMES);
  }

  function syncAnimatedItemImages(root = document) {
    syncAnimatedVisuals({ root, frameIndex: itemAnimFrameIndex, getAnimatedItemImage, getAnimatedGemImage, getAnimatedBossImage });
  }

  function startItemIconAnimation() {
    if (itemAnimTimer) clearInterval(itemAnimTimer);
    itemAnimTimer = setInterval(() => {
      itemAnimFrameIndex = (itemAnimFrameIndex + 1) % 8;
      syncAnimatedItemImages(document);
    }, 145);
  }

  function hasItemType(id) {
    return checkHasItemType(state, id);
  }

  function itemPower(id) {
    return Math.max(1, getItemLevel(id) || 1);
  }

  function getCarriedItems() {
    return listCarriedItems(state, ITEM_DEFS);
  }

  function itemSlotAvailable() {
    return checkItemSlotAvailable(state, ITEM_DEFS, MAX_ITEM_TYPES);
  }

  function ensureItemType(id) {
    return ensureStateItemType(state, id, { ITEM_BASE_LEVEL, ITEM_DEFS, MAX_ITEM_TYPES });
  }

  function addItemCharges(id, amount = 1, allowNewType = true) {
    return addStateItemCharges(state, id, amount, allowNewType, { ITEM_BASE_LEVEL, ITEM_DEFS, MAX_ITEM_TYPES });
  }

  function upgradeItem(id, levelGain = 1, chargeGain = 1) {
    return upgradeStateItem(state, id, levelGain, chargeGain, { ITEM_BASE_LEVEL, ITEM_DEFS, MAX_ITEM_TYPES });
  }

  function spendItemCharge(id) {
    spendStateItemCharge(state, id);
  }

  function grantDragonHoardBonus() {
    applyDragonHoardBonus(state, ITEM_DEFS, (id, amount, allowNewType) => addItemCharges(id, amount, allowNewType));
  }

  function loadMeta() {
    return loadMetaState(localStorage, META_KEY);
  }

  function saveMeta() {
    persistMeta(localStorage, META_KEY, meta);
  }

  function recordCodex(group, key, delta = 1) {
    patchCodex(meta, group, key, delta);
    saveMeta();
  }

  function bindEvents() {
    bindCoreEvents({
      restartBtn,
      boardEl,
      itemWrapEl,
      codexBtn,
      guideBtn,
      codexCloseBtn,
      guideCloseBtn,
      codexModalEl,
      guideModalEl,
      startRun,
      onBoardClick,
      onItemClick,
      onItemHover,
      onItemHoverOut,
      openCodex,
      openGuidePanel,
      closeGuideModal,
    });
  }

  function openCodex() {
    renderCodex();
    codexModalEl.classList.remove("hidden");
  }

  function openGuidePanel(entryId = null) {
    renderGuideList(entryId);
    guideModalTitleEl.textContent = entryId && GUIDE_DEFS[entryId] ? GUIDE_DEFS[entryId].title : "Tile Guide";
    guideModalDescEl.textContent = entryId && GUIDE_DEFS[entryId]
      ? "This tile type has appeared for the first time in your current run."
      : "Every tile type, board condition, and special gem is listed here.";
    guideModalEl.classList.remove("hidden");
  }

  function closeGuideModal() {
    guideModalEl.classList.add("hidden");
    guideActive = false;
    maybeShowNextGuide();
  }

  function renderGuideList(highlightId = null) {
    const entries = Object.entries(GUIDE_DEFS);
    guideModalContentEl.innerHTML = "";

    for (const [id, def] of entries) {
      const detail = createGuideEntry(id, def, highlightId === id, true);
      detail.addEventListener("click", () => {});
      guideModalContentEl.appendChild(detail);
    }
  }

  function createGuideEntry(id, def, highlighted = false, detailed = false) {
    const entry = document.createElement("div");
    entry.className = `guide-item${detailed ? " modal-item" : ""}${highlighted ? " highlighted" : ""}`;

    const preview = document.createElement("div");
    preview.className = "guide-preview";
    preview.appendChild(createGuidePreview(def.preview));

    const text = document.createElement("div");
    text.innerHTML = `<strong>${def.title}</strong><small>${def.desc}</small>`;

    entry.appendChild(preview);
    entry.appendChild(text);
    entry.dataset.guide = id;
    return entry;
  }

  function createGuidePreview(preview) {
    const frame = document.createElement("div");
    frame.className = "guide-preview-frame";

    if (!preview || preview.kind === "obstacle") {
      const obstacle = document.createElement("div");
      obstacle.className = "obstacle";
      frame.appendChild(obstacle);
      return frame;
    }

    const gem = document.createElement("div");
    gem.className = `gem g-${preview.color ?? 0}`;
    if (preview.special) gem.classList.add(`sp-${preview.special}`);
    if (preview.glass) gem.classList.add("glass");
    if (preview.locked) gem.classList.add("locked");

    const icon = document.createElement("img");
    icon.className = "gem-icon gem-image";
    icon.alt = "guide gem";
    icon.dataset.animGem = String(preview.color ?? 0);
    icon.src = getAnimatedGemImage(preview.color ?? 0);
    gem.appendChild(icon);
    frame.appendChild(gem);
    return frame;
  }

  function queueGuideIfNew(id) {
    if (!GUIDE_DEFS[id]) return;
    if (meta.codex.guideSeen[id]) return;
    meta.codex.guideSeen[id] = 1;
    saveMeta();
    guideQueue.push(id);
  }

  function scanGuideDiscoveries() {
    let hasGlass = false;
    let hasLocked = false;
    let hasObstacle = false;
    const specials = new Set();

    for (const cell of state.board) {
      if (isObstacle(cell)) hasObstacle = true;
      if (!isGem(cell)) continue;
      if (cell.glass) hasGlass = true;
      if (cell.lockedTurns > 0) hasLocked = true;
      if (cell.special) specials.add(cell.special);
    }

    if (hasObstacle) queueGuideIfNew("obstacle");
    if (hasGlass) queueGuideIfNew("glass");
    if (hasLocked) queueGuideIfNew("locked");
    if (state.floor === 1) queueGuideIfNew("gem_basic");
    for (const special of specials) queueGuideIfNew(special);
    maybeShowNextGuide();
  }

  function maybeShowNextGuide() {
    if (guideActive || overlayEl.classList.contains("hidden") === false) return;
    const next = guideQueue.shift();
    if (!next) return;
    guideActive = true;
    openGuidePanel(next);
  }

  function bindOverlayActions() {
    const buttons = overlayActionsEl.querySelectorAll("[data-action]");
    for (const btn of buttons) {
      btn.addEventListener("click", () => {
        if (btn.dataset.action === "restart-run") startRun();
      });
    }
  }

  function renderCodex() {
    const c = meta.codex;
    codexContentEl.innerHTML = "";

    const rows = [
      ["Runs", c.runs],
      ["Best Chain", c.maxChain],
      ["Hammer Uses", c.itemUse.hammer],
      ["Row Sweep Uses", c.itemUse.row],
      ["Cross Burst Uses", c.itemUse.cross],
      ["Color Bomb Uses", c.itemUse.color],
      ["Shuffle Uses", c.itemUse.shuffle],
      ["Line Triggers", c.specialTrigger.line_h + c.specialTrigger.line_v],
      ["Bomb Triggers", c.specialTrigger.bomb],
      ["Rainbow Triggers", c.specialTrigger.rainbow],
      ["Boss: Glass Storm", c.bossSeen.glass_storm],
      ["Boss: Hex Lock", c.bossSeen.hex_lock],
      ["Boss: Color Shift", c.bossSeen.color_shift],
      ["Screen Pulse Uses", c.skillUse.screen_wipe],
      ["Rainbow Burst Uses", c.skillUse.rainbow_burst],
      ["Time Freeze Uses", c.skillUse.time_freeze],
      ["Boss Breaker Uses", c.skillUse.boss_breaker],
      ["Best Single Clear", c.maxSingleClear],
    ];

    for (const [k, v] of rows) {
      const div = document.createElement("div");
      div.className = "row";
      div.innerHTML = `<span>${k}</span><strong>${v}</strong>`;
      codexContentEl.appendChild(div);
    }
  }

  function startRun() {
    state = createInitialState();
    selected = null;
    inputLocked = false;
    clearAnim = new Set();
    fallAnim = new Set();
    guideQueue = [];
    guideActive = false;
    overlayEl.classList.add("hidden");
    codexModalEl.classList.add("hidden");
    guideModalEl.classList.add("hidden");
    meta.codex.runs += 1;
    saveMeta();
    startFloor(1);
    notify("A new run begins.", "ok");
  }

  function startFloor(floor) {
    state.floor = floor;
    if (state.floor > TOTAL_FLOORS) return onVictory();

    const previousColorCount = state.activeGemColors?.length || 4;

    const cfg = FLOOR_CONFIG[state.floor - 1];
    const threat = getFloorThreat(state.floor);
    const theme = getFloorTheme(state.floor);
    boardSize = getBoardSizeForFloor(state.floor);
    state.boardSize = boardSize;
    state.activeGemColors = getGemPoolForFloor(state.floor);
    state.floorThreat = { label: threat.label, bossGain: threat.bossGain, pressure: threat.pressure };
    state.floorTheme = theme;
    const unlockedNewColor = state.activeGemColors.length > previousColorCount;

    state.targetScore = Math.floor(cfg.target * threat.targetMul);
    state.movesLeft = Math.max(8, cfg.moves + threat.movesDelta);
    state.floorScore = 0;
    state.mode = { type: "normal", item: null };
    state.modifier = randomPick(MODIFIERS);
    state.modGlass = 0;
    state.modLocks = 0;
    state.taxColor = null;
    state.dropBoost = 0;
    state.chainBonus = 0;
    selected = null;

    if (state.nextFloorMovePenalty > 0) {
      state.movesLeft = Math.max(7, state.movesLeft - state.nextFloorMovePenalty);
      state.nextFloorMovePenalty = 0;
    }
    if (state.nextFloorMoveBonus > 0) {
      state.movesLeft += state.nextFloorMoveBonus;
      state.nextFloorMoveBonus = 0;
    }

    if (state.perks.overcharge) {
      state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 28);
    }
    if (state.blessings.tactical_reserve) state.movesLeft += 1;
    if (state.blessings.chain_matrix) state.chainBonus += 0.15;
    if (state.blessings.supply_cache) refillCarriedCharges();
    if (unlockedNewColor) {
      state.movesLeft += 1;
      state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 18);
    }
    grantDragonHoardBonus();

    state.board = createBoard();
    resolveAutoBoard();
    placeObstacles(cfg.obstacles + threat.obstacleBonus);
    state.modifier.apply(state);

    applyThemePressure(theme, threat);

    if (state.eventCurseFloors > 0) {
      state.eventCurseFloors -= 1;
      state.dropBoost += 0.08;
      state.chainBonus += 0.1;
    }

    const purifierOffset = state.blessings.purifier_sigil ? 2 : 0;
    if (state.modGlass > 0) placeGlass(Math.max(0, state.modGlass + threat.glassBonus - purifierOffset));
    if (state.modLocks > 0) placeLocks(Math.max(0, state.modLocks + Math.max(0, threat.pressure - 1) - purifierOffset));

    const isElite = ELITE_FLOORS.includes(state.floor);
    state.boss.elite = isElite;
    state.boss.charge = 0;
    state.boss.max = Math.max(3, (isElite ? 5 : 7) + threat.bossMaxDelta);
    state.boss.hint = isElite ? `${theme.eliteBossName} ready - ${threat.label}` : `${theme.bossName} idle - ${threat.label}`;
    state.boss.phase = "charging";
    state.boss.casting = false;

    overlayEl.classList.add("hidden");
    if (overlayActionsEl) overlayActionsEl.innerHTML = "";
    clearAnim.clear();
    fallAnim.clear();

    renderAll();
    showFloorIntro(threat);
    if (unlockedNewColor) {
      const newest = state.activeGemColors[state.activeGemColors.length - 1];
      notify(`New gem unlocked: ${GEM_COLOR_NAMES[newest]}. +1 move and +18 momentum to ease the transition.`, "ok");
    }
    notify(`Floor ${state.floor} begins: ${theme.title} / ${state.modifier.name} / ${threat.label}.`, "ok");
    scanGuideDiscoveries();
  }

  function getFloorThreat(floor) {
    return FLOOR_DIFFICULTY[Math.max(0, Math.min(FLOOR_DIFFICULTY.length - 1, floor - 1))];
  }

  function getFloorTheme(floor) {
    return CHAPTER_THEMES.find((theme) => floor >= theme.start && floor <= theme.end) || CHAPTER_THEMES[0];
  }

  function getGemPoolForFloor(floor) {
    return GEM_POOL_BY_FLOOR[Math.max(0, Math.min(GEM_POOL_BY_FLOOR.length - 1, floor - 1))] || [0, 1, 2, 3];
  }

  function nextGemColor(color) {
    const pool = state.activeGemColors || [0, 1, 2, 3];
    const idx = pool.indexOf(color);
    if (idx === -1) return pool[0];
    return pool[(idx + 1) % pool.length];
  }

  function getBoardSizeForFloor(floor) {
    const size = BOARD_SIZE_BY_FLOOR[Math.max(0, Math.min(BOARD_SIZE_BY_FLOOR.length - 1, floor - 1))] || MIN_BOARD_SIZE;
    return Math.max(MIN_BOARD_SIZE, Math.min(MAX_BOARD_SIZE, size));
  }

  function showFloorIntro(threat) {
    const fx = document.createElement("div");
    fx.className = "floor-intro";
    fx.innerHTML = `<strong>${state.floorTheme.title} · Floor ${state.floor}</strong><small>${threat.label} - ${state.modifier.name} · ${state.activeGemColors.length} colors</small>`;
    fxLayerEl.appendChild(fx);

    spawnScreenPulse("floor", 620);
    shakeBoard(1.08);
    setTimeout(() => fx.remove(), 760);
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

  function placeLocks(count) {
    const idxs = collectIndices((c) => c && c.kind === "gem" && c.lockedTurns <= 0);
    shuffle(idxs);
    for (let i = 0; i < Math.min(count, idxs.length); i += 1) state.board[idxs[i]].lockedTurns = 2;
  }

  function applyThemePressure(theme, threat) {
    if (theme.id === "frozen_archive") {
      state.modLocks += 2 + Math.min(2, threat.pressure);
      state.modGlass += 1;
    }
    if (theme.id === "storm_forge") {
      state.chainBonus += 0.08;
      state.dropBoost += 0.06;
    }
    if (theme.id === "void_rift") {
      if (state.taxColor == null) state.taxColor = randColor();
      state.modGlass += 1;
      placeObstacles(1 + Math.max(0, threat.pressure - 2));
    }
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
    if (!item || getItemCount(item) <= 0 || !hasItemType(item)) return;

    if (!ITEM_DEFS[item].target) {
      inputLocked = true;
      spendItemCharge(item);
      recordCodex("itemUse", item);
      if (item === "shuffle") {
        useShuffle();
      } else {
        useLegendSkill(item);
      }
      return;
    }

    state.mode = { type: "target_item", item };
    selected = null;
    renderAll();
  }

  function onItemHover(event) {
    const btn = event.target.closest(".ability[data-item]");
    if (!btn || !itemTooltipEl) return;
    const item = btn.dataset.item;
    if (!item || !ITEM_DEFS[item]) return;
    itemTooltipEl.innerHTML = `<strong>${ITEM_DEFS[item].name} Lv.${getItemLevel(item)}</strong><small>${ITEM_DEFS[item].desc}</small>`;
    itemTooltipEl.classList.remove("hidden");
  }

  function onItemHoverOut(event) {
    if (!itemTooltipEl) return;
    const related = event.relatedTarget;
    if (related && related.closest && related.closest("#itemWrap")) return;
    itemTooltipEl.classList.add("hidden");
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
    if (!isGem(ca) || !isGem(cb)) return notify("Obstacle tiles cannot be swapped.", "warn");
    if (ca.lockedTurns > 0 || cb.lockedTurns > 0) return notify("A locked gem cannot be swapped.", "warn");

    inputLocked = true;
    await playSwapAnimation(a, b);

    if (ca.special && cb.special) {
      swap(a, b);
      consumeMove();
      const comboTargets = specialComboTargets(a, b, ca.special, cb.special);
      await resolveAction(comboTargets, "combo");
      await consumePostAction();
      return (inputLocked = false);
    }

    swap(a, b);
    const analysis = analyzeMatches();
    if (analysis.clear.length === 0) {
      swap(a, b);
      await playSwapAnimation(a, b);
      inputLocked = false;
      renderAll();
      return notify("Invalid swap: no match formed.", "warn");
    }

    consumeMove();
    await resolveAction(analysis.clear, "normal", analysis.spawnMap, b);
    await consumePostAction();
    inputLocked = false;
  }

  async function useTargetItem(item, idx) {
    if (getItemCount(item) <= 0) return;
    const targets = getItemTargets(item, idx);
    if (targets.length === 0) return notify("That item cannot be used there.", "warn");

    inputLocked = true;
    spendItemCharge(item);
    state.mode = { type: "normal", item: null };
    recordCodex("itemUse", item);

    await playItemCastAnimation(item, idx);
    await resolveAction(targets, item);
    await consumePostAction();
    inputLocked = false;
  }

  function getItemTargets(item, idx) {
    const r = rowOf(idx);
    const c = colOf(idx);

    if (item === "hammer") {
      const power = itemPower(item);
      if (power <= 1) return [idx];
      const arr = [idx];
      for (let rr = r - 1; rr <= r + 1; rr += 1) for (let cc = c - 1; cc <= c + 1; cc += 1) if (inside(rr, cc)) arr.push(rr * boardSize + cc);
      return [...new Set(arr)];
    }
    if (item === "row") {
      const rows = [r];
      if (itemPower(item) >= 2 && inside(r - 1, c)) rows.push(r - 1);
      if (itemPower(item) >= 3 && inside(r + 1, c)) rows.push(r + 1);
      return [...new Set(rows.flatMap((row) => indicesInRow(row)))];
    }
    if (item === "cross") {
      const arr = [...indicesInRow(r), ...indicesInCol(c)];
      if (itemPower(item) >= 3) {
        if (inside(r - 1, c)) arr.push(...indicesInRow(r - 1));
        if (inside(r + 1, c)) arr.push(...indicesInRow(r + 1));
      }
      return [...new Set(arr)];
    }
    if (item === "color") {
      const cell = state.board[idx];
      if (!isGem(cell)) return [];
      if (cell.lockedTurns > 0) return [];
      const targets = collectIndices((x) => isGem(x) && x.color === cell.color);
      if (itemPower(item) >= 3) {
        const bonusColor = nextGemColor(cell.color);
        targets.push(...collectIndices((x) => isGem(x) && x.color === bonusColor));
      }
      return [...new Set(targets)];
    }
    return [];
  }

  async function useShuffle() {
    const power = itemPower("shuffle");
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
    if (power >= 2) state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 10 + power * 2);
    if (power >= 3) {
      for (let i = 0; i < state.board.length; i += 1) if (isGem(state.board[i])) state.board[i].lockedTurns = 0;
    }
    renderAll();
    await consumePostAction();
    inputLocked = false;
    notify("Item used: Shuffle", "ok");
  }

  function applyLegendBossPressure() {
    if (state.perks.fever_smith) {
      state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 10);
    }
    if (!state.perks.boss_hunter) return;
    state.boss.charge = Math.max(0, state.boss.charge - 1);
  }

  async function useLegendSkill(skill) {
    if (skill === "screen_wipe") {
      await playSkillShowcase("Screen Pulse", "screen");
      const targets = collectIndices((x) => isGem(x) || (itemPower(skill) >= 2 && isObstacle(x)));
      recordCodex("skillUse", "screen_wipe");
      applyLegendBossPressure();
      meta.codex.maxSingleClear = Math.max(meta.codex.maxSingleClear, targets.length);
      saveMeta();
      await resolveAction(targets, "legend");
      await consumePostAction();
      inputLocked = false;
      return;
    }

    if (skill === "rainbow_burst") {
      await playSkillShowcase("Rainbow Burst", "rainbow");
      const first = randColor();
      let second = randColor();
      if (second === first) second = nextGemColor(first);
      const targets = collectIndices((x) => isGem(x) && (x.color === first || x.color === second));
      const extra = collectIndices((x) => isGem(x) && x.special).slice(0, itemPower(skill) >= 2 ? 16 : 10);
      const merged = [...new Set([...targets, ...extra])];
      recordCodex("skillUse", "rainbow_burst");
      applyLegendBossPressure();
      meta.codex.maxSingleClear = Math.max(meta.codex.maxSingleClear, merged.length);
      saveMeta();
      await resolveAction(merged, "legend");
      await consumePostAction();
      inputLocked = false;
      return;
    }

    if (skill === "time_freeze") {
      await playSkillShowcase("Time Freeze", "screen");
      state.movesLeft += 2 + itemPower(skill);
      state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 18 + itemPower(skill) * 4 + (state.perks.fever_smith ? 8 : 0));
      for (let i = 0; i < state.board.length; i += 1) {
        if (isGem(state.board[i])) state.board[i].lockedTurns = 0;
      }
      recordCodex("skillUse", "time_freeze");
      applyLegendBossPressure();
      notify(`Time Freeze grants +${2 + itemPower(skill)} moves and removes all locks.`, "ok");
      renderAll();
      await consumePostAction();
      inputLocked = false;
      return;
    }

    if (skill === "boss_breaker") {
      await playSkillShowcase("Boss Breaker", "rainbow");
      const targets = collectIndices((x) => isGem(x));
      shuffle(targets);
      const chosen = targets.slice(0, Math.min(12 + itemPower(skill) * 3, targets.length));
      state.boss.charge = Math.max(0, state.boss.charge - Math.ceil(state.boss.max * (0.45 + itemPower(skill) * 0.12)));
      state.boss.hint = "Boss Breaker: charge shattered";
      recordCodex("skillUse", "boss_breaker");
      applyLegendBossPressure();
      meta.codex.maxSingleClear = Math.max(meta.codex.maxSingleClear, chosen.length);
      saveMeta();
      await resolveAction(chosen, "legend");
      await consumePostAction();
      inputLocked = false;
      return;
    }

    inputLocked = false;
  }

  async function playSkillShowcase(name, theme = "screen") {
    const fx = document.createElement("div");
    fx.className = `skill-showcase ${theme}`;
    fx.textContent = name;
    fxLayerEl.appendChild(fx);

    spawnScreenPulse(theme === "screen" ? "skill-screen" : "skill-rainbow", 520);
    boardWrapEl.classList.add("boss-cast");
    shakeBoard(theme === "screen" ? 1.45 : 1.35);
    await sleep(120);

    for (let i = 0; i < 6; i += 1) {
      spawnShockwaveFX(Math.floor(Math.random() * boardSize * boardSize), true);
    }
    await sleep(320);

    fx.remove();
    boardWrapEl.classList.remove("boss-cast");
  }

  async function consumePostAction() {
    decayLocks();
    if (state.feverTurns > 0) state.feverTurns -= 1;
    await tickBoss();
    checkFloorState();
    renderAll();
    scanGuideDiscoveries();
  }

  function decayLocks() {
    for (let i = 0; i < state.board.length; i += 1) {
      const cell = state.board[i];
      if (isGem(cell) && cell.lockedTurns > 0) cell.lockedTurns -= 1;
    }
  }

  async function tickBoss() {
    if (state.gameOver || state.victory || state.boss.casting) return;
    const gain = Math.max(1, state.floorThreat.bossGain + (state.boss.elite ? 1 : 0) - (state.blessings.boss_shunt ? 1 : 0));
    state.boss.charge = Math.min(state.boss.max, state.boss.charge + gain);
    state.boss.phase = state.boss.charge >= state.boss.max ? "ready" : "charging";
    if (state.boss.charge < state.boss.max) return;

    state.boss.casting = true;
    state.boss.phase = "ready";
    state.boss.hint = "Boss skill fully charged!";
    notify("Boss is about to cast!", "warn");
    boardWrapEl.classList.add("boss-telegraph");
    renderAll();
    await sleep(360);

    const skillPool = state.floorTheme.id === "void_rift" ? BOSS_SKILLS : BOSS_SKILLS.filter((skill) => skill !== "rift_collapse");
    const skill = randomPick(skillPool);
    await castBossSkill(skill);

    boardWrapEl.classList.remove("boss-telegraph");
    state.boss.charge = 0;
    state.boss.phase = "charging";
    state.boss.casting = false;
  }

  async function castBossSkill(skill) {
    recordCodex("bossSeen", skill);
    boardWrapEl.classList.add("boss-cast");
    spawnScreenPulse("boss", 520);

    if (skill === "glass_storm") {
      const amount = state.boss.elite ? 14 : 9;
      placeGlass(amount);
      state.boss.hint = `Glass Storm: +${amount} glass`;
      notify("Boss casts Glass Storm!", "warn");
      spawnFloatText("Boss: Glass Storm", Math.floor((boardSize * boardSize) / 2));
      for (let i = 0; i < 8; i += 1) spawnShockwaveFX(Math.floor(Math.random() * boardSize * boardSize), true);
      shakeBoard(1.45);
      applyBossPressure(skill);
      renderAll();
      await sleep(220);
      boardWrapEl.classList.remove("boss-cast");
      return;
    }

    if (skill === "hex_lock") {
      const gems = collectIndices((x) => isGem(x) && x.lockedTurns <= 0);
      shuffle(gems);
      const lockCount = Math.min(gems.length, state.boss.elite ? 7 : 5);
      for (let i = 0; i < lockCount; i += 1) {
        state.board[gems[i]].lockedTurns = 2;
      }
      state.boss.hint = `Hex Lock: ${lockCount} tiles locked`;
      notify("Boss casts Hex Lock!", "warn");
      spawnFloatText("Boss: Hex Lock", Math.floor((boardSize * boardSize) / 2));
      shakeBoard(1.35);
      applyBossPressure(skill);
      renderAll();
      await sleep(180);
      boardWrapEl.classList.remove("boss-cast");
      return;
    }

    if (skill === "color_shift") {
      const from = randColor();
      let to = randColor();
      if (to === from) to = nextGemColor(from);
      const candidates = collectIndices((x) => isGem(x) && x.color === from && x.lockedTurns <= 0);
      shuffle(candidates);
      const cap = state.boss.elite ? 22 : 16;
      const count = Math.min(cap, candidates.length);
      for (let i = 0; i < count; i += 1) state.board[candidates[i]].color = to;
      state.boss.hint = "Color Shift: board recolored";
      notify("Boss casts Color Shift!", "warn");
      spawnFloatText("Boss: Color Shift", Math.floor((boardSize * boardSize) / 2));
      for (let i = 0; i < 5; i += 1) spawnShockwaveFX(Math.floor(Math.random() * boardSize * boardSize), true);
      shakeBoard(1.4);
      applyBossPressure(skill);
      renderAll();
      await sleep(200);
      boardWrapEl.classList.remove("boss-cast");
      return;
    }

    if (skill === "rift_collapse") {
      const gems = collectIndices((x) => isGem(x) && x.lockedTurns <= 0);
      shuffle(gems);
      const collapseCount = Math.min(gems.length, state.boss.elite ? 8 : 5);
      for (let i = 0; i < collapseCount; i += 1) {
        state.board[gems[i]] = { kind: "obstacle" };
      }
      placeLocks(state.boss.elite ? 5 : 3);
      state.boss.hint = `Rift Collapse: ${collapseCount} tiles corrupted`;
      notify("Boss casts Rift Collapse!", "warn");
      spawnFloatText("Boss: Rift Collapse", Math.floor((boardSize * boardSize) / 2));
      for (let i = 0; i < 6; i += 1) spawnShockwaveFX(Math.floor(Math.random() * boardSize * boardSize), true);
      shakeBoard(1.55);
      applyBossPressure("color_shift");
      renderAll();
      await sleep(240);
      boardWrapEl.classList.remove("boss-cast");
    }
  }

  function applyBossPressure(skill) {
    const pressure = state.floorThreat.pressure || 0;
    if (skill === "glass_storm") {
      const reduction = state.perks.pressure_valve ? 1 : 0;
      const loss = Math.max(0, 1 + Math.min(1, pressure) - reduction);
      state.movesLeft = Math.max(0, state.movesLeft - loss);
      if (loss > 0) spawnFloatText(`-${loss} Move`, Math.floor((boardSize * boardSize) / 2));
      return;
    }
    if (skill === "color_shift") {
      const reduction = state.perks.pressure_valve ? 1 : 0;
      const loss = Math.max(0, (state.boss.elite ? 2 : 1) + pressure - reduction);
      state.movesLeft = Math.max(0, state.movesLeft - loss);
      if (loss > 0) spawnFloatText(`-${loss} Move`, Math.floor((boardSize * boardSize) / 2));
    }
  }

  async function resolveAction(initialTargets, source, spawnMap = null, preferSpawnIndex = null) {
    let chain = 1;
    let current = [...new Set(initialTargets)];
    let localSpawnMap = spawnMap;

    while (current.length > 0) {
      const expandedInfo = expandWithSpecialTriggers(current, MAX_SKILL_CHAIN);
      const valid = expandedInfo.targets.filter((idx) => state.board[idx] !== null);
      if (valid.length === 0) break;

      if (expandedInfo.chainCount > 1) {
        spawnFloatText(`Chain Skill x${expandedInfo.chainCount}`, valid[0]);
      }

      clearAnim = new Set(valid);
      spawnShatterFX(valid);
      if (expandedInfo.chainCount > 1) shakeBoard(1.25);
      else shakeBoard(1);
      renderAll();
      await sleep(180);

      const gemTargets = valid.filter((i) => isGem(state.board[i]));
      const obstacles = valid.filter((i) => isObstacle(state.board[i])).length;

      let glassBroken = 0;
      for (const idx of valid) {
        const cell = state.board[idx];
        if (isGem(cell) && cell.glass) glassBroken += 1;
      }

      let gain = calcGain(gemTargets.length, obstacles, chain, source, expandedInfo.chainCount, glassBroken);
      if (source === "legend") gain = Math.floor(gain * 1.3);
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
          state.board[spawnIndex] = { kind: "gem", color: randColor(), special: localSpawnMap.get(spawnIndex), glass: false, lockedTurns: 0 };
          spawnShockwaveFX(spawnIndex, true);
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

      meta.codex.maxChain = Math.max(meta.codex.maxChain, chain);
      saveMeta();

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
      if (g.len >= 5) {
        spawnMap.set(g.indices[2], "rainbow");
      } else if (g.len === 4 && !spawnMap.has(g.indices[1])) {
        if (state.perks.prism_heart && Math.random() < 0.18) spawnMap.set(g.indices[1], "rainbow");
        else if (state.perks.combo_forge && Math.random() < 0.4) spawnMap.set(g.indices[1], "bomb");
        else spawnMap.set(g.indices[1], g.dir === "h" ? "line_h" : "line_v");
      }
    }

    return { clear: [...clearSet], spawnMap };
  }

  function findMatchGroups() {
    const groups = [];
    for (let r = 0; r < boardSize; r += 1) {
      let c = 0;
      while (c < boardSize) {
        const idx = r * boardSize + c;
        const cell = state.board[idx];
        if (!isGem(cell) || cell.special === "rainbow") { c += 1; continue; }
        let len = 1;
        while (c + len < boardSize && sameColor(idx, r * boardSize + c + len)) len += 1;
        if (len >= 3) groups.push({ dir: "h", len, indices: rangeIndices(r, c, len, "h") });
        c += len;
      }
    }

    for (let c = 0; c < boardSize; c += 1) {
      let r = 0;
      while (r < boardSize) {
        const idx = r * boardSize + c;
        const cell = state.board[idx];
        if (!isGem(cell) || cell.special === "rainbow") { r += 1; continue; }
        let len = 1;
        while (r + len < boardSize && sameColor(idx, (r + len) * boardSize + c)) len += 1;
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
    for (let k = 0; k < len; k += 1) arr.push(dir === "h" ? r * boardSize + (c + k) : (r + k) * boardSize + c);
    return arr;
  }

  function expandWithSpecialTriggers(indices, maxDepth) {
    const set = new Set(indices);
    const queue = indices.map((idx) => ({ idx, depth: 0 }));
    let chainCount = 1;

    while (queue.length > 0) {
      const { idx, depth } = queue.shift();
      const cell = state.board[idx];
      if (!isGem(cell) || !cell.special) continue;

      if (cell.special in meta.codex.specialTrigger) recordCodex("specialTrigger", cell.special);
      spawnShockwaveFX(idx, true);

      if (depth >= maxDepth) continue;

      const extra = specialTargets(idx, cell.special);
      let spawned = 0;
      for (const e of extra) {
        if (!set.has(e)) {
          set.add(e);
          queue.push({ idx: e, depth: depth + 1 });
          spawned += 1;
        }
      }
      if (spawned > 0) chainCount = Math.max(chainCount, depth + 2);
    }

    return { targets: [...set], chainCount: Math.min(chainCount, maxDepth + 1) };
  }

  function specialTargets(idx, special) {
    const r = rowOf(idx);
    const c = colOf(idx);
    if (special === "line_h") return indicesInRow(r);
    if (special === "line_v") return indicesInCol(c);
    if (special === "bomb") {
      const arr = [];
      for (let rr = r - 1; rr <= r + 1; rr += 1) for (let cc = c - 1; cc <= c + 1; cc += 1) if (inside(rr, cc)) arr.push(rr * boardSize + cc);
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

  function calcGain(gemCount, obstacleCount, chain, source, skillChainDepth = 1, glassBroken = 0) {
    let base = gemCount * 10 + obstacleCount * 14;
    let chainMul = 1 + (0.25 + state.chainBonus) * (chain - 1);

    if (state.taxColor != null) {
      const taxed = countColor(state.taxColor);
      base -= Math.floor(taxed * 2);
    }
    if (state.feverTurns > 0) chainMul += 0.5;

    if (source === "hammer") base += 8 + itemPower("hammer") * 4;
    if (source === "row") base += (state.feverTurns > 0 ? 26 : 18) + itemPower("row") * 5;
    if (source === "cross") base += (state.feverTurns > 0 ? 34 : 24) + itemPower("cross") * 6;
    if (source === "color") base += (state.feverTurns > 0 ? 40 : 28) + itemPower("color") * 6;
    if (source === "combo") base += 45;

    if (skillChainDepth > 1) base += skillChainDepth * 12;
    if (state.perks.blast_core && (source !== "normal" || skillChainDepth > 1)) base = Math.floor(base * 1.22);
    if (state.perks.glass_breaker && glassBroken > 0) base += glassBroken * 10;
    if (state.perks.score_bloom && gemCount > 0) base += gemCount * 5;
    if (state.perks.prism_heart && source === "normal") base += Math.floor(gemCount * 1.5);

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
      state.feverTurns = (state.perks.fever_loop ? 4 : 3) + (state.blessings.fever_engine ? 1 : 0);
      spawnFloatText("FEVER!", Math.floor((boardSize * boardSize) / 2));
      notify("FEVER started: score and drops are boosted!", "ok");
    }
  }

  function maybeDropItem(chain) {
    if (chain < 2) return;
    let chance = 0.16 - (state.floor - 1) * 0.012 + state.dropBoost;
    if (state.feverTurns > 0) chance += 0.1;
    if (state.perks.relic_magnet) chance += 0.1;
    chance = Math.max(0.08, Math.min(0.5, chance));
    if (Math.random() >= chance) return;

    const carried = getCarriedItems();
    const pool = carried.length >= MAX_ITEM_TYPES ? [...carried] : ITEM_ORDER.filter((id) => ITEM_DEFS[id].rarity !== "legendary");
    if (state.perks.arcane_stockpile && Math.random() < 0.35) pool.push("screen_wipe", "rainbow_burst", "time_freeze", "boss_breaker");
    const weighted = [];
    for (const id of pool) {
      const weight = hasItemType(id) ? 2 + getItemLevel(id) : 1;
      for (let i = 0; i < weight; i += 1) weighted.push(id);
    }
    const picked = randomPick(weighted);
    if (!addItemCharges(picked, 1, itemSlotAvailable())) return;
    spawnFloatText(`+${ITEM_DEFS[picked].name}`, Math.floor(Math.random() * boardSize * boardSize));
  }

  function breakAdjacentObstacles(gemIndices) {
    const broken = new Set();
    for (const idx of gemIndices) {
      const r = rowOf(idx);
      const c = colOf(idx);
      const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
      for (const [nr, nc] of neighbors) {
        if (!inside(nr, nc)) continue;
        const ni = nr * boardSize + nc;
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
    if ([3, 6, 9].includes(state.floor)) return showChapterBlessings();
    if (EVENT_NODE_FLOORS.includes(state.floor)) return showEventNode();
    showRewardChoices();
  }

  function showChapterBlessings() {
    overlayTitleEl.textContent = `Chapter Blessing · ${state.floorTheme.title}`;
    overlayDescEl.textContent = "Choose one powerful blessing to shape the rest of your run.";
    choiceWrapEl.innerHTML = "";
    overlayActionsEl.innerHTML = "";

    const missing = Object.entries(BLESSING_DEFS).filter(([id]) => !state.blessings[id]);
    shuffle(missing);
    const picks = missing.slice(0, 3);

    for (const [, def] of picks) {
      const btn = document.createElement("button");
      btn.className = `choice rarity-${def.rarity}`;
      btn.innerHTML = `<span class="choice-rarity">Blessing</span><strong>${def.title}</strong><small>${def.desc}</small>`;
      btn.addEventListener("click", () => {
        def.apply(state);
        overlayEl.classList.add("hidden");
        notify(`Blessing acquired: ${def.title}`, "ok");
        renderAll();
        startFloor(state.floor + 1);
      });
      choiceWrapEl.appendChild(btn);
    }

    overlayEl.classList.remove("hidden");
  }

  function onVictory() {
    state.victory = true;
    updateMeta();
    renderAll();
    overlayTitleEl.textContent = "Victory!";
    overlayDescEl.textContent = `You cleared all ${TOTAL_FLOORS} floors across ${CHAPTER_THEMES.length} chapters with a final score of ${state.score}.`;
    choiceWrapEl.innerHTML = "";
    overlayActionsEl.innerHTML = `<button type="button" class="btn danger overlay-btn" data-action="restart-run">Start New Run</button>`;
    bindOverlayActions();
    overlayEl.classList.remove("hidden");
  }

  function onDefeat() {
    state.gameOver = true;
    updateMeta();
    renderAll();
    overlayTitleEl.textContent = "Run Failed";
    overlayDescEl.textContent = `Floor ${state.floor} ended below the target score. Final score: ${state.score}.`;
    choiceWrapEl.innerHTML = "";
    overlayActionsEl.innerHTML = `<button type="button" class="btn danger overlay-btn" data-action="restart-run">Restart Now</button>`;
    bindOverlayActions();
    overlayEl.classList.remove("hidden");
  }

  function showEventNode() {
    overlayTitleEl.textContent = `Event Node · ${state.floorTheme.title}`;
    overlayDescEl.textContent = `Choose one route to shape the next floor in ${state.floorTheme.shortLabel}.`;
    choiceWrapEl.innerHTML = "";
    overlayActionsEl.innerHTML = "";

    const events = buildEventChoices();

    for (const ev of events) {
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.innerHTML = `<strong>${ev.title}</strong><small>${ev.desc}</small>`;
      btn.addEventListener("click", () => {
        ev.apply();
        overlayEl.classList.add("hidden");
        startFloor(state.floor + 1);
      });
      choiceWrapEl.appendChild(btn);
    }

    overlayEl.classList.remove("hidden");
  }

  function buildEventChoices() {
    const commonEvents = [
      {
        title: "Cursed Pact",
        desc: "The next two floors are harsher, but chain rewards and drops increase and you gain +1 Cross Burst.",
        apply: () => {
          state.eventCurseFloors = 2;
          addItemCharges("cross", 1, true);
          notify("You signed the Cursed Pact.", "warn");
        },
      },
      {
        title: "Repair Forge",
        desc: "Gain +2 moves next floor and reset the boss charge.",
        apply: () => {
          state.nextFloorMoveBonus += 2;
          state.boss.charge = 0;
          notify("The forge stabilizes the next floor.", "ok");
        },
      },
      {
        title: "Greed Altar",
        desc: "Gain +180 score now, but lose 2 moves next floor.",
        apply: () => {
          state.score += 180;
          state.floorScore += 40;
          state.nextFloorMovePenalty += 2;
          notify("Greed Altar activated: high reward, high pressure.", "warn");
        },
      },
      {
        title: "Tactical Map",
        desc: "Scout the next floor to gain +3 moves and +20 momentum.",
        apply: () => {
          state.nextFloorMoveBonus += 3;
          state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 20);
          notify("You charted a safer route.", "ok");
        },
      },
    ];

    const chapterEvents = {
      crystal_mines: [
        {
          title: "Prospector Cache",
          desc: "Open an old mine crate to gain +1 Hammer and +1 Row Sweep.",
          apply: () => {
            addItemCharges("hammer", 1, true);
            addItemCharges("row", 1, true);
            notify("Prospector tools added to your kit.", "ok");
          },
        },
      ],
      frozen_archive: [
        {
          title: "Frozen Lantern",
          desc: "Stabilize the archive: remove all current locks and gain +25 momentum.",
          apply: () => {
            for (let i = 0; i < state.board.length; i += 1) if (isGem(state.board[i])) state.board[i].lockedTurns = 0;
            state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 25);
            notify("The lantern calms the frozen archive.", "ok");
          },
        },
      ],
      storm_forge: [
        {
          title: "Forge Overdrive",
          desc: "Gain +1 Color Bomb and boost the next cursed floor payoff.",
          apply: () => {
            addItemCharges("color", 1, true);
            state.eventCurseFloors = Math.max(state.eventCurseFloors, 1);
            notify("The forge roars to life.", "warn");
          },
        },
      ],
      void_rift: [
        {
          title: "Void Bargain",
          desc: "Gain +240 score and +1 Rainbow Burst, but suffer -1 move next floor.",
          apply: () => {
            state.score += 240;
            state.floorScore += 60;
            state.nextFloorMovePenalty += 1;
            addItemCharges("rainbow_burst", 1, true);
            notify("The rift grants power at a cost.", "warn");
          },
        },
      ],
    };

    const pool = [...commonEvents, ...(chapterEvents[state.floorTheme.id] || [])];
    shuffle(pool);
    return pool.slice(0, 3);
  }

  function showRewardChoices() {
    const choices = buildRewardChoices();
    overlayTitleEl.textContent = `Floor ${state.floor} Cleared`;
    overlayDescEl.textContent = "Choose one reward: item, system boost, or build perk.";
    choiceWrapEl.innerHTML = "";
    overlayActionsEl.innerHTML = "";

    for (const reward of choices) {
      const btn = document.createElement("button");
      btn.className = `choice rarity-${reward.rarity || "common"}`;
      btn.innerHTML = `<span class="choice-rarity">${RARITY_LABELS[reward.rarity] || "Common"}</span><strong>${reward.title}</strong><small>${reward.desc}</small>`;
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
    const result = [];
    const perkReward = buildPerkReward();
    if (perkReward) result.push(perkReward);

    const itemRewards = buildItemRewards();
    const supportRewards = buildSupportRewards();
    const combined = [...itemRewards, ...supportRewards];
    shuffle(combined);

    for (const reward of combined) {
      if (result.length >= 3) break;
      if (!result.some((x) => x.title === reward.title)) result.push(reward);
    }
    return result.slice(0, 3);
  }

  function buildPerkReward() {
    const missing = Object.entries(PERK_DEFS).filter(([k]) => !state.perks[k]);
    if (missing.length === 0) return null;
    const weighted = [];
    for (const [id, def] of missing) {
      const weight = def.rarity === "legendary" ? 1 : def.rarity === "epic" ? 2 : def.rarity === "rare" ? 3 : 4;
      for (let i = 0; i < weight; i += 1) weighted.push([id, def]);
    }
    const [id, def] = randomPick(weighted);
    return {
      type: "perk",
      rarity: def.rarity,
      title: `${RARITY_LABELS[def.rarity]} Skill: ${def.title}`,
      desc: def.desc,
      apply: () => def.apply(state),
    };
  }

  function buildItemRewards() {
    const rewards = [];
    const carried = getCarriedItems();
    const newCandidates = ITEM_ORDER.filter((id) => !hasItemType(id));

    if (carried.length < MAX_ITEM_TYPES && newCandidates.length > 0) {
      const preferred = newCandidates.filter((id) => ITEM_DEFS[id].rarity !== "legendary");
      const candidate = randomPick(preferred.length > 0 ? preferred : newCandidates);
      rewards.push(createNewItemReward(candidate));
    }

    const upgradePool = [];
    for (const id of carried) {
      const weight = 2 + getItemLevel(id) * 2 + (getItemCount(id) === 0 ? 1 : 0);
      for (let i = 0; i < weight; i += 1) upgradePool.push(id);
    }
    while (upgradePool.length > 0 && rewards.length < 2) {
      const id = randomPick(upgradePool);
      rewards.push(createUpgradeReward(id));
      for (let i = upgradePool.length - 1; i >= 0; i -= 1) if (upgradePool[i] === id) upgradePool.splice(i, 1);
    }

    return rewards;
  }

  function buildSupportRewards() {
    return [
      { type: "support", rarity: "common", title: "Extra Moves +2", desc: "Reduce next-floor pressure", apply: () => (state.nextFloorMoveBonus += 2) },
      { type: "support", rarity: "common", title: "Momentum Surge", desc: "+40 momentum", apply: () => (state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 40)) },
      { type: "support", rarity: "rare", title: "Field Repair", desc: "Restore 2 random item charges across carried gear", apply: restoreRandomCharges },
      { type: "support", rarity: "common", title: "Vault Refill", desc: "Restore 1 charge to every carried item", apply: refillCarriedCharges },
      { type: "support", rarity: "rare", title: "Forge Tune-Up", desc: "Upgrade a random carried item by 1 level and gain 1 charge", apply: upgradeRandomCarriedItem },
      { type: "support", rarity: "rare", title: "Boss Suppressant", desc: "Start the next floor with +2 moves and a fully reset boss gauge", apply: () => { state.nextFloorMoveBonus += 2; state.boss.charge = 0; } },
      { type: "support", rarity: "epic", title: "Fever Battery", desc: "Gain +70 momentum to prime your next power spike", apply: () => (state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 70)) },
      { type: "support", rarity: "epic", title: "Rift Cache", desc: "Gain +1 random epic-or-higher item charge", apply: grantHighTierCharge },
    ];
  }

  function createNewItemReward(id) {
    const bonus = state.perks.vault_expander ? 2 : 1;
    return {
      type: "item",
      rarity: ITEM_DEFS[id].rarity,
      title: `New Item: ${ITEM_DEFS[id].name}`,
      desc: `Add ${ITEM_DEFS[id].name} to your loadout with ${bonus} charge${bonus > 1 ? "s" : ""}.`,
      apply: () => addItemCharges(id, bonus, true),
    };
  }

  function createUpgradeReward(id) {
    const charges = ITEM_DEFS[id].rarity === "legendary" ? 1 : 2;
    return {
      type: "item",
      rarity: ITEM_DEFS[id].rarity,
      title: `Upgrade ${ITEM_DEFS[id].name}`,
      desc: `Raise ${ITEM_DEFS[id].name} to Lv.${getItemLevel(id) + 1} and gain +${charges} charge${charges > 1 ? "s" : ""}.`,
      apply: () => upgradeItem(id, 1, charges),
    };
  }

  function restoreRandomCharges() {
    const carried = getCarriedItems();
    if (carried.length === 0) return;
    const bag = [];
    for (const id of carried) {
      for (let i = 0; i < Math.max(1, getItemLevel(id)); i += 1) bag.push(id);
    }
    for (let i = 0; i < 2; i += 1) addItemCharges(randomPick(bag), 1, false);
  }

  function refillCarriedCharges() {
    for (const id of getCarriedItems()) addItemCharges(id, 1, false);
  }

  function upgradeRandomCarriedItem() {
    const carried = getCarriedItems();
    if (carried.length === 0) return;
    const id = randomPick(carried);
    upgradeItem(id, 1, 1);
  }

  function grantHighTierCharge() {
    const carried = getCarriedItems().filter((id) => ["epic", "legendary"].includes(ITEM_DEFS[id].rarity));
    const fallback = getCarriedItems();
    const pool = carried.length > 0 ? carried : fallback;
    if (pool.length === 0) return;
    addItemCharges(randomPick(pool), 1, false);
  }

  function consumeMove() {
    state.movesLeft = Math.max(0, state.movesLeft - 1);
  }

  async function playSwapAnimation(a, b) {
    await runSwapAnimation(boardEl, a, b, sleep);
  }

  async function playItemCastAnimation(item, idx) {
    await runItemCastAnimation({ itemWrapEl, boardEl, item, idx, imageSrc: getAnimatedItemImage(item), itemName: ITEM_DEFS[item].name, sleep });
  }

  function spawnShatterFX(indices) {
    runShatterFX({ indices, boardEl, state, isGem, fxLayerEl, MAX_ACTIVE_SHARDS, activeShards, setActiveShards: (value) => { activeShards = value; } });
  }

  function spawnShockwaveFX(index, strong = false) {
    runShockwaveFX({ boardEl, fxLayerEl, index, strong });
  }

  function spawnFloatText(text, index) {
    runFloatText({ boardEl, fxLayerEl, text, index });
  }

  function spawnScreenPulse(theme = "boss", duration = 420) {
    runScreenPulse({ fxLayerEl, theme, duration });
  }

  function shakeBoard(power = 1) {
    runShakeBoard(boardWrapEl, power);
  }

  function updateMeta() {
    meta.bestFloor = Math.max(meta.bestFloor, state.floor);
    meta.bestScore = Math.max(meta.bestScore, state.score);
    saveMeta();
  }

  function createBoard() {
    return createBoardState(boardSize, randColor);
  }

  function resolveAutoBoard() {
    resolveAutoBoardState(state, findMatchGroups, isGem, randColor);
  }

  function collapseBoard() {
    return collapseBoardState(state, boardSize, isGem);
  }

  function refillBoard() {
    return refillBoardState(state, randColor);
  }

  function isAdjacent(a, b) {
    return checkIsAdjacent(boardSize, a, b);
  }

  function rowOf(i) { return getRowOf(boardSize, i); }
  function colOf(i) { return getColOf(boardSize, i); }
  function inside(r, c) { return isInside(boardSize, r, c); }
  function indicesInRow(r) { return getIndicesInRow(boardSize, r); }
  function indicesInCol(c) { return getIndicesInCol(boardSize, c); }

  function swap(a, b) {
    swapBoardCells(state, a, b);
  }

  function randColor() { return randomPick(state.activeGemColors || GEM_POOL_BY_FLOOR[0]); }
  function randomPick(arr) { return pickRandom(arr); }

  function shuffle(arr) {
    shuffleArray(arr);
  }

  function sleep(ms) { return wait(ms); }
  function isGem(c) { return checkIsGem(c); }
  function isObstacle(c) { return checkIsObstacle(c); }

  function renderAll() {
    renderHUD();
    renderItems();
    renderPerks();
    renderGuideList();
    renderBoard();
    boardEl.style.setProperty("--board-size", String(boardSize));
  }

  function renderHUD() {
    floorEl.textContent = `${state.floor}/${TOTAL_FLOORS}`;
    if (boardTargetScoreEl) boardTargetScoreEl.textContent = String(state.targetScore);
    movesLeftEl.textContent = String(state.movesLeft);
    floorScoreEl.textContent = String(state.floorScore);
    if (boardFloorScoreEl) boardFloorScoreEl.textContent = String(state.floorScore);
    scoreEl.textContent = String(state.score);
    bestFloorEl.textContent = String(meta.bestFloor);
    bestScoreEl.textContent = String(meta.bestScore);

    momentumBarEl.style.width = `${(state.momentum / MOMENTUM_MAX) * 100}%`;
    feverTurnsEl.textContent = `Fever ${state.feverTurns}`;

    const bossPct = Math.max(0, Math.min(100, (state.boss.charge / state.boss.max) * 100));
    if (bossBarEl) bossBarEl.style.width = `${bossPct}%`;
    if (bossSkillHintEl) bossSkillHintEl.textContent = state.boss.hint;
    if (bossTitleEl) bossTitleEl.textContent = state.boss.elite ? state.floorTheme.eliteBossName : state.floorTheme.bossName;
    if (bossStateEl) bossStateEl.textContent = state.boss.casting ? `Casting in ${state.floorTheme.shortLabel}` : state.boss.phase === "ready" ? "Primed to strike on the next beat" : `Charging through ${state.floorTheme.title}`;
    if (bossThreatEl) bossThreatEl.textContent = getBossThreatLabel();
    if (bossPatternEl) bossPatternEl.textContent = state.boss.elite ? `${state.floorTheme.pattern} / Elite pressure` : state.floorTheme.pattern;
    if (modifierEl) modifierEl.textContent = state.modifier ? `${state.floorTheme.shortLabel} · ${state.modifier.name} · ${state.activeGemColors.length}C` : `${state.floorTheme.shortLabel} · ${state.activeGemColors.length}C`;
    if (bossMeterEl) {
      bossMeterEl.classList.remove("charging", "ready", "casting");
      if (state.boss.casting) bossMeterEl.classList.add("casting");
      else if (state.boss.phase === "ready") bossMeterEl.classList.add("ready");
      else bossMeterEl.classList.add("charging");
    }

    if (state.mode.type === "normal") modeTextEl.textContent = "Mode: Standard swap";
    if (state.mode.type === "target_item") modeTextEl.textContent = `Mode: Target item (${ITEM_DEFS[state.mode.item].name})`;
  }

  function getBossThreatLabel() {
    if (state.boss.casting) return "Cataclysmic";
    const pct = state.boss.charge / state.boss.max;
    if (pct >= 0.95) return "Critical";
    if (pct >= 0.7) return "Severe";
    if (pct >= 0.4) return "Rising";
    return "Low";
  }

  function renderItems() {
    renderItemsView({
      itemWrapEl,
      getCarriedItems,
      state,
      getItemCount,
      getItemLevel,
      ITEM_DEFS,
      getAnimatedItemImage,
      MAX_ITEM_TYPES,
      UI_IMAGES,
    });
  }

  function renderPerks() {
    renderPerksView({ perkWrapEl, state, PERK_DEFS, BLESSING_DEFS, RARITY_LABELS });
  }

  function renderBoard() {
    renderBoardView({
      boardEl,
      state,
      selected,
      isObstacle,
      isGem,
      clearAnim,
      fallAnim,
      getAnimatedGemImage,
    });
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
