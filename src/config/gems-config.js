export const GUIDE_DEFS = {
  gem_basic: { title: "Element Gem", desc: "Match 3 or more gems of the same color to score and charge momentum.", preview: { kind: "gem", color: 0 } },
  obstacle: { title: "Obstacle Block", desc: "Cannot be swapped. Clear adjacent gems or use items to break it.", preview: { kind: "obstacle" } },
  glass: { title: "Glass Layer", desc: "The first clear removes the glass, the second clear removes the gem itself.", preview: { kind: "gem", color: 1, glass: true } },
  locked: { title: "Locked Gem", desc: "Locked gems stay in place and cannot be swapped until the lock expires.", preview: { kind: "gem", color: 2, locked: true } },
  line_h: { title: "Row Gem", desc: "Clears a full horizontal lane when triggered.", preview: { kind: "gem", color: 3, special: "line_h" } },
  line_v: { title: "Column Gem", desc: "Clears a full vertical lane when triggered.", preview: { kind: "gem", color: 3, special: "line_v" } },
  bomb: { title: "Bomb Gem", desc: "Explodes the surrounding 3x3 area.", preview: { kind: "gem", color: 5, special: "bomb" } },
  rainbow: { title: "Rainbow Gem", desc: "Detonates every gem of the chosen color when activated.", preview: { kind: "gem", color: 4, special: "rainbow" } },
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
