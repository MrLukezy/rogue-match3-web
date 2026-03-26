export const MAX_ITEM_TYPES = 5;

const zhen = (zh, en) => ({ zh, en });

export const ITEM_DEFS = {
  hammer: { name: zhen("锤子", "Hammer"), image: "./assets/generated/items/item_hammer.png", desc: zhen("破坏一个格子", "Break a single tile"), target: true, rarity: "common" },
  row: { name: zhen("横扫", "Row Sweep"), image: "./assets/generated/items/item_row_sweep.png", desc: zhen("清除一整行", "Clear one full row"), target: true, rarity: "common" },
  cross: { name: zhen("十字爆发", "Cross Burst"), image: "./assets/generated/items/item_cross_burst.png", desc: zhen("清除一行一列", "Clear row and column"), target: true, rarity: "rare" },
  color: { name: zhen("彩色炸弹", "Color Bomb"), image: "./assets/generated/items/item_color_bomb.png", desc: zhen("清除选中颜色", "Clear the chosen color"), target: true, rarity: "rare" },
  shuffle: { name: zhen("洗牌", "Shuffle"), image: "./assets/generated/items/item_shuffle.png", desc: zhen("重新洗盘", "Re-roll the board"), target: false, rarity: "common" },
  screen_wipe: { name: zhen("全屏脉冲", "Screen Pulse"), image: "./assets/generated/items/item_screen_pulse.png", desc: zhen("立即清除所有宝石", "Instantly clear every gem"), target: false, rarity: "epic" },
  rainbow_burst: { name: zhen("彩虹爆发", "Rainbow Burst"), image: "./assets/generated/items/item_rainbow_burst.png", desc: zhen("清除两种随机颜色并触发特殊效果", "Clear two random colors and trigger specials"), target: false, rarity: "epic" },
  time_freeze: { name: zhen("时间冻结", "Time Freeze"), image: "./assets/generated/items/item_time_freeze.png", desc: zhen("获得步数、解锁宝石并稳定动量", "Gain moves, unlock gems, and stabilize momentum"), target: false, rarity: "epic" },
  boss_breaker: { name: zhen("Boss 粉碎者", "Boss Breaker"), image: "./assets/generated/items/item_boss_breaker.png", desc: zhen("砸碎充能并击碎棋盘大范围区域", "Smash charge and shatter a wide section of the board"), target: false, rarity: "legendary" },
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
export const ITEM_BASE_COUNTS = { hammer: 2, shuffle: 1 };
export const ITEM_BASE_LEVEL = 1;
export const RARITY_LABELS = {
  common: zhen("普通", "Common"),
  rare: zhen("稀有", "Rare"),
  epic: zhen("史诗", "Epic"),
  legendary: zhen("传说", "Legendary"),
};
