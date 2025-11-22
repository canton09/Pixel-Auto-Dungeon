import { 
  Hero, HeroClass, Stats, Item, EquipmentSlot, 
  GameMap, MapTile, MapTheme, Enemy, Coordinate, EnemyType 
} from './types';
import { MAP_SIZE, CLASS_CONFIG, MAP_THEMES, ITEM_PREFIXES, ITEM_BASES, CLASS_DISPLAY, ENEMY_TYPES_MAP, CLASS_SKILLS } from './constants';

// --- Generators ---

export const generateHero = (id: number, hClass: HeroClass): Hero => {
  const base = CLASS_CONFIG[hClass].base;
  return {
    id,
    name: `${CLASS_DISPLAY[hClass]}`,
    class: hClass,
    baseStats: { ...base, maxHp: base.hp, maxMp: base.mp },
    stats: { ...base, maxHp: base.hp, maxMp: base.mp },
    skills: CLASS_SKILLS[hClass],
    equipment: {
      [EquipmentSlot.Weapon]: null,
      [EquipmentSlot.Head]: null,
      [EquipmentSlot.Body]: null,
      [EquipmentSlot.Hands]: null,
      [EquipmentSlot.Feet]: null,
    },
    avatarColor: CLASS_CONFIG[hClass].color
  };
};

export const generateMap = (level: number): GameMap => {
  const theme = MAP_THEMES[Math.floor(Math.random() * MAP_THEMES.length)];
  const tiles: MapTile[][] = Array(MAP_SIZE).fill(null).map((_, y) => 
    Array(MAP_SIZE).fill(null).map((_, x) => ({
      x, y, type: 'wall', explored: false, visible: false
    }))
  );

  const startPos = { x: 1, y: 1 };
  const stack: Coordinate[] = [startPos];
  tiles[startPos.y][startPos.x].type = 'start';
  tiles[startPos.y][startPos.x].explored = true;
  tiles[startPos.y][startPos.x].visible = true;

  const visited = new Set<string>();
  visited.add(`1,1`);

  let bossPos = { x: 1, y: 1 };
  let maxDist = 0;

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const dist = Math.abs(current.x - startPos.x) + Math.abs(current.y - startPos.y);
    if (dist > maxDist) {
      maxDist = dist;
      bossPos = { ...current };
    }

    const neighbors = [
      { x: current.x + 2, y: current.y },
      { x: current.x - 2, y: current.y },
      { x: current.x, y: current.y + 2 },
      { x: current.x, y: current.y - 2 },
    ].filter(n => 
      n.x > 0 && n.x < MAP_SIZE - 1 && n.y > 0 && n.y < MAP_SIZE - 1 && !visited.has(`${n.x},${n.y}`)
    );

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      visited.add(`${next.x},${next.y}`);
      
      tiles[next.y][next.x].type = 'floor';
      tiles[(current.y + next.y) / 2][(current.x + next.x) / 2].type = 'floor';
      
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  tiles[bossPos.y][bossPos.x].type = 'boss';

  for(let y=0; y<MAP_SIZE; y++) {
    for(let x=0; x<MAP_SIZE; x++) {
      if(tiles[y][x].type === 'floor' && Math.random() < 0.08) {
        tiles[y][x].hasEnemy = true;
      }
    }
  }

  return {
    tiles,
    width: MAP_SIZE,
    height: MAP_SIZE,
    theme,
    level,
    startPos,
    bossPos
  };
};

export const generateItem = (level: number, forceSlot?: EquipmentSlot): Item => {
  const slots = Object.values(EquipmentSlot);
  const slot = forceSlot || slots[Math.floor(Math.random() * slots.length)];
  
  const prefix = ITEM_PREFIXES[Math.min(Math.floor(Math.random() * ITEM_PREFIXES.length), level % 10)];
  const baseName = ITEM_BASES[slot][Math.floor(Math.random() * ITEM_BASES[slot].length)];
  
  const rarityRoll = Math.random();
  let rarity: Item['rarity'] = 'Common';
  let mult = 1;
  if (rarityRoll > 0.98) { rarity = 'Mythic'; mult = 5; }
  else if (rarityRoll > 0.9) { rarity = 'Legendary'; mult = 3; }
  else if (rarityRoll > 0.75) { rarity = 'Epic'; mult = 2; }
  else if (rarityRoll > 0.5) { rarity = 'Rare'; mult = 1.5; }

  const stats: Partial<Stats> = {};
  const statPoints = Math.floor((level * 2 + 5) * mult);
  
  if (slot === EquipmentSlot.Weapon) stats.atk = statPoints;
  else if (slot === EquipmentSlot.Body) stats.def = statPoints;
  else if (slot === EquipmentSlot.Head) {
     stats.hp = statPoints * 5;
     if (Math.random() > 0.7) stats.mp = statPoints * 3;
  }
  else {
    if (Math.random() > 0.5) stats.spd = Math.floor(statPoints / 2);
    if (Math.random() > 0.5) stats.atk = Math.floor(statPoints / 3);
    if (Math.random() > 0.5) stats.def = Math.floor(statPoints / 3);
    if (Math.random() > 0.8) stats.mp = Math.floor(statPoints * 2);
  }

  const score = (stats.hp || 0)/10 + (stats.atk || 0) + (stats.def || 0) + (stats.spd || 0);

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: `${prefix}${baseName}`,
    slot,
    rarity,
    stats,
    score
  };
};

export const generateEnemies = (count: number, level: number, theme: MapTheme, isBoss: boolean): Enemy[] => {
  const enemies: Enemy[] = [];
  
  for (let i = 0; i < count; i++) {
    let name = "";
    let type: EnemyType = 'beast';
    let base = "";

    if (isBoss) {
        name = `[首领] ${theme.bossNames[Math.floor(Math.random() * theme.bossNames.length)]}`;
        base = "boss";
        type = 'demon'; // Default boss type, or random
    } else {
        const prefix = theme.enemyPrefixes[Math.floor(Math.random() * theme.enemyPrefixes.length)];
        base = theme.enemyBases[Math.floor(Math.random() * theme.enemyBases.length)];
        name = `${prefix}${base}`;
        type = ENEMY_TYPES_MAP[base] || 'beast';
    }
    
    // Increased HP multiplier to 4x (from previous implied 1x) to make fights last longer
    const hpMult = isBoss ? 20 : 5; 
    const statMult = isBoss ? 3.5 : 1.3;

    enemies.push({
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      isBoss,
      type,
      hueRotate: Math.floor(Math.random() * 360), // Random color shift
      stats: {
        hp: (100 + level * 25) * hpMult,
        maxHp: (100 + level * 25) * hpMult,
        mp: 0,
        maxMp: 0,
        atk: (15 + level * 3) * statMult,
        def: (2 + level) * statMult,
        spd: (5 + level) * (isBoss ? 1.2 : 0.8)
      },
      rewardScore: (level * 10) * statMult
    });
  }
  return enemies;
};

// --- Mechanics ---

export const recalculateHeroStats = (hero: Hero): Hero => {
  const newStats = { ...hero.baseStats };
  Object.values(hero.equipment).forEach(item => {
    if (item) {
      if (item.stats.hp) newStats.hp += item.stats.hp;
      if (item.stats.mp) newStats.mp += item.stats.mp;
      if (item.stats.atk) newStats.atk += item.stats.atk;
      if (item.stats.def) newStats.def += item.stats.def;
      if (item.stats.spd) newStats.spd += item.stats.spd;
    }
  });
  // Preserve current HP/MP percentage when stats change
  const oldHpPercent = hero.stats.hp / hero.stats.maxHp;
  const oldMpPercent = hero.stats.mp / hero.stats.maxMp;
  
  newStats.maxHp = newStats.hp;
  newStats.maxMp = newStats.mp;
  
  // Apply current stats
  newStats.hp = Math.floor(newStats.maxHp * oldHpPercent) || newStats.maxHp;
  newStats.mp = Math.floor(newStats.maxMp * oldMpPercent) || newStats.maxMp;

  return { ...hero, stats: newStats };
};

export const tryAutoEquip = (hero: Hero, item: Item): { success: boolean; oldItem: Item | null } => {
  const currentItem = hero.equipment[item.slot];
  
  let scoreMult = 1;
  if (hero.class === HeroClass.Paladin && item.stats.def) scoreMult = 1.2;
  if (hero.class === HeroClass.Berserker && item.stats.atk) scoreMult = 1.2;
  if (hero.class === HeroClass.Assassin && item.stats.spd) scoreMult = 1.3;
  if ((hero.class === HeroClass.Elementalist || hero.class === HeroClass.Priest) && item.stats.mp) scoreMult = 1.3;

  const newScore = item.score * scoreMult;
  const currentScore = currentItem ? currentItem.score : 0;

  if (newScore > currentScore) {
    return { success: true, oldItem: currentItem };
  }
  return { success: false, oldItem: null };
};