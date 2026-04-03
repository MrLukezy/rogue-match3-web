export function createInitialState({ MIN_BOARD_SIZE, ITEM_ORDER, BLESSING_ORDER }) {
  return {
    floor: 1,
    score: 0,
    floorScore: 0,
    targetScore: 0,
    momentumLastDecayAt: 0,
    movesLeft: 0,
    boardSize: MIN_BOARD_SIZE,
    activeGemColors: [0, 1, 2, 3],
    board: [],
    mode: { type: "normal", item: null },
    items: Object.fromEntries(ITEM_ORDER.map((id) => [id, 0])),
    itemLevels: Object.fromEntries(ITEM_ORDER.map((id) => [id, 0])),
    itemSlots: [],
    // 祝福系统 - 最多装备3个祝福
    blessingSlots: [],
    blessingLevels: Object.fromEntries(BLESSING_ORDER.map((id) => [id, 0])),
    // 祝福状态追踪
    blessingState: {
      kineticEnergy: 0,        // 动能累积当前能量
      comboStreak: 0,         // 当前连击数
      lastMomentumPeak: 0,    // 上次动量峰值
      absorbedEnergy: 0,      // 已吸收的能量
      skillCooldowns: {},     // 技能冷却追踪
      critActive: false,      // 暴击是否激活
      desperateMode: false,   // 绝境模式
    },
    modifier: null,
    modGlass: 0,
    modLocks: 0,
    taxColor: null,
    taxColorTurns: 0,
    tideRows: [],
    tideCols: [],
    bossTelegraph: null,
    suppressSpecialSpawnOnce: false,
    suppressSpecialNotice: null,
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
    boss: { charge: 0, max: 100, hp: 0, maxHp: 0, hint: "Idle", elite: false, phase: "charging", casting: false, lastActionEndedAt: 0, pendingIdleMs: 0, lastChargeTickAt: 0, nextDecisionAt: 0, smallCastCount: 0, warningStage: 0 },
    eventCurseFloors: 0,
    nextFloorMovePenalty: 0,
    nextFloorMoveBonus: 0,
    floorThreat: { label: "Warm-Up", bossGain: 1, pressure: 0 },
    floorTheme: { id: "ember_hollows", title: "Chapter 1 · Ember Hollows", shortLabel: "Ember", minionName: "Ember Scout", bossName: "Ember Cub", eliteBossName: "Wild Ember Cub", pattern: "Burn / Spread / Chip pressure", intro: "An introductory fire chapter built around gentle ember spread." },
    selectedChapter: null,
    routePlan: { id: "main", title: "Main Path", floorsRemaining: 0, moveBonus: 0, movePenalty: 0, targetMulDelta: 0, pressureDelta: 0, dropBoost: 0, chainBonus: 0, shardBonus: 0 },
    gameOver: false,
    victory: false,
  };
}

export function seedStartingItems(state, { ITEM_BASE_LEVEL, ITEM_BASE_COUNTS }) {
  for (const id of state.itemSlots) {
    state.itemLevels[id] = ITEM_BASE_LEVEL;
    state.items[id] = ITEM_BASE_COUNTS[id] || 0;
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
      emberling_flare: 0,
      ember_spark: 0,
      frostling_burst: 0,
      tail_scorch: 0,
      burrowling_toss: 0,
      cinder_spread: 0,
      stormling_jolt: 0,
      foxfire_ring: 0,
      sporeling_puff: 0,
      wildfire_pounce: 0,
      tideling_surge: 0,
      chill_script: 0,
      mirrorling_glimmer: 0,
      frost_page: 0,
      slagling_drop: 0,
      winter_seal: 0,
      eclipseling_sign: 0,
      glacier_column: 0,
      voidling_ripple: 0,
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

// ============================================================
// 祝福系统辅助函数
// ============================================================

export const MAX_BLESSING_SLOTS = 3;

export const getBlessingLevel = (state, id) => Number(state.blessingLevels[id] || 0);

export const hasBlessingEquipped = (state, id) => state.blessingSlots.includes(id);

export const getEquippedBlessings = (state) => state.blessingSlots.filter(Boolean);

export const blessingSlotAvailable = (state) => state.blessingSlots.length < MAX_BLESSING_SLOTS;

export function equipBlessing(state, id, level = 1) {
  if (hasBlessingEquipped(state, id)) return false;
  if (!blessingSlotAvailable(state)) return false;
  state.blessingSlots.push(id);
  state.blessingLevels[id] = Math.max(1, getBlessingLevel(state, id));
  return true;
}

export function unequipBlessing(state, id) {
  const idx = state.blessingSlots.indexOf(id);
  if (idx === -1) return false;
  state.blessingSlots.splice(idx, 1);
  return true;
}

export function upgradeBlessing(state, id, levels = 1) {
  if (!hasBlessingEquipped(state, id)) return false;
  state.blessingLevels[id] = Math.max(1, getBlessingLevel(state, id) + levels);
  return true;
}

// 祝福协同效果检测
export function checkBlessingSynergy(state, synergyKey, BLESSING_SYERGIES) {
  const synergy = BLESSING_SYERGIES[synergyKey];
  if (!synergy) return false;
  return synergy.blessings.every((id) => hasBlessingEquipped(state, id));
}

// 动能累积效果
export function addKineticEnergy(state, amount, MOMENTUM_MAX) {
  const level = getBlessingLevel(state, "kineticAccumulation");
  if (level <= 0) return amount;
  
  const cap = level === 1 ? 50 : level === 2 ? 75 : level === 3 ? 100 : level === 4 ? 150 : 200;
  const prev = state.blessingState.kineticEnergy;
  state.blessingState.kineticEnergy = Math.min(cap, prev + amount);
  
  // 返回实际消耗的能量作为动量
  const consumed = state.blessingState.kineticEnergy - prev;
  return amount - consumed;
}

// 连击狂热检测
export function checkComboMania(state, comboCount) {
  const level = getBlessingLevel(state, "comboMania");
  if (level <= 0) return false;
  
  const threshold = level >= 3 ? 2 : 3;
  if (comboCount < threshold) return false;
  
  const triggerProb = (15 + 15 * level) / 100;
  return Math.random() < triggerProb;
}

// 幸运光环 - 提高技能触发概率
export function getLuckyAuraBonus(state) {
  const level = getBlessingLevel(state, "luckyAura");
  if (level <= 0) return 0;
  return (3 * level + 2) / 100;
}

// 暴击祝福 - 获取暴击概率
export function getCriticalChance(state) {
  const level = getBlessingLevel(state, "criticalBlessing");
  if (level <= 0) return 0;
  return (8 + 6 * level) / 100;
}

// 暴击效果倍率
export function getCriticalEffect(state) {
  const level = getBlessingLevel(state, "criticalBlessing");
  if (level <= 0) return 1.0;
  return 1.3 + 0.4 * level;
}

// 蓄能削弱效果
export function getChargeWeakenRate(state) {
  const level = getBlessingLevel(state, "chargeWeaken");
  if (level <= 0) return 0;
  return (8 * level + 2) / 100;
}

// 技能冷却缩减
export function getCooldownReduction(state) {
  const level = getBlessingLevel(state, "cooldownReduction");
  if (level <= 0) return 0;
  return (8 * level + 2) / 100;
}

// 资源回收 - 检查是否返还技能冷却
export function checkResourceRecovery(state) {
  const level = getBlessingLevel(state, "resourceRecovery");
  if (level <= 0) return false;
  const refundProb = (3 + 5 * level) / 100;
  return Math.random() < refundProb;
}

// 绝境逢生 - 检查低血量增益
export function checkDesperateMode(state, hp, maxHp) {
  const level = getBlessingLevel(state, "desperateSurvival");
  if (level <= 0) return false;
  
  const threshold = 20 + 5 * level;
  const hpPercent = (hp / maxHp) * 100;
  state.blessingState.desperateMode = hpPercent <= threshold;
  return state.blessingState.desperateMode;
}

// 完美主义加成
export function getPerfectionistBonus(state, matchCount) {
  const level = getBlessingLevel(state, "perfectionist");
  if (level <= 0) return 1.0;
  
  if (matchCount >= 5) return 1.4 + 0.2 * level;
  if (matchCount >= 4) return 1.15 + 0.1 * level;
  return 1.0;
}

// 连锁觉醒检测
export function checkChainAwakening(state, chainCount) {
  const level = getBlessingLevel(state, "chainAwakening");
  if (level <= 0) return false;
  if (chainCount < 3) return false;
  
  const mult = 0.8 + 0.4 * level;
  const bonus = 8 + 3 * level;
  const triggerProb = (0.1 + (chainCount - 3) * bonus / 100) * mult;
  return Math.random() < triggerProb;
}

// 技能连发检测
export function checkSkillBarrage(state) {
  const level = getBlessingLevel(state, "skillBarrage");
  if (level <= 0) return false;
  
  const triggerProb = (5 + 7 * level) / 100;
  return Math.random() < triggerProb;
}

export function getSkillBarrageMax(state) {
  const level = getBlessingLevel(state, "skillBarrage");
  if (level <= 1) return 1;
  if (level === 2) return 2;
  if (level === 3) return 3;
  if (level === 4) return 4;
  return Infinity;
}

// 战场统治 - 重排检测
export function checkBattlefieldControl(state) {
  const level = getBlessingLevel(state, "battlefieldControl");
  if (level <= 0) return false;
  
  const reshuffleProb = (3 + 4 * level) / 100;
  return Math.random() < reshuffleProb;
}

// 动能转化 - 获取转化率
export function getKineticConversionRate(state) {
  const level = getBlessingLevel(state, "kineticConversion");
  if (level <= 0) return 0;
  return (5 + 10 * level) / 100;
}

// 充能反击 - 获取反击伤害倍率
export function getChargedCounterDamage(state) {
  const level = getBlessingLevel(state, "chargedCounter");
  if (level <= 0) return 0;
  return 0.5 * Math.pow(2, level - 1);
}

// 充能反击触发概率
export function getChargedCounterTrigger(state) {
  const level = getBlessingLevel(state, "chargedCounter");
  if (level <= 0) return 0;
  return (15 + 15 * level) / 100;
}

// 能量吸收率
export function getEnergyAbsorbRate(state) {
  const level = getBlessingLevel(state, "energyAbsorb");
  if (level <= 0) return 0;
  return (3 + 7 * level) / 100;
}

// 蓄能感知阈值
export function getChargeSenseThreshold(state) {
  const level = getBlessingLevel(state, "chargeSense");
  if (level <= 0) return 1.0;
  return (60 - 10 * level) / 100;
}

// 能量吸收上限
export function getEnergyAbsorbCap(state) {
  const level = getBlessingLevel(state, "energyAbsorb");
  if (level <= 0) return 0;
  return 50 * Math.pow(2, level - 1);
}
