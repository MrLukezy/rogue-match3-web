export function createInitialState({ MIN_BOARD_SIZE, ITEM_ORDER }) {
  return {
    floor: 1,
    score: 0,
    floorScore: 0,
    targetScore: 0,
    movesLeft: 0,
    boardSize: MIN_BOARD_SIZE,
    activeGemColors: [0, 1, 2, 3],
    board: [],
    mode: { type: "normal", item: null },
    items: Object.fromEntries(ITEM_ORDER.map((id) => [id, 0])),
    itemLevels: Object.fromEntries(ITEM_ORDER.map((id) => [id, 0])),
    itemSlots: ["hammer", "shuffle"],
    modifier: null,
    modGlass: 0,
    modLocks: 0,
    taxColor: null,
    taxColorTurns: 0,
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
    blessings: {
      tactical_reserve: false,
      supply_cache: false,
      chain_matrix: false,
      fever_engine: false,
      boss_shunt: false,
      purifier_sigil: false,
    },
    boss: { charge: 0, max: 100, hint: "Idle", elite: false, phase: "charging", casting: false, lastActionEndedAt: 0, pendingIdleMs: 0 },
    eventCurseFloors: 0,
    nextFloorMovePenalty: 0,
    nextFloorMoveBonus: 0,
    floorThreat: { label: "Warm-Up", bossGain: 1, pressure: 0 },
    floorTheme: { id: "ember_hollows", title: "Chapter 1 · Ember Hollows", shortLabel: "Ember", bossName: "Ember Cub", eliteBossName: "Wild Ember Cub", pattern: "Burn / Spread / Chip pressure", intro: "An introductory fire chapter built around gentle ember spread." },
    selectedChapter: null,
    routePlan: { id: "main", title: "Main Path", floorsRemaining: 0, moveBonus: 0, movePenalty: 0, targetMulDelta: 0, pressureDelta: 0, dropBoost: 0, chainBonus: 0, shardBonus: 0 },
    gameOver: false,
    victory: false,
  };
}

export function seedStartingItems(state, { ITEM_BASE_LEVEL, ITEM_BASE_COUNTS }) {
  for (const id of state.itemSlots) {
    state.itemLevels[id] = ITEM_BASE_LEVEL;
    state.items[id] = ITEM_BASE_COUNTS[id] || 1;
  }
}

export const getItemCount = (state, id) => Number(state.items[id] || 0);
export const getItemLevel = (state, id) => Number(state.itemLevels[id] || 0);
export const hasItemType = (state, id) => state.itemSlots.includes(id);
export const getCarriedItems = (state, ITEM_DEFS) => state.itemSlots.filter((id) => ITEM_DEFS[id]);
export const itemSlotAvailable = (state, ITEM_DEFS, MAX_ITEM_TYPES) => getCarriedItems(state, ITEM_DEFS).length < MAX_ITEM_TYPES;

export function getItemFrames(id, ITEM_ANIM_FRAMES, ITEM_DEFS) {
  return ITEM_ANIM_FRAMES[id] || [ITEM_DEFS[id]?.image].filter(Boolean);
}

export function getAnimatedItemImage(id, frameIndex, ITEM_ANIM_FRAMES, ITEM_DEFS) {
  const frames = getItemFrames(id, ITEM_ANIM_FRAMES, ITEM_DEFS);
  if (!frames.length) return ITEM_DEFS[id]?.image || "";
  return frames[frameIndex % frames.length];
}

export function getGemFrames(color, GEM_ANIM_FRAMES, GEM_IMAGE_BY_COLOR) {
  return GEM_ANIM_FRAMES[color] || [GEM_IMAGE_BY_COLOR[color] || GEM_IMAGE_BY_COLOR[0]].filter(Boolean);
}

export function getAnimatedGemImage(color, frameIndex, GEM_ANIM_FRAMES, GEM_IMAGE_BY_COLOR) {
  const frames = getGemFrames(color, GEM_ANIM_FRAMES, GEM_IMAGE_BY_COLOR);
  return frames[frameIndex % frames.length];
}

export function getAnimatedBossImage(frameIndex, BOSS_ANIM_FRAMES) {
  return BOSS_ANIM_FRAMES[frameIndex % BOSS_ANIM_FRAMES.length] || "./assets/generated/boss/boss_sigil.png";
}

export function syncAnimatedVisuals({ root = document, frameIndex, getAnimatedItemImage, getAnimatedGemImage, getAnimatedBossImage }) {
  const itemImages = root.querySelectorAll("[data-anim-item]");
  for (const img of itemImages) {
    const item = img.dataset.animItem;
    const next = getAnimatedItemImage(item, frameIndex);
    if (next && img.getAttribute("src") !== next) img.setAttribute("src", next);
  }

  const gemImages = root.querySelectorAll("[data-anim-gem]");
  for (const img of gemImages) {
    const color = Number(img.dataset.animGem);
    const next = getAnimatedGemImage(color, frameIndex);
    if (next && img.getAttribute("src") !== next) img.setAttribute("src", next);
  }

  const bossImages = root.querySelectorAll("[data-anim-boss]");
  for (const img of bossImages) {
    const next = getAnimatedBossImage(frameIndex);
    if (next && img.getAttribute("src") !== next) img.setAttribute("src", next);
  }
}

export function ensureItemType(state, id, { ITEM_BASE_LEVEL, ITEM_DEFS, MAX_ITEM_TYPES }) {
  if (hasItemType(state, id)) return true;
  if (!itemSlotAvailable(state, ITEM_DEFS, MAX_ITEM_TYPES)) return false;
  state.itemSlots.push(id);
  state.itemLevels[id] = Math.max(ITEM_BASE_LEVEL, getItemLevel(state, id));
  return true;
}

export function addItemCharges(state, id, amount, allowNewType, deps) {
  if (!hasItemType(state, id)) {
    if (!allowNewType || !ensureItemType(state, id, deps)) return false;
    if (state.perks.vault_expander) amount += 1;
  }
  state.items[id] = getItemCount(state, id) + amount;
  if (state.itemLevels[id] <= 0) state.itemLevels[id] = deps.ITEM_BASE_LEVEL;
  return true;
}

export function upgradeItem(state, id, levelGain, chargeGain, deps) {
  if (!hasItemType(state, id) && !ensureItemType(state, id, deps)) return false;
  state.itemLevels[id] = Math.max(deps.ITEM_BASE_LEVEL, getItemLevel(state, id) + levelGain);
  const bonusCharges = state.perks.quick_hands && deps.ITEM_DEFS[id].target ? 1 : 0;
  state.items[id] = getItemCount(state, id) + chargeGain + bonusCharges;
  return true;
}

export function spendItemCharge(state, id) {
  state.items[id] = Math.max(0, getItemCount(state, id) - 1);
}

export function boostAllItemLevels(state, ITEM_BASE_LEVEL) {
  for (const id of state.itemSlots) {
    state.itemLevels[id] = Math.max(ITEM_BASE_LEVEL, (state.itemLevels[id] || ITEM_BASE_LEVEL) + 1);
    state.items[id] = Number(state.items[id] || 0) + 1;
  }
}

export function grantDragonHoardBonus(state, ITEM_DEFS, addItemChargesFn) {
  if (!state.perks.dragon_hoard) return;
  const carried = getCarriedItems(state, ITEM_DEFS);
  if (carried.length === 0) return;
  carried.sort((a, b) => getItemLevel(state, b) - getItemLevel(state, a) || getItemCount(state, b) - getItemCount(state, a));
  addItemChargesFn(carried[0], 1, false);
}

export function defaultCodex() {
  const bossSeen = {
    ember_spark: 0,
    tail_scorch: 0,
    cinder_spread: 0,
    foxfire_ring: 0,
    wildfire_pounce: 0,
    chill_script: 0,
    frost_page: 0,
    winter_seal: 0,
    glacier_column: 0,
    absolute_stillness: 0,
    pebble_drop: 0,
    bark_armor: 0,
    burrow_rise: 0,
    cave_in: 0,
    elder_root_wall: 0,
    static_pin: 0,
    thunder_lance: 0,
    overload_mark: 0,
    chain_burst: 0,
    duel_of_storms: 0,
    toxin_dust: 0,
    thorn_bind: 0,
    spore_bloom: 0,
    rot_garden: 0,
    royal_pollution: 0,
    splash_shift: 0,
    undertow_pull: 0,
    tide_pool: 0,
    tail_wave: 0,
    abyss_tsunami: 0,
    mirror_glint: 0,
    false_match: 0,
    prism_shuffle: 0,
    mirror_maze: 0,
    thousand_masks: 0,
    iron_slag: 0,
    anvil_slam: 0,
    furnace_core: 0,
    heavy_press: 0,
    steelflame_domain: 0,
    radiance_mark: 0,
    eclipse_wing: 0,
    judgment_wheel: 0,
    abyss_gaze: 0,
    revelation_zero: 0,
    void_scale: 0,
    dragon_breath: 0,
    world_crack: 0,
    emperor_decree: 0,
    star_abyss_end: 0,
  };

  return {
    itemUse: { hammer: 0, row: 0, cross: 0, color: 0, shuffle: 0, screen_wipe: 0, rainbow_burst: 0, time_freeze: 0, boss_breaker: 0 },
    specialTrigger: { line_h: 0, line_v: 0, bomb: 0, rainbow: 0 },
    bossSeen,
    skillUse: { screen_wipe: 0, rainbow_burst: 0, time_freeze: 0, boss_breaker: 0 },
    maxSingleClear: 0,
    maxChain: 0,
    runs: 0,
    guideSeen: {},
  };
}

export function defaultMetaProgression() {
  return {
    shards: 0,
      unlockedChapters: ["ember_hollows"],
    clearedChapters: {},
    upgrades: {
      veteran_boots: 0,
      ember_core: 0,
      relic_satchel: 0,
      boss_dampener: 0,
    },
  };
}

export function loadMeta(storage, META_KEY) {
  try {
    const raw = storage.getItem(META_KEY);
    if (!raw) return { bestFloor: 0, bestScore: 0, codex: defaultCodex(), progression: defaultMetaProgression() };
    const parsed = JSON.parse(raw);
    return {
      bestFloor: Number(parsed.bestFloor || 0),
      bestScore: Number(parsed.bestScore || 0),
      progression: {
        ...defaultMetaProgression(),
        ...(parsed.progression || {}),
        unlockedChapters: Array.isArray((parsed.progression || {}).unlockedChapters) && (parsed.progression || {}).unlockedChapters.length > 0
          ? (parsed.progression || {}).unlockedChapters
          : defaultMetaProgression().unlockedChapters,
        clearedChapters: { ...defaultMetaProgression().clearedChapters, ...((parsed.progression || {}).clearedChapters || {}) },
        upgrades: { ...defaultMetaProgression().upgrades, ...((parsed.progression || {}).upgrades || {}) },
      },
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
    return { bestFloor: 0, bestScore: 0, codex: defaultCodex(), progression: defaultMetaProgression() };
  }
}

export function saveMeta(storage, META_KEY, meta) {
  storage.setItem(META_KEY, JSON.stringify(meta));
}

export function recordCodex(meta, group, key, delta = 1) {
  if (!meta.codex[group]) return;
  if (typeof meta.codex[group] === "object") meta.codex[group][key] = Number(meta.codex[group][key] || 0) + delta;
}
