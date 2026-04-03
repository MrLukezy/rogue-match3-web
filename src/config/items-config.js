export const MAX_ITEM_TYPES = 5;

const zhen = (zh, en) => ({ zh, en });

// ============================================================
// 宝石技能系统 - 核心目标：让玩家更方便地消除宝石
// ============================================================

// 销毁数量计算公式（供代码引用）
export const ITEM_FORMULAS = {
  // 直接销毁类
  blast: (level) => level === 1 ? 2 : level === 2 ? 5 : level === 3 ? 9 : level === 4 ? 14 : 21,
  chainLightning: (level) => level === 1 ? 3 : level === 2 ? 6 : level === 3 ? 10 : level === 4 ? 15 : 21,
  crossStrike: (level) => level === 1 ? 9 : level === 2 ? 15 : level === 3 ? 25 : level === 4 ? 35 : 49,
  meteor: (level) => level * (level + 3),
  splatter: (level) => level === 1 ? 3 : level === 2 ? 5 : level === 3 ? 7 : level === 4 ? 10 : 14,
  shatter: (level) => {
    const n = level * 2;
    return Math.floor(n * (n + 1) / 2) + 3;
  },

  // 颜色改变类 (返回三消概率%)
  colorAssimilation: (level) => 50 + 10 * level,
  paintTarget: (level) => 30 + 10 * (level + 1),
  rainbowBridge: (level) => level === 1 ? 4 : level === 2 ? 6 : level === 3 ? 8 : level === 4 ? 11 : 15,
  colorCycle: (level) => 40 + 12 * level,
  neighborMimic: (level) => 35 + 13 * level,
  mirrorCopy: (level) => 45 + 11 * level,

  // 宝石强化类
  explosiveEnchant: (level) => {
    const n = level * 2 - 1;
    return Math.floor(n * (n + 1) / 2) + 2;
  },
  lineEnchant: (level) => 4 * level * level + 2 * level + 1,
  comboEnchant: (level) => {
    const n = level + 1;
    return Math.floor(n * (n + 1) / 2) + 1;
  },

  // 宝石触发类
  instantTrigger: (level) => Math.pow(2, level + 1) - 1 + level * 2,
  chainTrigger: (level) => {
    const n = level * 2 + 1;
    return Math.floor(n * (n + 3) / 2);
  },
  timedDetonate: (level) => level * level * 2 + level + 2,
  conditionalTrigger: (level) => {
    const n = level * 2 - 1;
    return n * (n + 1) - 1;
  },
  resonanceTrigger: (level) => {
    const n = level * 2;
    return n * (n + 2);
  },
  priorityTrigger: (level) => level * level * 2 + level,
};

// 触发概率
export const ITEM_TRIGGERS = {
  blast: () => 1.0,
  chainLightning: () => 1.0,
  crossStrike: () => 1.0,
  meteor: () => 0.85,
  splatter: (level) => 0.30 + 0.10 * (level - 1),
  shatter: (level) => 0.60 + 0.10 * (level - 1),
  colorAssimilation: () => 1.0,
  paintTarget: () => 1.0,
  rainbowBridge: () => 0.90,
  colorCycle: () => 0.75,
  neighborMimic: () => 1.0,
  mirrorCopy: () => 0.85,
  explosiveEnchant: () => 1.0,
  lineEnchant: () => 1.0,
  comboEnchant: () => 1.0,
  instantTrigger: () => 1.0,
  chainTrigger: () => 0.90,
  timedDetonate: () => 0.85,
  conditionalTrigger: () => 0.75,
  resonanceTrigger: () => 0.80,
  priorityTrigger: () => 0.95,
};

// 技能定义
export const ITEM_DEFS = {
  // ==================== 直接销毁类 ====================
  blast: {
    name: zhen("爆破", "Blast"),
    image: "./assets/generated/items/blast-20260403-120429-1_rgba.png",
    desc: zhen("以目标宝石为圆心，消除周围宝石。等级越高，范围越大。", "Destroy gems in a circular area around target. Higher levels expand the blast radius."),
    target: true,
    rarity: "common",
    type: "destruction",
  },
  chainLightning: {
    name: zhen("连锁闪电", "Chain Lightning"),
    image: "./assets/generated/items/chainLightning-20260403-120457-1_rgba.png",
    desc: zhen("消灭一颗宝石后，电流跳跃至相邻同色宝石继续消灭。", "After destroying a gem, lightning chains to adjacent gems of the same color."),
    target: true,
    rarity: "common",
    type: "destruction",
  },
  crossStrike: {
    name: zhen("十字斩", "Cross Strike"),
    image: "./assets/generated/items/crossStrike-20260403-120518-1_rgba.png",
    desc: zhen("消除一整行和一整列的宝石。", "Destroy an entire row and column of gems."),
    target: true,
    rarity: "rare",
    type: "destruction",
  },
  meteor: {
    name: zhen("宝石雨", "Meteor"),
    image: "./assets/generated/items/meteor-20260403-120536-1_rgba.png",
    desc: zhen("随机掉落特殊宝石，落地时消除落点周围宝石。", "Random meteors fall and destroy gems on impact."),
    target: false,
    rarity: "common",
    type: "destruction",
  },
  splatter: {
    name: zhen("溅射", "Splatter"),
    image: "./assets/generated/items/splatter-20260403-120553-1_rgba.png",
    desc: zhen("消除一颗宝石时，概率触发额外溅射伤害。", "When destroying a gem, chance to trigger extra splash damage."),
    target: false,
    rarity: "common",
    type: "destruction",
  },
  shatter: {
    name: zhen("粉碎", "Shatter"),
    image: "./assets/generated/items/shatter-20260403-120610-1_rgba.png",
    desc: zhen("对单颗宝石造成巨大伤害，概率粉碎周围同色宝石。", "Deal massive damage to a single gem with a chance to shatter surrounding same-color gems."),
    target: true,
    rarity: "rare",
    type: "destruction",
  },

  // ==================== 颜色改变类 ====================
  colorAssimilation: {
    name: zhen("色彩同化", "Color Assimilation"),
    image: "./assets/generated/items/colorAssimilation-20260403-120628-1_rgba.png",
    desc: zhen("将目标周围宝石变为主目标宝石的颜色，创造三消机会。", "Change surrounding gems to match the target's color, creating match-3 opportunities."),
    target: true,
    rarity: "rare",
    type: "colorChange",
  },
  paintTarget: {
    name: zhen("染色目标", "Paint Target"),
    image: "./assets/generated/items/paintTarget-20260403-120645-1_rgba.png",
    desc: zhen("指定一颗宝石变为指定颜色。", "Change a target gem to a specified color."),
    target: true,
    rarity: "common",
    type: "colorChange",
  },
  rainbowBridge: {
    name: zhen("彩虹桥", "Rainbow Bridge"),
    image: "./assets/generated/items/rainbowBridge-20260403-120704-1_rgba.png",
    desc: zhen("在两指定宝石之间建立路径，将路径上所有宝石变为主目标颜色。", "Create a path between two gems, changing all gems along it to the main target's color."),
    target: true,
    rarity: "rare",
    type: "colorChange",
  },
  colorCycle: {
    name: zhen("色相轮回", "Color Cycle"),
    image: "./assets/generated/items/colorCycle-20260403-120720-1_rgba.png",
    desc: zhen("将一片区域宝石按顺时针顺序循环变色。", "Cycle the colors of gems in an area clockwise."),
    target: true,
    rarity: "epic",
    type: "colorChange",
  },
  neighborMimic: {
    name: zhen("邻近模仿", "Neighbor Mimic"),
    image: "./assets/generated/items/neighborMimic-20260403-120747-1_rgba.png",
    desc: zhen("宝石变为上下左右邻居中出现最多的颜色。", "Gem changes to match the most common color among its neighbors."),
    target: true,
    rarity: "common",
    type: "colorChange",
  },
  mirrorCopy: {
    name: zhen("镜像复制", "Mirror Copy"),
    image: "./assets/generated/items/mirrorCopy-20260403-120805-1_rgba.png",
    desc: zhen("将一个区域的颜色分布镜像复制到另一区域。", "Mirror the color distribution from one area to another."),
    target: true,
    rarity: "epic",
    type: "colorChange",
  },

  // ==================== 宝石强化类 ====================
  explosiveEnchant: {
    name: zhen("爆炸强化", "Explosive Enchant"),
    image: "./assets/generated/items/explosiveEnchant-20260403-120823-1_rgba.png",
    desc: zhen("为目标宝石添加爆炸属性，被消除时造成范围伤害。", "Enchant a gem with explosive properties - it deals area damage when destroyed."),
    target: true,
    rarity: "common",
    type: "enhancement",
  },
  lineEnchant: {
    name: zhen("横竖强化", "Line Enchant"),
    image: "./assets/generated/items/lineEnchant-20260403-120840-1_rgba.png",
    desc: zhen("为目标宝石添加横竖属性，被消除时消除整行或整列。", "Enchant a gem with line properties - it clears entire rows or columns when destroyed."),
    target: true,
    rarity: "rare",
    type: "enhancement",
  },
  comboEnchant: {
    name: zhen("连击强化", "Combo Enchant"),
    image: "./assets/generated/items/comboEnchant-20260403-120900-1_rgba.png",
    desc: zhen("为目标宝石添加连击属性，消除后额外触发一次。", "Enchant a gem with combo properties - it triggers extra hits after destruction."),
    target: true,
    rarity: "rare",
    type: "enhancement",
  },
  // ==================== 宝石触发类 ====================
  instantTrigger: {
    name: zhen("即时引爆", "Instant Trigger"),
    image: "./assets/generated/items/instantTrigger-20260403-120919-1_rgba.png",
    desc: zhen("立即触发所有强化宝石的被动效果。", "Immediately trigger all enchanted gems' passive effects."),
    target: false,
    rarity: "epic",
    type: "trigger",
  },
  chainTrigger: {
    name: zhen("连锁引爆", "Chain Trigger"),
    image: "./assets/generated/items/chainTrigger-20260403-120936-1_rgba.png",
    desc: zhen("触发一颗强化宝石后，依次连锁触发周围强化宝石。", "After triggering one enchanted gem, chain-trigger surrounding enchanted gems."),
    target: false,
    rarity: "epic",
    type: "trigger",
  },
  timedDetonate: {
    name: zhen("定时爆破", "Timed Detonate"),
    image: "./assets/generated/items/timedDetonate-20260403-120953-1_rgba.png",
    desc: zhen("为所有强化宝石设置延迟引爆。", "Set a delayed detonation for all enchanted gems."),
    target: false,
    rarity: "rare",
    type: "trigger",
  },
  conditionalTrigger: {
    name: zhen("条件爆破", "Conditional Trigger"),
    image: "./assets/generated/items/conditionalTrigger-20260403-121012-1_rgba.png",
    desc: zhen("当满足特定条件时触发强化宝石。", "Trigger enchanted gems when specific conditions are met."),
    target: false,
    rarity: "rare",
    type: "trigger",
  },
  resonanceTrigger: {
    name: zhen("共鸣引爆", "Resonance Trigger"),
    image: "./assets/generated/items/resonanceTrigger-20260403-121029-1_rgba.png",
    desc: zhen("同色强化宝石达到数量时集体触发。", "Same-color enchanted gems trigger collectively when threshold is reached."),
    target: false,
    rarity: "legendary",
    type: "trigger",
  },
  priorityTrigger: {
    name: zhen("强化优先", "Priority Trigger"),
    image: "./assets/generated/items/priorityTrigger-20260403-121045-1_rgba.png",
    desc: zhen("优先触发高等级强化宝石。", "Prioritize triggering high-level enchanted gems."),
    target: false,
    rarity: "epic",
    type: "trigger",
  },
};

// 技能顺序（按类型分组）
export const ITEM_ORDER = [
  // 直接销毁
  "blast", "chainLightning", "crossStrike", "meteor", "splatter", "shatter",
  // 颜色改变
  "colorAssimilation", "paintTarget", "rainbowBridge", "colorCycle", "neighborMimic", "mirrorCopy",
  // 宝石强化
  "explosiveEnchant", "lineEnchant", "comboEnchant",
  // 宝石触发
  "instantTrigger", "chainTrigger", "timedDetonate", "conditionalTrigger", "resonanceTrigger", "priorityTrigger",
];

export const ITEM_BASE_COUNTS = { blast: 0, chainLightning: 0, crossStrike: 0, meteor: 0, splatter: 0, shatter: 0 };
export const ITEM_BASE_LEVEL = 1;

export const RARITY_LABELS = {
  common: zhen("普通", "Common"),
  rare: zhen("稀有", "Rare"),
  epic: zhen("史诗", "Epic"),
  legendary: zhen("传说", "Legendary"),
};

// 稀有度顺序
export const RARITY_ORDER = ["common", "rare", "epic", "legendary"];

// 技能类型标签
export const TYPE_LABELS = {
  destruction: zhen("直接销毁", "Destruction"),
  colorChange: zhen("颜色改变", "Color Change"),
  enhancement: zhen("宝石强化", "Enhancement"),
  trigger: zhen("宝石触发", "Trigger"),
};

// 动画帧（复用现有占位符路径，实际需要生成）
export const ITEM_ANIM_FRAMES = {
  blast: ["./assets/generated/items/blast-20260403-120429-1_rgba.png"],
  chainLightning: ["./assets/generated/items/chainLightning-20260403-120457-1_rgba.png"],
  crossStrike: ["./assets/generated/items/crossStrike-20260403-120518-1_rgba.png"],
  meteor: ["./assets/generated/items/meteor-20260403-120536-1_rgba.png"],
  splatter: ["./assets/generated/items/splatter-20260403-120553-1_rgba.png"],
  shatter: ["./assets/generated/items/shatter-20260403-120610-1_rgba.png"],
  colorAssimilation: ["./assets/generated/items/colorAssimilation-20260403-120628-1_rgba.png"],
  paintTarget: ["./assets/generated/items/paintTarget-20260403-120645-1_rgba.png"],
  rainbowBridge: ["./assets/generated/items/rainbowBridge-20260403-120704-1_rgba.png"],
  colorCycle: ["./assets/generated/items/colorCycle-20260403-120720-1_rgba.png"],
  neighborMimic: ["./assets/generated/items/neighborMimic-20260403-120747-1_rgba.png"],
  mirrorCopy: ["./assets/generated/items/mirrorCopy-20260403-120805-1_rgba.png"],
  explosiveEnchant: ["./assets/generated/items/explosiveEnchant-20260403-120823-1_rgba.png"],
  lineEnchant: ["./assets/generated/items/lineEnchant-20260403-120840-1_rgba.png"],
  comboEnchant: ["./assets/generated/items/comboEnchant-20260403-120900-1_rgba.png"],
  instantTrigger: ["./assets/generated/items/instantTrigger-20260403-120919-1_rgba.png"],
  chainTrigger: ["./assets/generated/items/chainTrigger-20260403-120936-1_rgba.png"],
  timedDetonate: ["./assets/generated/items/timedDetonate-20260403-120953-1_rgba.png"],
  conditionalTrigger: ["./assets/generated/items/conditionalTrigger-20260403-121012-1_rgba.png"],
  resonanceTrigger: ["./assets/generated/items/resonanceTrigger-20260403-121029-1_rgba.png"],
  priorityTrigger: ["./assets/generated/items/priorityTrigger-20260403-121045-1_rgba.png"],
};
