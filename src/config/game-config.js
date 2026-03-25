export const MIN_BOARD_SIZE = 6;
export const MAX_BOARD_SIZE = 15;
export const BOARD_SIZE_BY_FLOOR = [6, 7, 8, 8, 9, 10, 10, 11, 12, 12, 13, 14];
export const COLORS = 6;
export const TOTAL_FLOORS = 12;
export const META_KEY = "rogue_match3_meta_v5";
export const MOMENTUM_MAX = 100;
export const MAX_SKILL_CHAIN = 2;
export const MAX_ACTIVE_SHARDS = 260;

export const FLOOR_CONFIG = [
  { target: 420, moves: 17, obstacles: 0 },
  { target: 610, moves: 17, obstacles: 0 },
  { target: 780, moves: 16, obstacles: 1 },
  { target: 980, moves: 16, obstacles: 1 },
  { target: 1180, moves: 16, obstacles: 2 },
  { target: 1410, moves: 15, obstacles: 2 },
  { target: 1680, moves: 15, obstacles: 3 },
  { target: 1960, moves: 14, obstacles: 3 },
  { target: 2280, moves: 14, obstacles: 4 },
  { target: 2620, moves: 13, obstacles: 4 },
  { target: 3020, moves: 13, obstacles: 5 },
  { target: 3480, moves: 12, obstacles: 6 },
];

export const FLOOR_DIFFICULTY = [
  { label: "Warm-Up", targetMul: 1, movesDelta: 0, obstacleBonus: 0, glassBonus: 0, bossGain: 1, bossMaxDelta: 0, pressure: 0 },
  { label: "Pressure", targetMul: 1.06, movesDelta: 0, obstacleBonus: 0, glassBonus: 1, bossGain: 1, bossMaxDelta: 0, pressure: 0 },
  { label: "Mine Warden", targetMul: 1.14, movesDelta: -1, obstacleBonus: 1, glassBonus: 1, bossGain: 2, bossMaxDelta: -1, pressure: 1 },
  { label: "Cold Draft", targetMul: 1.22, movesDelta: -1, obstacleBonus: 1, glassBonus: 1, bossGain: 2, bossMaxDelta: -1, pressure: 1 },
  { label: "Frostbite", targetMul: 1.3, movesDelta: -1, obstacleBonus: 2, glassBonus: 2, bossGain: 2, bossMaxDelta: -1, pressure: 1 },
  { label: "Archive Sentinel", targetMul: 1.4, movesDelta: -2, obstacleBonus: 2, glassBonus: 2, bossGain: 2, bossMaxDelta: -2, pressure: 2 },
  { label: "Spark Surge", targetMul: 1.48, movesDelta: -1, obstacleBonus: 2, glassBonus: 1, bossGain: 3, bossMaxDelta: -1, pressure: 2 },
  { label: "Forge Pressure", targetMul: 1.58, movesDelta: -2, obstacleBonus: 3, glassBonus: 2, bossGain: 3, bossMaxDelta: -2, pressure: 2 },
  { label: "Storm Tyrant", targetMul: 1.7, movesDelta: -2, obstacleBonus: 3, glassBonus: 2, bossGain: 3, bossMaxDelta: -2, pressure: 3 },
  { label: "Void Echo", targetMul: 1.82, movesDelta: -2, obstacleBonus: 4, glassBonus: 3, bossGain: 3, bossMaxDelta: -2, pressure: 3 },
  { label: "Abyss Gravity", targetMul: 1.96, movesDelta: -3, obstacleBonus: 4, glassBonus: 3, bossGain: 4, bossMaxDelta: -2, pressure: 3 },
  { label: "Final Cataclysm", targetMul: 2.12, movesDelta: -3, obstacleBonus: 5, glassBonus: 4, bossGain: 4, bossMaxDelta: -3, pressure: 4 },
];

export const CHAPTER_THEMES = [
  {
    id: "crystal_mines",
    start: 1,
    end: 3,
    title: "Crystal Mines",
    shortLabel: "Mines",
    bossName: "Mine Warden",
    eliteBossName: "Crystal Burrow Tyrant",
    pattern: "Glass / Obstacle / Pressure",
    intro: "Stable crystal tunnels with early board hazards.",
    boardImage: "./assets/generated/ui/bg_board_crystal_mines.png",
    obstacleImage: "./assets/generated/ui/tile_obstacle_mines.png",
    gemTone: "none",
  },
  {
    id: "frozen_archive",
    start: 4,
    end: 6,
    title: "Frozen Archive",
    shortLabel: "Archive",
    bossName: "Archivist of Frost",
    eliteBossName: "Frozen Memory Eater",
    pattern: "Lock / Glass / Recolor",
    intro: "Lock-heavy floors that reward planning over speed.",
    boardImage: "./assets/generated/ui/bg_board_frozen_archive.png",
    obstacleImage: "./assets/generated/ui/tile_obstacle_archive.png",
    gemTone: "hue-rotate(12deg) saturate(0.9) brightness(1.05)",
  },
  {
    id: "storm_forge",
    start: 7,
    end: 9,
    title: "Storm Forge",
    shortLabel: "Forge",
    bossName: "Forge Tempest",
    eliteBossName: "Thunder Crucible Titan",
    pattern: "Pressure / Chain / Boss burst",
    intro: "High-voltage floors built around chain payoffs and punishment.",
    boardImage: "./assets/generated/ui/bg_board_storm_forge.png",
    obstacleImage: "./assets/generated/ui/tile_obstacle_forge.png",
    gemTone: "saturate(1.16) brightness(1.04)",
  },
  {
    id: "void_rift",
    start: 10,
    end: 12,
    title: "Void Rift",
    shortLabel: "Rift",
    bossName: "Rift Sovereign",
    eliteBossName: "Voidheart Devourer",
    pattern: "Storm / Lock / Shift / Collapse",
    intro: "Endgame floors with stacked pressure and mixed hazards.",
    boardImage: "./assets/generated/ui/bg_board_void_rift.png",
    obstacleImage: "./assets/generated/ui/tile_obstacle_rift.png",
    gemTone: "hue-rotate(-14deg) saturate(1.12) brightness(0.96)",
  },
];

export const EVENT_NODE_FLOORS = [2, 5, 8, 11];
export const ELITE_FLOORS = [3, 6, 9, 12];
