export const BLESSING_DEFS = {
  tactical_reserve: {
    title: "Tactical Reserve",
    desc: "+1 move at the start of every floor.",
    rarity: "rare",
    apply: (state) => { state.blessings.tactical_reserve = true; },
  },
  supply_cache: {
    title: "Supply Cache",
    desc: "Restore +1 charge to every carried item at the start of each floor.",
    rarity: "rare",
    apply: (state) => { state.blessings.supply_cache = true; },
  },
  chain_matrix: {
    title: "Chain Matrix",
    desc: "Permanent +0.15 chain bonus for the rest of the run.",
    rarity: "epic",
    apply: (state) => { state.blessings.chain_matrix = true; },
  },
  fever_engine: {
    title: "Fever Engine",
    desc: "Fever lasts +1 extra turn and starts with a brighter payoff.",
    rarity: "epic",
    apply: (state) => { state.blessings.fever_engine = true; },
  },
  boss_shunt: {
    title: "Boss Shunt",
    desc: "Boss charge gain is reduced during future floors.",
    rarity: "legendary",
    apply: (state) => { state.blessings.boss_shunt = true; },
  },
  purifier_sigil: {
    title: "Purifier Sigil",
    desc: "Each floor starts with fewer locks and glass layers.",
    rarity: "rare",
    apply: (state) => { state.blessings.purifier_sigil = true; },
  },
};
