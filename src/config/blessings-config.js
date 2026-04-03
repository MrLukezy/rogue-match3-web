const zhen = (zh, en) => ({ zh, en });

// ============================================================
// 玩家祝福系统 - 核心目标：动量、蓄能、技能触发率
// ============================================================

// 祝福升级公式
export const BLESSING_FORMULAS = {
  // 动量类
  kineticAccumulation: {
    momentumCap: (level) => level === 1 ? 50 : level === 2 ? 75 : level === 3 ? 100 : level === 4 ? 150 : 200,
    damagePer10: (level) => level === 1 ? 3 : level === 2 ? 5 : level === 3 ? 8 : level === 4 ? 12 : 20,
  },
  comboMania: {
    triggerProb: (level) => 15 + 15 * level,
    extraCount: (level) => level,
  },
  momentumBreaker: {
    threshold: (level) => 95 - 5 * level, // %
    range: (level) => 2 * level + 1,
  },
  kineticConversion: {
    convertRate: (level) => 5 + 10 * level, // %
    overflowCap: (level) => level === 1 ? 50 : level === 2 ? 75 : level === 3 ? 100 : level === 4 ? 150 : Infinity,
  },

  // 蓄能类
  chargeSense: {
    threshold: (level) => 60 - 10 * level, // %
    momentumBonus: (level) => 5 * level,
  },
  chargedCounter: {
    damageMult: (level) => 0.5 * Math.pow(2, level - 1),
    triggerProb: (level) => 15 + 15 * level,
  },
  energyAbsorb: {
    absorbRate: (level) => 3 + 7 * level,
    energyCap: (level) => 50 * Math.pow(2, level - 1),
  },
  chargeWeaken: {
    weakenRate: (level) => 8 * level + 2, // %
  },

  // 触发类
  luckyAura: {
    triggerBonus: (level) => 3 * level + 2, // %
  },
  cooldownReduction: {
    reduction: (level) => 8 * level + 2, // %
  },
  chainAwakening: {
    triggerMult: (level) => 0.8 + 0.4 * level,
    chainBonus: (level) => 8 + 3 * level,
  },
  criticalBlessing: {
    critProb: (level) => 8 + 6 * level,
    critEffect: (level) => 1.3 + 0.4 * level,
  },
  skillBarrage: {
    barrageProb: (level) => 5 + 7 * level,
    maxBarrage: (level) => level === 1 ? 1 : level === 2 ? 2 : level === 3 ? 3 : level === 4 ? 4 : Infinity,
  },

  // 综合类
  desperateSurvival: {
    hpThreshold: (level) => 20 + 5 * level,
    damageBonus: (level) => 10 * Math.pow(2, level - 1),
    triggerBonus: (level) => 8 * level,
  },
  battlefieldControl: {
    reshuffleProb: (level) => 3 + 4 * level,
    matchOptimize: (level) => 8 + 10 * level,
  },
  perfectionist: {
    match4Bonus: (level) => 1.15 + 0.1 * level,
    match5Bonus: (level) => 1.4 + 0.2 * level,
  },
  resourceRecovery: {
    refundProb: (level) => 3 + 5 * level,
  },
};

// 祝福定义
export const BLESSING_DEFS = {
  // ==================== 动量类 ====================
  kineticAccumulation: {
    title: zhen("动能累积", "Kinetic Accumulation"),
    desc: zhen("每次消除增加动能，动能越高伤害越高", "Each clear builds kinetic energy - higher energy means more damage"),
    rarity: "common",
    category: "momentum",
    effect: zhen("每次消除+1动能，连击时额外+0.5", "+1 kinetic per clear, +0.5 per combo hit"),
  },
  comboMania: {
    title: zhen("连击狂热", "Combo Mania"),
    desc: zhen("连击数达到阈值时，概率触发额外消除", "Chance to trigger extra clears when combo threshold is reached"),
    rarity: "rare",
    category: "momentum",
    effect: zhen("连击≥3时触发，等级越高概率越高", "Triggers at combo≥3, higher levels = higher chance"),
  },
  momentumBreaker: {
    title: zhen("势如破竹", "Momentum Breaker"),
    desc: zhen("动量达到顶峰时，触发一次免费的全屏消除", "When momentum peaks, trigger a free board-wide clear"),
    rarity: "epic",
    category: "momentum",
    effect: zhen("动量达上限的90%-70%时触发", "Triggers at 90%-70% of max momentum"),
  },
  kineticConversion: {
    title: zhen("动能转化", "Kinetic Conversion"),
    desc: zhen("将多余动能转化为回复生命", "Convert excess kinetic energy into HP recovery"),
    rarity: "rare",
    category: "momentum",
    effect: zhen("溢出动能10%-50%转化为生命", "Convert 10%-50% of overflow to HP"),
  },

  // ==================== 蓄能类 ====================
  chargeSense: {
    title: zhen("蓄能感知", "Charge Sense"),
    desc: zhen("感知敌人蓄能进度，提前预警并提供反击机会", "Sense enemy charge progress, get early warning and counter opportunities"),
    rarity: "rare",
    category: "charge",
    effect: zhen("敌人蓄能50%-5%时预警，获得动量", "Warn at 50%-5% enemy charge, gain momentum"),
  },
  chargedCounter: {
    title: zhen("充能反击", "Charged Counter"),
    desc: zhen("敌人蓄能满时，概率自动触发反击", "When enemy charge is full, chance to auto-counter"),
    rarity: "rare",
    category: "charge",
    effect: zhen("蓄能满时50%-200%伤害反击", "Counter with 50%-200% damage on full charge"),
  },
  energyAbsorb: {
    title: zhen("能量吸收", "Energy Absorb"),
    desc: zhen("敌人蓄能时，玩家吸收部分能量为自己所用", "When enemy charges, absorb some energy for yourself"),
    rarity: "epic",
    category: "charge",
    effect: zhen("吸收敌人5%-40%蓄能", "Absorb 5%-40% of enemy charge"),
  },
  chargeWeaken: {
    title: zhen("蓄能削弱", "Charge Weaken"),
    desc: zhen("降低敌人蓄能速度", "Slow down enemy charge rate"),
    rarity: "common",
    category: "charge",
    effect: zhen("敌人蓄能速度-10%-60%", "Enemy charge rate reduced by 10%-60%"),
  },

  // ==================== 触发类 ====================
  luckyAura: {
    title: zhen("幸运光环", "Lucky Aura"),
    desc: zhen("提高所有技能的触发概率", "Increase trigger chance of all skills"),
    rarity: "epic",
    category: "trigger",
    effect: zhen("所有技能触发率+5%-30%", "All skills +5%-30% trigger rate"),
  },
  cooldownReduction: {
    title: zhen("技能冷却缩减", "Cooldown Reduction"),
    desc: zhen("减少技能冷却时间", "Reduce skill cooldown"),
    rarity: "rare",
    category: "trigger",
    effect: zhen("冷却时间-10%-55%", "Cooldown reduced by 10%-55%"),
  },
  chainAwakening: {
    title: zhen("连锁觉醒", "Chain Awakening"),
    desc: zhen("连锁消除时，概率触发技能自动释放", "Chance to auto-trigger skills during chain clears"),
    rarity: "epic",
    category: "trigger",
    effect: zhen("3连消起，+10%-25%/连消", "From 3-match, +10%-25% per additional match"),
  },
  criticalBlessing: {
    title: zhen("暴击祝福", "Critical Blessing"),
    desc: zhen("技能触发时，概率造成双倍效果", "Chance for skills to deal double effect"),
    rarity: "legendary",
    category: "trigger",
    effect: zhen("10%-40%概率暴击，1.5-3倍效果", "10%-40% crit chance, 1.5-3x effect"),
  },
  skillBarrage: {
    title: zhen("技能连发", "Skill Barrage"),
    desc: zhen("技能触发后，概率继续触发其他技能", "After skill triggers, chance to trigger another"),
    rarity: "legendary",
    category: "trigger",
    effect: zhen("10%-40%概率连发，最多5次", "10%-40% barrage chance, up to 5 hits"),
  },

  // ==================== 综合类 ====================
  desperateSurvival: {
    title: zhen("绝境逢生", "Desperate Survival"),
    desc: zhen("生命值低时获得强力增益", "Gain powerful buffs when HP is low"),
    rarity: "epic",
    category: "hybrid",
    effect: zhen("HP<40%时，伤害+100%，技能触发+40%", "At HP<40%, +100% damage, +40% skill trigger"),
  },
  battlefieldControl: {
    title: zhen("战场统治", "Battlefield Control"),
    desc: zhen("控制棋盘格局，创造有利消除条件", "Control the board, create favorable clear conditions"),
    rarity: "rare",
    category: "hybrid",
    effect: zhen("每回合5%-25%概率重排，优化三消", "5%-25% chance to reshuffle per turn, optimize match-3"),
  },
  perfectionist: {
    title: zhen("完美主义", "Perfectionist"),
    desc: zhen("强迫症式的精准消除，奖励完美操作", "Reward perfect operations with bonus effects"),
    rarity: "rare",
    category: "hybrid",
    effect: zhen("4消1.2-1.6倍，5消1.5-2.5倍", "4-match 1.2-1.6x, 5-match 1.5-2.5x"),
  },
  resourceRecovery: {
    title: zhen("资源回收", "Resource Recovery"),
    desc: zhen("未触发的技能概率返还冷却", "Chance to refund cooldown on missed skills"),
    rarity: "common",
    category: "hybrid",
    effect: zhen("技能未触发时，5%-30%概率返还", "5%-30% chance to refund on miss"),
  },
};

// 祝福分类
export const BLESSING_CATEGORIES = {
  momentum: zhen("动量类", "Momentum"),
  charge: zhen("蓄能类", "Charge"),
  trigger: zhen("触发类", "Trigger"),
  hybrid: zhen("综合类", "Hybrid"),
};

// 祝福顺序
export const BLESSING_ORDER = [
  // 动量类
  "kineticAccumulation", "comboMania", "momentumBreaker", "kineticConversion",
  // 蓄能类
  "chargeSense", "chargedCounter", "energyAbsorb", "chargeWeaken",
  // 触发类
  "luckyAura", "cooldownReduction", "chainAwakening", "criticalBlessing", "skillBarrage",
  // 综合类
  "desperateSurvival", "battlefieldControl", "perfectionist", "resourceRecovery",
];

// 稀有度标签
export const RARITY_LABELS = {
  common: zhen("普通", "Common"),
  rare: zhen("稀有", "Rare"),
  epic: zhen("史诗", "Epic"),
  legendary: zhen("传说", "Legendary"),
};

// 稀有度顺序
export const RARITY_ORDER = ["common", "rare", "epic", "legendary"];

// 协同效果定义
export const BLESSING_SYERGIES = {
  kineticSet: {
    name: zhen("动能三件套", "Kinetic Set"),
    blessings: ["kineticAccumulation", "comboMania", "momentumBreaker"],
    effect: zhen("动量溢出时，连击狂热触发率+50%", "When momentum overflows, Combo Mania trigger rate +50%"),
  },
  chargeCounter: {
    name: zhen("蓄能克星", "Charge Counter"),
    blessings: ["chargeSense", "chargedCounter", "energyAbsorb"],
    effect: zhen("打断敌人蓄能时，回复量翻倍", "When interrupting enemy charge, recovery doubled"),
  },
  skillStorm: {
    name: zhen("技能狂潮", "Skill Storm"),
    blessings: ["luckyAura", "chainAwakening", "skillBarrage"],
    effect: zhen("连锁触发技能时，幸运光环效果翻倍", "When chain-triggering skills, Lucky Aura effect doubled"),
  },
  desperateReversal: {
    name: zhen("绝境逆转", "Desperate Reversal"),
    blessings: ["desperateSurvival", "kineticConversion", "criticalBlessing"],
    effect: zhen("低血量时，暴击概率额外+30%", "At low HP, crit chance +30% additional"),
  },
};

// 升级材料需求
export const BLESSING_UPGRADE_COSTS = {
  1: { score: 0, label: "初始" },
  2: { score: 100, label: "100评分" },
  3: { score: 250, label: "250评分" },
  4: { score: 500, label: "500评分" },
  5: { score: 1000, label: "1000评分" },
};

// 装备槽位
export const MAX_BLESSING_SLOTS = 3;
