import React from 'react';
import { HeroClass, EnemyType } from '../types';

export const HeroAvatar: React.FC<{ hClass: HeroClass, size?: string, animated?: boolean }> = ({ hClass, size = "w-10 h-10", animated = false }) => {
  let mainColor = '#ccc';
  let accentColor = '#fff';
  
  switch (hClass) {
    case HeroClass.Paladin: mainColor = '#3b82f6'; accentColor = '#fcd34d'; break;
    case HeroClass.Berserker: mainColor = '#ef4444'; accentColor = '#7f1d1d'; break;
    case HeroClass.Assassin: mainColor = '#a855f7'; accentColor = '#1f2937'; break;
    case HeroClass.Elementalist: mainColor = '#06b6d4'; accentColor = '#ec4899'; break;
    case HeroClass.Priest: mainColor = '#fef08a'; accentColor = '#fff'; break;
    case HeroClass.Ranger: mainColor = '#22c55e'; accentColor = '#3f6212'; break;
  }

  const animationClass = animated ? "animate-pulse" : "";

  return (
    <div className={`${size} relative flex items-center justify-center rendering-pixelated`}>
      <svg viewBox="0 0 16 16" className="w-full h-full drop-shadow-md">
        <rect x="6" y="2" width="4" height="4" fill="#ffdbac" />
        <rect x="5" y="6" width="6" height="5" fill={mainColor} />
        <rect x="6" y="11" width="1" height="3" fill="#555" />
        <rect x="9" y="11" width="1" height="3" fill="#555" />
        
        {hClass === HeroClass.Paladin && (
          <>
            <rect x="3" y="6" width="2" height="4" fill="#ccc" />
            <rect x="11" y="5" width="1" height="5" fill="#ccc" />
            <rect x="6" y="1" width="4" height="2" fill={accentColor} />
          </>
        )}
        {hClass === HeroClass.Berserker && (
          <>
            <rect x="11" y="3" width="3" height="3" fill={accentColor} />
            <rect x="12" y="6" width="1" height="5" fill="#8b4513" />
            <rect x="6" y="2" width="4" height="1" fill={accentColor} />
          </>
        )}
        {hClass === HeroClass.Assassin && (
          <>
             <rect x="6" y="2" width="4" height="2" fill={accentColor} />
             <rect x="4" y="7" width="1" height="3" fill="#ccc" />
             <rect x="11" y="7" width="1" height="3" fill="#ccc" />
          </>
        )}
        {hClass === HeroClass.Elementalist && (
          <>
             <circle cx="12" cy="4" r="1.5" fill={accentColor} className={animationClass} />
             <rect x="5" y="5" width="6" height="6" fill={mainColor} opacity="0.5" />
          </>
        )}
        {hClass === HeroClass.Priest && (
          <>
             <rect x="7" y="6" width="2" height="4" fill="#fff" />
             <rect x="6" y="6" width="4" height="1" fill="#fff" />
             <rect x="6" y="2" width="4" height="1" fill={mainColor} />
          </>
        )}
        {hClass === HeroClass.Ranger && (
          <>
             <path d="M 3 5 Q 1 8 3 11" stroke="#8b4513" fill="none" strokeWidth="1" />
             <rect x="6" y="2" width="4" height="1" fill={accentColor} />
          </>
        )}
      </svg>
    </div>
  );
};

export const EnemyAvatar: React.FC<{ type: EnemyType, isBoss: boolean, size?: string, hueRotate?: number }> = ({ type, isBoss, size = "w-12 h-12", hueRotate = 0 }) => {
  let color = '#888';
  let eyes = '#f00';
  
  if(isBoss) {
    color = '#4a0404'; // Deep red
    eyes = '#ff0';
  } else {
    switch (type) {
      case 'beast': color = '#7f5539'; break; // Brown
      case 'undead': color = '#5f6368'; eyes = '#0ff'; break; // Gray
      case 'demon': color = '#b91c1c'; break; // Red
      case 'construct': color = '#475569'; eyes = '#fbbf24'; break; // Slate
      case 'humanoid': color = '#1e3a8a'; break; // Blue
    }
  }

  // Determine slight shape variation based on hueRotate (as a pseudo-random seed)
  const variant = hueRotate % 3; 

  return (
    <div 
        className={`${size} relative flex items-center justify-center rendering-pixelated ${isBoss ? 'drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]' : ''}`}
        style={{ filter: `hue-rotate(${hueRotate}deg)` }}
    >
      <svg viewBox="0 0 16 16" className="w-full h-full">
        {type === 'beast' && (
           <>
             {variant === 0 && <path d="M4 8 Q2 4 4 2 Q8 4 12 2 Q14 4 12 8 L 12 12 Q 8 14 4 12 Z" fill={color} />}
             {variant === 1 && <path d="M4 9 L2 6 L5 3 L11 3 L14 6 L12 9 L8 13 Z" fill={color} />} 
             {variant === 2 && <path d="M3 10 C 2 5, 14 5, 13 10 L 8 14 Z" fill={color} />}
             <circle cx="6" cy="7" r="1" fill={eyes} />
             <circle cx="10" cy="7" r="1" fill={eyes} />
             <path d="M5 10 Q8 12 11 10" stroke="#000" fill="none" strokeWidth="0.5"/>
           </>
        )}
        {type === 'undead' && (
           <>
             <circle cx="8" cy="6" r="4" fill={variant === 0 ? "#ddd" : variant === 1 ? "#ccc" : "#eee"} />
             <rect x="7" y="10" width="2" height="4" fill="#ddd" />
             <rect x="4" y="11" width="8" height="1" fill="#ddd" />
             <circle cx="7" cy="6" r="1" fill={eyes} />
             <circle cx="9" cy="6" r="1" fill={eyes} />
           </>
        )}
        {type === 'demon' && (
           <>
             {variant === 0 && <path d="M3 4 L5 8 L3 12 L8 14 L13 12 L11 8 L13 4 L8 2 Z" fill={color} />}
             {variant === 1 && <path d="M4 2 L8 14 L12 2 L8 6 Z" fill={color} />}
             {variant === 2 && <path d="M2 6 L8 2 L14 6 L8 14 Z" fill={color} />}
             <path d="M8 2 L6 -2 L8 0 L10 -2 Z" fill="#000" />
             <circle cx="6" cy="7" r="1" fill={eyes} />
             <circle cx="10" cy="7" r="1" fill={eyes} />
           </>
        )}
        {type === 'construct' && (
           <>
             {variant === 0 && <rect x="4" y="4" width="8" height="8" fill={color} stroke="#000" strokeWidth="0.5"/>}
             {variant === 1 && <circle cx="8" cy="8" r="5" fill={color} stroke="#000" strokeWidth="0.5"/>}
             {variant === 2 && <path d="M8 2 L14 8 L8 14 L2 8 Z" fill={color} stroke="#000" strokeWidth="0.5"/>}
             <rect x="6" y="6" width="4" height="2" fill={eyes} className="animate-pulse"/>
             <rect x="3" y="6" width="1" height="4" fill="#333" />
             <rect x="12" y="6" width="1" height="4" fill="#333" />
           </>
        )}
        {type === 'humanoid' && (
           <>
             <circle cx="8" cy="4" r="3" fill="#ffdbac" />
             {variant === 0 && <path d="M5 8 L11 8 L13 14 L3 14 Z" fill={color} />}
             {variant === 1 && <rect x="4" y="8" width="8" height="6" fill={color} />}
             {variant === 2 && <path d="M4 8 L12 8 L10 14 L6 14 Z" fill={color} />}
             <rect x="3" y="8" width="2" height="6" fill="#000" opacity="0.5"/> 
             <rect x="11" y="8" width="2" height="6" fill="#000" opacity="0.5"/> 
           </>
        )}
      </svg>
    </div>
  );
};