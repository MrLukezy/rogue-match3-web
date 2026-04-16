const zhen = (zh, en) => ({ zh, en });

export const REWARD_CATEGORY_WEIGHTS = {
  combatSkill: 35,
  blessing: 15,
  support: 50,
};

export const SUPPORT_REWARD_DEFS = [
  {
    id: "extraMoves2",
    rarity: "common",
    weight: 16,
    title: zhen("额外步数 +2", "Extra Moves +2"),
    desc: zhen("下一层额外获得 2 步", "Gain 2 extra moves next floor"),
  },
  {
    id: "extraMoves3",
    rarity: "common",
    weight: 10,
    title: zhen("额外步数 +3", "Extra Moves +3"),
    desc: zhen("下一层额外获得 3 步", "Gain 3 extra moves next floor"),
  },
  {
    id: "cleanseFrost",
    rarity: "common",
    weight: 8,
    title: zhen("净化覆霜", "Cleanse Frost"),
    desc: zhen("移除当前盘面所有冻结与锁定", "Remove all frozen and locked states on the current board"),
  },
  {
    id: "cleanseToxins",
    rarity: "common",
    weight: 8,
    title: zhen("驱散毒灼", "Cleanse Toxins"),
    desc: zhen("移除当前盘面所有中毒与灼伤", "Remove all poison and burning from the current board"),
  },
  {
    id: "shatterGlass",
    rarity: "common",
    weight: 8,
    title: zhen("破除玻璃", "Shatter Glass"),
    desc: zhen("移除当前盘面所有玻璃层", "Remove all glass layers on the current board"),
  },
  {
    id: "momentumSurge",
    rarity: "common",
    weight: 6,
    title: zhen("动量激增", "Momentum Surge"),
    desc: zhen("+40 动量", "+40 momentum"),
  },
  {
    id: "tacticalRetrofit",
    rarity: "rare",
    weight: 4,
    title: zhen("战术加装", "Tactical Retrofit"),
    desc: zhen("随机提升一个已携带技能 1 级", "Upgrade one random carried skill by 1 level"),
  },
  {
    id: "bossSuppressant",
    rarity: "rare",
    weight: 4,
    title: zhen("Boss 抑制", "Boss Suppressant"),
    desc: zhen("下一层开始时 +2 步，并完全重置 Boss 能量槽", "Start the next floor with +2 moves and a fully reset boss gauge"),
  },
  {
    id: "feverBattery",
    rarity: "epic",
    weight: 2,
    title: zhen("热潮电池", "Fever Battery"),
    desc: zhen("获得 +70 动量，为下一次爆发蓄力", "Gain +70 momentum to prime your next power spike"),
  },
];
