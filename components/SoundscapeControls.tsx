import React from 'react';
import { Soundscape, SOUNDSCAPES } from '../types';

interface SoundscapeControlsProps {
  currentSound: string;
  volume: number;
  isPlaying: boolean;
  onSoundChange: (soundUrl: string) => void;
  onVolumeChange: (volume: number) => void;
  onToggle: () => void;
}

export const SoundscapeControls: React.FC<SoundscapeControlsProps> = ({
  currentSound,
  volume,
  isPlaying,
  onSoundChange,
  onVolumeChange,
  onToggle,
}) => {
  const currentSoundscape = SOUNDSCAPES.find(s => s.url === currentSound);

  return (
    <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎵</span>
          <span className="text-sm font-bold text-slate-300">Ambient Sound</span>
        </div>
        {currentSoundscape && currentSoundscape.id !== 'none' && (
          <button
            onClick={onToggle}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              isPlaying
                ? 'bg-indigo-500/20 text-indigo-300'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
        )}
      </div>

      {/* Sound Selection */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {SOUNDSCAPES.map(sound => (
            <SoundscapeButton
              key={sound.id}
              sound={sound}
              isActive={currentSound === sound.url || (sound.id === 'none' && !currentSound)}
              onClick={() => onSoundChange(sound.url)}
            />
          ))}
        </div>

        {/* Volume Control */}
        {currentSoundscape && currentSoundscape.id !== 'none' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};

interface SoundscapeButtonProps {
  sound: Soundscape;
  isActive: boolean;
  onClick: () => void;
}

const SoundscapeButton: React.FC<SoundscapeButtonProps> = ({
  sound,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
        isActive
          ? 'bg-indigo-500/20 border border-indigo-500/50'
          : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/50'
      }`}
    >
      <span className="text-xl">{sound.icon}</span>
      <span className={`text-[10px] font-medium ${
        isActive ? 'text-indigo-300' : 'text-slate-400'
      }`}>
        {sound.label}
      </span>
    </button>
  );
};

// Compact version for sidebar
export const SoundscapeCompact: React.FC<{
  currentSound: string;
  isPlaying: boolean;
  onToggle: () => void;
  onOpen: () => void;
}> = ({ currentSound, isPlaying, onToggle, onOpen }) => {
  const currentSoundscape = SOUNDSCAPES.find(s => s.url === currentSound);

  if (!currentSoundscape || currentSoundscape.id === 'none') {
    return (
      <button
        onClick={onOpen}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800/30 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
      >
        <span>🎵</span>
        <span className="text-xs">Add ambient sound</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/30 rounded-xl">
      <button
        onClick={onToggle}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          isPlaying 
            ? 'bg-indigo-500/30 text-indigo-300' 
            : 'bg-slate-700/50 text-slate-400'
        }`}
      >
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-300 truncate">
          {currentSoundscape.icon} {currentSoundscape.label}
        </div>
      </div>
      <button
        onClick={onOpen}
        className="text-slate-500 hover:text-slate-300"
      >
        ⚙️
      </button>
    </div>
  );
};

// Floating soundscape indicator
export const SoundscapeIndicator: React.FC<{
  sound: Soundscape | null;
  isPlaying: boolean;
  onClick: () => void;
}> = ({ sound, isPlaying, onClick }) => {
  if (!sound || sound.id === 'none') return null;

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md transition-all ${
        isPlaying
          ? 'bg-indigo-500/20 border border-indigo-500/30'
          : 'bg-slate-800/80 border border-slate-700/50'
      }`}
    >
      <span className={isPlaying ? 'animate-pulse' : ''}>{sound.icon}</span>
      <span className="text-xs text-slate-300">{sound.label}</span>
      {isPlaying && (
        <div className="flex gap-0.5 ml-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-3 bg-indigo-400 rounded-full"
              style={{
                animation: `soundbar 0.5s ease-in-out infinite ${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
};
