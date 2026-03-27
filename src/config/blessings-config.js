const zhen = (zh, en) => ({ zh, en });

export const CONDITIONAL_PASSIVE_DEFS = {
  chain_matrix: {
    title: zhen("连锁矩阵", "Chain Matrix"),
    desc: zhen("每次棋盘变化若形成连锁，则立即沿锚点打出额外十字追击。", "Whenever the board changes into a chain, immediately fire an extra cross strike from the anchor."),
    rarity: "epic",
    apply: (state) => { state.conditionalPassive = "chain_matrix"; },
  },
  fever_engine: {
    title: zhen("热潮引擎", "Fever Engine"),
    desc: zhen("每次棋盘变化时若处于热潮状态，则在命中锚点周围追加过载爆破。", "Whenever the board changes during Fever, add an overcharged blast around the hit anchor."),
    rarity: "epic",
    apply: (state) => { state.conditionalPassive = "fever_engine"; },
  },
  boss_shunt: {
    title: zhen("Boss 分流", "Boss Shunt"),
    desc: zhen("每次棋盘变化时若敌方蓄能过高，则自动分流其能量并追加一次压制打击。", "Whenever the board changes and enemy charge is high, siphon part of it away and add a suppressive strike."),
    rarity: "legendary",
    apply: (state) => { state.conditionalPassive = "boss_shunt"; },
  },
  purifier_sigil: {
    title: zhen("净化印记", "Purifier Sigil"),
    desc: zhen("每次棋盘变化时若场上存在锁定、冻结或玻璃层，则自动净化并清除其中一部分。", "Whenever the board changes and locks, freeze, or glass remain, automatically purify and clear part of them."),
    rarity: "rare",
    apply: (state) => { state.conditionalPassive = "purifier_sigil"; },
  },
};
