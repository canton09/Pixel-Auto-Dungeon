import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Hero, HeroClass, GameMap, GamePhase, GameLog, Coordinate, 
  Enemy 
} from './types';
import { 
  generateHero, generateMap, generateItem, generateEnemies, 
  recalculateHeroStats, tryAutoEquip 
} from './gameEngine';
import { TICK_RATE_MS } from './constants';
import MapDisplay from './components/MapDisplay';
import PartyPanel from './components/PartyPanel';
import LogPanel from './components/LogPanel';
import CombatScene from './components/CombatScene';
import MusicPlayer from './components/MusicPlayer';

const INITIAL_PARTY_CLASSES = [
  HeroClass.Paladin, HeroClass.Berserker, HeroClass.Assassin, 
  HeroClass.Elementalist, HeroClass.Priest, HeroClass.Ranger
];

function App() {
  const [party, setParty] = useState<Hero[]>([]);
  const [map, setMap] = useState<GameMap | null>(null);
  const [partyPos, setPartyPos] = useState<Coordinate>({ x: 1, y: 1 });
  const [phase, setPhase] = useState<GamePhase>(GamePhase.Exploring);
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [combatState, setCombatState] = useState<{ enemies: Enemy[]; round: number; lastLog?: string } | null>(null);
  const [sfxTrigger, setSfxTrigger] = useState<{ type: 'attack' | 'hit' | 'skill' | 'heal' | 'victory', id: number } | null>(null);

  const stateRef = useRef({ party, map, partyPos, phase, combatState });
  useEffect(() => {
    stateRef.current = { party, map, partyPos, phase, combatState };
  }, [party, map, partyPos, phase, combatState]);

  useEffect(() => {
    const initialHeroes = INITIAL_PARTY_CLASSES.map((c, i) => generateHero(i, c));
    setParty(initialHeroes);
    
    const firstMap = generateMap(1);
    setMap(firstMap);
    setPartyPos(firstMap.startPos);
    addLog("系统初始化完成。勇者队伍集结中...", 'info');
    addLog("进入区域: " + firstMap.theme.name, 'info');
  }, []);

  const addLog = (message: string, type: GameLog['type']) => {
    setLogs(prev => [...prev.slice(-49), { 
      id: Math.random().toString(36), 
      message, 
      type, 
      timestamp: Date.now() 
    }]);
  };

  const triggerSfx = (type: 'attack' | 'hit' | 'skill' | 'heal' | 'victory') => {
      setSfxTrigger({ type, id: Date.now() });
  };

  const tick = useCallback(() => {
    const { party, map, partyPos, phase, combatState } = stateRef.current;
    if (!map) return;

    // Reset visual states from previous tick
    const resetParty = party.map(h => ({ ...h, lastAction: undefined, lastDamage: undefined, lastSkillName: undefined }));
    
    if (phase === GamePhase.Exploring) {
      setParty(resetParty); // Clear any lingering combat visuals

      const neighbors = [
        { x: partyPos.x, y: partyPos.y - 1 },
        { x: partyPos.x, y: partyPos.y + 1 },
        { x: partyPos.x - 1, y: partyPos.y },
        { x: partyPos.x + 1, y: partyPos.y },
      ].filter(n => 
        n.x >= 0 && n.x < map.width && n.y >= 0 && n.y < map.height && 
        map.tiles[n.y][n.x].type !== 'wall'
      );

      if (neighbors.length === 0) return;

      let nextPos = neighbors[Math.floor(Math.random() * neighbors.length)];
      const unexplored = neighbors.filter(n => !map.tiles[n.y][n.x].explored);
      if (unexplored.length > 0) {
        nextPos = unexplored[Math.floor(Math.random() * unexplored.length)];
      }

      const newTiles = [...map.tiles];
      newTiles[nextPos.y][nextPos.x].explored = true;
      newTiles[nextPos.y][nextPos.x].visible = true;
      
      setMap({ ...map, tiles: newTiles });
      setPartyPos(nextPos);

      // Passive MP Regen while walking
      const regenParty = resetParty.map(h => ({
         ...h,
         stats: { ...h.stats, mp: Math.min(h.stats.maxMp, h.stats.mp + 2) }
      }));
      setParty(regenParty);

      const tile = newTiles[nextPos.y][nextPos.x];
      
      if (tile.type === 'boss') {
        addLog(`警告：遭遇 ${map.theme.bossNames[0]}！`, 'danger');
        setPhase(GamePhase.Combat);
        setCombatState({
          enemies: generateEnemies(1, map.level, map.theme, true),
          round: 1
        });
        return;
      }

      if (tile.hasEnemy) {
        addLog("遭遇突袭！敌人出现。", 'combat');
        setPhase(GamePhase.Combat);
        setCombatState({
          enemies: generateEnemies(Math.floor(Math.random() * 3) + 1, map.level, map.theme, false),
          round: 1
        });
        tile.hasEnemy = false; 
        setMap({ ...map, tiles: newTiles });
        return;
      }
    }

    else if (phase === GamePhase.Combat && combatState) {
      let combatLogStr = "";
      let eventOccurred = false;
      let sfxToPlay: 'skill' | 'attack' | 'hit' | null = null;
      
      let newEnemies = combatState.enemies.map(e => ({ ...e, lastAction: undefined, lastDamage: undefined }));
      let newParty = resetParty;
      
      // Select 1-2 random active heroes to attack per tick (Throttling)
      const activeHeroes = newParty.filter(h => h.stats.hp > 0);
      const attackersCount = Math.min(activeHeroes.length, Math.floor(Math.random() * 2) + 1);
      const attackerIndices = new Set<number>();
      while(attackerIndices.size < attackersCount && activeHeroes.length > 0) {
        const randIdx = Math.floor(Math.random() * newParty.length);
        if (newParty[randIdx] && newParty[randIdx].stats.hp > 0) attackerIndices.add(randIdx);
      }

      // --- Hero Turn ---
      newParty = newParty.map((hero, idx) => {
        if (!attackerIndices.has(idx)) return hero;
        
        const livingEnemies = newEnemies.filter(e => e.stats.hp > 0);
        if (livingEnemies.length === 0) return hero;

        // Skill Logic: 30% chance to try using a skill if MP suffices
        let usedSkill = false;
        let skillName = "";

        if (Math.random() < 0.3 && hero.skills.length > 0) {
            const skill = hero.skills[Math.floor(Math.random() * hero.skills.length)];
            if (hero.stats.mp >= skill.cost) {
                // Use Skill
                usedSkill = true;
                skillName = skill.name;
                const cost = skill.cost;
                const power = skill.power;
                
                hero.stats.mp -= cost;
                
                if (skill.type === 'heal') {
                     const healAmt = Math.floor(hero.stats.atk * power);
                     hero.stats.hp = Math.min(hero.stats.maxHp, hero.stats.hp + healAmt);
                     combatLogStr = `${hero.name} 使用 ${skillName} 恢复了 ${healAmt} HP!`;
                     triggerSfx('heal');
                     return { ...hero, lastAction: 'heal', lastSkillName: skillName };
                } else {
                     // Damage Skill
                     const isAoe = skill.type === 'aoe';
                     const targets = isAoe ? livingEnemies : [livingEnemies[Math.floor(Math.random() * livingEnemies.length)]];
                     
                     newEnemies = newEnemies.map(e => {
                         if (targets.some(t => t.id === e.id)) {
                             const dmg = Math.max(1, Math.floor((hero.stats.atk * power) - (e.stats.def * 0.1)));
                             return { ...e, stats: { ...e.stats, hp: e.stats.hp - dmg }, lastAction: 'hit', lastDamage: dmg };
                         }
                         return e;
                     });
                     
                     combatLogStr = `${hero.name} 使用 ${skillName} ${isAoe ? '轰炸全场' : '造成重创'}!`;
                     sfxToPlay = 'skill';
                     return { ...hero, lastAction: 'skill', lastSkillName: skillName };
                }
            }
        }

        if (!usedSkill) {
            // Basic Attack
            const randomEnemy = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
            const targetIdx = newEnemies.findIndex(e => e.id === randomEnemy.id);
            const target = newEnemies[targetIdx];
            
            if (!target) return hero;

            const dmg = Math.max(1, Math.floor((hero.stats.atk * (0.8 + Math.random() * 0.4)) - (target.stats.def * 0.2)));
            
            newEnemies[targetIdx] = {
                ...target,
                stats: { ...target.stats, hp: target.stats.hp - dmg },
                lastAction: 'hit',
                lastDamage: dmg
            };
            combatLogStr = `${hero.name} 攻击造成 ${dmg} 点伤害!`;
            if (!sfxToPlay) sfxToPlay = 'attack';
            return { ...hero, lastAction: 'attack' };
        }
        return hero;
      });

      // --- Enemy Turn ---
      const activeEnemies = newEnemies.filter(e => e.stats.hp > 0);
      const enemyAttackersCount = Math.min(activeEnemies.length, Math.floor(Math.random() * 2) + 1);
      let enemyAttacksLeft = enemyAttackersCount;
      let enemyHitPlayer = false;

      newEnemies = newEnemies.map(enemy => {
        if (enemy.stats.hp <= 0 || enemyAttacksLeft <= 0) return enemy;
        if (Math.random() > 0.6) return enemy; // Random chance to idle

        const livingHeroes = newParty.filter(h => h.stats.hp > 0);
        if (livingHeroes.length > 0) {
            enemyAttacksLeft--;
            const randomHero = livingHeroes[Math.floor(Math.random() * livingHeroes.length)];
            const targetIdx = newParty.findIndex(h => h.id === randomHero.id);
            const target = newParty[targetIdx];
            
            if (!target) return enemy;

            const dmg = Math.max(1, Math.floor((enemy.stats.atk * (0.8 + Math.random() * 0.4)) - (target.stats.def * 0.2)));
            
            newParty[targetIdx] = {
                ...target,
                stats: { ...target.stats, hp: target.stats.hp - dmg },
                lastAction: 'hit',
                lastDamage: dmg
            };
            enemyHitPlayer = true;
            return { ...enemy, lastAction: 'attack' };
        }
        return enemy;
      });

      // SFX Priority: Skill > EnemyHitPlayer > Attack
      if (sfxToPlay) triggerSfx(sfxToPlay);
      else if (enemyHitPlayer) triggerSfx('hit');

      // Check Death
      if (newParty.filter(h => h.stats.hp > 0).length === 0) {
            addLog("全军覆没！正在撤退恢复...", 'danger');
            newParty = newParty.map(h => ({...h, stats: {...h.stats, hp: h.stats.maxHp * 0.5, mp: h.stats.maxMp * 0.5 }}));
            setPhase(GamePhase.Exploring);
            setPartyPos(map.startPos);
            setCombatState(null); 
            setParty(newParty);
            return;
      }

      if (newEnemies.every(e => e.stats.hp <= 0)) {
        // Victory!
        const isBoss = newEnemies.some(e => e.isBoss);
        addLog(isBoss ? "首领被击败！" : "战斗胜利！", isBoss ? 'danger' : 'loot');
        setCombatState({ ...combatState, enemies: newEnemies, lastLog: "战斗胜利!" });
        setParty(newParty);
        triggerSfx('victory');
        setPhase(GamePhase.CombatVictory); 
      } else {
         setCombatState({ 
             enemies: newEnemies, 
             round: combatState.round + 1,
             lastLog: combatLogStr 
         });
         setParty(newParty);
      }
    }

    else if (phase === GamePhase.CombatVictory) {
        if (Math.random() > 0.5) { 
             const isBoss = combatState?.enemies.some(e => e.isBoss);
             
             // Loot & Recovery
             const newParty = party.map(hero => {
                const healedHp = Math.min(hero.stats.maxHp, hero.stats.hp + (hero.stats.maxHp * 0.3));
                const healedMp = Math.min(hero.stats.maxMp, hero.stats.mp + (hero.stats.maxMp * 0.3));

                let updatedHero = { ...hero, stats: { ...hero.stats, hp: healedHp, mp: healedMp }, lastAction: 'heal' as const };
     
                if (Math.random() > 0.3 || isBoss) {
                  const newItem = generateItem(map.level + (isBoss ? 2 : 0));
                  const equipResult = tryAutoEquip(updatedHero, newItem);
                  if (equipResult.success) {
                    updatedHero.equipment[newItem.slot] = newItem;
                    updatedHero = recalculateHeroStats(updatedHero);
                    addLog(`${hero.name} 装备了 ${newItem.name}`, 'loot');
                  }
                }
                return updatedHero;
             });

             setParty(newParty);
             setCombatState(null);
             setPhase(isBoss ? GamePhase.MapTransition : GamePhase.Exploring);
        }
    }

    else if (phase === GamePhase.MapTransition) {
      addLog("正在前往下一个区域...", 'info');
      const nextLevel = map.level + 1;
      // Pass the current map's theme name to exclude it from the next generation
      const nextMap = generateMap(nextLevel, map.theme.name);
      setMap(nextMap);
      setPartyPos(nextMap.startPos);
      setPhase(GamePhase.Exploring);
      // Full Heal on level up
      setParty(prev => prev.map(h => ({ ...h, stats: { ...h.stats, hp: h.stats.maxHp, mp: h.stats.maxMp } })));
      addLog(`进入层级 ${nextLevel}: ${nextMap.theme.name}`, 'info');
    }

  }, []);

  useEffect(() => {
    const interval = setInterval(tick, TICK_RATE_MS);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <div className="w-full min-h-screen bg-neutral-900 flex flex-col items-center p-2 sm:p-4 relative text-zinc-300 font-vt323">
      <MusicPlayer phase={phase} sfxTrigger={sfxTrigger} />
      <div className="absolute inset-0 pointer-events-none crt-overlay z-50"></div>

      <div className="max-w-6xl w-full flex flex-col gap-4 z-10">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b-4 border-zinc-700 pb-2">
            <div>
                 <h1 className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-md">
                    像素自动地牢循环
                </h1>
                <p className="text-zinc-500 text-sm mt-1 tracking-widest uppercase">Pixel Auto Dungeon: Infinite Loop</p>
            </div>
            
            <div className="text-right">
                <div className={`text-2xl font-bold uppercase tracking-widest ${phase === GamePhase.Combat ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                    {phase === GamePhase.Exploring ? '>>> 探索中 <<<' : (phase === GamePhase.Combat || phase === GamePhase.CombatVictory) ? '!!! 战斗中 !!!' : '... 传送中 ...'}
                </div>
            </div>
        </div>

        {/* Main Viewport */}
        <div className="flex flex-col gap-4">
            
            {/* Main Stage: Switches between Map and Combat */}
            <div className="w-full flex justify-center min-h-[500px]">
                {(phase === GamePhase.Combat || phase === GamePhase.CombatVictory) && combatState && map ? (
                    <CombatScene 
                        party={party} 
                        enemies={combatState.enemies} 
                        theme={map.theme} 
                        log={combatState.lastLog}
                        victory={phase === GamePhase.CombatVictory}
                    />
                ) : (
                    map && <MapDisplay map={map} partyPos={partyPos} party={party} />
                )}
            </div>

            {/* Bottom Panel: Stats and Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                 <div className="lg:col-span-2">
                    <PartyPanel party={party} />
                 </div>
                 <div className="lg:col-span-1">
                    <LogPanel logs={logs} />
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default App;