import React from 'react';
import { Hero, Enemy, MapTheme } from '../types';
import { HeroAvatar, EnemyAvatar } from './Avatars';

interface Props {
  party: Hero[];
  enemies: Enemy[];
  theme: MapTheme;
  log?: string;
  victory?: boolean;
}

const CombatScene: React.FC<Props> = ({ party, enemies, theme, log, victory }) => {
  
  return (
    <div className={`relative w-full h-[500px] border-4 border-neutral-900 overflow-hidden flex flex-col justify-between p-8 bg-gradient-to-b ${theme.bgGradient} shadow-inner`}>
      
      {/* Background Particles/Effect */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
          {/* Grid Floor Effect for depth */}
          <div className="absolute bottom-0 w-full h-1/2 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:40px_20px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom"></div>
      </div>

      {/* Victory Overlay */}
      {victory && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fade-in_0.5s]">
              <h1 className="text-6xl text-yellow-500 font-bold tracking-widest border-4 border-yellow-500 p-8 rotate-[-5deg] shadow-[0_0_50px_rgba(234,179,8,0.5)] bg-black/80">
                  VICTORY
              </h1>
          </div>
      )}

      {/* Top Section: Enemies */}
      <div className="flex justify-center gap-6 pt-4 z-10 min-h-[180px]">
        {enemies.map((enemy) => {
            if (!enemy || !enemy.stats) return null;
            const isDead = enemy.stats.hp <= 0;
            const isHit = enemy.lastAction === 'hit';
            const isAttacking = enemy.lastAction === 'attack';

            return (
                <div 
                    key={enemy.id} 
                    className={`flex flex-col items-center transition-all duration-300 relative ${isDead ? 'opacity-0 scale-50 filter grayscale' : 'opacity-100'} ${isHit ? 'animate-damage' : ''} ${isAttacking ? 'animate-attack-down z-20' : ''}`}
                >
                    {/* Damage Number */}
                    {enemy.lastDamage && (
                        <div className="absolute top-10 z-50 text-4xl font-bold text-white drop-shadow-[0_2px_0_rgba(255,0,0,1)] animate-float-damage pointer-events-none" style={{ textShadow: '2px 2px 0 #000' }}>
                            {enemy.lastDamage}
                        </div>
                    )}

                    {/* Health Bar */}
                    <div className="w-24 h-3 bg-black border border-white/20 mb-2 relative overflow-hidden shadow-lg">
                        <div className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-300" style={{ width: `${(Math.max(0, enemy.stats.hp) / enemy.stats.maxHp) * 100}%` }}></div>
                    </div>
                    
                    {/* Avatar */}
                    <div className="relative filter drop-shadow-xl">
                        <EnemyAvatar type={enemy.type} isBoss={enemy.isBoss} size={enemy.isBoss ? "w-32 h-32" : "w-24 h-24"} hueRotate={enemy.hueRotate} />
                        {isHit && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-full bg-white/70 rounded-full animate-ping mix-blend-overlay"></div>
                            </div>
                        )}
                    </div>
                    
                    <div className={`mt-2 font-bold text-shadow text-center bg-black/60 px-3 py-0.5 rounded border border-white/10 ${enemy.isBoss ? 'text-yellow-400 text-lg border-yellow-900/50' : 'text-gray-300 text-sm'}`}>
                        {enemy.name}
                    </div>
                </div>
            );
        })}
      </div>

      {/* Center Message Log Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none text-center w-full">
         {log && !victory && (
             <div className="inline-block bg-black/80 px-8 py-3 rounded-lg border-2 border-white/10 text-yellow-300 font-mono text-xl animate-[bounce_0.3s_ease-out] shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                 {log}
             </div>
         )}
      </div>

      {/* Bottom Section: Heroes */}
      <div className="flex justify-center gap-4 pb-4 z-10">
        {party.map((hero) => {
             if (!hero || !hero.stats) return null;
             const isHit = hero.lastAction === 'hit';
             const isAttacking = hero.lastAction === 'attack';
             const isHeal = hero.lastAction === 'heal';
             const isSkill = hero.lastAction === 'skill';

             return (
                <div 
                    key={hero.id} 
                    className={`relative flex flex-col items-center transition-transform duration-200 ${isAttacking || isSkill ? 'animate-attack-up z-20' : ''} ${isHit ? 'animate-damage' : ''}`}
                >
                    {/* Floating Text Effects */}
                    {hero.lastDamage && isHit && <div className="absolute -top-16 z-50 text-3xl font-bold text-red-500 animate-float-damage" style={{ textShadow: '1px 1px 0 #000' }}>-{hero.lastDamage}</div>}
                    {isHeal && <div className="absolute -top-16 z-50 text-2xl font-bold text-green-400 animate-float-damage" style={{ textShadow: '1px 1px 0 #000' }}>+HP</div>}
                    {isSkill && hero.lastSkillName && <div className="absolute -top-24 z-50 text-sm font-bold text-cyan-300 animate-float-damage whitespace-nowrap bg-black/50 px-2 rounded" style={{ textShadow: '1px 1px 0 #000' }}>{hero.lastSkillName}!</div>}

                    <div className={`border-2 p-1 bg-black/50 backdrop-blur-sm transition-colors duration-200 ${isHit ? 'border-red-500 bg-red-900/30' : 'border-zinc-600'}`}>
                         <HeroAvatar hClass={hero.class} size="w-16 h-16" animated={isSkill} />
                    </div>
                    
                    {/* HP */}
                    <div className="w-16 h-2 bg-zinc-900 mt-1 border border-black relative">
                        <div className="h-full bg-green-500 transition-all duration-200" style={{ width: `${(Math.max(0, hero.stats.hp) / hero.stats.maxHp) * 100}%` }}></div>
                    </div>
                    {/* MP */}
                    <div className="w-16 h-1 bg-zinc-900 border-x border-b border-black relative">
                        <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${(Math.max(0, hero.stats.mp) / hero.stats.maxMp) * 100}%` }}></div>
                    </div>
                </div>
             );
        })}
      </div>
      
    </div>
  );
};

export default CombatScene;