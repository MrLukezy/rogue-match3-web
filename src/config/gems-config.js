const zhen = (zh, en) => ({ zh, en });

export const GUIDE_DEFS = {
  gem_basic: { title: zhen("元素宝石", "Element Gem"), desc: zhen("匹配 3 个或更多同色宝石即可得分并积累动量。", "Match 3 or more gems of the same color to score and charge momentum."), preview: { kind: "gem", color: 0 } },
  obstacle: { title: zhen("障碍块", "Obstacle Block"), desc: zhen("不能交换。清除相邻宝石或使用道具破坏它。", "Cannot be swapped. Clear adjacent gems or use items to break it."), preview: { kind: "obstacle" } },
  glass: { title: zhen("玻璃层", "Glass Layer"), desc: zhen("第一次清除会打碎玻璃，第二次才会清除宝石本体。", "The first clear removes the glass, the second clear removes the gem itself."), preview: { kind: "gem", color: 1, glass: true } },
  burning: { title: zhen("灼伤宝石", "Burning Gem"), desc: zhen("被火焰点燃的宝石第一次清除只会熄火；若本回合没被消掉，下回合会继续灼烧周围宝石。", "The first clear only snuffs the flames on a burning gem; if it survives the turn, it scorches nearby gems next turn."), preview: { kind: "gem", color: 0, burning: true } },
  locked: { title: zhen("锁定宝石", "Locked Gem"), desc: zhen("锁定宝石会停留在原位，直到锁定回合结束前都无法交换。", "Locked gems stay in place and cannot be swapped until the lock expires."), preview: { kind: "gem", color: 2, locked: true } },
  line_h: { title: zhen("横向宝石", "Row Gem"), desc: zhen("触发时清除整条横向线路。", "Clears a full horizontal lane when triggered."), preview: { kind: "gem", color: 3, special: "line_h" } },
  line_v: { title: zhen("纵向宝石", "Column Gem"), desc: zhen("触发时清除整条纵向线路。", "Clears a full vertical lane when triggered."), preview: { kind: "gem", color: 3, special: "line_v" } },
  bomb: { title: zhen("炸弹宝石", "Bomb Gem"), desc: zhen("引爆周围 3x3 区域。", "Explodes the surrounding 3x3 area."), preview: { kind: "gem", color: 5, special: "bomb" } },
  rainbow: { title: zhen("彩虹宝石", "Rainbow Gem"), desc: zhen("激活时引爆所选颜色的全部宝石。", "Detonates every gem of the chosen color when activated."), preview: { kind: "gem", color: 4, special: "rainbow" } },
};

export const GEM_IMAGE_BY_COLOR = {
  0: "./assets/generated/gems/gem_fire.png",
  1: "./assets/generated/gems/gem_water.png",
  2: "./assets/generated/gems/gem_nature.png",
  3: "./assets/generated/gems/gem_lightning.png",
  4: "./assets/generated/gems/gem_arcane.png",
  5: "./assets/generated/gems/gem_alchemy.png",
};

export const GEM_ANIM_FRAMES = {
  0: ["./assets/generated/gems/anim/gem_fire_f1.png", "./assets/generated/gems/anim/gem_fire_f2.png", "./assets/generated/gems/anim/gem_fire_f3.png", "./assets/generated/gems/anim/gem_fire_f4.png", "./assets/generated/gems/anim/gem_fire_f5.png", "./assets/generated/gems/anim/gem_fire_f6.png", "./assets/generated/gems/anim/gem_fire_f7.png", "./assets/generated/gems/anim/gem_fire_f8.png"],
  1: ["./assets/generated/gems/anim/gem_water_f1.png", "./assets/generated/gems/anim/gem_water_f2.png", "./assets/generated/gems/anim/gem_water_f3.png", "./assets/generated/gems/anim/gem_water_f4.png", "./assets/generated/gems/anim/gem_water_f5.png", "./assets/generated/gems/anim/gem_water_f6.png", "./assets/generated/gems/anim/gem_water_f7.png", "./assets/generated/gems/anim/gem_water_f8.png"],
  2: ["./assets/generated/gems/anim/gem_nature_f1.png", "./assets/generated/gems/anim/gem_nature_f2.png", "./assets/generated/gems/anim/gem_nature_f3.png", "./assets/generated/gems/anim/gem_nature_f4.png", "./assets/generated/gems/anim/gem_nature_f5.png", "./assets/generated/gems/anim/gem_nature_f6.png", "./assets/generated/gems/anim/gem_nature_f7.png", "./assets/generated/gems/anim/gem_nature_f8.png"],
  3: ["./assets/generated/gems/anim/gem_lightning_f1.png", "./assets/generated/gems/anim/gem_lightning_f2.png", "./assets/generated/gems/anim/gem_lightning_f3.png", "./assets/generated/gems/anim/gem_lightning_f4.png", "./assets/generated/gems/anim/gem_lightning_f5.png", "./assets/generated/gems/anim/gem_lightning_f6.png", "./assets/generated/gems/anim/gem_lightning_f7.png", "./assets/generated/gems/anim/gem_lightning_f8.png"],
  4: ["./assets/generated/gems/anim/gem_arcane_f1.png", "./assets/generated/gems/anim/gem_arcane_f2.png", "./assets/generated/gems/anim/gem_arcane_f3.png", "./assets/generated/gems/anim/gem_arcane_f4.png", "./assets/generated/gems/anim/gem_arcane_f5.png", "./assets/generated/gems/anim/gem_arcane_f6.png", "./assets/generated/gems/anim/gem_arcane_f7.png", "./assets/generated/gems/anim/gem_arcane_f8.png"],
  5: ["./assets/generated/gems/anim/gem_alchemy_f1.png", "./assets/generated/gems/anim/gem_alchemy_f2.png", "./assets/generated/gems/anim/gem_alchemy_f3.png", "./assets/generated/gems/anim/gem_alchemy_f4.png", "./assets/generated/gems/anim/gem_alchemy_f5.png", "./assets/generated/gems/anim/gem_alchemy_f6.png", "./assets/generated/gems/anim/gem_alchemy_f7.png", "./assets/generated/gems/anim/gem_alchemy_f8.png"],
};

export const GEM_POOL_BY_FLOOR = [[0,1,2,3],[0,1,2,3],[0,1,2,3],[0,1,2,3,4],[0,1,2,3,4],[0,1,2,3,4],[0,1,2,3,4,5],[0,1,2,3,4,5],[0,1,2,3,4,5],[0,1,2,3,4,5],[0,1,2,3,4,5],[0,1,2,3,4,5]];

export const GEM_COLOR_NAMES = {
  0: zhen("火焰", "Fire"),
  1: zhen("水流", "Water"),
  2: zhen("自然", "Nature"),
  3: zhen("雷电", "Lightning"),
  4: zhen("奥术", "Arcane"),
  5: zhen("炼金", "Alchemy"),
};
