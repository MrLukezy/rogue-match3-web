(() => {
  // src/config/game-config.js
  var MIN_BOARD_SIZE = 6;
  var MAX_BOARD_SIZE = 15;
  var BOARD_SIZE_BY_FLOOR = [6, 7, 8, 8, 9, 10, 10, 11, 12, 12, 13, 14];
  var TOTAL_FLOORS = 12;
  var META_KEY = "rogue_match3_meta_v5";
  var MOMENTUM_MAX = 100;
  var MAX_SKILL_CHAIN = 2;
  var MAX_ACTIVE_SHARDS = 260;
  var FLOOR_CONFIG = [
    { target: 420, moves: 17, obstacles: 0 },
    { target: 610, moves: 17, obstacles: 0 },
    { target: 780, moves: 16, obstacles: 1 },
    { target: 980, moves: 16, obstacles: 1 },
    { target: 1180, moves: 16, obstacles: 2 },
    { target: 1410, moves: 15, obstacles: 2 },
    { target: 1680, moves: 15, obstacles: 3 },
    { target: 1960, moves: 14, obstacles: 3 },
    { target: 2280, moves: 14, obstacles: 4 },
    { target: 2620, moves: 13, obstacles: 4 },
    { target: 3020, moves: 13, obstacles: 5 },
    { target: 3480, moves: 12, obstacles: 6 }
  ];
  var FLOOR_DIFFICULTY = [
    { label: "Warm-Up", targetMul: 1, movesDelta: 0, obstacleBonus: 0, glassBonus: 0, bossGain: 1, bossMaxDelta: 0, pressure: 0 },
    { label: "Pressure", targetMul: 1.06, movesDelta: 0, obstacleBonus: 0, glassBonus: 1, bossGain: 1, bossMaxDelta: 0, pressure: 0 },
    { label: "Mine Warden", targetMul: 1.14, movesDelta: -1, obstacleBonus: 1, glassBonus: 1, bossGain: 2, bossMaxDelta: -1, pressure: 1 },
    { label: "Cold Draft", targetMul: 1.22, movesDelta: -1, obstacleBonus: 1, glassBonus: 1, bossGain: 2, bossMaxDelta: -1, pressure: 1 },
    { label: "Frostbite", targetMul: 1.3, movesDelta: -1, obstacleBonus: 2, glassBonus: 2, bossGain: 2, bossMaxDelta: -1, pressure: 1 },
    { label: "Archive Sentinel", targetMul: 1.4, movesDelta: -2, obstacleBonus: 2, glassBonus: 2, bossGain: 2, bossMaxDelta: -2, pressure: 2 },
    { label: "Spark Surge", targetMul: 1.48, movesDelta: -1, obstacleBonus: 2, glassBonus: 1, bossGain: 3, bossMaxDelta: -1, pressure: 2 },
    { label: "Forge Pressure", targetMul: 1.58, movesDelta: -2, obstacleBonus: 3, glassBonus: 2, bossGain: 3, bossMaxDelta: -2, pressure: 2 },
    { label: "Storm Tyrant", targetMul: 1.7, movesDelta: -2, obstacleBonus: 3, glassBonus: 2, bossGain: 3, bossMaxDelta: -2, pressure: 3 },
    { label: "Void Echo", targetMul: 1.82, movesDelta: -2, obstacleBonus: 4, glassBonus: 3, bossGain: 3, bossMaxDelta: -2, pressure: 3 },
    { label: "Abyss Gravity", targetMul: 1.96, movesDelta: -3, obstacleBonus: 4, glassBonus: 3, bossGain: 4, bossMaxDelta: -2, pressure: 3 },
    { label: "Final Cataclysm", targetMul: 2.12, movesDelta: -3, obstacleBonus: 5, glassBonus: 4, bossGain: 4, bossMaxDelta: -3, pressure: 4 }
  ];
  var CHAPTER_THEMES = [
    {
      id: "crystal_mines",
      start: 1,
      end: 3,
      title: "Crystal Mines",
      shortLabel: "Mines",
      bossName: "Mine Warden",
      eliteBossName: "Crystal Burrow Tyrant",
      pattern: "Glass / Obstacle / Pressure",
      intro: "Stable crystal tunnels with early board hazards.",
      boardImage: "./assets/generated/ui/bg_board_crystal_mines.png",
      obstacleImage: "./assets/generated/ui/tile_obstacle_mines.png",
      chapterPreviewImage: "./assets/generated/ui/bg_board_crystal_mines.png",
      bossPortrait: "./assets/generated/boss/boss_mine_warden.png",
      gemTone: "none"
    },
    {
      id: "frozen_archive",
      start: 4,
      end: 6,
      title: "Frozen Archive",
      shortLabel: "Archive",
      bossName: "Archivist of Frost",
      eliteBossName: "Frozen Memory Eater",
      pattern: "Lock / Glass / Recolor",
      intro: "Lock-heavy floors that reward planning over speed.",
      boardImage: "./assets/generated/ui/bg_board_frozen_archive.png",
      obstacleImage: "./assets/generated/ui/tile_obstacle_archive.png",
      chapterPreviewImage: "./assets/generated/ui/bg_board_frozen_archive.png",
      bossPortrait: "./assets/generated/boss/boss_archivist_frost.png",
      gemTone: "hue-rotate(12deg) saturate(0.9) brightness(1.05)"
    },
    {
      id: "storm_forge",
      start: 7,
      end: 9,
      title: "Storm Forge",
      shortLabel: "Forge",
      bossName: "Forge Tempest",
      eliteBossName: "Thunder Crucible Titan",
      pattern: "Pressure / Chain / Boss burst",
      intro: "High-voltage floors built around chain payoffs and punishment.",
      boardImage: "./assets/generated/ui/bg_board_storm_forge.png",
      obstacleImage: "./assets/generated/ui/tile_obstacle_forge.png",
      chapterPreviewImage: "./assets/generated/ui/bg_board_storm_forge.png",
      bossPortrait: "./assets/generated/boss/boss_forge_tempest.png",
      gemTone: "saturate(1.16) brightness(1.04)"
    },
    {
      id: "void_rift",
      start: 10,
      end: 12,
      title: "Void Rift",
      shortLabel: "Rift",
      bossName: "Rift Sovereign",
      eliteBossName: "Voidheart Devourer",
      pattern: "Storm / Lock / Shift / Collapse",
      intro: "Endgame floors with stacked pressure and mixed hazards.",
      boardImage: "./assets/generated/ui/bg_board_void_rift.png",
      obstacleImage: "./assets/generated/ui/tile_obstacle_rift.png",
      chapterPreviewImage: "./assets/generated/ui/bg_board_void_rift.png",
      bossPortrait: "./assets/generated/boss/boss_rift_sovereign.png",
      gemTone: "hue-rotate(-14deg) saturate(1.12) brightness(0.96)"
    }
  ];
  var ELITE_FLOORS = [3, 6, 9, 12];

  // src/config/items-config.js
  var MAX_ITEM_TYPES = 5;
  var ITEM_DEFS = {
    hammer: { name: "Hammer", image: "./assets/generated/items/item_hammer-20260403-121101-1_rgba.png", desc: "Break a single tile", target: true, rarity: "common" },
    row: { name: "Row Sweep", image: "./assets/generated/items/item_row_sweep-20260403-121117-1_rgba.png", desc: "Clear one full row", target: true, rarity: "common" },
    cross: { name: "Cross Burst", image: "./assets/generated/items/item_cross_burst-20260403-121136-1_rgba.png", desc: "Clear row and column", target: true, rarity: "rare" },
    color: { name: "Color Bomb", image: "./assets/generated/items/item_color_bomb-20260403-121155-1_rgba.png", desc: "Clear the chosen color", target: true, rarity: "rare" },
    shuffle: { name: "Shuffle", image: "./assets/generated/items/item_shuffle.png", desc: "Re-roll the board", target: false, rarity: "common" },
    screen_wipe: { name: "Screen Pulse", image: "./assets/generated/items/item_screen_pulse-20260403-121242-1_rgba.png", desc: "Instantly clear every gem", target: false, rarity: "epic" },
    rainbow_burst: { name: "Rainbow Burst", image: "./assets/generated/items/item_rainbow_burst-20260403-121214-1_rgba.png", desc: "Clear two random colors and trigger specials", target: false, rarity: "epic" },
    time_freeze: { name: "Time Freeze", image: "./assets/generated/items/item_time_freeze-20260403-121301-1_rgba.png", desc: "Gain moves, unlock gems, and stabilize momentum", target: false, rarity: "epic" },
    boss_breaker: { name: "Boss Breaker", image: "./assets/generated/items/item_boss_breaker-20260403-121358-1_rgba.png", desc: "Smash charge and shatter a wide section of the board", target: false, rarity: "legendary" }
  };
  var ITEM_ANIM_FRAMES = {
    hammer: ["./assets/generated/items/item_hammer-20260403-121101-1_rgba.png"],
    row: ["./assets/generated/items/item_row_sweep-20260403-121117-1_rgba.png"],
    cross: ["./assets/generated/items/item_cross_burst-20260403-121136-1_rgba.png"],
    color: ["./assets/generated/items/item_color_bomb-20260403-121155-1_rgba.png"],
    shuffle: ["./assets/generated/items/anim/item_shuffle_f1.png", "./assets/generated/items/anim/item_shuffle_f2.png", "./assets/generated/items/anim/item_shuffle_f3.png", "./assets/generated/items/anim/item_shuffle_f4.png", "./assets/generated/items/anim/item_shuffle_f5.png", "./assets/generated/items/anim/item_shuffle_f6.png", "./assets/generated/items/anim/item_shuffle_f7.png", "./assets/generated/items/anim/item_shuffle_f8.png"],
    screen_wipe: ["./assets/generated/items/item_screen_pulse-20260403-121242-1_rgba.png"],
    rainbow_burst: ["./assets/generated/items/item_rainbow_burst-20260403-121214-1_rgba.png"],
    time_freeze: ["./assets/generated/items/item_time_freeze-20260403-121301-1_rgba.png"],
    boss_breaker: ["./assets/generated/items/item_boss_breaker-20260403-121358-1_rgba.png"]
  };
  var ITEM_ORDER = ["hammer", "row", "cross", "color", "shuffle", "screen_wipe", "rainbow_burst", "time_freeze", "boss_breaker"];
  var ITEM_BASE_COUNTS = { hammer: 2, shuffle: 1 };
  var ITEM_BASE_LEVEL = 1;
  var RARITY_LABELS = { common: "Common", rare: "Rare", epic: "Epic", legendary: "Legendary" };

  // src/config/gems-config.js
  var GUIDE_DEFS = {
    gem_basic: { title: "Element Gem", desc: "Match 3 or more gems of the same color to score and charge momentum.", preview: { kind: "gem", color: 0 } },
    obstacle: { title: "Obstacle Block", desc: "Cannot be swapped. Clear adjacent gems or use items to break it.", preview: { kind: "obstacle" } },
    glass: { title: "Glass Layer", desc: "The first clear removes the glass, the second clear removes the gem itself.", preview: { kind: "gem", color: 1, glass: true } },
    locked: { title: "Locked Gem", desc: "Locked gems stay in place and cannot be swapped until the lock expires.", preview: { kind: "gem", color: 2, locked: true } },
    line_h: { title: "Row Gem", desc: "Clears a full horizontal lane when triggered.", preview: { kind: "gem", color: 3, special: "line_h" } },
    line_v: { title: "Column Gem", desc: "Clears a full vertical lane when triggered.", preview: { kind: "gem", color: 3, special: "line_v" } },
    bomb: { title: "Bomb Gem", desc: "Explodes the surrounding 3x3 area.", preview: { kind: "gem", color: 5, special: "bomb" } },
    rainbow: { title: "Rainbow Gem", desc: "Detonates every gem of the chosen color when activated.", preview: { kind: "gem", color: 4, special: "rainbow" } }
  };
  var GEM_IMAGE_BY_COLOR = {
    0: "./assets/generated/gems/gem_fire.png",
    1: "./assets/generated/gems/gem_water.png",
    2: "./assets/generated/gems/gem_nature.png",
    3: "./assets/generated/gems/gem_lightning.png",
    4: "./assets/generated/gems/gem_arcane.png",
    5: "./assets/generated/gems/gem_alchemy.png"
  };
  var GEM_ANIM_FRAMES = {
    0: ["./assets/generated/gems/anim/gem_fire_f1.png", "./assets/generated/gems/anim/gem_fire_f2.png", "./assets/generated/gems/anim/gem_fire_f3.png", "./assets/generated/gems/anim/gem_fire_f4.png", "./assets/generated/gems/anim/gem_fire_f5.png", "./assets/generated/gems/anim/gem_fire_f6.png", "./assets/generated/gems/anim/gem_fire_f7.png", "./assets/generated/gems/anim/gem_fire_f8.png"],
    1: ["./assets/generated/gems/anim/gem_water_f1.png", "./assets/generated/gems/anim/gem_water_f2.png", "./assets/generated/gems/anim/gem_water_f3.png", "./assets/generated/gems/anim/gem_water_f4.png", "./assets/generated/gems/anim/gem_water_f5.png", "./assets/generated/gems/anim/gem_water_f6.png", "./assets/generated/gems/anim/gem_water_f7.png", "./assets/generated/gems/anim/gem_water_f8.png"],
    2: ["./assets/generated/gems/anim/gem_nature_f1.png", "./assets/generated/gems/anim/gem_nature_f2.png", "./assets/generated/gems/anim/gem_nature_f3.png", "./assets/generated/gems/anim/gem_nature_f4.png", "./assets/generated/gems/anim/gem_nature_f5.png", "./assets/generated/gems/anim/gem_nature_f6.png", "./assets/generated/gems/anim/gem_nature_f7.png", "./assets/generated/gems/anim/gem_nature_f8.png"],
    3: ["./assets/generated/gems/anim/gem_lightning_f1.png", "./assets/generated/gems/anim/gem_lightning_f2.png", "./assets/generated/gems/anim/gem_lightning_f3.png", "./assets/generated/gems/anim/gem_lightning_f4.png", "./assets/generated/gems/anim/gem_lightning_f5.png", "./assets/generated/gems/anim/gem_lightning_f6.png", "./assets/generated/gems/anim/gem_lightning_f7.png", "./assets/generated/gems/anim/gem_lightning_f8.png"],
    4: ["./assets/generated/gems/anim/gem_arcane_f1.png", "./assets/generated/gems/anim/gem_arcane_f2.png", "./assets/generated/gems/anim/gem_arcane_f3.png", "./assets/generated/gems/anim/gem_arcane_f4.png", "./assets/generated/gems/anim/gem_arcane_f5.png", "./assets/generated/gems/anim/gem_arcane_f6.png", "./assets/generated/gems/anim/gem_arcane_f7.png", "./assets/generated/gems/anim/gem_arcane_f8.png"],
    5: ["./assets/generated/gems/anim/gem_alchemy_f1.png", "./assets/generated/gems/anim/gem_alchemy_f2.png", "./assets/generated/gems/anim/gem_alchemy_f3.png", "./assets/generated/gems/anim/gem_alchemy_f4.png", "./assets/generated/gems/anim/gem_alchemy_f5.png", "./assets/generated/gems/anim/gem_alchemy_f6.png", "./assets/generated/gems/anim/gem_alchemy_f7.png", "./assets/generated/gems/anim/gem_alchemy_f8.png"]
  };
  var GEM_POOL_BY_FLOOR = [
    [0, 1, 2, 3],
    [0, 1, 2, 3],
    [0, 1, 2, 3],
    [0, 1, 2, 3, 4],
    [0, 1, 2, 3, 4],
    [0, 1, 2, 3, 4],
    [0, 1, 2, 3, 4, 5],
    [0, 1, 2, 3, 4, 5],
    [0, 1, 2, 3, 4, 5],
    [0, 1, 2, 3, 4, 5],
    [0, 1, 2, 3, 4, 5],
    [0, 1, 2, 3, 4, 5]
  ];
  var GEM_COLOR_NAMES = {
    0: "Fire",
    1: "Water",
    2: "Nature",
    3: "Lightning",
    4: "Arcane",
    5: "Alchemy"
  };

  // src/config/boss-ui-config.js
  var UI_IMAGES = {
    obstacle: "./assets/generated/ui/tile_obstacle_obsidian.png",
    emptySlot: "./assets/generated/ui/icon_empty_slot_relic.png"
  };
  var BOSS_ANIM_FRAMES = [
    "./assets/generated/boss/anim/boss_sigil_f1.png",
    "./assets/generated/boss/anim/boss_sigil_f2.png",
    "./assets/generated/boss/anim/boss_sigil_f3.png",
    "./assets/generated/boss/anim/boss_sigil_f4.png",
    "./assets/generated/boss/anim/boss_sigil_f5.png",
    "./assets/generated/boss/anim/boss_sigil_f6.png",
    "./assets/generated/boss/anim/boss_sigil_f7.png",
    "./assets/generated/boss/anim/boss_sigil_f8.png"
  ];
  var BOSS_SKILLS = ["glass_storm", "hex_lock", "color_shift", "rift_collapse"];

  // src/config/blessings-config.js
  var BLESSING_DEFS = {
    tactical_reserve: {
      title: "Tactical Reserve",
      desc: "+1 move at the start of every floor.",
      rarity: "rare",
      apply: (state) => {
        state.blessings.tactical_reserve = true;
      }
    },
    supply_cache: {
      title: "Supply Cache",
      desc: "Restore +1 charge to every carried item at the start of each floor.",
      rarity: "rare",
      apply: (state) => {
        state.blessings.supply_cache = true;
      }
    },
    chain_matrix: {
      title: "Chain Matrix",
      desc: "Permanent +0.15 chain bonus for the rest of the run.",
      rarity: "epic",
      apply: (state) => {
        state.blessings.chain_matrix = true;
      }
    },
    fever_engine: {
      title: "Fever Engine",
      desc: "Fever lasts +1 extra turn and starts with a brighter payoff.",
      rarity: "epic",
      apply: (state) => {
        state.blessings.fever_engine = true;
      }
    },
    boss_shunt: {
      title: "Boss Shunt",
      desc: "Boss charge gain is reduced during future floors.",
      rarity: "legendary",
      apply: (state) => {
        state.blessings.boss_shunt = true;
      }
    },
    purifier_sigil: {
      title: "Purifier Sigil",
      desc: "Each floor starts with fewer locks and glass layers.",
      rarity: "rare",
      apply: (state) => {
        state.blessings.purifier_sigil = true;
      }
    }
  };

  // src/render/items-render.js
  function renderItemsView({
    itemWrapEl,
    getCarriedItems: getCarriedItems2,
    state,
    getItemCount: getItemCount2,
    getItemLevel: getItemLevel2,
    ITEM_DEFS: ITEM_DEFS2,
    getAnimatedItemImage: getAnimatedItemImage2,
    MAX_ITEM_TYPES: MAX_ITEM_TYPES2,
    UI_IMAGES: UI_IMAGES2
  }) {
    itemWrapEl.innerHTML = "";
    const carried = getCarriedItems2();
    for (const id of carried) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ability";
      btn.dataset.item = id;
      if (state.mode.type === "target_item" && state.mode.item === id) btn.classList.add("active");
      if (getItemCount2(id) <= 0) btn.classList.add("disabled");
      btn.classList.add(`rarity-${ITEM_DEFS2[id].rarity}`);
      btn.innerHTML = `<img class="item-icon item-image" data-anim-item="${id}" src="${getAnimatedItemImage2(id)}" alt="${ITEM_DEFS2[id].name}"><i class="item-badge">${getItemCount2(id)}</i><i class="item-level">Lv.${getItemLevel2(id)}</i><strong>${ITEM_DEFS2[id].name}</strong>`;
      itemWrapEl.appendChild(btn);
    }
    for (let i = carried.length; i < MAX_ITEM_TYPES2; i += 1) {
      const slot = document.createElement("div");
      slot.className = "ability disabled empty-slot";
      slot.innerHTML = `<div class="item-icon empty-item-slot"><img class="empty-slot-image" src="${UI_IMAGES2.emptySlot}" alt="Empty slot"></div><strong>Empty Slot</strong><small>New item types can be drafted here.</small>`;
      itemWrapEl.appendChild(slot);
    }
  }
  function renderPerksView({ perkWrapEl, state, PERK_DEFS, BLESSING_DEFS: BLESSING_DEFS2, RARITY_LABELS: RARITY_LABELS2 }) {
    if (!perkWrapEl) return;
    perkWrapEl.innerHTML = "";
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    const owned = Object.entries(PERK_DEFS).filter(([id]) => state.perks[id]).sort((a, b) => rarityOrder[a[1].rarity] - rarityOrder[b[1].rarity]);
    const blessings = Object.entries(BLESSING_DEFS2 || {}).filter(([id]) => state.blessings?.[id]).sort((a, b) => rarityOrder[a[1].rarity] - rarityOrder[b[1].rarity]);
    if (owned.length === 0 && blessings.length === 0) {
      const empty = document.createElement("div");
      empty.className = "perk-empty";
      empty.textContent = "Draft rogue skills after each floor to shape your run.";
      perkWrapEl.appendChild(empty);
      return;
    }
    for (const [, def] of blessings) {
      const el = document.createElement("div");
      el.className = `perk-chip rarity-${def.rarity}`;
      el.innerHTML = `<span>Blessing</span><strong>${def.title}</strong><small>${def.desc}</small>`;
      perkWrapEl.appendChild(el);
    }
    for (const [, def] of owned) {
      const el = document.createElement("div");
      el.className = `perk-chip rarity-${def.rarity}`;
      el.innerHTML = `<span>${RARITY_LABELS2[def.rarity]}</span><strong>${def.title}</strong><small>${def.desc}</small>`;
      perkWrapEl.appendChild(el);
    }
  }

  // src/render/board-render.js
  function renderBoardView({
    boardEl,
    state,
    selected,
    isObstacle: isObstacle2,
    isGem: isGem2,
    clearAnim,
    fallAnim,
    getAnimatedGemImage: getAnimatedGemImage2
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
      if (isObstacle2(value)) {
        const block = document.createElement("div");
        block.className = "obstacle";
        cell.appendChild(block);
      } else if (isGem2(value)) {
        const gem = document.createElement("div");
        gem.className = `gem g-${value.color}`;
        if (value.special) gem.classList.add(`sp-${value.special}`);
        if (value.glass) gem.classList.add("glass");
        if (value.lockedTurns > 0) gem.classList.add("locked");
        if (fallAnim.has(i)) gem.classList.add("fall-in");
        const icon = document.createElement("img");
        icon.className = "gem-icon gem-image";
        icon.dataset.animGem = String(value.color);
        icon.src = getAnimatedGemImage2(value.color);
        icon.alt = `gem-${value.color}`;
        gem.appendChild(icon);
        cell.appendChild(gem);
      }
      boardEl.appendChild(cell);
    }
  }

  // src/core/state-meta-items.js
  function createInitialState({ MIN_BOARD_SIZE: MIN_BOARD_SIZE2, ITEM_ORDER: ITEM_ORDER2 }) {
    return {
      floor: 1,
      score: 0,
      floorScore: 0,
      targetScore: 0,
      movesLeft: 0,
      boardSize: MIN_BOARD_SIZE2,
      activeGemColors: [0, 1, 2, 3],
      board: [],
      mode: { type: "normal", item: null },
      items: Object.fromEntries(ITEM_ORDER2.map((id) => [id, 0])),
      itemLevels: Object.fromEntries(ITEM_ORDER2.map((id) => [id, 0])),
      itemSlots: ["hammer", "shuffle"],
      modifier: null,
      modGlass: 0,
      modLocks: 0,
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
        dragon_hoard: false
      },
      blessings: {
        tactical_reserve: false,
        supply_cache: false,
        chain_matrix: false,
        fever_engine: false,
        boss_shunt: false,
        purifier_sigil: false
      },
      boss: { charge: 0, max: 7, hint: "Idle", elite: false, phase: "charging", casting: false },
      eventCurseFloors: 0,
      nextFloorMovePenalty: 0,
      nextFloorMoveBonus: 0,
      floorThreat: { label: "Warm-Up", bossGain: 1, pressure: 0 },
      floorTheme: { id: "crystal_mines", title: "Crystal Mines", shortLabel: "Mines", bossName: "Mine Warden", eliteBossName: "Crystal Burrow Tyrant", pattern: "Glass / Obstacle / Pressure", intro: "Stable crystal tunnels with early board hazards." },
      selectedChapter: null,
      routePlan: { id: "main", title: "Main Path", floorsRemaining: 0, moveBonus: 0, movePenalty: 0, targetMulDelta: 0, pressureDelta: 0, dropBoost: 0, chainBonus: 0, shardBonus: 0 },
      gameOver: false,
      victory: false
    };
  }
  function seedStartingItems(state, { ITEM_BASE_LEVEL: ITEM_BASE_LEVEL2, ITEM_BASE_COUNTS: ITEM_BASE_COUNTS2 }) {
    for (const id of state.itemSlots) {
      state.itemLevels[id] = ITEM_BASE_LEVEL2;
      state.items[id] = ITEM_BASE_COUNTS2[id] || 1;
    }
  }
  var getItemCount = (state, id) => Number(state.items[id] || 0);
  var getItemLevel = (state, id) => Number(state.itemLevels[id] || 0);
  var hasItemType = (state, id) => state.itemSlots.includes(id);
  var getCarriedItems = (state, ITEM_DEFS2) => state.itemSlots.filter((id) => ITEM_DEFS2[id]);
  var itemSlotAvailable = (state, ITEM_DEFS2, MAX_ITEM_TYPES2) => getCarriedItems(state, ITEM_DEFS2).length < MAX_ITEM_TYPES2;
  function getItemFrames(id, ITEM_ANIM_FRAMES2, ITEM_DEFS2) {
    return ITEM_ANIM_FRAMES2[id] || [ITEM_DEFS2[id]?.image].filter(Boolean);
  }
  function getAnimatedItemImage(id, frameIndex, ITEM_ANIM_FRAMES2, ITEM_DEFS2) {
    const frames = getItemFrames(id, ITEM_ANIM_FRAMES2, ITEM_DEFS2);
    if (!frames.length) return ITEM_DEFS2[id]?.image || "";
    return frames[frameIndex % frames.length];
  }
  function getGemFrames(color, GEM_ANIM_FRAMES2, GEM_IMAGE_BY_COLOR2) {
    return GEM_ANIM_FRAMES2[color] || [GEM_IMAGE_BY_COLOR2[color] || GEM_IMAGE_BY_COLOR2[0]].filter(Boolean);
  }
  function getAnimatedGemImage(color, frameIndex, GEM_ANIM_FRAMES2, GEM_IMAGE_BY_COLOR2) {
    const frames = getGemFrames(color, GEM_ANIM_FRAMES2, GEM_IMAGE_BY_COLOR2);
    return frames[frameIndex % frames.length];
  }
  function getAnimatedBossImage(frameIndex, BOSS_ANIM_FRAMES2) {
    return BOSS_ANIM_FRAMES2[frameIndex % BOSS_ANIM_FRAMES2.length] || "./assets/generated/boss/boss_sigil.png";
  }
  function syncAnimatedVisuals({ root = document, frameIndex, getAnimatedItemImage: getAnimatedItemImage2, getAnimatedGemImage: getAnimatedGemImage2, getAnimatedBossImage: getAnimatedBossImage2 }) {
    const itemImages = root.querySelectorAll("[data-anim-item]");
    for (const img of itemImages) {
      const item = img.dataset.animItem;
      const next = getAnimatedItemImage2(item, frameIndex);
      if (next && img.getAttribute("src") !== next) img.setAttribute("src", next);
    }
    const gemImages = root.querySelectorAll("[data-anim-gem]");
    for (const img of gemImages) {
      const color = Number(img.dataset.animGem);
      const next = getAnimatedGemImage2(color, frameIndex);
      if (next && img.getAttribute("src") !== next) img.setAttribute("src", next);
    }
    const bossImages = root.querySelectorAll("[data-anim-boss]");
    for (const img of bossImages) {
      const next = getAnimatedBossImage2(frameIndex);
      if (next && img.getAttribute("src") !== next) img.setAttribute("src", next);
    }
  }
  function ensureItemType(state, id, { ITEM_BASE_LEVEL: ITEM_BASE_LEVEL2, ITEM_DEFS: ITEM_DEFS2, MAX_ITEM_TYPES: MAX_ITEM_TYPES2 }) {
    if (hasItemType(state, id)) return true;
    if (!itemSlotAvailable(state, ITEM_DEFS2, MAX_ITEM_TYPES2)) return false;
    state.itemSlots.push(id);
    state.itemLevels[id] = Math.max(ITEM_BASE_LEVEL2, getItemLevel(state, id));
    return true;
  }
  function addItemCharges(state, id, amount, allowNewType, deps) {
    if (!hasItemType(state, id)) {
      if (!allowNewType || !ensureItemType(state, id, deps)) return false;
      if (state.perks.vault_expander) amount += 1;
    }
    state.items[id] = getItemCount(state, id) + amount;
    if (state.itemLevels[id] <= 0) state.itemLevels[id] = deps.ITEM_BASE_LEVEL;
    return true;
  }
  function upgradeItem(state, id, levelGain, chargeGain, deps) {
    if (!hasItemType(state, id) && !ensureItemType(state, id, deps)) return false;
    state.itemLevels[id] = Math.max(deps.ITEM_BASE_LEVEL, getItemLevel(state, id) + levelGain);
    const bonusCharges = state.perks.quick_hands && deps.ITEM_DEFS[id].target ? 1 : 0;
    state.items[id] = getItemCount(state, id) + chargeGain + bonusCharges;
    return true;
  }
  function spendItemCharge(state, id) {
    state.items[id] = Math.max(0, getItemCount(state, id) - 1);
  }
  function boostAllItemLevels(state, ITEM_BASE_LEVEL2) {
    for (const id of state.itemSlots) {
      state.itemLevels[id] = Math.max(ITEM_BASE_LEVEL2, (state.itemLevels[id] || ITEM_BASE_LEVEL2) + 1);
      state.items[id] = Number(state.items[id] || 0) + 1;
    }
  }
  function grantDragonHoardBonus(state, ITEM_DEFS2, addItemChargesFn) {
    if (!state.perks.dragon_hoard) return;
    const carried = getCarriedItems(state, ITEM_DEFS2);
    if (carried.length === 0) return;
    carried.sort((a, b) => getItemLevel(state, b) - getItemLevel(state, a) || getItemCount(state, b) - getItemCount(state, a));
    addItemChargesFn(carried[0], 1, false);
  }
  function defaultCodex() {
    return {
      itemUse: { hammer: 0, row: 0, cross: 0, color: 0, shuffle: 0, screen_wipe: 0, rainbow_burst: 0, time_freeze: 0, boss_breaker: 0 },
      specialTrigger: { line_h: 0, line_v: 0, bomb: 0, rainbow: 0 },
      bossSeen: { glass_storm: 0, hex_lock: 0, color_shift: 0, rift_collapse: 0 },
      skillUse: { screen_wipe: 0, rainbow_burst: 0, time_freeze: 0, boss_breaker: 0 },
      maxSingleClear: 0,
      maxChain: 0,
      runs: 0,
      guideSeen: {}
    };
  }
  function defaultMetaProgression() {
    return {
      shards: 0,
      unlockedChapters: ["crystal_mines"],
      clearedChapters: {},
      upgrades: {
        veteran_boots: 0,
        ember_core: 0,
        relic_satchel: 0,
        boss_dampener: 0
      }
    };
  }
  function loadMeta(storage, META_KEY2) {
    try {
      const raw = storage.getItem(META_KEY2);
      if (!raw) return { bestFloor: 0, bestScore: 0, codex: defaultCodex(), progression: defaultMetaProgression() };
      const parsed = JSON.parse(raw);
      return {
        bestFloor: Number(parsed.bestFloor || 0),
        bestScore: Number(parsed.bestScore || 0),
        progression: {
          ...defaultMetaProgression(),
          ...parsed.progression || {},
          unlockedChapters: Array.isArray((parsed.progression || {}).unlockedChapters) && (parsed.progression || {}).unlockedChapters.length > 0 ? (parsed.progression || {}).unlockedChapters : defaultMetaProgression().unlockedChapters,
          clearedChapters: { ...defaultMetaProgression().clearedChapters, ...(parsed.progression || {}).clearedChapters || {} },
          upgrades: { ...defaultMetaProgression().upgrades, ...(parsed.progression || {}).upgrades || {} }
        },
        codex: {
          ...defaultCodex(),
          ...parsed.codex || {},
          itemUse: { ...defaultCodex().itemUse, ...(parsed.codex || {}).itemUse || {} },
          specialTrigger: { ...defaultCodex().specialTrigger, ...(parsed.codex || {}).specialTrigger || {} },
          bossSeen: { ...defaultCodex().bossSeen, ...(parsed.codex || {}).bossSeen || {} },
          skillUse: { ...defaultCodex().skillUse, ...(parsed.codex || {}).skillUse || {} },
          guideSeen: { ...defaultCodex().guideSeen, ...(parsed.codex || {}).guideSeen || {} }
        }
      };
    } catch {
      return { bestFloor: 0, bestScore: 0, codex: defaultCodex(), progression: defaultMetaProgression() };
    }
  }
  function saveMeta(storage, META_KEY2, meta) {
    storage.setItem(META_KEY2, JSON.stringify(meta));
  }
  function recordCodex(meta, group, key, delta = 1) {
    if (!meta.codex[group]) return;
    if (typeof meta.codex[group] === "object") meta.codex[group][key] = Number(meta.codex[group][key] || 0) + delta;
  }

  // src/core/board-core.js
  function createBoard(boardSize, randColor2) {
    const arr = Array(boardSize * boardSize).fill(null);
    for (let i = 0; i < arr.length; i += 1) arr[i] = { kind: "gem", color: randColor2(), special: null, glass: false, lockedTurns: 0 };
    return arr;
  }
  function resolveAutoBoard(state, findMatchGroups, isGem2, randColor2) {
    let safe = 0;
    while (true) {
      const groups = findMatchGroups();
      if (groups.length === 0) break;
      for (const g of groups) {
        for (const idx of g.indices) {
          if (isGem2(state.board[idx])) state.board[idx].color = randColor2();
        }
      }
      if (++safe > 80) break;
    }
  }
  function collapseBoard(state, boardSize, isGem2) {
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
        if (state.board[idx] !== next && next && isGem2(next)) moved.push(idx);
        state.board[idx] = next;
      }
    }
    return moved;
  }
  function refillBoard(state, randColor2) {
    const born = [];
    for (let i = 0; i < state.board.length; i += 1) {
      if (state.board[i] === null) {
        state.board[i] = { kind: "gem", color: randColor2(), special: null, glass: false, lockedTurns: 0 };
        born.push(i);
      }
    }
    return born;
  }
  var rowOf = (boardSize, i) => Math.floor(i / boardSize);
  var colOf = (boardSize, i) => i % boardSize;
  var inside = (boardSize, r, c) => r >= 0 && r < boardSize && c >= 0 && c < boardSize;
  var indicesInRow = (boardSize, r) => Array.from({ length: boardSize }, (_, x) => r * boardSize + x);
  var indicesInCol = (boardSize, c) => Array.from({ length: boardSize }, (_, y) => y * boardSize + c);
  function isAdjacent(boardSize, a, b) {
    return Math.abs(rowOf(boardSize, a) - rowOf(boardSize, b)) + Math.abs(colOf(boardSize, a) - colOf(boardSize, b)) === 1;
  }
  function swap(state, a, b) {
    const t = state.board[a];
    state.board[a] = state.board[b];
    state.board[b] = t;
  }
  var randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  var isGem = (c) => c && c.kind === "gem";
  var isObstacle = (c) => c && c.kind === "obstacle";

  // src/fx/board-fx.js
  async function playSwapAnimation(boardEl, a, b, sleep2) {
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
    await sleep2(145);
    cellA.style.transform = "";
    cellB.style.transform = "";
    await sleep2(20);
  }
  async function playItemCastAnimation({ itemWrapEl, boardEl, item, idx, imageSrc, itemName, sleep: sleep2 }) {
    const fromEl = itemWrapEl.querySelector(`.ability[data-item="${item}"]`);
    const toEl = boardEl.querySelector(`.cell[data-index="${idx}"]`);
    if (!fromEl || !toEl) return;
    const from = fromEl.getBoundingClientRect();
    const to = toEl.getBoundingClientRect();
    const fx = document.createElement("div");
    fx.className = `item-cast-fx item-${item}`;
    fx.innerHTML = `<img src="${imageSrc}" alt="${itemName}" class="item-cast-image" data-anim-item="${item}">`;
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
    await sleep2(240);
    fx.remove();
  }
  function spawnShatterFX({ indices, boardEl, state, isGem: isGem2, fxLayerEl, MAX_ACTIVE_SHARDS: MAX_ACTIVE_SHARDS2, activeShards, setActiveShards }) {
    const host = document.body;
    const capped = indices.slice(0, 16);
    const shardBudget = Math.max(0, MAX_ACTIVE_SHARDS2 - activeShards);
    if (shardBudget <= 0) return;
    let useBudget = shardBudget;
    for (const idx of capped) {
      if (useBudget <= 0) break;
      const cell = boardEl.querySelector(`.cell[data-index="${idx}"]`);
      if (!cell) continue;
      const rect = cell.getBoundingClientRect();
      const source = state.board[idx];
      const specialBoost = isGem2(source) && source.special ? 1.75 : 1;
      const pieces = Math.min(useBudget, Math.floor((18 + Math.random() * 12) * specialBoost));
      useBudget -= pieces;
      const burst = document.createElement("i");
      burst.className = "fx-burst";
      burst.style.left = `${rect.left + rect.width / 2}px`;
      burst.style.top = `${rect.top + rect.height / 2}px`;
      if (isGem2(source)) {
        const color = `var(--gem-color-${source.color}, #ffffff)`;
        burst.style.background = `radial-gradient(circle, rgba(255,255,255,0.98) 0%, ${color} 28%, rgba(255,255,255,0.14) 58%, rgba(255,255,255,0) 76%)`;
      }
      host.appendChild(burst);
      setTimeout(() => burst.remove(), 280);
      if (isGem2(source) && source.special) {
        const streakCount = source.special === "bomb" || source.special === "rainbow" ? 6 : 4;
        for (let s = 0; s < streakCount; s += 1) {
          const streak = document.createElement("i");
          streak.className = "fx-streak";
          streak.style.left = `${rect.left + rect.width / 2}px`;
          streak.style.top = `${rect.top + rect.height / 2}px`;
          const rot = `${360 / streakCount * s + (source.special === "line_h" ? 0 : source.special === "line_v" ? 90 : 30)}deg`;
          streak.style.setProperty("--streak-rot", rot);
          streak.style.background = `linear-gradient(90deg, rgba(255,255,255,0), var(--gem-color-${source.color}, #fff), rgba(255,255,255,0))`;
          host.appendChild(streak);
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
        p.style.background = isGem2(source) ? `var(--gem-color-${source.color}, #dce8ff)` : "#dce8ff";
        p.style.opacity = String(0.72 + Math.random() * 0.28);
        p.style.clipPath = Math.random() > 0.5 ? "polygon(50% 0%, 0% 100%, 100% 100%)" : "polygon(0% 0%, 100% 18%, 76% 100%, 14% 82%)";
        p.style.setProperty("--dx", `${dx}px`);
        p.style.setProperty("--dy", `${dy}px`);
        p.style.setProperty("--rot", rot);
        host.appendChild(p);
        setActiveShards(activeShards + 1);
        activeShards += 1;
        setTimeout(() => {
          p.remove();
          activeShards = Math.max(0, activeShards - 1);
          setActiveShards(activeShards);
        }, 620);
      }
    }
  }
  function spawnShockwaveFX({ boardEl, fxLayerEl, index, strong = false }) {
    const host = document.body;
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
      host.appendChild(wave);
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
      flash.style.borderRadius = "50%";
      flash.style.transform = "translate(-50%, -50%)";
      flash.style.background = "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0) 100%)";
      flash.style.animation = "waveExpand 240ms ease forwards";
      host.appendChild(flash);
      setTimeout(() => flash.remove(), 260);
    }
  }
  function spawnFloatText({ boardEl, fxLayerEl, text, index }) {
    const host = document.body;
    const cell = boardEl.querySelector(`.cell[data-index="${index}"]`);
    if (!cell) return;
    const r = cell.getBoundingClientRect();
    const el = document.createElement("i");
    el.className = "fx-text";
    el.textContent = text;
    el.style.left = `${r.left + r.width / 2}px`;
    el.style.top = `${r.top + r.height / 2}px`;
    host.appendChild(el);
    setTimeout(() => el.remove(), 540);
  }
  function spawnScreenPulse({ fxLayerEl, theme = "boss", duration = 420 }) {
    const host = document.body;
    const el = document.createElement("i");
    el.className = `fx-screen-pulse ${theme}`;
    host.appendChild(el);
    setTimeout(() => el.remove(), duration);
  }
  function shakeBoard(boardWrapEl, power = 1) {
    boardWrapEl.classList.remove("shake");
    boardWrapEl.style.setProperty("--shake-power", String(power));
    boardWrapEl.offsetWidth;
    boardWrapEl.classList.add("shake");
  }

  // src/bootstrap/dom.js
  function getDomRefs(doc = document) {
    return {
      appRootEl: doc.getElementById("appRoot"),
      chapterScreenEl: doc.getElementById("chapterScreen"),
      chapterShellEl: doc.getElementById("chapterShell"),
      chapterListEl: doc.getElementById("chapterList"),
      floorEl: doc.getElementById("floor"),
      modifierEl: doc.getElementById("modifier"),
      movesLeftEl: doc.getElementById("movesLeft"),
      floorScoreEl: doc.getElementById("floorScore"),
      scoreEl: doc.getElementById("score"),
      boardTargetScoreEl: doc.getElementById("boardTargetScore"),
      boardFloorScoreEl: doc.getElementById("boardFloorScore"),
      bestFloorEl: doc.getElementById("bestFloor"),
      bestScoreEl: doc.getElementById("bestScore"),
      momentumBarEl: doc.getElementById("momentumBar"),
      feverTurnsEl: doc.getElementById("feverTurns"),
      bossMeterEl: doc.getElementById("bossMeter"),
      bossBarEl: doc.getElementById("bossBar"),
      bossSkillHintEl: doc.getElementById("bossSkillHint"),
      bossPortraitEl: doc.getElementById("bossPortrait"),
      bossTitleEl: doc.getElementById("bossTitle"),
      bossStateEl: doc.getElementById("bossState"),
      bossThreatEl: doc.getElementById("bossThreat"),
      bossPatternEl: doc.getElementById("bossPattern"),
      modeTextEl: doc.getElementById("modeText"),
      boardWrapEl: doc.getElementById("boardWrap"),
      boardEl: doc.getElementById("board"),
      fxLayerEl: doc.getElementById("fxLayer"),
      itemTooltipEl: doc.getElementById("itemTooltip"),
      messageEl: doc.getElementById("message"),
      audioToggleBtn: doc.getElementById("audioToggleBtn"),
      restartBtn: doc.getElementById("restartBtn"),
      codexBtn: doc.getElementById("codexBtn"),
      guideBtn: doc.getElementById("guideBtn"),
      itemWrapEl: doc.getElementById("itemWrap"),
      perkWrapEl: doc.getElementById("perkWrap"),
      overlayEl: doc.getElementById("overlay"),
      overlayTitleEl: doc.getElementById("overlayTitle"),
      overlayDescEl: doc.getElementById("overlayDesc"),
      choiceWrapEl: doc.getElementById("choiceWrap"),
      overlayActionsEl: doc.getElementById("overlayActions"),
      codexModalEl: doc.getElementById("codexModal"),
      codexContentEl: doc.getElementById("codexContent"),
      codexCloseBtn: doc.getElementById("codexCloseBtn"),
      guideModalEl: doc.getElementById("guideModal"),
      guideModalTitleEl: doc.getElementById("guideModalTitle"),
      guideModalDescEl: doc.getElementById("guideModalDesc"),
      guideModalContentEl: doc.getElementById("guideModalContent"),
      guideCloseBtn: doc.getElementById("guideCloseBtn")
    };
  }
  function bindCoreEvents({
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
    closeGuideModal
  }) {
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

  // src/audio/audio-manager.js
  var DEFAULT_AUDIO_STATE = {
    muted: false
  };
  function createAudioManager({ storage = window.localStorage, storageKey = "rogue-match3-audio" } = {}) {
    const manifest = {
      bgm: { src: "./assets/audio/bgm_battle_loop.ogg", volume: 0.3, loop: true, kind: "music" },
      uiClick: { src: "./assets/audio/ui_click.ogg", volume: 0.42 },
      uiError: { src: "./assets/audio/ui_error_game.mp3", volume: 0.5 },
      gemTap: { src: "./assets/audio/gem_sfx/gem_clear_main.mp3", volume: 0.9 },
      swap: { src: "./assets/audio/swap.ogg", volume: 0.26 },
      matchClear: { src: "./assets/audio/match_clear.ogg", volume: 0.3 },
      matchClearHeavy: { src: "./assets/audio/skill_sfx/skill_hammer.ogg", volume: 0.28 },
      matchClearBurst: { src: "./assets/audio/skill_sfx/skill_pulse9.ogg", volume: 0.26 },
      
      gemClear1: { src: "./assets/audio/gem_sfx/gem_tap_main.mp3", volume: 0.1 },
      gemClear2: { src: "./assets/audio/gem_sfx/gem_tap_main.mp3", volume: 0.12 },
      gemClear3: { src: "./assets/audio/gem_sfx/gem_tap_main.mp3", volume: 0.14 },
      gemClear4: { src: "./assets/audio/gem_sfx/gem_tap_main.mp3", volume: 0.16 },
      gemClear5: { src: "./assets/audio/gem_sfx/gem_tap_main.mp3", volume: 0.18 },
      gemClear6: { src: "./assets/audio/gem_sfx/gem_tap_main.mp3", volume: 0.2 },
      gemClear7: { src: "./assets/audio/gem_sfx/gem_tap_main.mp3", volume: 0.22 },
      comboRise: { src: "./assets/audio/skill_sfx/skill_color.ogg", volume: 0.2 },
      rewardPick: { src: "./assets/audio/reward_pick.ogg", volume: 0.48 },
      victory: { src: "./assets/audio/victory.ogg", volume: 0.52 },
      defeat: { src: "./assets/audio/defeat.ogg", volume: 0.42 },
      fever: { src: "./assets/audio/fever.ogg", volume: 0.5 },
      itemCast: { src: "./assets/audio/item_cast.ogg", volume: 0.42 },
      itemGain: { src: "./assets/audio/item_gain.ogg", volume: 0.36 },
      bossCast: { src: "./assets/audio/boss_cast.ogg", volume: 0.4 },
      enemyFireCast: { src: "./assets/audio/enemy_layers/enemy_fire_cast.ogg", volume: 0.34 },
      enemyIceCast: { src: "./assets/audio/enemy_layers/enemy_ice_cast.ogg", volume: 0.3 },
      enemyArcaneCast: { src: "./assets/audio/enemy_layers/enemy_arcane_cast.ogg", volume: 0.3 },
      enemyLightningCast: { src: "./assets/audio/enemy_layers/enemy_lightning_cast.ogg", volume: 0.34 },
      enemyPoisonCast: { src: "./assets/audio/enemy_layers/enemy_poison_cast.ogg", volume: 0.32 },
      enemyStoneCast: { src: "./assets/audio/enemy_layers/enemy_stone_cast.ogg", volume: 0.34 },
      enemyWaterCast: { src: "./assets/audio/enemy_layers/enemy_water_cast.ogg", volume: 0.3 },
      enemyBossVoice: { src: "./assets/audio/enemy_layers/enemy_boss_voice.ogg", volume: 0.3 },
      enemyMinionVoice: { src: "./assets/audio/enemy_layers/enemy_minion_voice.ogg", volume: 0.22 },
      enemyBossRoar: { src: "./assets/audio/enemy_layers/enemy_boss_roar.wav", volume: 0.38 },
      floorStart: { src: "./assets/audio/floor_start.ogg", volume: 0.28 },
      skillHammer: { src: "./assets/audio/skill_sfx/skill_hammer.ogg", volume: 0.34 },
      skillRow: { src: "./assets/audio/skill_sfx/skill_row.wav", volume: 0.34 },
      skillCross: { src: "./assets/audio/skill_sfx/skill_cross.wav", volume: 0.36 },
      skillColor: { src: "./assets/audio/skill_sfx/skill_color.ogg", volume: 0.32 },
      skillShuffle: { src: "./assets/audio/skill_sfx/skill_shuffle.ogg", volume: 0.34 },
      skillPulse9: { src: "./assets/audio/skill_sfx/skill_pulse9.ogg", volume: 0.38 },
      skillRainbow: { src: "./assets/audio/skill_sfx/skill_rainbow.wav", volume: 0.34 },
      skillOverclock: { src: "./assets/audio/skill_sfx/skill_overclock.ogg", volume: 0.32 },
      skillExecute: { src: "./assets/audio/skill_sfx/skill_execute.ogg", volume: 0.4 },
      condChainMatrix: { src: "./assets/audio/skill_sfx/cond_chain_matrix.ogg", volume: 0.28 },
      condFeverEngine: { src: "./assets/audio/skill_sfx/cond_fever_engine.wav", volume: 0.28 },
      condPurifier: { src: "./assets/audio/skill_sfx/cond_purifier.ogg", volume: 0.26 },
      condBossShunt: { src: "./assets/audio/skill_sfx/cond_boss_shunt.ogg", volume: 0.24 },
      enemyMinionCast: { src: "./assets/audio/skill_sfx/enemy_minion_cast.ogg", volume: 0.3 },
      enemyBossCast: { src: "./assets/audio/skill_sfx/enemy_boss_cast.ogg", volume: 0.34 },
      enemyUltimateCast: { src: "./assets/audio/skill_sfx/enemy_ultimate_cast.ogg", volume: 0.4 },
    };
    let toggleButton = null;
    let unlocked = false;
    let musicStarted = false;
    let musicEl = null;
    const state = loadState();
    function loadState() {
      try {
        const parsed = JSON.parse(storage.getItem(storageKey) || "null");
        return { ...DEFAULT_AUDIO_STATE, ...parsed || {} };
      } catch {
        return { ...DEFAULT_AUDIO_STATE };
      }
    }
    function saveState() {
      try {
        storage.setItem(storageKey, JSON.stringify(state));
      } catch {
      }
    }
    function ensureMusic() {
      if (musicEl) return musicEl;
      const cfg = manifest.bgm;
      musicEl = new Audio(cfg.src);
      musicEl.loop = true;
      musicEl.preload = "auto";
      musicEl.volume = cfg.volume;
      musicEl.muted = state.muted;
      return musicEl;
    }
    function syncToggleButton() {
      if (!toggleButton) return;
      toggleButton.textContent = state.muted ? "\u{1F507} Muted" : "\u{1F50A} Audio";
      toggleButton.setAttribute("aria-pressed", state.muted ? "false" : "true");
      toggleButton.dataset.muted = state.muted ? "true" : "false";
    }
    async function unlock() {
      if (unlocked) return true;
      unlocked = true;
      try {
        const audio = ensureMusic();
        audio.muted = true;
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
        audio.muted = state.muted;
      } catch {
      }
      return true;
    }
    async function startMusic() {
      if (state.muted) return false;
      const audio = ensureMusic();
      audio.muted = false;
      if (musicStarted && !audio.paused) return true;
      musicStarted = true;
      try {
        await audio.play();
        return true;
      } catch {
        musicStarted = false;
        return false;
      }
    }
    function stopMusic() {
      if (!musicEl) return;
      musicEl.pause();
      musicStarted = false;
    }
    async function toggleMute(forceMuted = !state.muted) {
      state.muted = Boolean(forceMuted);
      saveState();
      if (musicEl) musicEl.muted = state.muted;
      syncToggleButton();
      if (state.muted) {
        stopMusic();
        return;
      }
      await unlock();
      await startMusic();
      play("uiClick", { allowWhenMuted: false, volume: 0.34 });
    }
    function bindToggle(button) {
      toggleButton = button;
      if (!toggleButton) return;
      syncToggleButton();
      toggleButton.addEventListener("click", async () => {
        await toggleMute();
      });
    }
    function installAutoUnlock(doc = document) {
      const unlockAndStart = async () => {
        await unlock();
        if (!state.muted) await startMusic();
      };
      doc.addEventListener("pointerdown", unlockAndStart, { passive: true });
      doc.addEventListener("keydown", unlockAndStart, { passive: true });
    }
    function play(name, options = {}) {
      const cfg = manifest[name];
      if (!cfg) return null;
      if (state.muted && !options.allowWhenMuted) return null;
      if (cfg.kind === "music") return startMusic();
      const audio = new Audio(cfg.src);
      audio.preload = "auto";
      audio.volume = Math.max(0, Math.min(1, options.volume ?? cfg.volume ?? 0.4));
      audio.playbackRate = Math.max(0.65, Math.min(1.5, options.rate ?? 1));
      audio.currentTime = 0;
      audio.play().catch(() => {
      });
      return audio;
    }
    return {
      bindToggle,
      installAutoUnlock,
      unlock,
      play,
      startMusic,
      stopMusic,
      toggleMute,
      isMuted: () => state.muted,
      syncToggleButton
    };
  }

  // game.js
  (() => {
    const MODIFIERS = [
      { id: "glass", name: "Glass", desc: "Start with extra glass layers", apply: (s) => s.modGlass = 8 },
      { id: "heavy", name: "Heavy", desc: "Lose 2 moves, gain stronger chains", apply: (s) => {
        s.movesLeft = Math.max(8, s.movesLeft - 2);
        s.chainBonus += 0.2;
      } },
      { id: "color_tax", name: "Color Tax", desc: "One color scores less", apply: (s) => {
        s.taxColor = randColor2();
      } },
      { id: "lucky", name: "Lucky Drop", desc: "Item drop chance is higher", apply: (s) => {
        s.dropBoost += 0.12;
      } },
      { id: "frost_seal", name: "Frost Seal", desc: "Several gems begin locked", apply: (s) => {
        s.modLocks = 4;
      } },
      { id: "stormfront", name: "Stormfront", desc: "Builds momentum faster but trims one move", apply: (s) => {
        s.movesLeft = Math.max(8, s.movesLeft - 1);
        s.chainBonus += 0.12;
        s.dropBoost += 0.04;
      } },
      { id: "rich_vein", name: "Rich Vein", desc: "Gain score and extra tool density on this floor", apply: (s) => {
        s.floorScore += 80;
        s.dropBoost += 0.08;
      } }
    ];
    const PERK_DEFS = {
      combo_forge: { title: "Combo Forge", desc: "4-matches can upgrade into bomb gems", rarity: "common", apply: (s) => {
        s.perks.combo_forge = true;
      } },
      fever_loop: { title: "Fever Loop", desc: "Fever lasts +1 turn", rarity: "common", apply: (s) => {
        s.perks.fever_loop = true;
      } },
      relic_magnet: { title: "Relic Magnet", desc: "Item drop chance is higher", rarity: "common", apply: (s) => {
        s.perks.relic_magnet = true;
      } },
      glass_breaker: { title: "Glass Breaker", desc: "Breaking glass grants bonus points", rarity: "common", apply: (s) => {
        s.perks.glass_breaker = true;
      } },
      overcharge: { title: "Overcharge", desc: "Each floor begins with bonus momentum", rarity: "common", apply: (s) => {
        s.perks.overcharge = true;
      } },
      pressure_valve: { title: "Pressure Valve", desc: "Boss pressure removes fewer moves", rarity: "common", apply: (s) => {
        s.perks.pressure_valve = true;
      } },
      blast_core: { title: "Blast Core", desc: "Specials and blasts score more", rarity: "rare", apply: (s) => {
        s.perks.blast_core = true;
      } },
      score_bloom: { title: "Score Bloom", desc: "Every gem cleared grants bonus score", rarity: "rare", apply: (s) => {
        s.perks.score_bloom = true;
      } },
      quick_hands: { title: "Quick Hands", desc: "Target items gain bonus charge when upgraded", rarity: "rare", apply: (s) => {
        s.perks.quick_hands = true;
      } },
      fever_smith: { title: "Fever Smith", desc: "Legend skills grant extra momentum", rarity: "rare", apply: (s) => {
        s.perks.fever_smith = true;
      } },
      arcane_stockpile: { title: "Arcane Stockpile", desc: "Item drops can include legendary skills", rarity: "epic", apply: (s) => {
        s.perks.arcane_stockpile = true;
      } },
      boss_hunter: { title: "Boss Hunter", desc: "Damage the boss charge more whenever you use a legend skill", rarity: "epic", apply: (s) => {
        s.perks.boss_hunter = true;
      } },
      vault_expander: { title: "Vault Expander", desc: "New item types arrive with bonus charges", rarity: "epic", apply: (s) => {
        s.perks.vault_expander = true;
      } },
      prism_heart: { title: "Prism Heart", desc: "Rainbow gems score more and spawn more often", rarity: "epic", apply: (s) => {
        s.perks.prism_heart = true;
      } },
      sovereign_circuit: { title: "Sovereign Circuit", desc: "All equipped items gain +1 level instantly", rarity: "legendary", apply: (s) => {
        s.perks.sovereign_circuit = true;
        boostAllItemLevels(s);
      } },
      dragon_hoard: { title: "Dragon Hoard", desc: "Your highest-level item gains charges every floor", rarity: "legendary", apply: (s) => {
        s.perks.dragon_hoard = true;
      } }
    };
    const {
      appRootEl,
      chapterScreenEl,
      chapterShellEl,
      chapterListEl,
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
      bossPortraitEl,
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
      audioToggleBtn,
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
      guideCloseBtn
    } = getDomRefs(document);
    let meta = loadMeta2();
    let state = createInitialState2();
    let selected = null;
    let inputLocked = false;
    let clearAnim = /* @__PURE__ */ new Set();
    let fallAnim = /* @__PURE__ */ new Set();
    let activeShards = 0;
    let boardSize = MIN_BOARD_SIZE;
    let guideQueue = [];
    let guideActive = false;
    let itemAnimFrameIndex = 0;
    let itemAnimTimer = null;
    const audio = createAudioManager();
    bindEvents();
    startItemIconAnimation();
    startRun();
    function createInitialState2() {
      const initial = createInitialState({ MIN_BOARD_SIZE, ITEM_ORDER });
      seedStartingItems(initial, { ITEM_BASE_LEVEL, ITEM_BASE_COUNTS });
      return initial;
    }
    function getItemCount2(id) {
      return getItemCount(state, id);
    }
    function getItemLevel2(id) {
      return getItemLevel(state, id);
    }
    function getAnimatedItemImage2(id, frameIndex = itemAnimFrameIndex) {
      return getAnimatedItemImage(id, frameIndex, ITEM_ANIM_FRAMES, ITEM_DEFS);
    }
    function getAnimatedGemImage2(color, frameIndex = itemAnimFrameIndex) {
      return getAnimatedGemImage(color, frameIndex, GEM_ANIM_FRAMES, GEM_IMAGE_BY_COLOR);
    }
    function getAnimatedBossImage2(frameIndex = itemAnimFrameIndex) {
      return getAnimatedBossImage(frameIndex, BOSS_ANIM_FRAMES);
    }
    function syncAnimatedItemImages(root = document) {
      syncAnimatedVisuals({ root, frameIndex: itemAnimFrameIndex, getAnimatedItemImage: getAnimatedItemImage2, getAnimatedGemImage: getAnimatedGemImage2, getAnimatedBossImage: getAnimatedBossImage2 });
    }
    function startItemIconAnimation() {
      if (itemAnimTimer) clearInterval(itemAnimTimer);
      itemAnimTimer = setInterval(() => {
        itemAnimFrameIndex = (itemAnimFrameIndex + 1) % 8;
        syncAnimatedItemImages(document);
      }, 145);
    }
    function hasItemType2(id) {
      return hasItemType(state, id);
    }
    function itemPower(id) {
      return Math.max(1, getItemLevel2(id) || 1);
    }
    function getCarriedItems2() {
      return getCarriedItems(state, ITEM_DEFS);
    }
    function itemSlotAvailable2() {
      return itemSlotAvailable(state, ITEM_DEFS, MAX_ITEM_TYPES);
    }
    function ensureItemType2(id) {
      return ensureItemType(state, id, { ITEM_BASE_LEVEL, ITEM_DEFS, MAX_ITEM_TYPES });
    }
    function addItemCharges2(id, amount = 1, allowNewType = true) {
      return addItemCharges(state, id, amount, allowNewType, { ITEM_BASE_LEVEL, ITEM_DEFS, MAX_ITEM_TYPES });
    }
    function upgradeItem2(id, levelGain = 1, chargeGain = 1) {
      return upgradeItem(state, id, levelGain, chargeGain, { ITEM_BASE_LEVEL, ITEM_DEFS, MAX_ITEM_TYPES });
    }
    function spendItemCharge2(id) {
      spendItemCharge(state, id);
    }
    function grantDragonHoardBonus2() {
      grantDragonHoardBonus(state, ITEM_DEFS, (id, amount, allowNewType) => addItemCharges2(id, amount, allowNewType));
    }
    function loadMeta2() {
      return loadMeta(localStorage, META_KEY);
    }
    function saveMeta2() {
      saveMeta(localStorage, META_KEY, meta);
    }
    function recordCodex2(group, key, delta = 1) {
      recordCodex(meta, group, key, delta);
      saveMeta2();
    }
    function bindEvents() {
      audio.bindToggle(audioToggleBtn);
      audio.installAutoUnlock(document);
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
        closeGuideModal
      });
    }
    function openCodex() {
      renderCodex();
      audio.play("uiClick");
      codexModalEl.classList.remove("hidden");
    }
    function openGuidePanel(entryId = null) {
      renderGuideList(entryId);
      guideModalTitleEl.textContent = entryId && GUIDE_DEFS[entryId] ? GUIDE_DEFS[entryId].title : "Tile Guide";
      guideModalDescEl.textContent = entryId && GUIDE_DEFS[entryId] ? "This tile type has appeared for the first time in your current run." : "Every tile type, board condition, and special gem is listed here.";
      audio.play("uiClick");
      guideModalEl.classList.remove("hidden");
    }
    function closeGuideModal() {
      audio.play("uiClick", { volume: 0.3 });
      guideModalEl.classList.add("hidden");
      guideActive = false;
      maybeShowNextGuide();
    }
    function renderGuideList(highlightId = null) {
      const entries = Object.entries(GUIDE_DEFS);
      guideModalContentEl.innerHTML = "";
      for (const [id, def] of entries) {
        const detail = createGuideEntry(id, def, highlightId === id, true);
        detail.addEventListener("click", () => {
        });
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
      icon.src = getAnimatedGemImage2(preview.color ?? 0);
      gem.appendChild(icon);
      frame.appendChild(gem);
      return frame;
    }
    function queueGuideIfNew(id) {
      if (!GUIDE_DEFS[id]) return;
      if (meta.codex.guideSeen[id]) return;
      meta.codex.guideSeen[id] = 1;
      saveMeta2();
      guideQueue.push(id);
    }
    function scanGuideDiscoveries() {
      let hasGlass = false;
      let hasLocked = false;
      let hasObstacle = false;
      const specials = /* @__PURE__ */ new Set();
      for (const cell of state.board) {
        if (isObstacle2(cell)) hasObstacle = true;
        if (!isGem2(cell)) continue;
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
          if (btn.dataset.action === "chapter-select") showChapterSelect();
          if (btn.dataset.action === "next-chapter") startNextChapter();
        });
      }
    }
    function renderCodex() {
      const c = meta.codex;
      const p = meta.progression;
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
        ["Best Single Clear", c.maxSingleClear]
      ];
      for (const [k, v] of rows) {
        const div = document.createElement("div");
        div.className = "row";
        div.innerHTML = `<span>${k}</span><strong>${v}</strong>`;
        codexContentEl.appendChild(div);
      }
      const progression = document.createElement("div");
      progression.className = "codex-progression";
      progression.innerHTML = `<div class="row"><span>Rift Shards</span><strong>${p.shards}</strong></div><h4>Permanent Upgrades</h4>`;
      const upgrades = [
        { id: "veteran_boots", title: "Veteran Boots", desc: "+1 start move per rank", max: 3, cost: (lvl) => 4 + lvl * 3 },
        { id: "ember_core", title: "Ember Core", desc: "+12 start momentum per rank", max: 3, cost: (lvl) => 5 + lvl * 4 },
        { id: "relic_satchel", title: "Relic Satchel", desc: "Starting Hammer and Shuffle gain +1 charge per rank", max: 2, cost: (lvl) => 6 + lvl * 5 },
        { id: "boss_dampener", title: "Boss Dampener", desc: "Reduce boss charge gain by 1 on early floors", max: 2, cost: (lvl) => 8 + lvl * 6 }
      ];
      for (const up of upgrades) {
        const level = Number(p.upgrades[up.id] || 0);
        const canBuy = level < up.max;
        const cost = up.cost(level);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice codex-upgrade";
        btn.disabled = !canBuy || p.shards < cost;
        btn.innerHTML = `<strong>${up.title} Lv.${level}/${up.max}</strong><small>${up.desc}</small><small>Cost: ${canBuy ? cost : "MAX"} shards</small>`;
        btn.addEventListener("click", () => {
          if (!canBuy || meta.progression.shards < cost) return;
          meta.progression.shards -= cost;
          meta.progression.upgrades[up.id] = level + 1;
          saveMeta2();
          renderCodex();
        });
        progression.appendChild(btn);
      }
      codexContentEl.appendChild(progression);
    }
    function startRun() {
      state = createInitialState2();
      selected = null;
      inputLocked = false;
      clearAnim = /* @__PURE__ */ new Set();
      fallAnim = /* @__PURE__ */ new Set();
      guideQueue = [];
      guideActive = false;
      overlayEl.classList.add("hidden");
      codexModalEl.classList.add("hidden");
      guideModalEl.classList.add("hidden");
      meta.codex.runs += 1;
      saveMeta2();
      showChapterSelect();
      audio.startMusic();
      notify("Choose a chapter to begin the run.", "ok");
    }
    function openChapterScreen() {
      if (appRootEl) appRootEl.classList.add("hidden");
      if (chapterScreenEl) chapterScreenEl.classList.remove("hidden");
    }
    function closeChapterScreen() {
      if (chapterScreenEl) chapterScreenEl.classList.add("hidden");
      if (appRootEl) appRootEl.classList.remove("hidden");
    }
    function getChapterLocalFloor() {
      if (!state.selectedChapter) return state.floor;
      return state.floor - state.selectedChapter.start + 1;
    }
    function showChapterSelect() {
      openChapterScreen();
      overlayEl.classList.add("hidden");
      chapterListEl.innerHTML = "";
      const unlocked = new Set(meta.progression.unlockedChapters || ["crystal_mines"]);
      if (chapterScreenEl) chapterScreenEl.style.setProperty("--chapter-preview-image", `url("${CHAPTER_THEMES[0].chapterPreviewImage}")`);
      for (const chapter of CHAPTER_THEMES) {
        const btn = document.createElement("button");
        const isUnlocked = unlocked.has(chapter.id);
        const isCleared = Boolean(meta.progression.clearedChapters?.[chapter.id]);
        btn.className = `chapter-card${isUnlocked ? "" : " locked"}`;
        btn.disabled = !isUnlocked;
        btn.innerHTML = `<span class="tag">${isUnlocked ? isCleared ? "Cleared" : "Unlocked" : "Locked"}</span><strong>${chapter.title}</strong><small>${chapter.intro}<br>Boss: ${chapter.bossName}<br>Pattern: ${chapter.pattern}</small>`;
        btn.addEventListener("mouseenter", () => {
          if (chapterScreenEl) chapterScreenEl.style.setProperty("--chapter-preview-image", `url("${chapter.chapterPreviewImage}")`);
        });
        btn.addEventListener("focus", () => {
          if (chapterScreenEl) chapterScreenEl.style.setProperty("--chapter-preview-image", `url("${chapter.chapterPreviewImage}")`);
        });
        btn.addEventListener("click", () => {
          if (!isUnlocked) return;
          audio.play("uiClick");
          state.selectedChapter = chapter;
          state.floorTheme = chapter;
          state.routePlan = { id: "main", title: "Main Path", floorsRemaining: 0, moveBonus: 0, movePenalty: 0, targetMulDelta: 0, pressureDelta: 0, dropBoost: 0, chainBonus: 0, shardBonus: 0 };
          closeChapterScreen();
          showChapterBlessings(true);
        });
        chapterListEl.appendChild(btn);
      }
    }
    function startFloor(floor) {
      state.floor = floor;
      const chapter = state.selectedChapter || CHAPTER_THEMES[0];
      if (state.floor > chapter.end) return onVictory();
      const previousColorCount = state.activeGemColors?.length || 4;
      const cfg = FLOOR_CONFIG[state.floor - 1];
      const threat = getFloorThreat(state.floor);
      const theme = getFloorTheme(state.floor);
      const route = state.routePlan || { id: "main", title: "Main Path", floorsRemaining: 0, moveBonus: 0, movePenalty: 0, targetMulDelta: 0, pressureDelta: 0, dropBoost: 0, chainBonus: 0, shardBonus: 0 };
      boardSize = getBoardSizeForFloor(state.floor);
      state.boardSize = boardSize;
      state.activeGemColors = getGemPoolForFloor(state.floor);
      state.floorThreat = { label: threat.label, bossGain: threat.bossGain, pressure: threat.pressure };
      state.floorTheme = theme;
      applyThemeVisuals(theme);
      const unlockedNewColor = state.activeGemColors.length > previousColorCount;
      state.targetScore = Math.floor(cfg.target * (threat.targetMul + route.targetMulDelta));
      state.movesLeft = Math.max(8, cfg.moves + threat.movesDelta);
      state.floorScore = 0;
      state.mode = { type: "normal", item: null };
      state.modifier = randomPick2(MODIFIERS);
      state.modGlass = 0;
      state.modLocks = 0;
      state.taxColor = null;
      state.dropBoost = 0;
      state.chainBonus = 0;
      selected = null;
      if (route.floorsRemaining > 0) {
        state.movesLeft += route.moveBonus;
        state.movesLeft = Math.max(7, state.movesLeft - route.movePenalty);
        state.dropBoost += route.dropBoost;
        state.chainBonus += route.chainBonus;
        state.floorThreat.pressure += route.pressureDelta;
        route.floorsRemaining -= 1;
        if (route.floorsRemaining <= 0) {
          state.routePlan = { id: "main", title: "Main Path", floorsRemaining: 0, moveBonus: 0, movePenalty: 0, targetMulDelta: 0, pressureDelta: 0, dropBoost: 0, chainBonus: 0, shardBonus: 0 };
        }
      }
      if (state.nextFloorMovePenalty > 0) {
        state.movesLeft = Math.max(7, state.movesLeft - state.nextFloorMovePenalty);
        state.nextFloorMovePenalty = 0;
      }
      if (state.nextFloorMoveBonus > 0) {
        state.movesLeft += state.nextFloorMoveBonus;
        state.nextFloorMoveBonus = 0;
      }
      state.movesLeft += Number(meta.progression.upgrades.veteran_boots || 0);
      if (state.perks.overcharge) {
        state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 28);
      }
      state.momentum = Math.min(MOMENTUM_MAX, state.momentum + Number(meta.progression.upgrades.ember_core || 0) * 12);
      if (state.blessings.tactical_reserve) state.movesLeft += 1;
      if (state.blessings.chain_matrix) state.chainBonus += 0.15;
      if (state.blessings.supply_cache) refillCarriedCharges();
      if (unlockedNewColor) {
        state.movesLeft += 1;
        state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 18);
      }
      grantDragonHoardBonus2();
      const satchelBonus = Number(meta.progression.upgrades.relic_satchel || 0);
      if (satchelBonus > 0) {
        addItemCharges2("hammer", satchelBonus, false);
        addItemCharges2("shuffle", satchelBonus, false);
      }
      state.board = createBoard2();
      resolveAutoBoard2();
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
      audio.play("floorStart");
      if (unlockedNewColor) {
        const newest = state.activeGemColors[state.activeGemColors.length - 1];
        notify(`New gem unlocked: ${GEM_COLOR_NAMES[newest]}. +1 move and +18 momentum to ease the transition.`, "ok");
      }
      notify(`Floor ${state.floor} begins: ${theme.title} / ${state.routePlan.title} / ${state.modifier.name} / ${threat.label}.`, "ok");
      scanGuideDiscoveries();
    }
    function getFloorThreat(floor) {
      return FLOOR_DIFFICULTY[Math.max(0, Math.min(FLOOR_DIFFICULTY.length - 1, floor - 1))];
    }
    function getFloorTheme(floor) {
      return CHAPTER_THEMES.find((theme) => floor >= theme.start && floor <= theme.end) || CHAPTER_THEMES[0];
    }
    function applyThemeVisuals(theme) {
      document.body.dataset.theme = theme.id;
      document.documentElement.style.setProperty("--bg-board-image", `url("${theme.boardImage}")`);
      document.documentElement.style.setProperty("--obstacle-image", `url("${theme.obstacleImage}")`);
      document.documentElement.style.setProperty("--chapter-gem-filter", theme.gemTone || "none");
      if (bossPortraitEl) bossPortraitEl.src = theme.bossPortrait;
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
      fx.innerHTML = `<strong>${state.floorTheme.title} \xB7 Floor ${state.floor}</strong><small>${threat.label} - ${state.modifier.name} \xB7 ${state.activeGemColors.length} colors</small>`;
      fxLayerEl.appendChild(fx);
      spawnScreenPulse2("floor", 620);
      shakeBoard2(1.08);
      setTimeout(() => fx.remove(), 760);
    }
    function placeObstacles(count) {
      const idxs = collectIndices((c) => c && c.kind === "gem");
      shuffle2(idxs);
      for (let i = 0; i < Math.min(count, idxs.length); i += 1) state.board[idxs[i]] = { kind: "obstacle" };
    }
    function placeGlass(count) {
      const idxs = collectIndices((c) => c && c.kind === "gem");
      shuffle2(idxs);
      for (let i = 0; i < Math.min(count, idxs.length); i += 1) state.board[idxs[i]].glass = true;
    }
    function placeLocks(count) {
      const idxs = collectIndices((c) => c && c.kind === "gem" && c.lockedTurns <= 0);
      shuffle2(idxs);
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
        if (state.taxColor == null) state.taxColor = randColor2();
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
      if (!item || getItemCount2(item) <= 0 || !hasItemType2(item)) return;
      audio.play("uiClick", { volume: 0.34 });
      if (!ITEM_DEFS[item].target) {
        inputLocked = true;
        spendItemCharge2(item);
        recordCodex2("itemUse", item);
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
      itemTooltipEl.innerHTML = `<strong>${ITEM_DEFS[item].name} Lv.${getItemLevel2(item)}</strong><small>${ITEM_DEFS[item].desc}</small>`;
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
      if (!isAdjacent2(a, b)) {
        selected = b;
        return renderBoard();
      }
      await attemptSwap(a, b);
    }
    async function attemptSwap(a, b) {
      const ca = state.board[a];
      const cb = state.board[b];
      if (!isGem2(ca) || !isGem2(cb)) {
        audio.play("uiError");
        return notify("Obstacle tiles cannot be swapped.", "warn");
      }
      if (ca.lockedTurns > 0 || cb.lockedTurns > 0) {
        audio.play("uiError");
        return notify("A locked gem cannot be swapped.", "warn");
      }
      inputLocked = true;
      audio.play("swap");
      await playSwapAnimation2(a, b);
      if (ca.special && cb.special) {
        swap2(a, b);
        consumeMove();
        const comboTargets = specialComboTargets(a, b, ca.special, cb.special);
        await resolveAction(comboTargets, "combo");
        await consumePostAction();
        return inputLocked = false;
      }
      swap2(a, b);
      const analysis = analyzeMatches();
      if (analysis.clear.length === 0) {
        swap2(a, b);
        await playSwapAnimation2(a, b);
        inputLocked = false;
        renderAll();
        audio.play("uiError", { volume: 0.34 });
        return notify("Invalid swap: no match formed.", "warn");
      }
      consumeMove();
      await resolveAction(analysis.clear, "normal", analysis.spawnMap, b);
      await consumePostAction();
      inputLocked = false;
    }
    async function useTargetItem(item, idx) {
      if (getItemCount2(item) <= 0) return;
      const targets = getItemTargets(item, idx);
      if (targets.length === 0) {
        audio.play("uiError");
        return notify("That item cannot be used there.", "warn");
      }
      inputLocked = true;
      audio.play("itemCast");
      spendItemCharge2(item);
      state.mode = { type: "normal", item: null };
      recordCodex2("itemUse", item);
      await playItemCastAnimation2(item, idx);
      await resolveAction(targets, item);
      await consumePostAction();
      inputLocked = false;
    }
    function getItemTargets(item, idx) {
      const r = rowOf2(idx);
      const c = colOf2(idx);
      if (item === "hammer") {
        const power = itemPower(item);
        if (power <= 1) return [idx];
        const arr = [idx];
        for (let rr = r - 1; rr <= r + 1; rr += 1) for (let cc = c - 1; cc <= c + 1; cc += 1) if (inside2(rr, cc)) arr.push(rr * boardSize + cc);
        return [...new Set(arr)];
      }
      if (item === "row") {
        const rows = [r];
        if (itemPower(item) >= 2 && inside2(r - 1, c)) rows.push(r - 1);
        if (itemPower(item) >= 3 && inside2(r + 1, c)) rows.push(r + 1);
        return [...new Set(rows.flatMap((row) => indicesInRow2(row)))];
      }
      if (item === "cross") {
        const arr = [...indicesInRow2(r), ...indicesInCol2(c)];
        if (itemPower(item) >= 3) {
          if (inside2(r - 1, c)) arr.push(...indicesInRow2(r - 1));
          if (inside2(r + 1, c)) arr.push(...indicesInRow2(r + 1));
        }
        return [...new Set(arr)];
      }
      if (item === "color") {
        const cell = state.board[idx];
        if (!isGem2(cell)) return [];
        if (cell.lockedTurns > 0) return [];
        const targets = collectIndices((x) => isGem2(x) && x.color === cell.color);
        if (itemPower(item) >= 3) {
          const bonusColor = nextGemColor(cell.color);
          targets.push(...collectIndices((x) => isGem2(x) && x.color === bonusColor));
        }
        return [...new Set(targets)];
      }
      return [];
    }
    async function useShuffle() {
      audio.play("itemCast", { volume: 0.34, rate: 0.95 });
      const power = itemPower("shuffle");
      const gems = collectIndices(isGem2).map((i) => state.board[i]);
      shuffle2(gems);
      let k = 0;
      for (let i = 0; i < state.board.length; i += 1) {
        if (isGem2(state.board[i])) {
          state.board[i] = gems[k++];
          fallAnim.add(i);
        }
      }
      renderAll();
      await sleep2(220);
      fallAnim.clear();
      resolveAutoBoard2();
      if (power >= 2) state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 10 + power * 2);
      if (power >= 3) {
        for (let i = 0; i < state.board.length; i += 1) if (isGem2(state.board[i])) state.board[i].lockedTurns = 0;
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
        const targets = collectIndices((x) => isGem2(x) || itemPower(skill) >= 2 && isObstacle2(x));
        recordCodex2("skillUse", "screen_wipe");
        applyLegendBossPressure();
        meta.codex.maxSingleClear = Math.max(meta.codex.maxSingleClear, targets.length);
        saveMeta2();
        await resolveAction(targets, "legend");
        await consumePostAction();
        inputLocked = false;
        return;
      }
      if (skill === "rainbow_burst") {
        await playSkillShowcase("Rainbow Burst", "rainbow");
        const first = randColor2();
        let second = randColor2();
        if (second === first) second = nextGemColor(first);
        const targets = collectIndices((x) => isGem2(x) && (x.color === first || x.color === second));
        const extra = collectIndices((x) => isGem2(x) && x.special).slice(0, itemPower(skill) >= 2 ? 16 : 10);
        const merged = [.../* @__PURE__ */ new Set([...targets, ...extra])];
        recordCodex2("skillUse", "rainbow_burst");
        applyLegendBossPressure();
        meta.codex.maxSingleClear = Math.max(meta.codex.maxSingleClear, merged.length);
        saveMeta2();
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
          if (isGem2(state.board[i])) state.board[i].lockedTurns = 0;
        }
        recordCodex2("skillUse", "time_freeze");
        applyLegendBossPressure();
        notify(`Time Freeze grants +${2 + itemPower(skill)} moves and removes all locks.`, "ok");
        renderAll();
        await consumePostAction();
        inputLocked = false;
        return;
      }
      if (skill === "boss_breaker") {
        await playSkillShowcase("Boss Breaker", "rainbow");
        const targets = collectIndices((x) => isGem2(x));
        shuffle2(targets);
        const chosen = targets.slice(0, Math.min(12 + itemPower(skill) * 3, targets.length));
        state.boss.charge = Math.max(0, state.boss.charge - Math.ceil(state.boss.max * (0.45 + itemPower(skill) * 0.12)));
        state.boss.hint = "Boss Breaker: charge shattered";
        recordCodex2("skillUse", "boss_breaker");
        applyLegendBossPressure();
        meta.codex.maxSingleClear = Math.max(meta.codex.maxSingleClear, chosen.length);
        saveMeta2();
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
      audio.play("itemCast", { volume: 0.38, rate: theme === "screen" ? 0.92 : 1.05 });
      spawnScreenPulse2(theme === "screen" ? "skill-screen" : "skill-rainbow", 520);
      boardWrapEl.classList.add("boss-cast");
      shakeBoard2(theme === "screen" ? 1.45 : 1.35);
      await sleep2(120);
      for (let i = 0; i < 6; i += 1) {
        spawnShockwaveFX2(Math.floor(Math.random() * boardSize * boardSize), true);
      }
      await sleep2(320);
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
        if (isGem2(cell) && cell.lockedTurns > 0) cell.lockedTurns -= 1;
      }
    }
    async function tickBoss() {
      if (state.gameOver || state.victory || state.boss.casting) return;
      const permanentDampener = state.floor <= 6 ? Number(meta.progression.upgrades.boss_dampener || 0) : 0;
      const gain = Math.max(1, state.floorThreat.bossGain + (state.boss.elite ? 1 : 0) - (state.blessings.boss_shunt ? 1 : 0) - permanentDampener);
      state.boss.charge = Math.min(state.boss.max, state.boss.charge + gain);
      state.boss.phase = state.boss.charge >= state.boss.max ? "ready" : "charging";
      if (state.boss.charge < state.boss.max) return;
      state.boss.casting = true;
      state.boss.phase = "ready";
      state.boss.hint = "Boss skill fully charged!";
      notify("Boss is about to cast!", "warn");
      audio.play("bossCast", { volume: 0.24, rate: 0.84 });
      boardWrapEl.classList.add("boss-telegraph");
      renderAll();
      await sleep2(360);
      const skillPool = state.floorTheme.id === "void_rift" ? BOSS_SKILLS : BOSS_SKILLS.filter((skill2) => skill2 !== "rift_collapse");
      const skill = randomPick2(skillPool);
      await castBossSkill(skill);
      boardWrapEl.classList.remove("boss-telegraph");
      state.boss.charge = 0;
      state.boss.phase = "charging";
      state.boss.casting = false;
    }
    async function castBossSkill(skill) {
      recordCodex2("bossSeen", skill);
      audio.play("bossCast", { volume: 0.44, rate: skill === "rift_collapse" ? 0.82 : 1 });
      boardWrapEl.classList.add("boss-cast");
      if (bossPortraitEl) bossPortraitEl.classList.add("casting");
      spawnScreenPulse2("boss", 520);
      if (skill === "glass_storm") {
        const amount = state.boss.elite ? 14 : 9;
        placeGlass(amount);
        state.boss.hint = `Glass Storm: +${amount} glass`;
        notify("Boss casts Glass Storm!", "warn");
        spawnFloatText2("Boss: Glass Storm", Math.floor(boardSize * boardSize / 2));
        for (let i = 0; i < 8; i += 1) spawnShockwaveFX2(Math.floor(Math.random() * boardSize * boardSize), true);
        shakeBoard2(1.45);
        applyBossPressure(skill);
        renderAll();
        await sleep2(220);
        if (bossPortraitEl) bossPortraitEl.classList.remove("casting");
        boardWrapEl.classList.remove("boss-cast");
        return;
      }
      if (skill === "hex_lock") {
        const gems = collectIndices((x) => isGem2(x) && x.lockedTurns <= 0);
        shuffle2(gems);
        const lockCount = Math.min(gems.length, state.boss.elite ? 7 : 5);
        for (let i = 0; i < lockCount; i += 1) {
          state.board[gems[i]].lockedTurns = 2;
        }
        state.boss.hint = `Hex Lock: ${lockCount} tiles locked`;
        notify("Boss casts Hex Lock!", "warn");
        spawnFloatText2("Boss: Hex Lock", Math.floor(boardSize * boardSize / 2));
        shakeBoard2(1.35);
        applyBossPressure(skill);
        renderAll();
        await sleep2(180);
        if (bossPortraitEl) bossPortraitEl.classList.remove("casting");
        boardWrapEl.classList.remove("boss-cast");
        return;
      }
      if (skill === "color_shift") {
        const from = randColor2();
        let to = randColor2();
        if (to === from) to = nextGemColor(from);
        const candidates = collectIndices((x) => isGem2(x) && x.color === from && x.lockedTurns <= 0);
        shuffle2(candidates);
        const cap = state.boss.elite ? 22 : 16;
        const count = Math.min(cap, candidates.length);
        for (let i = 0; i < count; i += 1) state.board[candidates[i]].color = to;
        state.boss.hint = "Color Shift: board recolored";
        notify("Boss casts Color Shift!", "warn");
        spawnFloatText2("Boss: Color Shift", Math.floor(boardSize * boardSize / 2));
        for (let i = 0; i < 5; i += 1) spawnShockwaveFX2(Math.floor(Math.random() * boardSize * boardSize), true);
        shakeBoard2(1.4);
        applyBossPressure(skill);
        renderAll();
        await sleep2(200);
        if (bossPortraitEl) bossPortraitEl.classList.remove("casting");
        boardWrapEl.classList.remove("boss-cast");
        return;
      }
      if (skill === "rift_collapse") {
        const gems = collectIndices((x) => isGem2(x) && x.lockedTurns <= 0);
        shuffle2(gems);
        const collapseCount = Math.min(gems.length, state.boss.elite ? 8 : 5);
        for (let i = 0; i < collapseCount; i += 1) {
          state.board[gems[i]] = { kind: "obstacle" };
        }
        placeLocks(state.boss.elite ? 5 : 3);
        state.boss.hint = `Rift Collapse: ${collapseCount} tiles corrupted`;
        notify("Boss casts Rift Collapse!", "warn");
        spawnFloatText2("Boss: Rift Collapse", Math.floor(boardSize * boardSize / 2));
        for (let i = 0; i < 6; i += 1) spawnShockwaveFX2(Math.floor(Math.random() * boardSize * boardSize), true);
        shakeBoard2(1.55);
        applyBossPressure("color_shift");
        renderAll();
        await sleep2(240);
        if (bossPortraitEl) bossPortraitEl.classList.remove("casting");
        boardWrapEl.classList.remove("boss-cast");
      }
    }
    function applyBossPressure(skill) {
      const pressure = state.floorThreat.pressure || 0;
      if (skill === "glass_storm") {
        const reduction = state.perks.pressure_valve ? 1 : 0;
        const loss = Math.max(0, 1 + Math.min(1, pressure) - reduction);
        state.movesLeft = Math.max(0, state.movesLeft - loss);
        if (loss > 0) spawnFloatText2(`-${loss} Move`, Math.floor(boardSize * boardSize / 2));
        return;
      }
      if (skill === "color_shift") {
        const reduction = state.perks.pressure_valve ? 1 : 0;
        const loss = Math.max(0, (state.boss.elite ? 2 : 1) + pressure - reduction);
        state.movesLeft = Math.max(0, state.movesLeft - loss);
        if (loss > 0) spawnFloatText2(`-${loss} Move`, Math.floor(boardSize * boardSize / 2));
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
          spawnFloatText2(`Chain Skill x${expandedInfo.chainCount}`, valid[0]);
        }
        audio.play("matchClear", {
          volume: Math.min(0.58, 0.24 + valid.length * 0.012 + (expandedInfo.chainCount > 1 ? 0.06 : 0)),
          rate: Math.max(0.82, 1.06 - (chain - 1) * 0.04)
        });
        clearAnim = new Set(valid);
        spawnShatterFX2(valid);
        if (expandedInfo.chainCount > 1) shakeBoard2(1.25);
        else shakeBoard2(1);
        renderAll();
        await sleep2(180);
        const gemTargets = valid.filter((i) => isGem2(state.board[i]));
        const obstacles = valid.filter((i) => isObstacle2(state.board[i])).length;
        let glassBroken = 0;
        for (const idx of valid) {
          const cell = state.board[idx];
          if (isGem2(cell) && cell.glass) glassBroken += 1;
        }
        let gain = calcGain(gemTargets.length, obstacles, chain, source, expandedInfo.chainCount, glassBroken);
        if (source === "legend") gain = Math.floor(gain * 1.3);
        state.floorScore += gain;
        state.score += gain;
        updateMomentum(gemTargets.length, chain);
        spawnFloatText2(`+${gain}`, gemTargets[0] ?? valid[0]);
        for (const idx of valid) {
          const cell = state.board[idx];
          if (isGem2(cell) && cell.glass) {
            cell.glass = false;
            continue;
          }
          state.board[idx] = null;
        }
        breakAdjacentObstacles(gemTargets);
        if (chain === 1 && localSpawnMap && localSpawnMap.size > 0) {
          const spawnIndex = pickSpawnIndex(localSpawnMap, preferSpawnIndex);
          if (spawnIndex !== null && state.board[spawnIndex] === null) {
            state.board[spawnIndex] = { kind: "gem", color: randColor2(), special: localSpawnMap.get(spawnIndex), glass: false, lockedTurns: 0 };
            spawnShockwaveFX2(spawnIndex, true);
          }
        }
        clearAnim.clear();
        renderAll();
        await sleep2(70);
        const moved = collapseBoard2();
        const born = refillBoard2();
        fallAnim = /* @__PURE__ */ new Set([...moved, ...born]);
        renderAll();
        await sleep2(230);
        fallAnim.clear();
        maybeDropItem(chain);
        meta.codex.maxChain = Math.max(meta.codex.maxChain, chain);
        saveMeta2();
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
      const clearSet = /* @__PURE__ */ new Set();
      const spawnMap = /* @__PURE__ */ new Map();
      for (const g of groups) for (const idx of g.indices) clearSet.add(idx);
      const at = /* @__PURE__ */ new Map();
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
          if (!isGem2(cell) || cell.special === "rainbow") {
            c += 1;
            continue;
          }
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
          if (!isGem2(cell) || cell.special === "rainbow") {
            r += 1;
            continue;
          }
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
      return isGem2(ca) && isGem2(cb) && ca.color === cb.color;
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
        if (!isGem2(cell) || !cell.special) continue;
        if (cell.special in meta.codex.specialTrigger) recordCodex2("specialTrigger", cell.special);
        spawnShockwaveFX2(idx, true);
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
      const r = rowOf2(idx);
      const c = colOf2(idx);
      if (special === "line_h") return indicesInRow2(r);
      if (special === "line_v") return indicesInCol2(c);
      if (special === "bomb") {
        const arr = [];
        for (let rr = r - 1; rr <= r + 1; rr += 1) for (let cc = c - 1; cc <= c + 1; cc += 1) if (inside2(rr, cc)) arr.push(rr * boardSize + cc);
        return arr;
      }
      if (special === "rainbow") {
        const cell = state.board[idx];
        const color = cell.color;
        return collectIndices((x) => isGem2(x) && x.color === color);
      }
      return [idx];
    }
    function specialComboTargets(a, b, sa, sb) {
      const set = /* @__PURE__ */ new Set([a, b]);
      if ((sa === "line_h" || sa === "line_v") && (sb === "line_h" || sb === "line_v")) {
        for (const i of indicesInRow2(rowOf2(a))) set.add(i);
        for (const i of indicesInCol2(colOf2(a))) set.add(i);
        for (const i of indicesInRow2(rowOf2(b))) set.add(i);
        for (const i of indicesInCol2(colOf2(b))) set.add(i);
        return [...set];
      }
      if (sa === "rainbow" || sb === "rainbow") {
        const other = sa === "rainbow" ? state.board[b] : state.board[a];
        if (isGem2(other)) {
          for (const i of collectIndices((x) => isGem2(x) && x.color === other.color)) set.add(i);
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
      for (const c of state.board) if (isGem2(c) && c.color === color) n += 1;
      return Math.floor(n / 6);
    }
    function updateMomentum(gems, chain) {
      const gain = Math.min(26, gems + chain * 4);
      state.momentum = Math.min(MOMENTUM_MAX, state.momentum + gain);
      if (state.momentum >= MOMENTUM_MAX) {
        state.momentum = 0;
        state.feverTurns = (state.perks.fever_loop ? 4 : 3) + (state.blessings.fever_engine ? 1 : 0);
        spawnFloatText2("FEVER!", Math.floor(boardSize * boardSize / 2));
        notify("FEVER started: score and drops are boosted!", "ok");
        audio.play("fever");
      }
    }
    function maybeDropItem(chain) {
      if (chain < 2) return;
      let chance = 0.16 - (state.floor - 1) * 0.012 + state.dropBoost;
      if (state.feverTurns > 0) chance += 0.1;
      if (state.perks.relic_magnet) chance += 0.1;
      chance = Math.max(0.08, Math.min(0.5, chance));
      if (Math.random() >= chance) return;
      const carried = getCarriedItems2();
      const pool = carried.length >= MAX_ITEM_TYPES ? [...carried] : ITEM_ORDER.filter((id) => ITEM_DEFS[id].rarity !== "legendary");
      if (state.perks.arcane_stockpile && Math.random() < 0.35) pool.push("screen_wipe", "rainbow_burst", "time_freeze", "boss_breaker");
      const weighted = [];
      for (const id of pool) {
        const weight = hasItemType2(id) ? 2 + getItemLevel2(id) : 1;
        for (let i = 0; i < weight; i += 1) weighted.push(id);
      }
      const picked = randomPick2(weighted);
      if (!addItemCharges2(picked, 1, itemSlotAvailable2())) return;
      spawnFloatText2(`+${ITEM_DEFS[picked].name}`, Math.floor(Math.random() * boardSize * boardSize));
      audio.play("itemGain", { volume: 0.32 });
    }
    function breakAdjacentObstacles(gemIndices) {
      const broken = /* @__PURE__ */ new Set();
      for (const idx of gemIndices) {
        const r = rowOf2(idx);
        const c = colOf2(idx);
        const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
        for (const [nr, nc] of neighbors) {
          if (!inside2(nr, nc)) continue;
          const ni = nr * boardSize + nc;
          if (isObstacle2(state.board[ni])) broken.add(ni);
        }
      }
      for (const idx of broken) state.board[idx] = null;
    }
    function checkFloorState() {
      if (state.floorScore >= state.targetScore) return onFloorCleared();
      if (state.movesLeft <= 0) return onDefeat();
    }
    function onFloorCleared() {
      grantMetaShards(1 + (state.routePlan?.shardBonus || 0));
      saveMeta2();
      const localFloor = getChapterLocalFloor();
      if (state.selectedChapter && state.floor >= state.selectedChapter.end) return onVictory();
      if (localFloor === 1) return showRewardChoices();
      if (localFloor === 2) return showEventNode();
      showRewardChoices();
    }
    function showChapterBlessings(isChapterStart = false) {
      overlayTitleEl.textContent = `Chapter Blessing \xB7 ${state.floorTheme.title}`;
      overlayDescEl.textContent = isChapterStart ? "Choose one powerful blessing before entering this chapter." : "Choose one powerful blessing to shape the rest of your run.";
      choiceWrapEl.innerHTML = "";
      overlayActionsEl.innerHTML = "";
      const missing = Object.entries(BLESSING_DEFS).filter(([id]) => !state.blessings[id]);
      shuffle2(missing);
      const picks = missing.slice(0, 3);
      for (const [, def] of picks) {
        const btn = document.createElement("button");
        btn.className = `choice rarity-${def.rarity}`;
        btn.innerHTML = `<span class="choice-rarity">Blessing</span><strong>${def.title}</strong><small>${def.desc}</small>`;
        btn.addEventListener("click", () => {
          def.apply(state);
          audio.play("rewardPick");
          overlayEl.classList.add("hidden");
          notify(`Blessing acquired: ${def.title}`, "ok");
          renderAll();
          if (isChapterStart) startFloor(state.selectedChapter.start);
          else startFloor(state.floor + 1);
        });
        choiceWrapEl.appendChild(btn);
      }
      overlayEl.classList.remove("hidden");
    }
    function onVictory() {
      state.victory = true;
      grantMetaShards(6 + Math.floor(state.score / 900));
      let nextUnlockedChapter = null;
      if (state.selectedChapter?.id) {
        meta.progression.clearedChapters[state.selectedChapter.id] = true;
        const currentIndex = CHAPTER_THEMES.findIndex((x) => x.id === state.selectedChapter.id);
        const next = CHAPTER_THEMES[currentIndex + 1];
        if (next && !meta.progression.unlockedChapters.includes(next.id)) meta.progression.unlockedChapters.push(next.id);
        nextUnlockedChapter = next || null;
      }
      updateMeta();
      renderAll();
      audio.play("victory");
      overlayTitleEl.textContent = `${state.selectedChapter?.title || "Chapter"} Cleared!`;
      overlayDescEl.textContent = `You defeated ${state.floorTheme.bossName} and cleared this chapter challenge with a final score of ${state.score}. ${unlockSummaryText()}`;
      choiceWrapEl.innerHTML = "";
      if (nextUnlockedChapter) {
        overlayActionsEl.innerHTML = `<button type="button" class="btn overlay-btn" data-action="next-chapter">Next Chapter</button><button type="button" class="btn danger overlay-btn" data-action="chapter-select">Back to Chapters</button>`;
      } else {
        overlayActionsEl.innerHTML = `<button type="button" class="btn overlay-btn" data-action="chapter-select">Back to Home</button><button type="button" class="btn danger overlay-btn" data-action="restart-run">Start New Run</button>`;
      }
      bindOverlayActions();
      overlayEl.classList.remove("hidden");
    }
    function startNextChapter() {
      if (!state.selectedChapter?.id) return showChapterSelect();
      const currentIndex = CHAPTER_THEMES.findIndex((x) => x.id === state.selectedChapter.id);
      const next = CHAPTER_THEMES[currentIndex + 1];
      if (!next) return showChapterSelect();
      state = createInitialState2();
      state.selectedChapter = next;
      state.floorTheme = next;
      overlayEl.classList.add("hidden");
      closeChapterScreen();
      showChapterBlessings(true);
    }
    function onDefeat() {
      state.gameOver = true;
      grantMetaShards(Math.max(2, state.floor - 1));
      updateMeta();
      renderAll();
      audio.play("defeat");
      overlayTitleEl.textContent = "Run Failed";
      overlayDescEl.textContent = `Chapter ${state.selectedChapter?.title || "Run"} ended on floor ${getChapterLocalFloor()}. Final score: ${state.score}.`;
      choiceWrapEl.innerHTML = "";
      overlayActionsEl.innerHTML = `<button type="button" class="btn danger overlay-btn" data-action="restart-run">Restart Now</button>`;
      bindOverlayActions();
      overlayEl.classList.remove("hidden");
    }
    function unlockSummaryText() {
      if (!state.selectedChapter?.id) return "";
      const currentIndex = CHAPTER_THEMES.findIndex((x) => x.id === state.selectedChapter.id);
      const next = CHAPTER_THEMES[currentIndex + 1];
      if (next && meta.progression.unlockedChapters.includes(next.id)) return `Next chapter unlocked: ${next.title}.`;
      return "";
    }
    function showEventNode() {
      overlayTitleEl.textContent = `Branch Route \xB7 ${state.floorTheme.title}`;
      overlayDescEl.textContent = `Choose a route for the final boss floor in ${state.floorTheme.shortLabel}.`;
      choiceWrapEl.innerHTML = "";
      overlayActionsEl.innerHTML = "";
      const events = buildBranchRoutes();
      for (const ev of events) {
        const btn = document.createElement("button");
        btn.className = "choice";
        btn.innerHTML = `<strong>${ev.title}</strong><small>${ev.desc}</small>`;
        btn.addEventListener("click", () => {
          ev.apply();
          audio.play("rewardPick", { volume: 0.42 });
          overlayEl.classList.add("hidden");
          startFloor(state.floor + 1);
        });
        choiceWrapEl.appendChild(btn);
      }
      overlayEl.classList.remove("hidden");
    }
    function buildBranchRoutes() {
      const theme = state.floorTheme.id;
      const names = {
        crystal_mines: ["Survey Route", "Greed Route", "Blast Route"],
        frozen_archive: ["Calm Route", "Scholar Route", "Risk Route"],
        storm_forge: ["Shielded Route", "Harvest Route", "Overdrive Route"],
        void_rift: ["Anchored Route", "Rift Route", "Cataclysm Route"]
      }[theme] || ["Safe Route", "Greedy Route", "Trial Route"];
      return [
        {
          title: names[0],
          desc: "Final boss floor: +2 moves, lower target pressure, calmer pacing.",
          apply: () => {
            state.routePlan = { id: "safe", title: names[0], floorsRemaining: 1, moveBonus: 2, movePenalty: 0, targetMulDelta: -0.08, pressureDelta: -1, dropBoost: 0, chainBonus: 0, shardBonus: 0 };
            notify(`Route chosen: ${names[0]}.`, "ok");
          }
        },
        {
          title: names[1],
          desc: "Final boss floor: extra drops and +1 shard, but targets are slightly higher.",
          apply: () => {
            state.routePlan = { id: "greed", title: names[1], floorsRemaining: 1, moveBonus: 0, movePenalty: 0, targetMulDelta: 0.08, pressureDelta: 0, dropBoost: 0.1, chainBonus: 0, shardBonus: 1 };
            notify(`Route chosen: ${names[1]}.`, "warn");
          }
        },
        {
          title: names[2],
          desc: "Final boss floor: fewer moves and more pressure, but stronger chains and a full item refill now.",
          apply: () => {
            state.routePlan = { id: "trial", title: names[2], floorsRemaining: 1, moveBonus: 0, movePenalty: 1, targetMulDelta: 0.12, pressureDelta: 1, dropBoost: 0.04, chainBonus: 0.18, shardBonus: 0 };
            refillCarriedCharges();
            notify(`Route chosen: ${names[2]}.`, "warn");
          }
        }
      ];
    }
    function buildEventChoices() {
      const commonEvents = [
        {
          title: "Cursed Pact",
          desc: "The next two floors are harsher, but chain rewards and drops increase and you gain +1 Cross Burst.",
          apply: () => {
            state.eventCurseFloors = 2;
            addItemCharges2("cross", 1, true);
            notify("You signed the Cursed Pact.", "warn");
          }
        },
        {
          title: "Repair Forge",
          desc: "Gain +2 moves next floor and reset the boss charge.",
          apply: () => {
            state.nextFloorMoveBonus += 2;
            state.boss.charge = 0;
            notify("The forge stabilizes the next floor.", "ok");
          }
        },
        {
          title: "Greed Altar",
          desc: "Gain +180 score now, but lose 2 moves next floor.",
          apply: () => {
            state.score += 180;
            state.floorScore += 40;
            state.nextFloorMovePenalty += 2;
            notify("Greed Altar activated: high reward, high pressure.", "warn");
          }
        },
        {
          title: "Tactical Map",
          desc: "Scout the next floor to gain +3 moves and +20 momentum.",
          apply: () => {
            state.nextFloorMoveBonus += 3;
            state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 20);
            notify("You charted a safer route.", "ok");
          }
        }
      ];
      const chapterEvents = {
        crystal_mines: [
          {
            title: "Prospector Cache",
            desc: "Open an old mine crate to gain +1 Hammer and +1 Row Sweep.",
            apply: () => {
              addItemCharges2("hammer", 1, true);
              addItemCharges2("row", 1, true);
              notify("Prospector tools added to your kit.", "ok");
            }
          }
        ],
        frozen_archive: [
          {
            title: "Frozen Lantern",
            desc: "Stabilize the archive: remove all current locks and gain +25 momentum.",
            apply: () => {
              for (let i = 0; i < state.board.length; i += 1) if (isGem2(state.board[i])) state.board[i].lockedTurns = 0;
              state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 25);
              notify("The lantern calms the frozen archive.", "ok");
            }
          }
        ],
        storm_forge: [
          {
            title: "Forge Overdrive",
            desc: "Gain +1 Color Bomb and boost the next cursed floor payoff.",
            apply: () => {
              addItemCharges2("color", 1, true);
              state.eventCurseFloors = Math.max(state.eventCurseFloors, 1);
              notify("The forge roars to life.", "warn");
            }
          }
        ],
        void_rift: [
          {
            title: "Void Bargain",
            desc: "Gain +240 score and +1 Rainbow Burst, but suffer -1 move next floor.",
            apply: () => {
              state.score += 240;
              state.floorScore += 60;
              state.nextFloorMovePenalty += 1;
              addItemCharges2("rainbow_burst", 1, true);
              notify("The rift grants power at a cost.", "warn");
            }
          }
        ]
      };
      const pool = [...commonEvents, ...chapterEvents[state.floorTheme.id] || []];
      shuffle2(pool);
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
          audio.play("rewardPick");
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
      shuffle2(combined);
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
      for (const [id2, def2] of missing) {
        const weight = def2.rarity === "legendary" ? 1 : def2.rarity === "epic" ? 2 : def2.rarity === "rare" ? 3 : 4;
        for (let i = 0; i < weight; i += 1) weighted.push([id2, def2]);
      }
      const [id, def] = randomPick2(weighted);
      return {
        type: "perk",
        rarity: def.rarity,
        title: `${RARITY_LABELS[def.rarity]} Skill: ${def.title}`,
        desc: def.desc,
        apply: () => def.apply(state)
      };
    }
    function buildItemRewards() {
      const rewards = [];
      const carried = getCarriedItems2();
      const newCandidates = ITEM_ORDER.filter((id) => !hasItemType2(id));
      if (carried.length < MAX_ITEM_TYPES && newCandidates.length > 0) {
        const preferred = newCandidates.filter((id) => ITEM_DEFS[id].rarity !== "legendary");
        const candidate = randomPick2(preferred.length > 0 ? preferred : newCandidates);
        rewards.push(createNewItemReward(candidate));
      }
      const upgradePool = [];
      for (const id of carried) {
        const weight = 2 + getItemLevel2(id) * 2 + (getItemCount2(id) === 0 ? 1 : 0);
        for (let i = 0; i < weight; i += 1) upgradePool.push(id);
      }
      while (upgradePool.length > 0 && rewards.length < 2) {
        const id = randomPick2(upgradePool);
        rewards.push(createUpgradeReward(id));
        for (let i = upgradePool.length - 1; i >= 0; i -= 1) if (upgradePool[i] === id) upgradePool.splice(i, 1);
      }
      return rewards;
    }
    function buildSupportRewards() {
      return [
        { type: "support", rarity: "common", title: "Extra Moves +2", desc: "Reduce next-floor pressure", apply: () => state.nextFloorMoveBonus += 2 },
        { type: "support", rarity: "common", title: "Momentum Surge", desc: "+40 momentum", apply: () => state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 40) },
        { type: "support", rarity: "rare", title: "Field Repair", desc: "Restore 2 random item charges across carried gear", apply: restoreRandomCharges },
        { type: "support", rarity: "common", title: "Vault Refill", desc: "Restore 1 charge to every carried item", apply: refillCarriedCharges },
        { type: "support", rarity: "rare", title: "Forge Tune-Up", desc: "Upgrade a random carried item by 1 level and gain 1 charge", apply: upgradeRandomCarriedItem },
        { type: "support", rarity: "rare", title: "Boss Suppressant", desc: "Start the next floor with +2 moves and a fully reset boss gauge", apply: () => {
          state.nextFloorMoveBonus += 2;
          state.boss.charge = 0;
        } },
        { type: "support", rarity: "epic", title: "Fever Battery", desc: "Gain +70 momentum to prime your next power spike", apply: () => state.momentum = Math.min(MOMENTUM_MAX, state.momentum + 70) },
        { type: "support", rarity: "epic", title: "Rift Cache", desc: "Gain +1 random epic-or-higher item charge", apply: grantHighTierCharge }
      ];
    }
    function createNewItemReward(id) {
      const bonus = state.perks.vault_expander ? 2 : 1;
      return {
        type: "item",
        rarity: ITEM_DEFS[id].rarity,
        title: `New Item: ${ITEM_DEFS[id].name}`,
        desc: `Add ${ITEM_DEFS[id].name} to your loadout with ${bonus} charge${bonus > 1 ? "s" : ""}.`,
        apply: () => addItemCharges2(id, bonus, true)
      };
    }
    function createUpgradeReward(id) {
      const charges = ITEM_DEFS[id].rarity === "legendary" ? 1 : 2;
      return {
        type: "item",
        rarity: ITEM_DEFS[id].rarity,
        title: `Upgrade ${ITEM_DEFS[id].name}`,
        desc: `Raise ${ITEM_DEFS[id].name} to Lv.${getItemLevel2(id) + 1} and gain +${charges} charge${charges > 1 ? "s" : ""}.`,
        apply: () => upgradeItem2(id, 1, charges)
      };
    }
    function restoreRandomCharges() {
      const carried = getCarriedItems2();
      if (carried.length === 0) return;
      const bag = [];
      for (const id of carried) {
        for (let i = 0; i < Math.max(1, getItemLevel2(id)); i += 1) bag.push(id);
      }
      for (let i = 0; i < 2; i += 1) addItemCharges2(randomPick2(bag), 1, false);
    }
    function refillCarriedCharges() {
      for (const id of getCarriedItems2()) addItemCharges2(id, 1, false);
    }
    function upgradeRandomCarriedItem() {
      const carried = getCarriedItems2();
      if (carried.length === 0) return;
      const id = randomPick2(carried);
      upgradeItem2(id, 1, 1);
    }
    function grantHighTierCharge() {
      const carried = getCarriedItems2().filter((id) => ["epic", "legendary"].includes(ITEM_DEFS[id].rarity));
      const fallback = getCarriedItems2();
      const pool = carried.length > 0 ? carried : fallback;
      if (pool.length === 0) return;
      addItemCharges2(randomPick2(pool), 1, false);
    }
    function consumeMove() {
      state.movesLeft = Math.max(0, state.movesLeft - 1);
    }
    async function playSwapAnimation2(a, b) {
      await playSwapAnimation(boardEl, a, b, sleep2);
    }
    async function playItemCastAnimation2(item, idx) {
      await playItemCastAnimation({ itemWrapEl, boardEl, item, idx, imageSrc: getAnimatedItemImage2(item), itemName: ITEM_DEFS[item].name, sleep: sleep2 });
    }
    function spawnShatterFX2(indices) {
      spawnShatterFX({ indices, boardEl, state, isGem: isGem2, fxLayerEl, MAX_ACTIVE_SHARDS, activeShards, setActiveShards: (value) => {
        activeShards = value;
      } });
    }
    function spawnShockwaveFX2(index, strong = false) {
      spawnShockwaveFX({ boardEl, fxLayerEl, index, strong });
    }
    function spawnFloatText2(text, index) {
      spawnFloatText({ boardEl, fxLayerEl, text, index });
    }
    function spawnScreenPulse2(theme = "boss", duration = 420) {
      spawnScreenPulse({ fxLayerEl, theme, duration });
    }
    function shakeBoard2(power = 1) {
      shakeBoard(boardWrapEl, power);
    }
    function updateMeta() {
      meta.bestFloor = Math.max(meta.bestFloor, state.floor);
      meta.bestScore = Math.max(meta.bestScore, state.score);
      saveMeta2();
    }
    function grantMetaShards(amount) {
      meta.progression.shards = Number(meta.progression.shards || 0) + Math.max(0, amount);
    }
    function createBoard2() {
      return createBoard(boardSize, randColor2);
    }
    function resolveAutoBoard2() {
      resolveAutoBoard(state, findMatchGroups, isGem2, randColor2);
    }
    function collapseBoard2() {
      return collapseBoard(state, boardSize, isGem2);
    }
    function refillBoard2() {
      return refillBoard(state, randColor2);
    }
    function isAdjacent2(a, b) {
      return isAdjacent(boardSize, a, b);
    }
    function rowOf2(i) {
      return rowOf(boardSize, i);
    }
    function colOf2(i) {
      return colOf(boardSize, i);
    }
    function inside2(r, c) {
      return inside(boardSize, r, c);
    }
    function indicesInRow2(r) {
      return indicesInRow(boardSize, r);
    }
    function indicesInCol2(c) {
      return indicesInCol(boardSize, c);
    }
    function swap2(a, b) {
      swap(state, a, b);
    }
    function randColor2() {
      return randomPick2(state.activeGemColors || GEM_POOL_BY_FLOOR[0]);
    }
    function randomPick2(arr) {
      return randomPick(arr);
    }
    function shuffle2(arr) {
      shuffle(arr);
    }
    function sleep2(ms) {
      return sleep(ms);
    }
    function isGem2(c) {
      return isGem(c);
    }
    function isObstacle2(c) {
      return isObstacle(c);
    }
    function renderAll() {
      renderHUD();
      renderItems();
      renderPerks();
      renderGuideList();
      renderBoard();
      boardEl.style.setProperty("--board-size", String(boardSize));
    }
    function renderHUD() {
      floorEl.textContent = state.selectedChapter ? `${getChapterLocalFloor()}/3` : `${state.floor}/${TOTAL_FLOORS}`;
      if (boardTargetScoreEl) boardTargetScoreEl.textContent = String(state.targetScore);
      movesLeftEl.textContent = String(state.movesLeft);
      floorScoreEl.textContent = String(state.floorScore);
      if (boardFloorScoreEl) boardFloorScoreEl.textContent = String(state.floorScore);
      scoreEl.textContent = String(state.score);
      bestFloorEl.textContent = String(meta.bestFloor);
      bestScoreEl.textContent = String(meta.bestScore);
      momentumBarEl.style.width = `${state.momentum / MOMENTUM_MAX * 100}%`;
      feverTurnsEl.textContent = `Fever ${state.feverTurns}`;
      const bossPct = Math.max(0, Math.min(100, state.boss.charge / state.boss.max * 100));
      if (bossBarEl) bossBarEl.style.width = `${bossPct}%`;
      if (bossSkillHintEl) bossSkillHintEl.textContent = state.boss.hint;
      if (bossTitleEl) bossTitleEl.textContent = state.boss.elite ? state.floorTheme.eliteBossName : state.floorTheme.bossName;
      if (bossStateEl) bossStateEl.textContent = state.boss.casting ? `Casting in ${state.floorTheme.shortLabel}` : state.boss.phase === "ready" ? "Primed to strike on the next beat" : `Charging through ${state.floorTheme.title}`;
      if (bossThreatEl) bossThreatEl.textContent = getBossThreatLabel();
      if (bossPatternEl) bossPatternEl.textContent = state.boss.elite ? `${state.floorTheme.pattern} / Elite pressure` : state.floorTheme.pattern;
      if (modifierEl) modifierEl.textContent = state.modifier ? `${state.floorTheme.shortLabel} \xB7 ${state.routePlan.title} \xB7 ${state.modifier.name} \xB7 ${state.activeGemColors.length}C` : `${state.floorTheme.shortLabel} \xB7 ${state.routePlan.title} \xB7 ${state.activeGemColors.length}C`;
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
        getCarriedItems: getCarriedItems2,
        state,
        getItemCount: getItemCount2,
        getItemLevel: getItemLevel2,
        ITEM_DEFS,
        getAnimatedItemImage: getAnimatedItemImage2,
        MAX_ITEM_TYPES,
        UI_IMAGES
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
        isObstacle: isObstacle2,
        isGem: isGem2,
        clearAnim,
        fallAnim,
        getAnimatedGemImage: getAnimatedGemImage2
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
})();
