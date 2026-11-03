/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameStatus = 'MENU' | 'PLAYING' | 'CHALLENGE_STAGE' | 'BOSS_STAGE' | 'PAUSED' | 'STAGE_CLEAR' | 'GAME_OVER';

export type EnemyType = 'DRONE' | 'BUTTERFLY' | 'COMMANDER' | 'INFILTRATOR' | 'BOSS';

export type PowerUpType = 
  | 'DUAL_FIGHTER' 
  | 'SPREAD_SHOT' 
  | 'RAPID_FIRE' 
  | 'PLASMA_BEAM' 
  | 'SHIELD' 
  | 'SMART_BOMB' 
  | 'EXTRA_LIFE';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Player {
  x: number;
  y: number;
  targetX: number;
  width: number;
  height: number;
  speed: number;
  lives: number;
  score: number;
  isDual: boolean;
  hasShield: boolean;
  shieldHealth: number;
  maxShieldHealth: number;
  activeWeapon: 'NORMAL' | 'SPREAD' | 'PLASMA';
  weaponTimer: number; // Duration of special weapon
  rapidFireTimer: number;
  smartBombs: number;
  invincibleTimer: number;
  isHit: boolean;
  hitTimer: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isPlayer: boolean;
  type: 'NORMAL' | 'SPREAD' | 'PLASMA' | 'ENEMY' | 'BOSS_MISSILE';
  damage: number;
  color: string;
  radius: number;
}

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  points: number;
  state: 'ENTERING' | 'FORMATION' | 'DIVING' | 'RETURNING' | 'TRACTOR';
  formationRow: number;
  formationCol: number;
  formationTargetX: number;
  formationTargetY: number;
  pathProgress: number;
  pathType: number;
  diveAngle: number;
  speed: number;
  wingAngle: number;
  color: string;
  hasEscort?: boolean;
  shootCooldown: number;
  tractorTimer?: number;
}

export interface Boss {
  x: number;
  y: number;
  targetX: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  phase: number;
  moveAngle: number;
  attackTimer: number;
  shieldActive: boolean;
  shieldHp: number;
  maxShieldHp: number;
  isEnraged: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  isSparkle?: boolean;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface PowerUp {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  vy: number;
  radius: number;
  color: string;
  label: string;
}

export interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  color: string;
  alpha: number;
  layer: number;
}

export interface HighScoreEntry {
  rank: number;
  name: string;
  score: number;
  wave: number;
  date: string;
}

export interface GameStats {
  shotsFired: number;
  shotsHit: number;
  enemiesDefeated: number;
  bossesDefeated: number;
  powerUpsCollected: number;
  maxCombo: number;
  currentCombo: number;
  wave: number;
}
