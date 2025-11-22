import React, { useMemo } from 'react';
import { GameMap, Coordinate, Hero } from '../types';
import { HeroAvatar } from './Avatars';

interface Props {
  map: GameMap;
  partyPos: Coordinate;
  party: Hero[];
}

const MapDisplay: React.FC<Props> = ({ map, partyPos, party }) => {
  // Viewport settings
  const VIEW_SIZE = 7; // Show 7x7 grid
  const HALF_VIEW = Math.floor(VIEW_SIZE / 2);

  const tiles = useMemo(() => {
    const grid = [];
    for (let y = partyPos.y - HALF_VIEW; y <= partyPos.y + HALF_VIEW; y++) {
      const row = [];
      for (let x = partyPos.x - HALF_VIEW; x <= partyPos.x + HALF_VIEW; x++) {
        // Check bounds
        if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
           row.push(<div key={`${x}-${y}`} className="w-10 h-10 sm:w-16 sm:h-16 bg-black" />);
           continue;
        }

        const tile = map.tiles[y][x];
        const isParty = partyPos.x === x && partyPos.y === y;
        
        let content = null;
        let bgStyle = "bg-black";
        
        // --- Texture Classes ---
        // We use CSS gradients/patterns to simulate textures
        const wallPattern = "bg-[radial-gradient(circle,_var(--tw-gradient-from)_1px,_transparent_1px)] bg-[length:4px_4px]";
        // Enhanced Floor Pattern
        const floorPattern = "bg-[conic-gradient(at_top_left,_var(--tw-gradient-from)_0%,_transparent_50%)]";

        if (!tile.explored) {
          bgStyle = "bg-black opacity-90"; // Fog
        } else {
          if (tile.type === 'wall') {
             bgStyle = `${map.theme.wallColor} ${wallPattern} opacity-80 shadow-inner`;
          } else {
             bgStyle = `${map.theme.floorColor} opacity-100 ${floorPattern}`;
             // Floor decoration
             if ((x+y)%5 === 0) content = <div className="absolute inset-2 bg-white/5 rounded-full blur-[1px]"></div>;
             if ((x*y)%7 === 0) content = <div className="absolute top-1 right-1 w-2 h-2 bg-white/10 rounded-full"></div>;
          }

          if (tile.type === 'start') {
             content = <div className="text-[8px] sm:text-[10px] text-white/50 text-center mt-4 sm:mt-6">入口</div>;
          }

          if (tile.type === 'boss') {
             content = (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 sm:w-10 sm:h-10 bg-red-900/50 rounded-full animate-pulse border-2 border-red-500 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                        <span className="text-sm sm:text-xl">☠️</span>
                    </div>
                 </div>
             );
          }

          if (tile.hasEnemy && !isParty && tile.type !== 'boss') {
             content = (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 sm:w-6 sm:h-6 bg-purple-900/80 rounded-full animate-bounce shadow-[0_0_10px_rgba(147,51,234,0.5)]"></div>
                 </div>
             );
          }
        }

        row.push(
          <div 
            key={`${x}-${y}`} 
            className={`w-10 h-10 sm:w-16 sm:h-16 relative border border-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden ${bgStyle}`}
          >
            {content}
            
            {/* Render Party Grid inside current tile */}
            {isParty && (
              <div className="grid grid-cols-3 gap-[1px] p-[1px] sm:p-[2px] w-full h-full z-10 bg-black/20 backdrop-blur-[1px]">
                  {party.map(hero => (
                    <div key={hero.id} className="flex items-center justify-center">
                        <HeroAvatar hClass={hero.class} size="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                    </div>
                  ))}
              </div>
            )}
          </div>
        );
      }
      grid.push(<div key={y} className="flex">{row}</div>);
    }
    return grid;
  }, [map, partyPos, party]);

  return (
    <div className="relative border-2 sm:border-4 border-stone-600 bg-zinc-900 shadow-2xl shadow-black overflow-hidden rounded-sm max-w-full">
        {/* Map Header */}
        <div className="absolute top-0 left-0 right-0 bg-black/90 text-white p-1 sm:p-2 z-20 flex justify-between items-center border-b border-white/10 backdrop-blur-sm">
            <span className="text-yellow-500 font-bold drop-shadow-md text-sm sm:text-base">{map.theme.name}</span>
            <span className="text-[10px] sm:text-xs text-gray-400 font-mono">Lvl {map.level}</span>
        </div>
        
        {/* Map Grid */}
        <div className="flex flex-col p-0.5 sm:p-1 bg-black items-center justify-center">
            {tiles}
        </div>

        {/* Scanlines & Vignette */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none z-30 opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-30"></div>
    </div>
  );
};

export default MapDisplay;