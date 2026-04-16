const zhen = (zh, en) => ({ zh, en });

// ============================================================
// 玩家祝福系统 - 当前仅保留 8 个核心祝福
// ============================================================

export const BLESSING_FORMULAS = {
  kineticAccumulation: {
    energyCap: (level) => [0, 30, 45, 60, 80, 100][Math.max(0, Math.min(5, level))],
    damagePer10: (level) => [0, 0.04, 0.05, 0.06, 0.07, 0.08][Math.max(0, Math.min(5, level))],
  },
  comboMania: {
    comboThreshold: (level) => (level >= 4 ? 2 : 3),
    triggerProb: (level) => [0, 0.18, 0.28, 0.38, 0.5, 0.62][Math.max(0, Math.min(5, level))],
    extraClearCount: (level) => [0, 2, 3, 4, 5, 6][Math.max(0, Math.min(5, level))],
  },
  momentumBreaker: {
    triggerProb: (level) => [0, 0.12, 0.2, 0.28, 0.36, 0.45][Math.max(0, Math.min(5, level))],
  },
  chargeWeaken: {
    weakenRate: (level) => [0, 0.12, 0.18, 0.24, 0.3, 0.36][Math.max(0, Math.min(5, level))],
  },
  criticalBlessing: {
    critProb: (level) => [0, 0.12, 0.18, 0.24, 0.3, 0.36][Math.max(0, Math.min(5, level))],
    critEffect: () => 2,
  },
  desperateSurvival: {
    moveThreshold: () => 5,
    moveGain: (level) => (level >= 4 ? 2 : 1),
  },
  tacticalReserve: {
    minMoves: () => 2,
    maxMoves: () => 5,
  },
  purifierSigil: {
    cleanseCount: (level) => Math.max(0, level * 2),
  },
  colorAssimilationBlessing: {
    affectedCount: (level) => Math.pow(2, Math.max(1, level - 1)),
  },
  neighborMimicBlessing: {
    affectedCount: (level) => Math.pow(2, Math.max(1, level - 1)),
  },
  explosiveInfusion: {
    affectedCount: (level) => Math.max(1, level),
  },
  lineSigil: {
    affectedCount: (level) => Math.max(1, level),
  },
};

export const BLESSING_DEFS = {
  kineticAccumulation: {
    title: zhen("动能累积", "Kinetic Accumulation"),
    desc: zhen("每次消除增加动能，动能越高伤害越高", "Each clear builds kinetic energy, and higher energy raises damage"),
    rarity: "common",
    category: "momentum",
    effect: zhen("消除会储存动能，并按当前动能提高伤害", "Clears store kinetic energy and scale damage by current energy"),
  },
  comboMania: {
    title: zhen("连击狂热", "Combo Mania"),
    desc: zhen("连击数达到阈值时，触发额外消除", "When combo count reaches a threshold, trigger extra clears"),
    rarity: "rare",
    category: "momentum",
    effect: zhen("连击达到阈值后，概率追加随机额外消除", "After hitting the combo threshold, may add random extra clears"),
  },
  momentumBreaker: {
    title: zhen("势如破竹", "Momentum Breaker"),
    desc: zhen("动量达到顶峰时，触发一次免费的全屏消除", "When momentum peaks, trigger a free board-wide clear"),
    rarity: "epic",
    category: "momentum",
    effect: zhen("动量拉满时有概率直接清屏一次", "On full momentum, has a chance to clear the board once for free"),
  },
  chargeWeaken: {
    title: zhen("蓄能削弱", "Charge Weaken"),
    desc: zhen("降低敌人蓄能速度", "Slow down enemy charge rate"),
    rarity: "common",
    category: "charge",
    effect: zhen("敌人被动蓄能速度持续降低", "Enemy passive charge gain is continuously reduced"),
  },
  criticalBlessing: {
    title: zhen("暴击祝福", "Critical Blessing"),
    desc: zhen("技能触发时，概率造成双倍效果", "Triggered skills have a chance to deal double effect"),
    rarity: "legendary",
    category: "trigger",
    effect: zhen("技能或特效命中时，概率直接翻倍", "Triggered skills and effects can crit for exact double effect"),
  },
  desperateSurvival: {
    title: zhen("绝境逢生", "Desperate Survival"),
    desc: zhen("当步数少于5的时候，每次连击会增加步数", "When moves are below 5, each combo grants extra moves"),
    rarity: "epic",
    category: "hybrid",
    effect: zhen("低步数时，每次连锁都会返还步数", "At low moves, each combo refunds moves"),
  },
  tacticalReserve: {
    title: zhen("战术预备", "Tactical Reserve"),
    desc: zhen("每层开始时获得额外步数（随机2-5），稳住节奏", "Gain 2-5 random extra moves at the start of each floor"),
    rarity: "rare",
    category: "hybrid",
    effect: zhen("每层开始随机额外获得 2~5 步", "Start each floor with a random 2~5 extra moves"),
  },
  purifierSigil: {
    title: zhen("净化印记", "Purifier Sigil"),
    desc: zhen("动量满了之后可以消耗动量点数*2的异常宝石", "When momentum fills, cleanse afflicted gems equal to level × 2"),
    rarity: "epic",
    category: "hybrid",
    effect: zhen("动量拉满时自动净化 等级×2 个异常宝石", "When momentum peaks, automatically cleanse afflicted gems equal to level × 2"),
  },
  colorAssimilationBlessing: {
    title: zhen("色彩同化", "Color Assimilation"),
    desc: zhen("作战技能结算后自动改色，帮助下一轮形成匹配。", "Recolors gems after combat skill resolution to help create the next match."),
    rarity: "rare",
    category: "trigger",
    effect: zhen("由旧作战技能迁移而来，现作为祝福修饰后续棋盘。", "Migrated from the old combat skill and now modifies the board as a blessing."),
  },
  neighborMimicBlessing: {
    title: zhen("邻近模仿", "Neighbor Mimic"),
    desc: zhen("作战技能结算后，让部分宝石模仿邻居主色，提升潜在三消率。", "After combat skills resolve, some gems mimic surrounding dominant colors to increase future match potential."),
    rarity: "common",
    category: "trigger",
    effect: zhen("由旧作战技能迁移而来，现负责局后校色与铺垫。", "Migrated from the old combat skill and now adjusts local colors after resolution."),
  },
  explosiveInfusion: {
    title: zhen("爆裂灌注", "Explosive Infusion"),
    desc: zhen("作战技能命中的若干宝石会获得爆炸强化。", "Several gems hit by combat skills gain explosive infusion."),
    rarity: "common",
    category: "trigger",
    effect: zhen("由旧爆炸强化迁移而来，现作为祝福修饰作战技能命中结果。", "Migrated from the old explosive enchant and now modifies combat skill hits as a blessing."),
  },
  lineSigil: {
    title: zhen("横竖刻印", "Line Sigil"),
    desc: zhen("作战技能命中的若干宝石会获得横竖强化。", "Several gems hit by combat skills gain line sigils."),
    rarity: "rare",
    category: "trigger",
    effect: zhen("由旧横竖强化迁移而来，现作为祝福持续修饰后续连锁。", "Migrated from the old line enchant and now persistently modifies later chains as a blessing."),
  },
};

export const BLESSING_IMAGE_BY_ID = {
  kineticAccumulation: "./assets/generated/blessings/unified-covers/blessing_kineticAccumulation_cover-20260407-113354-1.jpeg",
  comboMania: "./assets/generated/blessings/unified-covers/blessing_comboMania_cover-20260407-113355-1.jpeg",
  momentumBreaker: "./assets/generated/blessings/unified-covers/blessing_momentumBreaker_cover-20260407-113355-1.jpeg",
  chargeWeaken: "./assets/generated/blessings/unified-covers/blessing_chargeWeaken_cover-20260407-113449-1.jpeg",
  criticalBlessing: "./assets/generated/blessings/unified-covers/blessing_criticalBlessing_cover-20260407-113449-1.jpeg",
  desperateSurvival: "./assets/generated/blessings/unified-covers/blessing_desperateSurvival_cover-20260407-113537-1.jpeg",
  tacticalReserve: "./assets/generated/blessings/unified-covers/blessing_tacticalReserve_cover-20260407-113538-1.jpeg",
  purifierSigil: "./assets/generated/blessings/unified-covers/blessing_purifierSigil_cover-20260407-113538-1.jpeg",
  colorAssimilationBlessing: "./assets/generated/items/colorAssimilation-20260403-120628-1_rgba.png",
  neighborMimicBlessing: "./assets/generated/items/neighborMimic-20260403-120747-1_rgba.png",
  explosiveInfusion: "./assets/generated/items/explosiveEnchant-20260403-120823-1_rgba.png",
  lineSigil: "./assets/generated/items/lineEnchant-20260403-120840-1_rgba.png",
};

export const BLESSING_EFFECT_BY_ID = {
  kineticAccumulation: "momentum",
  comboMania: "combo",
  momentumBreaker: "burst",
  chargeWeaken: "debuff",
  criticalBlessing: "critical",
  desperateSurvival: "desperate",
  tacticalReserve: "reserve",
  purifierSigil: "purify",
  colorAssimilationBlessing: "recolor",
  neighborMimicBlessing: "mimic",
  explosiveInfusion: "explosive",
  lineSigil: "line",
};

export const BLESSING_CATEGORIES = {
  momentum: zhen("动量类", "Momentum"),
  charge: zhen("蓄能类", "Charge"),
  trigger: zhen("触发类", "Trigger"),
  hybrid: zhen("综合类", "Hybrid"),
  recolor: zhen("改色类", "Recolor"),
  mimic: zhen("模仿类", "Mimic"),
  explosive: zhen("爆裂类", "Explosive"),
  line: zhen("横竖类", "Line"),
};

export const BLESSING_ORDER = [
  "kineticAccumulation",
  "comboMania",
  "momentumBreaker",
  "chargeWeaken",
  "criticalBlessing",
  "desperateSurvival",
  "tacticalReserve",
  "purifierSigil",
  "colorAssimilationBlessing",
  "neighborMimicBlessing",
  "explosiveInfusion",
  "lineSigil",
];

export const RARITY_LABELS = {
  common: zhen("普通", "Common"),
  rare: zhen("稀有", "Rare"),
  epic: zhen("史诗", "Epic"),
  legendary: zhen("传说", "Legendary"),
};

export const RARITY_ORDER = ["common", "rare", "epic", "legendary"];

export const BLESSING_SYERGIES = {
  kineticSet: {
    name: zhen("动量三重奏", "Momentum Trio"),
    blessings: ["kineticAccumulation", "comboMania", "momentumBreaker"],
    effect: zhen("高动量局面会更容易滚起连锁和清屏节奏", "High-momentum turns more easily snowball into extra clears and wipe effects"),
  },
  survivalLoop: {
    name: zhen("续航回稳", "Stabilized Recovery"),
    blessings: ["desperateSurvival", "tacticalReserve", "purifierSigil"],
    effect: zhen("低步数与异常盘面的容错会明显提升", "Low-move and ailment-heavy situations become much safer"),
  },
};

export const BLESSING_UPGRADE_COSTS = {
  1: { score: 0, label: "初始" },
  2: { score: 100, label: "100评分" },
  3: { score: 250, label: "250评分" },
  4: { score: 500, label: "500评分" },
  5: { score: 1000, label: "1000评分" },
};

export const MAX_BLESSING_SLOTS = 5;
