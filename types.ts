export enum HeroClass {
  Paladin = 'Paladin',
  Berserker = 'Berserker',
  Assassin = 'Assassin',
  Elementalist = 'Elementalist',
  Priest = 'Priest',
  Ranger = 'Ranger'
}

export enum EquipmentSlot {
  Weapon = 'Weapon',
  Head = 'Head',
  Body = 'Body',
  Hands = 'Hands',
  Feet = 'Feet'
}

export interface Stats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  spd: number;
}

export interface Skill {
  name: string;
  cost: number;
  type: 'damage' | 'heal' | 'aoe';
  power: number; // Multiplier for DMG or Heal amount
  description: string;
}

export interface Item {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  stats: Partial<Stats>;
  classReq?: HeroClass;
  score: number;
}

export interface Hero {
  id: number;
  name: string;
  class: HeroClass;
  stats: Stats;
  baseStats: Stats;
  skills: Skill[];
  equipment: Record<EquipmentSlot, Item | null>;
  avatarColor: string;
  lastAction?: 'attack' | 'hit' | 'heal' | 'skill'; // Visual state
  lastSkillName?: string; // For visual feedback
  lastDamage?: number; // Visual state for damage numbers
}

export type EnemyType = 'beast' | 'undead' | 'demon' | 'construct' | 'humanoid';

export interface Enemy {
  id: string;
  name: string;
  isBoss: boolean;
  stats: Stats;
  rewardScore: number;
  type: EnemyType;
  hueRotate: number; // Visual variation
  lastAction?: 'attack' | 'hit'; // Visual state
  lastDamage?: number; // Visual state for damage numbers
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface MapTile {
  x: number;
  y: number;
  type: 'wall' | 'floor' | 'start' | 'boss';
  explored: boolean;
  visible: boolean;
  hasEnemy?: boolean;
}

export interface GameMap {
  tiles: MapTile[][];
  width: number;
  height: number;
  theme: MapTheme;
  level: number;
  startPos: Coordinate;
  bossPos: Coordinate;
}

export interface MapTheme {
  name: string;
  wallColor: string;
  floorColor: string;
  enemyPrefixes: string[]; // Adjectives
  enemyBases: string[]; // Nouns
  bossNames: string[];
  bgGradient: string; // CSS gradient for combat background
}

export enum GamePhase {
  Exploring = 'EXPLORING',
  Combat = 'COMBAT',
  CombatVictory = 'COMBAT_VICTORY',
  MapTransition = 'TRANSITION'
}

export interface CombatState {
  enemies: Enemy[];
  round: number;
  lastLog?: string;
}

export interface GameLog {
  id: string;
  message: string;
  type: 'info' | 'combat' | 'loot' | 'danger' | 'skill';
  timestamp: number;
}