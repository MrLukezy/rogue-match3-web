export const MAX_ITEM_TYPES = 5;

const zhen = (zh, en) => ({ zh, en });

// ============================================================
// 玩家作战技能（按最新规格收缩为 10 个）
// ============================================================

export const ITEM_FORMULAS = {
  // 直接销毁类
  blast: (level) => {
    const side = level + 2; // 3,4,5,6,7
    return side * side; // 9,16,25,36,49
  },
  chainLightning: (level) => Math.pow(2, level), // 2,4,8,16,32
  crossStrike: (level) => 4 * level + 1, // 中心 + 四方向延展
  meteor: (level) => Math.pow(2, level),
  splatter: (level) => Math.pow(2, level),
  shatter: (level) => Math.pow(2, level),

  // 颜色改变类
  colorAssimilation: (level) => Math.pow(2, level),
  neighborMimic: (level) => Math.pow(2, level),

  // 宝石强化类
  explosiveEnchant: (level) => level,
  lineEnchant: (level) => level,
};

export const ITEM_TRIGGERS = {
  blast: () => 1.0,
  chainLightning: () => 1.0,
  crossStrike: () => 1.0,
  meteor: () => 1.0,
  splatter: () => 1.0,
  shatter: () => 1.0,
  colorAssimilation: () => 1.0,
  neighborMimic: () => 1.0,
  explosiveEnchant: () => 1.0,
  lineEnchant: () => 1.0,
};

export const ITEM_DEFS = {
  blast: {
    name: zhen("爆破", "Blast"),
    image: "./assets/generated/items/blast-20260403-120429-1_rgba.png",
    desc: zhen("以目标宝石为中心爆破范围。Lv1~Lv5 依次覆盖 3x3、4x4、5x5、6x6、7x7 区域，是非常强力的史诗技能。", "Explodes around the target gem. Lv1~Lv5 cover 3x3 to 7x7 areas, making it a very powerful epic skill."),
    target: true,
    rarity: "epic",
    type: "destruction",
  },
  chainLightning: {
    name: zhen("连锁闪电", "Chain Lightning"),
    image: "./assets/generated/items/chainLightning-20260403-120457-1_rgba.png",
    desc: zhen("从触发点开始沿相邻同色宝石跳跃。Lv1~Lv5 总目标数依次为 2、4、8、16、32。", "Starts from the trigger gem and jumps through adjacent gems of the same color. Lv1~Lv5 hit 2, 4, 8, 16, and 32 targets."),
    target: true,
    rarity: "rare",
    type: "destruction",
  },
  crossStrike: {
    name: zhen("十字斩", "Cross Strike"),
    image: "./assets/generated/items/crossStrike-20260403-120518-1_rgba.png",
    desc: zhen("以触发点为中心形成十字斩击。Lv1 起覆盖上下左右各 1 格，等级越高每个方向再外扩 1 格。", "Creates a cross strike centered on the trigger point. Lv1 reaches 1 tile in each direction and each level extends farther."),
    target: true,
    rarity: "rare",
    type: "destruction",
  },
  meteor: {
    name: zhen("宝石雨", "Meteor"),
    image: "./assets/generated/items/meteor-20260403-120536-1_rgba.png",
    desc: zhen("随机落下陨石并在落点引发爆炸。Lv1~Lv5 总伤害目标数依次为 2、4、8、16、32。", "Random meteors fall and explode on impact. Lv1~Lv5 damage 2, 4, 8, 16, and 32 total targets."),
    target: false,
    rarity: "rare",
    type: "destruction",
  },
  splatter: {
    name: zhen("溅射", "Splatter"),
    image: "./assets/generated/items/splatter-20260403-120553-1_rgba.png",
    desc: zhen("消除后触发额外溅射伤害。Lv1~Lv5 额外影响 2、4、8、16、32 个目标，溅射范围逐步增大。", "Triggers extra splash damage after a clear. Lv1~Lv5 affect 2, 4, 8, 16, and 32 extra targets with a growing radius."),
    target: false,
    rarity: "rare",
    type: "destruction",
  },
  shatter: {
    name: zhen("粉碎", "Shatter"),
    image: "./assets/generated/items/shatter-20260403-120610-1_rgba.png",
    desc: zhen("对单颗宝石造成巨大伤害，并粉碎周围同色宝石。Lv1~Lv5 额外影响 2、4、8、16、32 个目标，范围逐步增大。", "Deals heavy damage to one gem and shatters nearby same-color gems. Lv1~Lv5 affect 2, 4, 8, 16, and 32 extra targets with a growing radius."),
    target: true,
    rarity: "rare",
    type: "destruction",
  },
  colorAssimilation: {
    name: zhen("色彩同化", "Color Assimilation"),
    image: "./assets/generated/items/colorAssimilation-20260403-120628-1_rgba.png",
    desc: zhen("将若干宝石变为主目标颜色来创造三消机会。Lv1~Lv5 影响 2、4、8、16、32 个目标，范围逐步增大。", "Changes gems to the target color to create match opportunities. Lv1~Lv5 affect 2, 4, 8, 16, and 32 targets with a growing range."),
    target: true,
    rarity: "rare",
    type: "colorChange",
  },
  neighborMimic: {
    name: zhen("邻近模仿", "Neighbor Mimic"),
    image: "./assets/generated/items/neighborMimic-20260403-120747-1_rgba.png",
    desc: zhen("让若干宝石变为上下左右邻居中出现最多的颜色。Lv1~Lv5 影响 2、4、8、16、32 个目标，范围逐步增大。", "Turns gems into the most common color among their orthogonal neighbors. Lv1~Lv5 affect 2, 4, 8, 16, and 32 targets with a growing range."),
    target: true,
    rarity: "common",
    type: "colorChange",
  },
  explosiveEnchant: {
    name: zhen("爆炸强化", "Explosive Enchant"),
    image: "./assets/generated/items/explosiveEnchant-20260403-120823-1_rgba.png",
    desc: zhen("随机给宝石添加爆炸属性。Lv1~Lv5 分别强化 1、2、3、4、5 颗宝石，被消除时会造成范围爆炸伤害。", "Randomly enchants gems with explosive power. Lv1~Lv5 affect 1, 2, 3, 4, and 5 gems, which explode when cleared."),
    target: false,
    rarity: "common",
    type: "enhancement",
  },
  lineEnchant: {
    name: zhen("横竖强化", "Line Enchant"),
    image: "./assets/generated/items/lineEnchant-20260403-120840-1_rgba.png",
    desc: zhen("随机给宝石添加横竖属性。Lv1~Lv5 分别强化 1、2、3、4、5 颗宝石，被消除时会清除整行或整列。", "Randomly enchants gems with line power. Lv1~Lv5 affect 1, 2, 3, 4, and 5 gems, which clear an entire row or column when cleared."),
    target: false,
    rarity: "rare",
    type: "enhancement",
  },
};

export const ITEM_ORDER = [
  "blast", "chainLightning", "crossStrike", "meteor", "splatter", "shatter",
  "colorAssimilation", "neighborMimic",
  "explosiveEnchant", "lineEnchant",
];

export const ITEM_BASE_COUNTS = Object.fromEntries(ITEM_ORDER.map((id) => [id, 0]));
export const ITEM_BASE_LEVEL = 1;

export const RARITY_LABELS = {
  common: zhen("普通", "Common"),
  rare: zhen("稀有", "Rare"),
  epic: zhen("史诗", "Epic"),
  legendary: zhen("传说", "Legendary"),
};

export const RARITY_ORDER = ["common", "rare", "epic", "legendary"];

export const TYPE_LABELS = {
  destruction: zhen("直接销毁", "Destruction"),
  colorChange: zhen("颜色改变", "Color Change"),
  enhancement: zhen("宝石强化", "Enhancement"),
};

export const ITEM_ANIM_FRAMES = {
  blast: ["./assets/generated/items/blast-20260403-120429-1_rgba.png"],
  chainLightning: ["./assets/generated/items/chainLightning-20260403-120457-1_rgba.png"],
  crossStrike: ["./assets/generated/items/crossStrike-20260403-120518-1_rgba.png"],
  meteor: ["./assets/generated/items/meteor-20260403-120536-1_rgba.png"],
  splatter: ["./assets/generated/items/splatter-20260403-120553-1_rgba.png"],
  shatter: ["./assets/generated/items/shatter-20260403-120610-1_rgba.png"],
  colorAssimilation: ["./assets/generated/items/colorAssimilation-20260403-120628-1_rgba.png"],
  neighborMimic: ["./assets/generated/items/neighborMimic-20260403-120747-1_rgba.png"],
  explosiveEnchant: ["./assets/generated/items/explosiveEnchant-20260403-120823-1_rgba.png"],
  lineEnchant: ["./assets/generated/items/lineEnchant-20260403-120840-1_rgba.png"],
};
