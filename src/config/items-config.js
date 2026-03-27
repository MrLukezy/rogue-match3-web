export const MAX_ITEM_TYPES = 5;

const zhen = (zh, en) => ({ zh, en });

export const ITEM_DEFS = {
  hammer: { name: zhen("回响溅射", "Ricochet Splash"), image: "./assets/generated/items/item_hammer.png", desc: zhen("每次消除后，额外击碎若干相邻宝石。等级越高，溅射次数越多。", "After every clear, break extra adjacent gems. Higher levels increase the number of splash hits."), target: false, rarity: "common" },
  row: { name: zhen("裂阵直击", "Line Breaker"), image: "./assets/generated/items/item_row_sweep.png", desc: zhen("达成大消除时，沿锚点打出贯穿整行的追加清除。高等级可扩大成双线或十字。", "On large clears, fire an extra full-line clear through the anchor. Higher levels widen it into double lines or a cross."), target: false, rarity: "common" },
  cross: { name: zhen("十字核爆", "Cross Nova"), image: "./assets/generated/items/item_cross_burst.png", desc: zhen("4 连或连锁时引爆锚点周围区域。高等级会扩大爆炸范围。", "On 4-matches or chains, detonate around the anchor. Higher levels expand the blast zone."), target: false, rarity: "rare" },
  color: { name: zhen("同调收割", "Color Harvest"), image: "./assets/generated/items/item_color_bomb.png", desc: zhen("根据本次消除的主色，额外收割同色宝石。等级越高，收割数量越多。", "Harvest extra gems matching the dominant cleared color. Higher levels increase the harvest count."), target: false, rarity: "rare" },
  shuffle: { name: zhen("追击尾流", "Cascade Tailwind"), image: "./assets/generated/items/item_shuffle.png", desc: zhen("每次消除后追加随机追击清除，帮助延长连锁。", "Adds random follow-up clears after every match to extend cascades."), target: false, rarity: "common" },
  screen_wipe: { name: zhen("九宫脉冲", "Ninefold Pulse"), image: "./assets/generated/items/item_screen_pulse.png", desc: zhen("大消除会在锚点触发 3x3 爆炸。高等级可同时炸多个锚点。", "Large clears trigger a 3x3 explosion at the anchor. Higher levels can detonate multiple anchors."), target: false, rarity: "epic" },
  rainbow_burst: { name: zhen("棱镜溢流", "Prism Overflow"), image: "./assets/generated/items/item_rainbow_burst.png", desc: zhen("连锁时按本次出现的颜色扩散额外清除。颜色越多，收益越高。", "During chains, spread bonus clears based on the colors involved in the match. More colors mean more payoff."), target: false, rarity: "epic" },
  time_freeze: { name: zhen("连锁过载", "Chain Overclock"), image: "./assets/generated/items/item_time_freeze.png", desc: zhen("特殊连锁会被放大成更猛烈的区域打击。等级越高，放大次数越多。", "Special chains are amplified into stronger area strikes. Higher levels increase the number of amplifications."), target: false, rarity: "epic" },
  boss_breaker: { name: zhen("处决矩阵", "Execution Matrix"), image: "./assets/generated/items/item_boss_breaker.png", desc: zhen("敌方血量进入斩杀线后，每次消除都会追加处决打击与范围清除。", "Once enemy HP enters execute range, every clear adds execution strikes and extra area destruction."), target: false, rarity: "legendary" },
};

export const ITEM_ANIM_FRAMES = {
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

export const ITEM_ORDER = ["hammer", "row", "cross", "color", "shuffle", "screen_wipe", "rainbow_burst", "time_freeze", "boss_breaker"];
export const ITEM_BASE_COUNTS = { hammer: 0, row: 0 };
export const ITEM_BASE_LEVEL = 1;
export const RARITY_LABELS = {
  common: zhen("普通", "Common"),
  rare: zhen("稀有", "Rare"),
  epic: zhen("史诗", "Epic"),
  legendary: zhen("传说", "Legendary"),
};
