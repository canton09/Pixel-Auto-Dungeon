import React, { useEffect, useRef, useState } from 'react';
import { GamePhase } from '../types';
import { Volume2, VolumeX } from 'lucide-react';

interface Props {
  phase: GamePhase;
  sfxTrigger?: { type: 'attack' | 'hit' | 'skill' | 'heal' | 'victory', id: number } | null;
}

// Frequencies
const NOTES: Record<string, number> = {
  'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50
};

type Note = { note: string; dur: number };

// --- MAP MELODIES (Soothing, Atmospheric, Pentatonic) ---
const MAP_TRACKS: Note[][] = [
  // 1. Wuxia Breeze (Original)
  [
    {note: 'A3', dur: 4}, {note: 'C4', dur: 4}, {note: 'D4', dur: 4}, {note: 'E4', dur: 8},
    {note: 'D4', dur: 4}, {note: 'C4', dur: 2}, {note: 'A3', dur: 2}, {note: 'G3', dur: 4}, {note: 'A3', dur: 8},
    {note: '0', dur: 4}, {note: 'E4', dur: 4}, {note: 'G4', dur: 4}, {note: 'A4', dur: 8},
  ],
  // 2. Ancient Temple (Slow, Mystery)
  [
    {note: 'E3', dur: 8}, {note: 'G3', dur: 4}, {note: 'A3', dur: 4},
    {note: 'B3', dur: 8}, {note: 'A3', dur: 4}, {note: 'G3', dur: 4},
    {note: 'E3', dur: 12}, {note: 'D3', dur: 4},
    {note: 'E3', dur: 16}, {note: '0', dur: 4}
  ],
  // 3. Pastoral (Major, Happy)
  [
    {note: 'C4', dur: 4}, {note: 'E4', dur: 4}, {note: 'G4', dur: 4}, {note: 'E4', dur: 4},
    {note: 'A4', dur: 4}, {note: 'G4', dur: 8}, {note: 'E4', dur: 4},
    {note: 'C4', dur: 4}, {note: 'D4', dur: 4}, {note: 'E4', dur: 4}, {note: 'D4', dur: 4},
    {note: 'C4', dur: 8}, {note: '0', dur: 4}
  ],
  // 4. Deep Dungeon (Low, Repetitive)
  [
    {note: 'D3', dur: 2}, {note: 'A2', dur: 2}, {note: 'D3', dur: 2}, {note: 'F3', dur: 2},
    {note: 'E3', dur: 4}, {note: 'A2', dur: 4},
    {note: 'D3', dur: 2}, {note: 'A2', dur: 2}, {note: 'F3', dur: 2}, {note: 'G3', dur: 2},
    {note: 'A3', dur: 8}, {note: '0', dur: 2}
  ],
  // 5. Ethereal (High pitch)
  [
    {note: 'A4', dur: 6}, {note: 'B4', dur: 2}, {note: 'C5', dur: 8},
    {note: 'B4', dur: 4}, {note: 'G4', dur: 4}, {note: 'E4', dur: 8},
    {note: 'A4', dur: 6}, {note: 'G4', dur: 2}, {note: 'A4', dur: 8},
    {note: '0', dur: 8}
  ]
];

// --- COMBAT MELODIES (Fast, Driving, Aggressive) ---
const COMBAT_TRACKS: Note[][] = [
  // 1. Battle Charge (Original)
  [
    {note: 'A2', dur: 1}, {note: 'A2', dur: 1}, {note: 'C3', dur: 1}, {note: 'A2', dur: 1}, 
    {note: 'E3', dur: 1}, {note: 'D3', dur: 1}, {note: 'C3', dur: 1}, {note: 'B2', dur: 1},
    {note: 'A2', dur: 1}, {note: 'A2', dur: 1}, {note: 'G3', dur: 2}, {note: 'E3', dur: 2},
  ],
  // 2. Boss Tension (Chromatic, Fast)
  [
    {note: 'C3', dur: 1}, {note: 'C3', dur: 1}, {note: 'Eb3', dur: 2}, 
    {note: 'C3', dur: 1}, {note: 'C3', dur: 1}, {note: 'Gb3', dur: 2},
    {note: 'C3', dur: 1}, {note: 'C3', dur: 1}, {note: 'F3', dur: 2},
    {note: 'Eb3', dur: 1}, {note: 'D3', dur: 1}, {note: 'C3', dur: 2},
  ],
  // 3. Heroic March (Major, Galloping)
  [
    {note: 'F3', dur: 2}, {note: 'C3', dur: 1}, {note: 'F3', dur: 1},
    {note: 'A3', dur: 2}, {note: 'C4', dur: 2},
    {note: 'Bb3', dur: 1}, {note: 'A3', dur: 1}, {note: 'G3', dur: 2},
    {note: 'C3', dur: 2}, {note: 'C3', dur: 2},
  ],
  // 4. 8-Bit Panic (High tempo arpeggios)
  [
    {note: 'A3', dur: 1}, {note: 'C4', dur: 1}, {note: 'E4', dur: 1}, {note: 'A4', dur: 1},
    {note: 'G4', dur: 1}, {note: 'E4', dur: 1}, {note: 'C4', dur: 1}, {note: 'G3', dur: 1},
    {note: 'F3', dur: 1}, {note: 'A3', dur: 1}, {note: 'C4', dur: 1}, {note: 'F4', dur: 1},
    {note: 'E4', dur: 2}, {note: 'E3', dur: 2},
  ],
  // 5. Heavy Metal (Low Drones)
  [
    {note: 'E2', dur: 2}, {note: 'E2', dur: 2}, {note: 'G2', dur: 2}, {note: 'E2', dur: 2},
    {note: 'Bb2', dur: 4}, {note: 'A2', dur: 4},
    {note: 'E2', dur: 2}, {note: 'E2', dur: 2}, {note: 'D3', dur: 4},
  ]
];

const VICTORY_THEME: Note[] = [
  {note: 'C4', dur: 2}, {note: 'C4', dur: 1}, {note: 'D4', dur: 1}, 
  {note: 'E4', dur: 2}, {note: 'E4', dur: 1}, {note: 'F4', dur: 1},
  {note: 'G4', dur: 4}, {note: 'C5', dur: 4},
  {note: 'G4', dur: 2}, {note: 'E4', dur: 2}, {note: 'C4', dur: 8}, {note: '0', dur: 4}
];

const MusicPlayer: React.FC<Props> = ({ phase, sfxTrigger }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const noteIndexRef = useRef<number>(0);
  const timerIDRef = useRef<number | null>(null);
  const currentMelodyRef = useRef<Note[]>(MAP_TRACKS[0]);
  const tempoRef = useRef<number>(140);
  
  // Track state to avoid reseeding random track on every render
  const currentPhaseRef = useRef<GamePhase>(phase);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setIsPlaying(true);
    if (audioCtxRef.current) {
        nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.1;
    }
    noteIndexRef.current = 0;
  };

  const toggleMute = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
    } else {
      initAudio();
    }
  };

  // --- Music Logic ---

  useEffect(() => {
    // Only change track if phase actually changed
    if (phase !== currentPhaseRef.current) {
        currentPhaseRef.current = phase;
        noteIndexRef.current = 0;
        
        if (phase === GamePhase.Combat) {
            // Pick random combat track
            const idx = Math.floor(Math.random() * COMBAT_TRACKS.length);
            currentMelodyRef.current = COMBAT_TRACKS[idx];
            tempoRef.current = 200 + Math.random() * 40; // Variable fast tempo
        } else if (phase === GamePhase.CombatVictory) {
            currentMelodyRef.current = VICTORY_THEME;
            tempoRef.current = 160;
        } else {
            // Pick random map track
            const idx = Math.floor(Math.random() * MAP_TRACKS.length);
            currentMelodyRef.current = MAP_TRACKS[idx];
            tempoRef.current = 120 + Math.random() * 30; // Slower variable tempo
        }
    }
  }, [phase]);

  useEffect(() => {
    const schedule = () => {
      if (!isPlaying || !audioCtxRef.current) return;

      const lookahead = 0.1; 
      const ctx = audioCtxRef.current;

      while (nextNoteTimeRef.current < ctx.currentTime + lookahead) {
        const melody = currentMelodyRef.current;
        const noteData = melody[noteIndexRef.current % melody.length];
        
        if (noteData.note !== '0' && NOTES[noteData.note]) {
           // Main voice
           playTone(NOTES[noteData.note], nextNoteTimeRef.current, noteData.dur * (60 / tempoRef.current) * 0.5, phase === GamePhase.Combat ? 'sawtooth' : 'square', 0.08);
           
           // Harmony (Fifth or Octave down)
           if (noteData.dur >= 4 && phase === GamePhase.Exploring) {
             playTone(NOTES[noteData.note] * 0.5, nextNoteTimeRef.current, noteData.dur * (60 / tempoRef.current) * 0.5, 'triangle', 0.05);
           }
           if (phase === GamePhase.Combat) {
              // Bass heavy in combat
              playTone(NOTES[noteData.note] * 0.25, nextNoteTimeRef.current, noteData.dur * (60 / tempoRef.current) * 0.2, 'square', 0.05);
           }
        }

        const beatLen = 60 / tempoRef.current; 
        const noteLen = beatLen * 0.5 * noteData.dur; 
        nextNoteTimeRef.current += noteLen;
        noteIndexRef.current++;
      }
      
      timerIDRef.current = window.setTimeout(schedule, 25);
    };

    if (isPlaying) {
      schedule();
    }

    return () => {
      if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
    };
  }, [isPlaying, phase]);

  const playTone = (freq: number, time: number, dur: number, type: OscillatorType, vol: number) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(vol, time + 0.01); 
    gainNode.gain.exponentialRampToValueAtTime(vol * 0.1, time + dur * 0.8);
    gainNode.gain.linearRampToValueAtTime(0, time + dur); 
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + dur);
  };

  // --- SFX Logic ---

  useEffect(() => {
      if (!isPlaying || !audioCtxRef.current || !sfxTrigger) return;
      playSFX(sfxTrigger.type);
  }, [sfxTrigger, isPlaying]);

  const playSFX = (type: string) => {
      const ctx = audioCtxRef.current!;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'attack') {
          // Swift Swipe: Noise-like or high slide
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
          
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          
          osc.start(now);
          osc.stop(now + 0.15);
      } else if (type === 'hit') {
          // Impact: Low square
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
          
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          
          osc.start(now);
          osc.stop(now + 0.1);
      } else if (type === 'skill') {
          // Magic: Tremolo Triangle
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.linearRampToValueAtTime(800, now + 0.3);
          
          // Add vibrato via another oscillator (simplified as just slide here for stability)
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
          gain.gain.linearRampToValueAtTime(0, now + 0.4);
          
          osc.start(now);
          osc.stop(now + 0.4);
      } else if (type === 'heal') {
          // Heal: Double chime
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now); // A4
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.3);
          
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(554, now + 0.1); // C#5
          gain2.gain.setValueAtTime(0, now);
          gain2.gain.setValueAtTime(0.2, now + 0.1);
          gain2.gain.linearRampToValueAtTime(0, now + 0.4);

          osc.start(now);
          osc.stop(now + 0.3);
          osc2.start(now + 0.1);
          osc2.stop(now + 0.4);
      } else if (type === 'victory') {
          // Fanfare
           osc.type = 'square';
           osc.frequency.setValueAtTime(523, now);
           osc.frequency.setValueAtTime(659, now + 0.1);
           osc.frequency.setValueAtTime(783, now + 0.2);
           
           gain.gain.setValueAtTime(0.2, now);
           gain.gain.setValueAtTime(0, now + 0.6);
           
           osc.start(now);
           osc.stop(now + 0.6);
      }
  };

  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50">
      <button 
        onClick={toggleMute}
        className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all ${isPlaying ? 'bg-green-600 border-green-800 text-white' : 'bg-red-600 border-red-800 text-white'}`}
        title={isPlaying ? "静音 (Mute)" : "开启音乐 (Play Music)"}
      >
        {isPlaying ? <Volume2 size={20} className="sm:w-6 sm:h-6" /> : <VolumeX size={20} className="sm:w-6 sm:h-6" />}
      </button>
      {!isPlaying && (
          <div className="absolute bottom-12 sm:bottom-16 right-0 w-32 sm:w-40 bg-black text-yellow-400 text-[10px] sm:text-xs p-1 sm:p-2 border border-white font-mono text-center animate-bounce shadow-[2px_2px_0_0_rgba(255,255,255,0.5)]">
              点击开启 BGM & SFX
          </div>
      )}
    </div>
  );
};

export default MusicPlayer;