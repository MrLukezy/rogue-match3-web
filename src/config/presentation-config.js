const buildIdleFrames = (basePath) => Array.from({ length: 8 }, (_, i) => `${basePath}/idle_f${i + 1}.png`);

export const CHAPTER_MINION_ANIMATIONS = {
  ember_hollows: { idle: buildIdleFrames("./assets/generated/chapters/chapter01/minion/anim/idle") },
  frost_spire: { idle: buildIdleFrames("./assets/generated/chapters/chapter02/minion/anim/idle") },
  stone_grove: { idle: buildIdleFrames("./assets/generated/chapters/chapter03/minion/anim/idle") },
  storm_peaks: { idle: buildIdleFrames("./assets/generated/chapters/chapter04/minion/anim/idle") },
  venom_bloom: { idle: buildIdleFrames("./assets/generated/chapters/chapter05/minion/anim/idle") },
  tidal_depths: { idle: buildIdleFrames("./assets/generated/chapters/chapter06/minion/anim/idle") },
  mirror_circus: { idle: buildIdleFrames("./assets/generated/chapters/chapter07/minion/anim/idle") },
  iron_forge: { idle: buildIdleFrames("./assets/generated/chapters/chapter08/minion/anim/idle") },
  eclipse_sanctum: { idle: buildIdleFrames("./assets/generated/chapters/chapter09/minion/anim/idle") },
  void_throne: { idle: buildIdleFrames("./assets/generated/chapters/chapter10/minion/anim/idle") },
};

export const CHAPTER_BOSS_ANIMATIONS = {
  ember_hollows: { idle: buildIdleFrames("./assets/generated/chapters/chapter01/boss/anim/idle") },
  frost_spire: { idle: buildIdleFrames("./assets/generated/chapters/chapter02/boss/anim/idle") },
  stone_grove: { idle: buildIdleFrames("./assets/generated/chapters/chapter03/boss/anim/idle") },
  storm_peaks: { idle: buildIdleFrames("./assets/generated/chapters/chapter04/boss/anim/idle") },
  venom_bloom: { idle: buildIdleFrames("./assets/generated/chapters/chapter05/boss/anim/idle") },
  tidal_depths: { idle: buildIdleFrames("./assets/generated/chapters/chapter06/boss/anim/idle") },
  mirror_circus: { idle: buildIdleFrames("./assets/generated/chapters/chapter07/boss/anim/idle") },
  iron_forge: { idle: buildIdleFrames("./assets/generated/chapters/chapter08/boss/anim/idle") },
  eclipse_sanctum: { idle: buildIdleFrames("./assets/generated/chapters/chapter09/boss/anim/idle") },
  void_throne: { idle: buildIdleFrames("./assets/generated/chapters/chapter10/boss/anim/idle") },
};

export const SKILL_AUDIO_PROFILES = {
  tacticalReserve: { sound: "condReserve", volume: 0.26, rate: 0.96, accent: { sound: "uiClick", volume: 0.08, rate: 1.08 } },
  purifierSigil: { sound: "condPurifier", volume: 0.28, rate: 1.04, accent: { sound: "skillColor", volume: 0.06, rate: 1.32 } },
};

export const ENEMY_CAST_AUDIO_MAP = {
  ember_spark: { sound: "enemyFireCast", volume: 0.34, rate: 1.04, accentMode: "voiceLayer" },
  tail_scorch: { sound: "enemyFireCast", volume: 0.36, rate: 0.92, accent: { sound: "enemyBossVoice", volume: 0.18, rate: 0.84 } },
  chill_script: { sound: "enemyIceCast", volume: 0.28, rate: 0.92, accentMode: "voiceLayer" },
  frost_page: { sound: "enemyIceCast", volume: 0.3, rate: 0.78, accent: { sound: "enemyBossVoice", volume: 0.16, rate: 0.8 } },
  pebble_drop: { sound: "enemyStoneCast", volume: 0.34, rate: 0.84, accentMode: "voiceLayer" },
  bark_armor: { sound: "enemyStoneCast", volume: 0.28, rate: 0.76, accent: { sound: "enemyMinionVoice", volume: 0.16, rate: 0.9 } },
  static_pin: { sound: "enemyLightningCast", volume: 0.3, rate: 1.18, accentMode: "voiceLayer" },
  thunder_lance: { sound: "enemyLightningCast", volume: 0.36, rate: 1.08, accent: { sound: "enemyBossVoice", volume: 0.2, rate: 0.88 } },
  toxin_dust: { sound: "enemyPoisonCast", volume: 0.3, rate: 1.08, accentMode: "voiceLayer" },
  thorn_bind: { sound: "enemyPoisonCast", volume: 0.28, rate: 0.9, accent: { sound: "enemyMinionVoice", volume: 0.18, rate: 0.96 } },
  splash_shift: { sound: "enemyWaterCast", volume: 0.28, rate: 0.94, accentMode: "voiceLayer" },
  undertow_pull: { sound: "enemyWaterCast", volume: 0.34, rate: 0.78, accent: { sound: "enemyBossVoice", volume: 0.18, rate: 0.82 } },
  mirror_glint: { sound: "enemyArcaneCast", volume: 0.28, rate: 1.2, accentMode: "voiceLayer" },
  false_match: { sound: "enemyArcaneCast", volume: 0.3, rate: 1.08, accent: { sound: "enemyBossVoice", volume: 0.16, rate: 1.04 } },
  iron_slag: { sound: "enemyStoneCast", volume: 0.34, rate: 0.72, accent: { sound: "enemyBossVoice", volume: 0.18, rate: 0.74 } },
  anvil_slam: { sound: "enemyStoneCast", volume: 0.38, rate: 0.82, accent: { sound: "enemyBossRoar", volume: 0.14, rate: 1.04 } },
  radiance_mark: { sound: "enemyArcaneCast", volume: 0.26, rate: 1.22, accentMode: "voiceLayer" },
  eclipse_wing: { sound: "enemyArcaneCast", volume: 0.3, rate: 0.9, accent: { sound: "enemyBossVoice", volume: 0.18, rate: 0.76 } },
  void_scale: { sound: "enemyArcaneCast", volume: 0.34, rate: 0.68, accent: { sound: "enemyBossRoar", volume: 0.16, rate: 0.62 } },
  dragon_breath: { sound: "enemyFireCast", volume: 0.38, rate: 0.98, accent: { sound: "enemyBossRoar", volume: 0.24, rate: 0.9 } },
};

export const ENEMY_CAST_AUDIO_ULTIMATE = {
  sound: "enemyUltimateCast",
  volume: 0.34,
  rate: 0.9,
  accent: { sound: "enemyBossRoar", volume: 0.24, rate: 0.82 },
  layer: { sound: "enemyArcaneCast", volume: 0.18, rate: 0.9 },
};

export const CHAPTER_BOARD_TONES = {
  crystal_mines: "hue-rotate(12deg) saturate(1.06) brightness(1.02)",
  frozen_archive: "hue-rotate(-18deg) saturate(1.08) brightness(1.04)",
  storm_forge: "hue-rotate(18deg) saturate(1.14) brightness(1.04)",
  void_rift: "hue-rotate(48deg) saturate(1.12) brightness(0.98)",
  ember_hollows: "hue-rotate(6deg) saturate(1.14) brightness(1.02)",
  frost_spire: "hue-rotate(-20deg) saturate(1.1) brightness(1.05)",
  stone_grove: "hue-rotate(26deg) saturate(1.02) brightness(0.98)",
  storm_peaks: "hue-rotate(-12deg) saturate(1.18) brightness(1.04)",
  venom_bloom: "hue-rotate(72deg) saturate(1.18) brightness(0.98)",
  tidal_depths: "hue-rotate(-34deg) saturate(1.12) brightness(1.03)",
  mirror_circus: "hue-rotate(118deg) saturate(1.08) brightness(1.04)",
  iron_forge: "hue-rotate(14deg) saturate(1.22) brightness(1.01)",
  eclipse_sanctum: "hue-rotate(152deg) saturate(1.08) brightness(1.02)",
  void_throne: "hue-rotate(190deg) saturate(1.14) brightness(0.96)",
};
