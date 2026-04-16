const zhen = (zh, en) => ({ zh, en });

export const MODIFIER_DEFS = [
  { id: "glass", name: zhen("玻璃蔓延", "Glass"), desc: zhen("开局附带更多玻璃层", "Start with extra glass layers"), handler: "glass" },
  { id: "heavy", name: zhen("重压", "Heavy"), desc: zhen("失去 2 步，但连锁更强", "Lose 2 moves, gain stronger chains"), handler: "heavy" },
  { id: "color_tax", name: zhen("颜色税", "Color Tax"), desc: zhen("一种颜色得分降低", "One color scores less"), handler: "color_tax" },
  { id: "lucky", name: zhen("幸运掉落", "Lucky Drop"), desc: zhen("道具掉落概率更高", "Item drop chance is higher"), handler: "lucky" },
  { id: "frost_seal", name: zhen("霜封", "Frost Seal"), desc: zhen("若干宝石开局被锁定", "Several gems begin locked"), handler: "frost_seal" },
  { id: "stormfront", name: zhen("风暴前线", "Stormfront"), desc: zhen("动量更快积累，但少 1 步", "Builds momentum faster but trims one move"), handler: "stormfront" },
  { id: "rich_vein", name: zhen("丰矿脉", "Rich Vein"), desc: zhen("本层额外得分并提高工具密度", "Gain score and extra tool density on this floor"), handler: "rich_vein" },
];

export const PERK_DEFS = {
  combo_forge: { title: zhen("连锁熔炉", "Combo Forge"), desc: zhen("4 连消可升级为炸弹宝石", "4-matches can upgrade into bomb gems"), rarity: "common", handler: "combo_forge" },
  fever_loop: { title: zhen("热潮回路", "Fever Loop"), desc: zhen("热潮持续 +1 回合", "Fever lasts +1 turn"), rarity: "common", handler: "fever_loop" },
  relic_magnet: { title: zhen("遗物磁引", "Relic Magnet"), desc: zhen("道具掉落概率更高", "Item drop chance is higher"), rarity: "common", handler: "relic_magnet" },
  glass_breaker: { title: zhen("碎玻者", "Glass Breaker"), desc: zhen("打碎玻璃可获得额外分数", "Breaking glass grants bonus points"), rarity: "common", handler: "glass_breaker" },
  overcharge: { title: zhen("过载启动", "Overcharge"), desc: zhen("每层开始时获得额外动量", "Each floor begins with bonus momentum"), rarity: "common", handler: "overcharge" },
  pressure_valve: { title: zhen("压力阀", "Pressure Valve"), desc: zhen("Boss 压力带来的减步更少", "Boss pressure removes fewer moves"), rarity: "common", handler: "pressure_valve" },
  blast_core: { title: zhen("爆破核心", "Blast Core"), desc: zhen("特殊宝石和爆炸得分更高", "Specials and blasts score more"), rarity: "rare", handler: "blast_core" },
  score_bloom: { title: zhen("分数绽放", "Score Bloom"), desc: zhen("每次清除宝石都获得额外分数", "Every gem cleared grants bonus score"), rarity: "rare", handler: "score_bloom" },
  quick_hands: { title: zhen("迅捷之手", "Quick Hands"), desc: zhen("目标型道具升级时获得额外充能", "Target items gain bonus charge when upgraded"), rarity: "rare", handler: "quick_hands" },
  fever_smith: { title: zhen("热潮锻匠", "Fever Smith"), desc: zhen("传说道具会提供更多动量", "Legend skills grant extra momentum"), rarity: "rare", handler: "fever_smith" },
  arcane_stockpile: { title: zhen("奥术储藏", "Arcane Stockpile"), desc: zhen("道具掉落可包含传说技能", "Item drops can include legendary skills"), rarity: "epic", handler: "arcane_stockpile" },
  boss_hunter: { title: zhen("Boss 猎手", "Boss Hunter"), desc: zhen("每次使用传说道具都会额外打击 Boss 充能", "Damage the boss charge more whenever you use a legend skill"), rarity: "epic", handler: "boss_hunter" },
  vault_expander: { title: zhen("仓库扩展", "Vault Expander"), desc: zhen("新道具类型会附带额外充能", "New item types arrive with bonus charges"), rarity: "epic", handler: "vault_expander" },
  prism_heart: { title: zhen("棱镜之心", "Prism Heart"), desc: zhen("彩虹宝石得分更高且更常出现", "Rainbow gems score more and spawn more often"), rarity: "epic", handler: "prism_heart" },
  sovereign_circuit: { title: zhen("王权回路", "Sovereign Circuit"), desc: zhen("所有装备道具立刻 +1 等级", "All equipped items gain +1 level instantly"), rarity: "legendary", handler: "sovereign_circuit" },
  dragon_hoard: { title: zhen("龙之宝藏", "Dragon Hoard"), desc: zhen("你最高等级的道具每层都会获得充能", "Your highest-level item gains charges every floor"), rarity: "legendary", handler: "dragon_hoard" },
};

export const COMMON_EVENT_DEFS = [
  { id: "cursedPact", title: zhen("诅咒契约", "Cursed Pact"), desc: zhen("接下来两层会更严苛，但连锁奖励和掉落提高，并获得 +1 十字斩。", "The next two floors are harsher, but chain rewards and drops increase and you gain +1 Cross Strike."), handler: "cursedPact" },
  { id: "repairForge", title: zhen("修复熔炉", "Repair Forge"), desc: zhen("下一层 +2 步，并重置 Boss 充能。", "Gain +2 moves next floor and reset the boss charge."), handler: "repairForge" },
  { id: "greedAltar", title: zhen("贪欲祭坛", "Greed Altar"), desc: zhen("立即获得 +180 分，但下一层失去 2 步。", "Gain +180 score now, but lose 2 moves next floor."), handler: "greedAltar" },
  { id: "tacticalMap", title: zhen("战术地图", "Tactical Map"), desc: zhen("侦察下一层，获得 +3 步和 +20 动量。", "Scout the next floor to gain +3 moves and +20 momentum."), handler: "tacticalMap" },
];

export const CHAPTER_EVENT_DEFS = {
  ember_hollows: [
    { id: "kindlingCache", title: zhen("引燃储备", "Kindling Cache"), desc: zhen("从余烬营地获得 +1 溅射和 +1 十字斩。", "Gain +1 Splatter and +1 Cross Strike from the ember camp."), handler: "kindlingCache" },
  ],
  frost_spire: [
    { id: "frozenLantern", title: zhen("寒霜提灯", "Frozen Lantern"), desc: zhen("稳定档案馆：移除当前所有锁定并获得 +25 动量。", "Stabilize the archive: remove all current locks and gain +25 momentum."), handler: "frozenLantern" },
  ],
  stone_grove: [
    { id: "burrowMap", title: zhen("地穴地图", "Burrow Map"), desc: zhen("下一层 +2 步，并立刻移除 2 个随机障碍。", "Gain +2 moves next floor and remove 2 random obstacles now."), handler: "burrowMap" },
  ],
  storm_peaks: [
    { id: "forgeOverdrive", title: zhen("熔炉过载", "Forge Overdrive"), desc: zhen("获得 1 级邻近模仿祝福，并提高下一次诅咒楼层收益。", "Gain Lv.1 Neighbor Mimic blessing and boost the next cursed floor payoff."), handler: "forgeOverdrive" },
  ],
  venom_bloom: [
    { id: "purifierNectar", title: zhen("净化花蜜", "Purifier Nectar"), desc: zhen("移除当前所有锁定，并清除本层颜色税。", "Remove all current locks and clear your taxed color for the floor."), handler: "purifierNectar" },
  ],
  tidal_depths: [
    { id: "tidalCompass", title: zhen("潮汐罗盘", "Tidal Compass"), desc: zhen("下一层 +3 步，并获得 +1 连锁闪电。", "Gain +3 moves next floor and +1 Chain Lightning."), handler: "tidalCompass" },
  ],
  mirror_circus: [
    { id: "trueLens", title: zhen("真实透镜", "True Lens"), desc: zhen("获得 +30 动量，并将 3 个随机玻璃宝石变为普通宝石。", "Gain +30 momentum and convert 3 random glass gems into normal gems."), handler: "trueLens" },
  ],
  iron_forge: [
    { id: "coolingValve", title: zhen("冷却阀门", "Cooling Valve"), desc: zhen("立刻移除 3 个障碍，并让下一层 Boss 从 0 能量开始。", "Remove 3 obstacles now and start next floor with the boss at 0 energy."), handler: "coolingValve" },
  ],
  eclipse_sanctum: [
    { id: "haloFragment", title: zhen("圣环碎片", "Halo Fragment"), desc: zhen("获得 1 级色彩同化祝福和 +25 动量。", "Gain Lv.1 Color Assimilation blessing and +25 momentum."), handler: "haloFragment" },
  ],
  void_throne: [
    { id: "voidBargain", title: zhen("虚空交易", "Void Bargain"), desc: zhen("获得 +240 分和 1 级横竖刻印祝福，但下一层 -1 步。", "Gain +240 score and Lv.1 Line Sigil blessing, but suffer -1 move next floor."), handler: "voidBargain" },
  ],
};
