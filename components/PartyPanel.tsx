import React from 'react';
import { Hero, EquipmentSlot, HeroClass } from '../types';
import { Shield, Sword, Heart, Zap } from 'lucide-react';
import { SLOT_DISPLAY } from '../constants';
import { HeroAvatar } from './Avatars';

interface Props {
  party: Hero[];
}

const HeroCard: React.FC<{ hero: Hero }> = ({ hero }) => {
  if (!hero || !hero.stats) return null;
  const hpPercent = (hero.stats.hp / hero.stats.maxHp) * 100;
  const mpPercent = (hero.stats.mp / hero.stats.maxMp) * 100;
  
  return (
    <div className="bg-zinc-900 border-2 border-zinc-700 p-2 flex flex-col gap-1 text-xs relative overflow-hidden group">
        {/* Class Icon / Avatar */}
        <div className="flex gap-2 items-start mb-1">
            <div className="border border-zinc-700 bg-black p-1">
                 <HeroAvatar hClass={hero.class} size="w-8 h-8" />
            </div>
            <div className="flex flex-col w-full">
                <div className={`font-bold text-sm ${hero.avatarColor}`}>{hero.name}</div>
                <div className="text-zinc-500 text-[10px]">{hero.class === HeroClass.Paladin ? '坦克' : hero.class === HeroClass.Priest ? '治疗' : '输出'}</div>
                
                 {/* HP Bar */}
                <div className="w-full h-1.5 bg-zinc-800 rounded-sm overflow-hidden mt-1 border border-zinc-600 relative">
                    <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.max(0, hpPercent)}%` }}></div>
                </div>
                {/* MP Bar */}
                <div className="w-full h-1 bg-zinc-800 rounded-sm overflow-hidden mt-0.5 relative">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.max(0, mpPercent)}%` }}></div>
                </div>
            </div>
        </div>

        {/* Stats Compact */}
        <div className="grid grid-cols-2 gap-x-2 text-[10px] text-zinc-400 bg-black/40 p-1 rounded">
            <div className="flex items-center gap-1"><Sword size={10} className="text-red-400"/> <span className="text-zinc-300">{hero.stats.atk}</span></div>
            <div className="flex items-center gap-1"><Shield size={10} className="text-blue-400"/> <span className="text-zinc-300">{hero.stats.def}</span></div>
            <div className="flex items-center gap-1"><Heart size={10} className="text-green-400"/> <span className="text-zinc-300">{Math.floor(hero.stats.hp)}</span></div>
            <div className="flex items-center gap-1"><Zap size={10} className="text-yellow-400"/> <span className="text-zinc-300">{hero.stats.spd}</span></div>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-5 gap-1 mt-2 border-t border-zinc-800 pt-2">
            {[EquipmentSlot.Head, EquipmentSlot.Body, EquipmentSlot.Hands, EquipmentSlot.Feet, EquipmentSlot.Weapon].map(slot => {
                const item = hero.equipment[slot];
                let rarityColor = 'border-zinc-800 bg-zinc-950 text-zinc-600';
                if (item) {
                    switch(item.rarity) {
                        case 'Rare': rarityColor = 'border-blue-800 bg-blue-900/20 text-blue-300'; break;
                        case 'Epic': rarityColor = 'border-purple-800 bg-purple-900/20 text-purple-300'; break;
                        case 'Legendary': rarityColor = 'border-orange-600 bg-orange-900/20 text-orange-300'; break;
                        case 'Mythic': rarityColor = 'border-red-600 bg-red-900/20 text-red-300 animate-pulse'; break;
                        default: rarityColor = 'border-zinc-600 bg-zinc-800 text-zinc-300';
                    }
                }
                
                return (
                    <div 
                        key={slot} 
                        className={`w-full aspect-square border ${rarityColor} flex items-center justify-center text-[8px] cursor-help relative group/item`}
                    >
                        {item ? SLOT_DISPLAY[slot][0] : <span className="opacity-20">{SLOT_DISPLAY[slot][0]}</span>}
                        
                        {/* Tooltip */}
                        {item && (
                             <div className="hidden group-hover/item:block absolute bottom-full left-0 z-50 bg-black border border-white p-2 min-w-[120px] pointer-events-none mb-1 shadow-xl">
                                <div className="font-bold text-white mb-1">{item.name}</div>
                                <div className="text-[9px] text-gray-400 mb-1">{item.rarity} {SLOT_DISPLAY[item.slot]}</div>
                                {Object.entries(item.stats).map(([key, val]) => (
                                    <div key={key} className="text-gray-300 text-[9px] uppercase">{key}: +{val}</div>
                                ))}
                                <div className="text-[9px] text-yellow-500 mt-1">评分: {Math.floor(item.score)}</div>
                             </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};

const PartyPanel: React.FC<Props> = ({ party }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 p-2 bg-black border-t-4 border-zinc-800">
        {party.map(h => <HeroCard key={h.id} hero={h} />)}
    </div>
  );
};

export default PartyPanel;