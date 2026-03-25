export const MIN_BOARD_SIZE = 6;
export const MAX_BOARD_SIZE = 15;
export const BOARD_SIZE_BY_FLOOR = [6, 8, 10, 11, 13, 14, 15];
export const COLORS = 6;
export const TOTAL_FLOORS = 7;
export const META_KEY = "rogue_match3_meta_v5";
export const MOMENTUM_MAX = 100;
export const MAX_SKILL_CHAIN = 2;
export const MAX_ACTIVE_SHARDS = 260;

export const FLOOR_CONFIG = [
  { target: 420, moves: 17, obstacles: 0 },
  { target: 580, moves: 17, obstacles: 0 },
  { target: 820, moves: 16, obstacles: 1 },
  { target: 1080, moves: 16, obstacles: 2 },
  { target: 1380, moves: 15, obstacles: 3 },
  { target: 1720, moves: 15, obstacles: 4 },
  { target: 2100, moves: 14, obstacles: 5 },
];

export const FLOOR_DIFFICULTY = [
  { label: "Warm-Up", targetMul: 1, movesDelta: 0, obstacleBonus: 0, glassBonus: 0, bossGain: 1, bossMaxDelta: 0, pressure: 0 },
  { label: "Pressure", targetMul: 1.08, movesDelta: 0, obstacleBonus: 1, glassBonus: 0, bossGain: 1, bossMaxDelta: -1, pressure: 0 },
  { label: "Danger", targetMul: 1.2, movesDelta: -1, obstacleBonus: 1, glassBonus: 1, bossGain: 2, bossMaxDelta: -1, pressure: 1 },
  { label: "High Risk", targetMul: 1.33, movesDelta: -1, obstacleBonus: 2, glassBonus: 1, bossGain: 2, bossMaxDelta: -1, pressure: 1 },
  { label: "Nightmare", targetMul: 1.48, movesDelta: -2, obstacleBonus: 2, glassBonus: 2, bossGain: 2, bossMaxDelta: -2, pressure: 2 },
  { label: "Inferno", targetMul: 1.64, movesDelta: -2, obstacleBonus: 3, glassBonus: 2, bossGain: 3, bossMaxDelta: -2, pressure: 2 },
  { label: "Final Stand", targetMul: 1.85, movesDelta: -3, obstacleBonus: 4, glassBonus: 3, bossGain: 3, bossMaxDelta: -2, pressure: 3 },
];
