(() => {
  const MIN_BOARD_SIZE = 6;
  const MAX_BOARD_SIZE = 15;
  const BOARD_SIZE_BY_FLOOR = [6, 8, 10, 11, 13, 14, 15];
  const COLORS = 6;
  const TOTAL_FLOORS = 7;
  const META_KEY = "rogue_match3_meta_v5";
  const MOMENTUM_MAX = 100;
  const MAX_SKILL_CHAIN = 2;
  const MAX_ACTIVE_SHARDS = 260;

  const FLOOR_CONFIG = [
    { target: 420, moves: 17, obstacles: 0 },
    { target: 580, moves: 17, obstacles: 0 },
    { target: 820, moves: 16, obstacles: 1 },
    { target: 1080, moves: 16, obstacles: 2 },
    { target: 1380, moves: 15, obstacles: 3 },
    { target: 1720, moves: 15, obstacles: 4 },
    { target: 2100, moves: 14, obstacles: 5 },
  ];

  const FLOOR_DIFFICULTY = [
    { label: "Warm-Up", targetMul: 1, movesDelta: 0, obstacleBonus: 0, glassBonus: 0, bossGain: 1, bossMaxDelta: 0, pressure: 0 },
    { label: "Pressure", targetMul: 1.08, movesDelta: 0, obstacleBonus: 1, glassBonus: 0, bossGain: 1, bossMaxDelta: -1, pressure: 0 },
    { label: "Danger", targetMul: 1.2, movesDelta: -1, obstacleBonus: 1, glassBonus: 1, bossGain: 2, bossMaxDelta: -1, pressure: 1 },
    { label: "High Risk", targetMul: 1.33, movesDelta: -1, obstacleBonus: 2, glassBonus: 1, bossGain: 2, bossMaxDelta: -1, pressure: 1 },
    { label: "Nightmare", targetMul: 1.48, movesDelta: -2, obstacleBonus: 2, glassBonus: 2, bossGain: 2, bossMaxDelta: -2, pressure: 2 },
    { label: "Inferno", targetMul: 1.64, movesDelta: -2, obstacleBonus: 3, glassBonus: 2, bossGain: 3, bossMaxDelta: -2, pressure: 2 },
    { label: "Final Stand", targetMul: 1.85, movesDelta: -3, obstacleBonus: 4, glassBonus: 3, bossGain: 3, bossMaxDelta: -2, pressure: 3 },
  ];

  const MAX_ITEM_TYPES = 5;
  const UI_IMAGES = {
    obstacle: "./assets/generated/ui/tile_obstacle_obsidian.png",
    emptySlot: "./assets/generated/ui/icon_empty_slot_relic.png",
  };

  const ITEM_DEFS = {
    hammer: { name: "Hammer", image: "./assets/generated/items/item_hammer.png", desc: "Break a single tile", target: true, rarity: "common" },
    row: { name: "Row Sweep", image: "./assets/generated/items/item_row_sweep.png", desc: "Clear one full row", target: true, rarity: "common" },
    cross: { name: "Cross Burst", image: "./assets/generated/items/item_cross_burst.png", desc: "Clear row and column", target: true, rarity: "rare" },
    color: { name: "Color Bomb", image: "./assets/generated/items/item_color_bomb.png", desc: "Clear the chosen color", target: true, rarity: "rare" },
    shuffle: { name: "Shuffle", image: "./assets/generated/items/item_shuffle.png", desc: "Re-roll the board", target: false, rarity: "common" },
    screen_wipe: { name: "Screen Pulse", image: "./assets/generated/items/item_screen_pulse.png", desc: "Instantly clear every gem", target: false, rarity: "epic" },
    rainbow_burst: { name: "Rainbow Burst", image: "./assets/generated/items/item_rainbow_burst.png", desc: "Clear two random colors and trigger specials", target: false, rarity: "epic" },
    time_freeze: { name: "Time Freeze", image: "./assets/generated/items/item_time_freeze.png", desc: "Gain moves, unlock gems, and stabilize momentum", target: false, rarity: "epic" },
    boss_breaker: { name: "Boss Breaker", image: "./assets/generated/items/item_boss_breaker.png", desc: "Smash charge and shatter a wide section of the board", target: false, rarity: "legendary" },
  };

  const ITEM_ANIM_FRAMES = {
    hammer: ["./assets/generated/items/anim/item_hammer_f1.png", "./assets/generated/items/anim/item_hammer_f2.png", "./assets/generated/items/anim/item_hammer_f3.png", "./assets/generated/items/anim/item_hammer_f4.png", "./assets/generated/items/anim/item_hammer_f5.png", "./assets/generated/items/anim/item_hammer_f6.png", "./assets/generated/items/anim/item_hammer_f7.png", "./assets/generated/items/anim/item_hammer_f8.png"],
    row: ["./assets/generated/items/anim/item_row_sweep_f1.png", "./assets/generated/items/anim/item_row_sweep_f2.png", "./assets/generated/items/anim/item_row_sweep_f3.png", "./assets/generated/items/anim/item_row_sweep_f4.png", "./assets/generated/items/anim/item_row_sweep_f5.png", "./assets/generated/items/anim/item_row_sweep_f6.png", "./assets/generated/items/anim/item_row_sweep_f7.png", "./assets/generated/items/anim/item_row_sweep_f8.png"],
    cross: ["./assets/generated/items/anim/item_cross_burst_f1.png", "./assets/generated/items/anim/item_cross_burst_f2.png", "./assets/generated/items/anim/item_cross_burst_f3.png", "./assets/generated/items/anim/item_cross_burst_f4.png", "./assets/generated/items/anim/item_cross_burst_f5.png", "./assets/generated/items/anim/item_cross_burst_f6.png", "./assets/generated/items/anim/item_cross_burst_f7.png", "./assets/generated/items/anim/item_cross_burst_f8.png"],
    color: ["./assets/generated/items/anim/item_color_bomb_f1.png", "./assets/generated/items/anim/item_color_bomb_f2.png", "./assets/generated/items/anim/item_color_bomb_f3.png", "./assets/generated/items/anim/item_color_bomb_f4.png", "./assets/generated/items/anim/item_color_bomb_f5.png", "./assets/generated/items/anim/item_color_bomb_f6.png", "./assets/generated/items/anim/item_color_bomb_f7.png", "./assets/generated/items/anim/item_color_bomb_f8.png"],
    shuffle: ["./assets/generated/items/anim/item_shuffle_f1.png", "./assets/generated/items/anim/item_shuffle_f2.png", "./assets/generated/items/anim/item_shuffle_f3.png", "./assets/generated/items/anim/item_shuffle_f4.png", "./assets/generated/items/anim/item_shuffle_f5.png", "./assets/generated/items/anim/item_shuffle_f6.png", "./assets/generated/items/anim/item_shuffle_f7.png", "./assets/generated/items/anim/item_shuffle_f8.png"],
    screen_wipe: ["./assets/generated/items/anim/item_screen_pulse_f1.png", "./assets/generated/items/anim/item_screen_pulse_f2.png", "./assets/generated/items/anim/item_screen_pulse_f3.png", "./assets/generated/items/anim/item_screen_pulse_f4.png", "./assets/generated/items/anim/item_screen_pulse_f5.png", "./assets/generated/items/anim/item_screen_pulse_f6.png", "./assets/generated/items/anim/item_screen_pulse_f7.png", "./assets/generated/items/anim/item_screen_pulse_f8.png"],
    rainbow_burst: ["./assets/generated/items/anim/item_rainbow_burst_f1.png", "./assets/generated/items/anim/item_rainbow_burst_f2.png", "./assets/generated/items/anim/item_rainbow_burst_f3.png", "./assets/generated/items/anim/item_rainbow_burst_f4.png", "./assets/generated/items/anim/item_rainbow_burst_f5.png", "./assets/generated/items/anim/item_rainbow_burst_f6.png", "./assets/generated/items/anim/item_rainbow_burst_f7.png", "./assets/generated/items/anim/item_rainbow_burst_f8.png"],
    time_freeze: ["./assets/generated/items/anim/item_time_freeze_f1.png", "./assets/generated/items/anim/item_time_freeze_f2.png", "./assets/generated/items/anim/item_time_freeze_f3.png", "./assets/generated/items/anim/item_time_freeze_f4.png", "./assets/generated/items/anim/item_time_freeze_f5.png", "./assets/generated/items/anim/item_time_freeze_f6.png", "./assets/generated/items/anim/item_time_freeze_f7.png", "./assets/generated/items/anim/item_time_freeze_f8.png"],
    boss_breaker: ["./assets/generated/items/anim/item_boss_breaker_f1.png", "./assets/generated/items/anim/item_boss_breaker_f2.png", "./assets/generated/items/anim/item_boss_breaker_f3.png", "./assets/generated/items/anim/item_boss_breaker_f4.png", "./assets/generated/items/anim/item_boss_breaker_f5.png", "./assets/generated/items/anim/item_boss_breaker_f6.png", "./assets/generated/items/anim/item_boss_breaker_f7.png", "./assets/generated/items/anim/item_boss_breaker_f8.png"],
  };

  const ITEM_ORDER = ["hammer", "row", "cross", "color", "shuffle", "screen_wipe", "rainbow_burst", "time_freeze", "boss_breaker"];
  const ITEM_BASE_COUNTS = { hammer: 2, shuffle: 1 };
  const ITEM_BASE_LEVEL = 1;
  const RARITY_LABELS = { common: "Common", rare: "Rare", epic: "Epic", legendary: "Legendary" };

  const GUIDE_DEFS = {
    gem_basic: { title: "Element Gem", desc: "Match 3 or more gems of the same color to score and charge momentum.", preview: { kind: "gem", color: 0 } },
    obstacle: { title: "Obstacle Block", desc: "Cannot be swapped. Clear adjacent gems or use items to break it.", preview: { kind: "obstacle" } },
    glass: { title: "Glass Layer", desc: "The first clear removes the glass, the second clear removes the gem itself.", preview: { kind: "gem", color: 1, glass: true } },
    locked: { title: "Locked Gem", desc: "Locked gems stay in place and cannot be swapped until the lock expires.", preview: { kind: "gem", color: 2, locked: true } },
    line_h: { title: "Row Gem", desc: "Clears a full horizontal lane when triggered.", preview: { kind: "gem", color: 3, special: "line_h" } },
    line_v: { title: "Column Gem", desc: "Clears a full vertical lane when triggered.", preview: { kind: "gem", color: 3, special: "line_v" } },
    bomb: { title: "Bomb Gem", desc: "Explodes the surrounding 3x3 area.", preview: { kind: "gem", color: 5, special: "bomb" } },
    rainbow: { title: "Rainbow Gem", desc: "Detonates every gem of the chosen color when activated.", preview: { kind: "gem", color: 4, special: "rainbow" } },
  };

  const GEM_IMAGE_BY_COLOR = {
    0: "./assets/generated/gems/gem_fire.png",
    1: "./assets/generated/gems/gem_water.png",
    2: "./assets/generated/gems/gem_nature.png",
    3: "./assets/generated/gems/gem_lightning.png",
    4: "./assets/generated/gems/gem_arcane.png",
    5: "./assets/generated/gems/gem_alchemy.png",
  };

  const GEM_ANIM_FRAMES = {
    0: ["./assets/generated/gems/anim/gem_fire_f1.png", "./assets/generated/gems/anim/gem_fire_f2.png", "./assets/generated/gems/anim/gem_fire_f3.png", "./assets/generated/gems/anim/gem_fire_f4.png", "./assets/generated/gems/anim/gem_fire_f5.png", "./assets/generated/gems/anim/gem_fire_f6.png", "./assets/generated/gems/anim/gem_fire_f7.png", "./assets/generated/gems/anim/gem_fire_f8.png"],
    1: ["./assets/generated/gems/anim/gem_water_f1.png", "./assets/generated/gems/anim/gem_water_f2.png", "./assets/generated/gems/anim/gem_water_f3.png", "./assets/generated/gems/anim/gem_water_f4.png", "./assets/generated/gems/anim/gem_water_f5.png", "./assets/generated/gems/anim/gem_water_f6.png", "./assets/generated/gems/anim/gem_water_f7.png", "./assets/generated/gems/anim/gem_water_f8.png"],
    2: ["./assets/generated/gems/anim/gem_nature_f1.png", "./assets/generated/gems/anim/gem_nature_f2.png", "./assets/generated/gems/anim/gem_nature_f3.png", "./assets/generated/gems/anim/gem_nature_f4.png", "./assets/generated/gems/anim/gem_nature_f5.png", "./assets/generated/gems/anim/gem_nature_f6.png", "./assets/generated/gems/anim/gem_nature_f7.png", "./assets/generated/gems/anim/gem_nature_f8.png"],
    3: ["./assets/generated/gems/anim/gem_lightning_f1.png", "./assets/generated/gems/anim/gem_lightning_f2.png", "./assets/generated/gems/anim/gem_lightning_f3.png", "./assets/generated/gems/anim/gem_lightning_f4.png", "./assets/generated/gems/anim/gem_lightning_f5.png", "./assets/generated/gems/anim/gem_lightning_f6.png", "./assets/generated/gems/anim/gem_lightning_f7.png", "./assets/generated/gems/anim/gem_lightning_f8.png"],
    4: ["./assets/generated/gems/anim/gem_arcane_f1.png", "./assets/generated/gems/anim/gem_arcane_f2.png", "./assets/generated/gems/anim/gem_arcane_f3.png", "./assets/generated/gems/anim/gem_arcane_f4.png", "./assets/generated/gems/anim/gem_arcane_f5.png", "./assets/generated/gems/anim/gem_arcane_f6.png", "./assets/generated/gems/anim/gem_arcane_f7.png", "./assets/generated/gems/anim/gem_arcane_f8.png"],
    5: ["./assets/generated/gems/anim/gem_alchemy_f1.png", "./assets/generated/gems/anim/gem_alchemy_f2.png", "./assets/generated/gems/anim/gem_alchemy_f3.png", "./assets/generated/gems/anim/gem_alchemy_f4.png", "./assets/generated/gems/anim/gem_alchemy_f5.png", "./assets/generated/gems/anim/gem_alchemy_f6.png", "./assets/generated/gems/anim/gem_alchemy_f7.png", "./assets/generated/gems/anim/gem_alchemy_f8.png"],
  };

  const BOSS_ANIM_FRAMES = ["./assets/generated/boss/anim/boss_sigil_f1.png", "./assets/generated/boss/anim/boss_sigil_f2.png", "./assets/generated/boss/anim/boss_sigil_f3.png", "./assets/generated/boss/anim/boss_sigil_f4.png", "./assets/generated/boss/anim/boss_sigil_f5.png", "./assets/generated/boss/anim/boss_sigil_f6.png", "./assets/generated/boss/anim/boss_sigil_f7.png", "./assets/generated/boss/anim/boss_sigil_f8.png"];

  const MODIFIERS = [
    { id: "glass", name: "Glass", desc: "Start with extra glass layers", apply: (s) => (s.modGlass = 8) },
    { id: "heavy", name: "Heavy", desc: "Lose 2 moves, gain stronger chains", apply: (s) => { s.movesLeft = Math.max(8, s.movesLeft - 2); s.chainBonus += 0.2; } },
    { id: "color_tax", name: "Color Tax", desc: "One color scores less", apply: (s) => { s.taxColor = randColor(); } },
    { id: "lucky", name: "Lucky Drop", desc: "Item drop chance is higher", apply: (s) => { s.dropBoost += 0.12; } },
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

  const BOSS_SKILLS = ["glass_storm", "hex_lock", "color_shift"];

  const floorEl = document.getElementById("floor");
  const modifierEl = document.getElementById("modifier");
  const movesLeftEl = document.getElementById("movesLeft");
  const floorScoreEl = document.getElementById("floorScore");
  const scoreEl = document.getElementById("score");
  const boardTargetScoreEl = document.getElementById("boardTargetScore");
  const boardFloorScoreEl = document.getElementById("boardFloorScore");
  const bestFloorEl = document.getElementById("bestFloor");
  const bestScoreEl = document.getElementById("bestScore");
  const momentumBarEl = document.getElementById("momentumBar");
  const feverTurnsEl = document.getElementById("feverTurns");
  const bossMeterEl = document.getElementById("bossMeter");
  const bossBarEl = document.getElementById("bossBar");
  const bossSkillHintEl = document.getElementById("bossSkillHint");
  const bossTitleEl = document.getElementById("bossTitle");
  const bossStateEl = document.getElementById("bossState");
  const bossThreatEl = document.getElementById("bossThreat");
  const bossPatternEl = document.getElementById("bossPattern");
  const modeTextEl = document.getElementById("modeText");
  const boardWrapEl = document.getElementById("boardWrap");
  const boardEl = document.getElementById("board");
  const fxLayerEl = document.getElementById("fxLayer");
  const itemTooltipEl = document.getElementById("itemTooltip");
  const messageEl = document.getElementById("message");
  const restartBtn = document.getElementById("restartBtn");
  const codexBtn = document.getElementById("codexBtn");
  const guideBtn = document.getElementById("guideBtn");

  const itemWrapEl = document.getElementById("itemWrap");
  const perkWrapEl = document.getElementById("perkWrap");
  const overlayEl = document.getElementById("overlay");
  const overlayTitleEl = document.getElementById("overlayTitle");
  const overlayDescEl = document.getElementById("overlayDesc");
  const choiceWrapEl = document.getElementById("choiceWrap");
  const overlayActionsEl = document.getElementById("overlayActions");

  const codexModalEl = document.getElementById("codexModal");
  const codexContentEl = document.getElementById("codexContent");
  const codexCloseBtn = document.getElementById("codexCloseBtn");
  const guideModalEl = document.getElementById("guideModal");
  const guideModalTitleEl = document.getElementById("guideModalTitle");
  const guideModalDescEl = document.getElementById("guideModalDesc");
  const guideModalContentEl = document.getElementById("guideModalContent");
  const guideCloseBtn = document.getElementById("guideCloseBtn");

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
    const initial = {
      floor: 1,
      score: 0,
      floorScore: 0,
      targetScore: 0,
      movesLeft: 0,
      boardSize: MIN_BOARD_SIZE,
      board: [],
      mode: { type: "normal", item: null },
      items: Object.fromEntries(ITEM_ORDER.map((id) => [id, 0])),
      itemLevels: Object.fromEntries(ITEM_ORDER.map((id) => [id, 0])),
      itemSlots: ["hammer", "shuffle"],
      modifier: null,
      modGlass: 0,
      taxColor: null,
      dropBoost: 0,
      chainBonus: 0,
      momentum: 0,
      feverTurns: 0,
      perks: {
        combo_forge: false,
        fever_loop: false,
        relic_magnet: false,
        blast_core: false,
        glass_breaker: false,
        overcharge: false,
        pressure_valve: false,
        arcane_stockpile: false,
        score_bloom: false,
        quick_hands: false,
        fever_smith: false,
        boss_hunter: false,
        vault_expander: false,
        prism_heart: false,
        sovereign_circuit: false,
        dragon_hoard: false,
      },
      boss: { charge: 0, max: 7, hint: "Idle", elite: false, phase: "charging", casting: false },
      eventCurseFloors: 0,
      nextFloorMovePenalty: 0,
      nextFloorMoveBonus: 0,
      floorThreat: { label: "Warm-Up", bossGain: 1, pressure: 0 },
      gameOver: false,
      victory: false,
    };
    seedStartingItems(initial);
    return initial;
  }

  function seedStartingItems(s) {
    for (const id of s.itemSlots) {
      s.itemLevels[id] = ITEM_BASE_LEVEL;
      s.items[id] = ITEM_BASE_COUNTS[id] || 1;
    }
  }

  function getItemCount(id) {
    return Number(state.items[id] || 0);
  }

  function getItemLevel(id) {
    return Number(state.itemLevels[id] || 0);
  }

  function getItemFrames(id) {
    return ITEM_ANIM_FRAMES[id] || [ITEM_DEFS[id]?.image].filter(Boolean);
  }

  function getAnimatedItemImage(id, frameIndex = itemAnimFrameIndex) {
    const frames = getItemFrames(id);
    if (!frames.length) return ITEM_DEFS[id]?.image || "";
    return frames[frameIndex % frames.length];
  }

  function getGemFrames(color) {
    return GEM_ANIM_FRAMES[color] || [GEM_IMAGE_BY_COLOR[color] || GEM_IMAGE_BY_COLOR[0]].filter(Boolean);
  }

  function getAnimatedGemImage(color, frameIndex = itemAnimFrameIndex) {
    const frames = getGemFrames(color);
    return frames[frameIndex % frames.length];
  }

  function getAnimatedBossImage(frameIndex = itemAnimFrameIndex) {
    return BOSS_ANIM_FRAMES[frameIndex % BOSS_ANIM_FRAMES.length] || "./assets/generated/boss/boss_sigil.png";
  }

  function syncAnimatedItemImages(root = document) {
    const images = root.querySelectorAll("[data-anim-item]");
    for (const img of images) {
      const item = img.dataset.animItem;
      const next = getAnimatedItemImage(item);
      if (next && img.getAttribute("src") !== next) img.setAttribute("src", next);
    }

    const gemImages = root.querySelectorAll("[data-anim-gem]");
    for (const img of gemImages) {
      const color = Number(img.dataset.animGem);
      const next = getAnimatedGemImage(color);
      if (next && img.getAttribute("src") !== next) img.setAttribute("src", next);
    }

    const bossImages = root.querySelectorAll("[data-anim-boss]");
    for (const img of bossImages) {
      const next = getAnimatedBossImage();
      if (next && img.getAttribute("src") !== next) img.setAttribute("src", next);
    }
  }

  function startItemIconAnimation() {
    if (itemAnimTimer) clearInterval(itemAnimTimer);
    itemAnimTimer = setInterval(() => {
      itemAnimFrameIndex = (itemAnimFrameIndex + 1) % 8;
      syncAnimatedItemImages(document);
    }, 145);
  }

  function hasItemType(id) {
    return state.itemSlots.includes(id);
  }

  function itemPower(id) {
    return Math.max(1, getItemLevel(id) || 1);
  }

  function getCarriedItems() {
    return state.itemSlots.filter((id) => ITEM_DEFS[id]);
  }

  function itemSlotAvailable() {
    return getCarriedItems().length < MAX_ITEM_TYPES;
  }

  function ensureItemType(id) {
    if (hasItemType(id)) return true;
    if (!itemSlotAvailable()) return false;
    state.itemSlots.push(id);
    state.itemLevels[id] = Math.max(ITEM_BASE_LEVEL, getItemLevel(id));
    return true;
  }

  function addItemCharges(id, amount = 1, allowNewType = true) {
    if (!hasItemType(id)) {
      if (!allowNewType || !ensureItemType(id)) return false;
      if (state.perks.vault_expander) amount += 1;
    }
    state.items[id] = getItemCount(id) + amount;
    if (state.itemLevels[id] <= 0) state.itemLevels[id] = ITEM_BASE_LEVEL;
    return true;
  }

  function upgradeItem(id, levelGain = 1, chargeGain = 1) {
    if (!hasItemType(id) && !ensureItemType(id)) return false;
    state.itemLevels[id] = Math.max(ITEM_BASE_LEVEL, getItemLevel(id) + levelGain);
    const bonusCharges = state.perks.quick_hands && ITEM_DEFS[id].target ? 1 : 0;
    state.items[id] = getItemCount(id) + chargeGain + bonusCharges;
    return true;
  }

  function spendItemCharge(id) {
    state.items[id] = Math.max(0, getItemCount(id) - 1);
  }

  function boostAllItemLevels(s) {
    for (const id of s.itemSlots) {
      s.itemLevels[id] = Math.max(ITEM_BASE_LEVEL, (s.itemLevels[id] || ITEM_BASE_LEVEL) + 1);
      s.items[id] = Number(s.items[id] || 0) + 1;
    }
  }

  function grantDragonHoardBonus() {
    if (!state.perks.dragon_hoard) return;
    const carried = getCarriedItems();
    if (carried.length === 0) return;
    carried.sort((a, b) => getItemLevel(b) - getItemLevel(a) || getItemCount(b) - getItemCount(a));
    addItemCharges(carried[0], 1, false);
  }

  function defaultCodex() {
    return {
      itemUse: { hammer: 0, row: 0, cross: 0, color: 0, shuffle: 0, screen_wipe: 0, rainbow_burst: 0, time_freeze: 0, boss_breaker: 0 },
      specialTrigger: { line_h: 0, line_v: 0, bomb: 0, rainbow: 0 },
      bossSeen: { glass_storm: 0, hex_lock: 0, color_shift: 0 },
      skillUse: { screen_wipe: 0, rainbow_burst: 0, time_freeze: 0, boss_breaker: 0 },
      maxSingleClear: 0,
      maxChain: 0,
      runs: 0,
      guideSeen: {},
    };
  }

  function loadMeta() {
    try {
      const raw = localStorage.getItem(META_KEY);
      if (!raw) return { bestFloor: 0, bestScore: 0, codex: defaultCodex() };
      const parsed = JSON.parse(raw);
      return {
        bestFloor: Number(parsed.bestFloor || 0),
        bestScore: Number(parsed.bestScore || 0),
        codex: {
          ...defaultCodex(),
          ...(parsed.codex || {}),
          itemUse: { ...defaultCodex().itemUse, ...((parsed.codex || {}).itemUse || {}) },
          specialTrigger: { ...defaultCodex().specialTrigger, ...((parsed.codex || {}).specialTrigger || {}) },
          bossSeen: { ...defaultCodex().bossSeen, ...((parsed.codex || {}).bossSeen || {}) },
          skillUse: { ...defaultCodex().skillUse, ...((parsed.codex || {}).skillUse || {}) },
          guideSeen: { ...defaultCodex().guideSeen, ...((parsed.codex || {}).guideSeen || {}) },
        },
      };
    } catch {
      return { bestFloor: 0, bestScore: 0, codex: defaultCodex() };
    }
  }

  function saveMeta() {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  }

  function recordCodex(group, key, delta = 1) {
    if (!meta.codex[group]) return;
    if (typeof meta.codex[group] === "object") {
      meta.codex[group][key] = Number(meta.codex[group][key] || 0) + delta;
    }
    saveMeta();
  }

  function bindEvents() {
    restartBtn.addEventListener("click", () => {
      if (window.confirm("Restart the run?")) startRun();
    });
    boardEl.addEventListener("click", onBoardClick);
    itemWrapEl.addEventListener("click", onItemClick);
    itemWrapEl.addEventListener("mouseover", onItemHover);
    itemWrapEl.addEventListener("mouseout", onItemHoverOut);

    if (codexBtn) codexBtn.addEventListener("click", openCodex);
    if (guideBtn) guideBtn.addEventListener("click", openGuidePanel);
    if (codexCloseBtn) codexCloseBtn.addEventListener("click", () => codexModalEl.classList.add("hidden"));
    if (guideCloseBtn) guideCloseBtn.addEventListener("click", closeGuideModal);
    if (codexModalEl) {
      codexModalEl.addEventListener("click", (e) => {
        if (e.target === codexModalEl) codexModalEl.classList.add("hidden");
      });
    }
    if (guideModalEl) {
      guideModalEl.addEventListener("click", (e) => {
        if (e.target === guideModalEl) closeGuideModal();
      });
    }
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

    const cfg = FLOOR_CONFIG[state.floor - 1];
    const threat = getFloorThreat(state.floor);
    boardSize = getBoardSizeForFloor(state.floor);
    state.boardSize = boardSize;
    state.floorThreat = { label: threat.label, bossGain: threat.bossGain, pressure: threat.pressure };

    state.targetScore = Math.floor(cfg.target * threat.targetMul);
    state.movesLeft = Math.max(8, cfg.moves + threat.movesDelta);
    state.floorScore = 0;
    state.mode = { type: "normal", item: null };
    state.modifier = randomPick(MODIFIERS);
    state.modGlass = 0;
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
    grantDragonHoardBonus();

    state.board = createBoard();
    resolveAutoBoard();
    placeObstacles(cfg.obstacles + threat.obstacleBonus);
    state.modifier.apply(state);

    if (state.eventCurseFloors > 0) {
      state.eventCurseFloors -= 1;
      state.dropBoost += 0.08;
      state.chainBonus += 0.1;
    }

    if (state.modGlass > 0) placeGlass(state.modGlass + threat.glassBonus);

    const isElite = state.floor === 3 || state.floor === 5 || state.floor === 7;
    state.boss.elite = isElite;
    state.boss.charge = 0;
    state.boss.max = Math.max(3, (isElite ? 5 : 7) + threat.bossMaxDelta);
    state.boss.hint = isElite ? `Elite boss ready - ${threat.label}` : `Boss idle - ${threat.label}`;
    state.boss.phase = "charging";
    state.boss.casting = false;

    overlayEl.classList.add("hidden");
    if (overlayActionsEl) overlayActionsEl.innerHTML = "";
    clearAnim.clear();
    fallAnim.clear();

    renderAll();
    showFloorIntro(threat);
    notify(`Floor ${state.floor} begins: ${state.modifier.name} - ${threat.label}.`, "ok");
    scanGuideDiscoveries();
  }

  function getFloorThreat(floor) {
    return FLOOR_DIFFICULTY[Math.max(0, Math.min(FLOOR_DIFFICULTY.length - 1, floor - 1))];
  }

  function getBoardSizeForFloor(floor) {
    const size = BOARD_SIZE_BY_FLOOR[Math.max(0, Math.min(BOARD_SIZE_BY_FLOOR.length - 1, floor - 1))] || MIN_BOARD_SIZE;
    return Math.max(MIN_BOARD_SIZE, Math.min(MAX_BOARD_SIZE, size));
  }

  function showFloorIntro(threat) {
    const fx = document.createElement("div");
    fx.className = "floor-intro";
    fx.innerHTML = `<strong>Floor ${state.floor}</strong><small>${threat.label} - ${state.modifier.name}</small>`;
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
        const bonusColor = (cell.color + 1) % COLORS;
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
      if (second === first) second = (second + 1) % COLORS;
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
    const gain = state.floorThreat.bossGain + (state.boss.elite ? 1 : 0);
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

    const skill = randomPick(BOSS_SKILLS);
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
      if (to === from) to = (to + 1) % COLORS;
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
      state.feverTurns = state.perks.fever_loop ? 4 : 3;
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
    if ([2, 4, 6].includes(state.floor)) return showEventNode();
    showRewardChoices();
  }

  function onVictory() {
    state.victory = true;
    updateMeta();
    renderAll();
    overlayTitleEl.textContent = "Victory!";
    overlayDescEl.textContent = `You cleared all ${TOTAL_FLOORS} floors with a final score of ${state.score}.`;
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
    overlayTitleEl.textContent = `Event Node (after Floor ${state.floor})`;
    overlayDescEl.textContent = "Choose one route to shape the next floor.";
    choiceWrapEl.innerHTML = "";
    overlayActionsEl.innerHTML = "";

    const events = [
      {
        title: "Cursed Pact",
        desc: "The next two floors are harsher, but chain rewards and drops increase and you gain +1 Cross Burst",
        apply: () => {
          state.eventCurseFloors = 2;
          addItemCharges("cross", 1, true);
          notify("You signed the Cursed Pact.", "warn");
        },
      },
      {
        title: "Repair Forge",
        desc: "Gain +2 moves next floor and reset the boss charge",
        apply: () => {
          state.nextFloorMoveBonus += 2;
          state.boss.charge = 0;
          notify("The forge stabilizes the next floor.", "ok");
        },
      },
      {
        title: "Greed Altar",
        desc: "Gain +180 score now, but lose 2 moves next floor",
        apply: () => {
          state.score += 180;
          state.floorScore += 40;
          state.nextFloorMovePenalty += 2;
          notify("Greed Altar activated: high reward, high pressure.", "warn");
        },
      },
    ];

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
    fx.innerHTML = `<img src="${getAnimatedItemImage(item)}" alt="${ITEM_DEFS[item].name}" class="item-cast-image" data-anim-item="${item}">`;

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
    const capped = indices.slice(0, 16);
    const shardBudget = Math.max(0, MAX_ACTIVE_SHARDS - activeShards);
    if (shardBudget <= 0) return;

    let useBudget = shardBudget;
    for (const idx of capped) {
      if (useBudget <= 0) break;
      const cell = boardEl.querySelector(`.cell[data-index="${idx}"]`);
      if (!cell) continue;
      const rect = cell.getBoundingClientRect();
      const source = state.board[idx];
      const specialBoost = isGem(source) && source.special ? 1.75 : 1;
      const pieces = Math.min(useBudget, Math.floor((18 + Math.random() * 12) * specialBoost));
      useBudget -= pieces;

      const burst = document.createElement("i");
      burst.className = "fx-burst";
      burst.style.left = `${rect.left + rect.width / 2}px`;
      burst.style.top = `${rect.top + rect.height / 2}px`;
      if (isGem(source)) {
        const color = `var(--gem-color-${source.color}, #ffffff)`;
        burst.style.background = `radial-gradient(circle, rgba(255,255,255,0.98) 0%, ${color} 28%, rgba(255,255,255,0.14) 58%, rgba(255,255,255,0) 76%)`;
      }
      fxLayerEl.appendChild(burst);
      setTimeout(() => burst.remove(), 280);

      if (isGem(source) && source.special) {
        const streakCount = source.special === "bomb" || source.special === "rainbow" ? 6 : 4;
        for (let s = 0; s < streakCount; s += 1) {
          const streak = document.createElement("i");
          streak.className = "fx-streak";
          streak.style.left = `${rect.left + rect.width / 2}px`;
          streak.style.top = `${rect.top + rect.height / 2}px`;
          const rot = `${(360 / streakCount) * s + (source.special === "line_h" ? 0 : source.special === "line_v" ? 90 : 30)}deg`;
          streak.style.setProperty("--streak-rot", rot);
          streak.style.background = `linear-gradient(90deg, rgba(255,255,255,0), var(--gem-color-${source.color}, #fff), rgba(255,255,255,0))`;
          fxLayerEl.appendChild(streak);
          setTimeout(() => streak.remove(), 320);
        }
      }

      for (let i = 0; i < pieces; i += 1) {
        const p = document.createElement("i");
        p.className = "fx-shard";
        p.style.left = `${rect.left + rect.width / 2}px`;
        p.style.top = `${rect.top + rect.height / 2}px`;

        const ang = Math.random() * Math.PI * 2;
        const speed = 34 + Math.random() * 86;
        const dx = Math.cos(ang) * speed;
        const dy = Math.sin(ang) * speed + 24;
        const rot = `${(Math.random() - 0.5) * 520}deg`;

        p.style.width = `${4 + Math.random() * 8}px`;
        p.style.height = `${3 + Math.random() * 6}px`;
        p.style.background = isGem(source) ? `var(--gem-color-${source.color}, #dce8ff)` : "#dce8ff";
        p.style.opacity = String(0.72 + Math.random() * 0.28);
        p.style.clipPath = Math.random() > 0.5
          ? "polygon(50% 0%, 0% 100%, 100% 100%)"
          : "polygon(0% 0%, 100% 18%, 76% 100%, 14% 82%)";
        p.style.setProperty("--dx", `${dx}px`);
        p.style.setProperty("--dy", `${dy}px`);
        p.style.setProperty("--rot", rot);

        fxLayerEl.appendChild(p);
        activeShards += 1;
        setTimeout(() => {
          p.remove();
          activeShards = Math.max(0, activeShards - 1);
        }, 620);
      }
    }
  }

  function spawnShockwaveFX(index, strong = false) {
    const cell = boardEl.querySelector(`.cell[data-index="${index}"]`);
    if (!cell) return;
    const r = cell.getBoundingClientRect();

    const spawnWave = (size, border, life, alpha = 0.9) => {
      const wave = document.createElement("i");
      wave.className = "fx-wave";
      wave.style.left = `${r.left + r.width / 2}px`;
      wave.style.top = `${r.top + r.height / 2}px`;
      wave.style.width = `${size}px`;
      wave.style.height = `${size}px`;
      wave.style.marginLeft = `${-size / 2}px`;
      wave.style.marginTop = `${-size / 2}px`;
      wave.style.borderWidth = `${border}px`;
      wave.style.borderColor = `rgba(255,255,255,${alpha})`;
      fxLayerEl.appendChild(wave);
      setTimeout(() => wave.remove(), life);
    };

    spawnWave(strong ? 16 : 12, strong ? 3 : 2, strong ? 360 : 320, strong ? 0.98 : 0.85);
    if (strong) {
      spawnWave(24, 2, 420, 0.68);
      spawnWave(34, 2, 460, 0.32);
      const flash = document.createElement("i");
      flash.style.position = "fixed";
      flash.style.left = `${r.left + r.width / 2}px`;
      flash.style.top = `${r.top + r.height / 2}px`;
      flash.style.width = "28px";
      flash.style.height = "28px";
      flash.style.marginLeft = "-14px";
      flash.style.marginTop = "-14px";
      flash.style.borderRadius = "50%";
      flash.style.background = "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0) 100%)";
      flash.style.animation = "waveExpand 240ms ease forwards";
      fxLayerEl.appendChild(flash);
      setTimeout(() => flash.remove(), 260);
    }
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

  function spawnScreenPulse(theme = "boss", duration = 420) {
    const el = document.createElement("i");
    el.className = `fx-screen-pulse ${theme}`;
    fxLayerEl.appendChild(el);
    setTimeout(() => el.remove(), duration);
  }

  function shakeBoard(power = 1) {
    boardWrapEl.classList.remove("shake");
    boardWrapEl.style.setProperty("--shake-power", String(power));
    boardWrapEl.offsetWidth;
    boardWrapEl.classList.add("shake");
  }

  function updateMeta() {
    meta.bestFloor = Math.max(meta.bestFloor, state.floor);
    meta.bestScore = Math.max(meta.bestScore, state.score);
    saveMeta();
  }

  function createBoard() {
    const arr = Array(boardSize * boardSize).fill(null);
    for (let i = 0; i < arr.length; i += 1) arr[i] = { kind: "gem", color: randColor(), special: null, glass: false, lockedTurns: 0 };
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

  function refillBoard() {
    const born = [];
    for (let i = 0; i < state.board.length; i += 1) {
      if (state.board[i] === null) {
        state.board[i] = { kind: "gem", color: randColor(), special: null, glass: false, lockedTurns: 0 };
        born.push(i);
      }
    }
    return born;
  }

  function isAdjacent(a, b) {
    return Math.abs(rowOf(a) - rowOf(b)) + Math.abs(colOf(a) - colOf(b)) === 1;
  }

  function rowOf(i) { return Math.floor(i / boardSize); }
  function colOf(i) { return i % boardSize; }
  function inside(r, c) { return r >= 0 && r < boardSize && c >= 0 && c < boardSize; }
  function indicesInRow(r) { return Array.from({ length: boardSize }, (_, x) => r * boardSize + x); }
  function indicesInCol(c) { return Array.from({ length: boardSize }, (_, y) => y * boardSize + c); }

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
    renderPerks();
    renderGuideList();
    renderBoard();
    boardEl.style.setProperty("--board-size", String(boardSize));
  }

  function renderHUD() {
    floorEl.textContent = `${state.floor}/${TOTAL_FLOORS}`;
    modifierEl.textContent = state.modifier ? state.modifier.name : "-";
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
    if (bossTitleEl) bossTitleEl.textContent = state.boss.elite ? "Elite Rift Tyrant" : "Warden of the Deep";
    if (bossStateEl) bossStateEl.textContent = state.boss.casting ? "Casting a battlefield skill" : state.boss.phase === "ready" ? "Primed to strike on the next beat" : `Charging through ${state.floorThreat.label}`;
    if (bossThreatEl) bossThreatEl.textContent = getBossThreatLabel();
    if (bossPatternEl) bossPatternEl.textContent = state.boss.elite ? "Storm / Lock / Shift / Elite pressure" : "Storm / Lock / Shift";
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
    itemWrapEl.innerHTML = "";
    const carried = getCarriedItems();
    for (const id of carried) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ability";
      btn.dataset.item = id;
      if (state.mode.type === "target_item" && state.mode.item === id) btn.classList.add("active");
      if (getItemCount(id) <= 0) btn.classList.add("disabled");
      btn.classList.add(`rarity-${ITEM_DEFS[id].rarity}`);
      btn.innerHTML = `<img class="item-icon item-image" data-anim-item="${id}" src="${getAnimatedItemImage(id)}" alt="${ITEM_DEFS[id].name}"><i class="item-badge">${getItemCount(id)}</i><i class="item-level">Lv.${getItemLevel(id)}</i><strong>${ITEM_DEFS[id].name}</strong><small>${ITEM_DEFS[id].desc}</small>`;
      itemWrapEl.appendChild(btn);
    }
    for (let i = carried.length; i < MAX_ITEM_TYPES; i += 1) {
      const slot = document.createElement("div");
      slot.className = "ability disabled empty-slot";
      slot.innerHTML = `<div class="item-icon empty-item-slot"><img class="empty-slot-image" src="${UI_IMAGES.emptySlot}" alt="Empty slot"></div><strong>Empty Slot</strong><small>New item types can be drafted here.</small>`;
      itemWrapEl.appendChild(slot);
    }
  }

  function renderPerks() {
    if (!perkWrapEl) return;
    perkWrapEl.innerHTML = "";
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    const owned = Object.entries(PERK_DEFS)
      .filter(([id]) => state.perks[id])
      .sort((a, b) => rarityOrder[a[1].rarity] - rarityOrder[b[1].rarity]);
    if (owned.length === 0) {
      const empty = document.createElement("div");
      empty.className = "perk-empty";
      empty.textContent = "Draft rogue skills after each floor to shape your run.";
      perkWrapEl.appendChild(empty);
      return;
    }
    for (const [, def] of owned) {
      const el = document.createElement("div");
      el.className = `perk-chip rarity-${def.rarity}`;
      el.innerHTML = `<span>${RARITY_LABELS[def.rarity]}</span><strong>${def.title}</strong><small>${def.desc}</small>`;
      perkWrapEl.appendChild(el);
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
        if (value.lockedTurns > 0) gem.classList.add("locked");
        if (clearAnim.has(i)) gem.classList.add("clear-pop");
        if (fallAnim.has(i)) gem.classList.add("fall-in");

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
