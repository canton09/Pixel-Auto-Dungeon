import { HeroClass, MapTheme, EquipmentSlot, EnemyType, Skill } from './types';

export const MAP_SIZE = 25; // 25x25 grid
export const TICK_RATE_MS = 800;

export const CLASS_DISPLAY: Record<HeroClass, string> = {
  [HeroClass.Paladin]: '圣骑士',
  [HeroClass.Berserker]: '狂战士',
  [HeroClass.Assassin]: '刺客',
  [HeroClass.Elementalist]: '元素使',
  [HeroClass.Priest]: '牧师',
  [HeroClass.Ranger]: '游侠'
};

export const SLOT_DISPLAY: Record<EquipmentSlot, string> = {
  [EquipmentSlot.Weapon]: '武器',
  [EquipmentSlot.Head]: '头盔',
  [EquipmentSlot.Body]: '护甲',
  [EquipmentSlot.Hands]: '护手',
  [EquipmentSlot.Feet]: '战靴'
};

// Define Skills
export const CLASS_SKILLS: Record<HeroClass, Skill[]> = {
  [HeroClass.Paladin]: [
    { name: "神圣打击", cost: 20, type: 'damage', power: 1.5, description: "强力的神圣攻击" },
    { name: "圣光护盾", cost: 30, type: 'heal', power: 0.5, description: "恢复自身生命" }, // Simplified as heal for now
    { name: "审判", cost: 45, type: 'damage', power: 2.2, description: "终极单体伤害" }
  ],
  [HeroClass.Berserker]: [
    { name: "顺劈斩", cost: 25, type: 'aoe', power: 0.8, description: "攻击所有敌人" },
    { name: "嗜血", cost: 0, type: 'damage', power: 1.2, description: "普通攻击但更强" }, // Passive-like
    { name: "大地震击", cost: 50, type: 'damage', power: 2.5, description: "毁灭性打击" }
  ],
  [HeroClass.Assassin]: [
    { name: "背刺", cost: 15, type: 'damage', power: 1.8, description: "快速的高伤攻击" },
    { name: "刀扇", cost: 35, type: 'aoe', power: 0.6, description: "飞刀攻击所有敌人" },
    { name: "致命一击", cost: 60, type: 'damage', power: 3.5, description: "极高的单体爆发" }
  ],
  [HeroClass.Elementalist]: [
    { name: "火球术", cost: 20, type: 'damage', power: 1.6, description: "火焰伤害" },
    { name: "暴风雪", cost: 50, type: 'aoe', power: 1.0, description: "强力群体魔法" },
    { name: "雷霆万钧", cost: 80, type: 'damage', power: 3.0, description: "单体闪电伤害" }
  ],
  [HeroClass.Priest]: [
    { name: "快速治疗", cost: 20, type: 'heal', power: 1.5, description: "恢复队友生命" },
    { name: "群体祷言", cost: 50, type: 'heal', power: 0.8, description: "恢复全队生命" }, // Note: Logic needs to handle AOE Heal
    { name: "神圣之火", cost: 30, type: 'damage', power: 1.5, description: "神圣魔法伤害" }
  ],
  [HeroClass.Ranger]: [
    { name: "二连射", cost: 25, type: 'damage', power: 1.4, description: "连续射击" },
    { name: "箭雨", cost: 40, type: 'aoe', power: 0.7, description: "攻击所有敌人" },
    { name: "狙击", cost: 55, type: 'damage', power: 2.8, description: "精准的高伤射击" }
  ]
};

export const CLASS_CONFIG: Record<HeroClass, { color: string; base: any }> = {
  [HeroClass.Paladin]: { 
    color: 'text-blue-400', 
    base: { hp: 200, mp: 100, atk: 15, def: 20, spd: 8 } 
  },
  [HeroClass.Berserker]: { 
    color: 'text-red-500', 
    base: { hp: 180, mp: 60, atk: 25, def: 10, spd: 12 } 
  },
  [HeroClass.Assassin]: { 
    color: 'text-purple-400', 
    base: { hp: 120, mp: 80, atk: 30, def: 5, spd: 20 } 
  },
  [HeroClass.Elementalist]: { 
    color: 'text-cyan-300', 
    base: { hp: 100, mp: 200, atk: 35, def: 5, spd: 10 } 
  },
  [HeroClass.Priest]: { 
    color: 'text-yellow-200', 
    base: { hp: 140, mp: 180, atk: 10, def: 10, spd: 10 } 
  },
  [HeroClass.Ranger]: { 
    color: 'text-green-400', 
    base: { hp: 150, mp: 100, atk: 22, def: 8, spd: 15 } 
  },
};

export const MAP_THEMES: MapTheme[] = [
  { 
    name: "腐败沼泽", 
    wallColor: "bg-[#2c3e23]", 
    floorColor: "bg-[#1a2316]", 
    bgGradient: "from-[#1a2316] via-[#2c3e23] to-black",
    enemyPrefixes: ["剧毒", "泥泞", "腐败", "变异", "长毛", "恶臭"],
    enemyBases: ["巨鼠", "软泥怪", "蚊虫", "鳄鱼", "多头蛇"],
    bossNames: ["沼泽之王", "万病之源"] 
  },
  { 
    name: "焦土炼狱", 
    wallColor: "bg-[#451212]", 
    floorColor: "bg-[#290808]", 
    bgGradient: "from-[#290808] via-[#7f1d1d] to-[#450a0a]",
    enemyPrefixes: ["燃烧", "熔岩", "黑曜石", "暴怒", "灰烬", "地狱"],
    enemyBases: ["小鬼", "火元素", "地狱犬", "炎魔", "红龙雏"],
    bossNames: ["拉格纳罗斯的化身", "灰烬领主"] 
  },
  { 
    name: "永冻冰原", 
    wallColor: "bg-[#1e293b]", 
    floorColor: "bg-[#0f172a]", 
    bgGradient: "from-[#0f172a] via-[#1e3a8a] to-[#cbd5e1]",
    enemyPrefixes: ["极寒", "冰霜", "雪崩", "水晶", "苍白", "冬眠"],
    enemyBases: ["雪狼", "冰巨人", "雪怪", "冰魂", "极地熊"],
    bossNames: ["凛冬女皇", "绝对零度"] 
  },
  { 
    name: "赛博废墟", 
    wallColor: "bg-[#2e1065]", 
    floorColor: "bg-[#170a2b]", 
    bgGradient: "from-[#020617] via-[#4c1d95] to-[#c026d3]",
    enemyPrefixes: ["机械", "镭射", "全息", "失控", "量子", "合成"],
    enemyBases: ["无人机", "守卫", "改造人", "炮塔", "机械蛛"],
    bossNames: ["天网核心", "暴走初号机"] 
  },
  { 
    name: "虚空维度", 
    wallColor: "bg-[#310b45]", 
    floorColor: "bg-[#0f0214]", 
    bgGradient: "from-[#000000] via-[#581c87] to-[#000000]",
    enemyPrefixes: ["虚空", "暗影", "扭曲", "无面", "噩梦", "混沌"],
    enemyBases: ["行者", "吞噬者", "眼魔", "触手怪", "魅影"],
    bossNames: ["虚空大君", "千眼之神"] 
  },
  { 
    name: "失落神庙", 
    wallColor: "bg-[#78350f]", 
    floorColor: "bg-[#451a03]", 
    bgGradient: "from-[#451a03] via-[#b45309] to-[#292524]",
    enemyPrefixes: ["古代", "诅咒", "法老", "沙尘", "黄金", "不朽"],
    enemyBases: ["木乃伊", "圣甲虫", "石像鬼", "祭司", "阿努比斯卫士"],
    bossNames: ["不朽法老", "沙漠死神"] 
  },
  { 
    name: "深渊海沟", 
    wallColor: "bg-[#172554]", 
    floorColor: "bg-[#020617]", 
    bgGradient: "from-[#020617] via-[#1e3a8a] to-[#172554]",
    enemyPrefixes: ["深海", "潮汐", "珊瑚", "带电", "装甲", "剧毒"],
    enemyBases: ["娜迦", "巨蟹", "灯笼鱼", "海怪", "狂鲨"],
    bossNames: ["利维坦", "深海暴君"] 
  },
  { 
    name: "死灵墓地", 
    wallColor: "bg-[#3f3f46]", 
    floorColor: "bg-[#18181b]", 
    bgGradient: "from-[#000000] via-[#52525b] to-[#18181b]",
    enemyPrefixes: ["骷髅", "幽灵", "腐烂", "怨念", "骸骨", "吸血"],
    enemyBases: ["士兵", "弓手", "法师", "骑士", "蝙蝠"],
    bossNames: ["巫妖王", "死亡骑士"] 
  }
];

export const ENEMY_TYPES_MAP: Record<string, EnemyType> = {
  // Mapping bases to types for avatar generation
  "巨鼠": "beast", "软泥怪": "beast", "蚊虫": "beast", "鳄鱼": "beast", "多头蛇": "beast",
  "小鬼": "demon", "火元素": "demon", "地狱犬": "beast", "炎魔": "demon", "红龙雏": "beast",
  "雪狼": "beast", "冰巨人": "humanoid", "雪怪": "beast", "冰魂": "undead", "极地熊": "beast",
  "无人机": "construct", "守卫": "construct", "改造人": "humanoid", "炮塔": "construct", "机械蛛": "construct",
  "行者": "humanoid", "吞噬者": "demon", "眼魔": "demon", "触手怪": "beast", "魅影": "undead",
  "木乃伊": "undead", "圣甲虫": "beast", "石像鬼": "construct", "祭司": "humanoid", "阿努比斯卫士": "humanoid",
  "娜迦": "humanoid", "巨蟹": "beast", "灯笼鱼": "beast", "海怪": "beast", "狂鲨": "beast",
  "士兵": "undead", "弓手": "undead", "法师": "undead", "骑士": "undead", "蝙蝠": "beast"
};

export const ITEM_PREFIXES = ["生锈的", "普通的", "精良的", "强化的", "附魔的", "远古的", "赛博的", "神圣的", "诅咒的", "宇宙的"];
export const ITEM_BASES: Record<EquipmentSlot, string[]> = {
  [EquipmentSlot.Weapon]: ["长剑", "战斧", "匕首", "法杖", "魔棒", "长弓", "战锤", "利刃", "权杖", "光束枪"],
  [EquipmentSlot.Head]: ["头盔", "软帽", "兜帽", "面甲", "皇冠", "面具", "头巾", "战盔", "光环", "兽角"],
  [EquipmentSlot.Body]: ["铠甲", "法袍", "背心", "板甲", "外衣", "战斗服", "披风", "锁子甲", "硬壳", "甲壳"],
  [EquipmentSlot.Hands]: ["手套", "护手", "护腕", "拳套", "护指", "利爪", "臂铠", "绷带", "触摸", "铁拳"],
  [EquipmentSlot.Feet]: ["战靴", "护胫", "凉鞋", "便鞋", "履带", "行者", "长靴", "铁鞋", "兽爪", "蹄铁"]
};