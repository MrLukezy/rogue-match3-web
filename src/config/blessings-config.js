const zhen = (zh, en) => ({ zh, en });

export const BLESSING_DEFS = {
  tactical_reserve: {
    title: zhen("战术预备", "Tactical Reserve"),
    desc: zhen("每层开始时 +1 步。", "+1 move at the start of every floor."),
    rarity: "rare",
    apply: (state) => { state.blessings.tactical_reserve = true; },
  },
  supply_cache: {
    title: zhen("补给储备", "Supply Cache"),
    desc: zhen("每层开始时，所有已携带进攻技能获得 +1 等级。", "At the start of each floor, all carried offensive skills gain +1 level."),
    rarity: "rare",
    apply: (state) => { state.blessings.supply_cache = true; },
  },
  chain_matrix: {
    title: zhen("连锁矩阵", "Chain Matrix"),
    desc: zhen("本轮剩余时间内永久获得 +0.15 连锁加成。", "Permanent +0.15 chain bonus for the rest of the run."),
    rarity: "epic",
    apply: (state) => { state.blessings.chain_matrix = true; },
  },
  fever_engine: {
    title: zhen("热潮引擎", "Fever Engine"),
    desc: zhen("热潮额外持续 +1 回合，收益更高。", "Fever lasts +1 extra turn and starts with a brighter payoff."),
    rarity: "epic",
    apply: (state) => { state.blessings.fever_engine = true; },
  },
  boss_shunt: {
    title: zhen("Boss 分流", "Boss Shunt"),
    desc: zhen("之后楼层中的 Boss 充能增长降低。", "Boss charge gain is reduced during future floors."),
    rarity: "legendary",
    apply: (state) => { state.blessings.boss_shunt = true; },
  },
  purifier_sigil: {
    title: zhen("净化印记", "Purifier Sigil"),
    desc: zhen("每层开始时锁定和玻璃层更少。", "Each floor starts with fewer locks and glass layers."),
    rarity: "rare",
    apply: (state) => { state.blessings.purifier_sigil = true; },
  },
};
