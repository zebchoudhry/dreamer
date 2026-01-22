import React from 'react';
import { STORY_STRUCTURE, StorySection } from '../types';

interface StoryProgressProps {
  currentSection: number;
  totalSections?: number;
  isPlaying?: boolean;
  onSectionClick?: (index: number) => void;
}

export const StoryProgress: React.FC<StoryProgressProps> = ({
  currentSection,
  totalSections = 5,
  isPlaying = false,
  onSectionClick,
}) => {
  const sections = STORY_STRUCTURE.slice(0, totalSections);

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700/50">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
        Story Progress
      </div>
      
      {/* Progress bar */}
      <div className="relative mb-6">
        <div className="h-2 bg-slate-700/50 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
            style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
          />
        </div>
        
        {/* Section markers */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-0">
          {sections.map((_, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                index <= currentSection
                  ? 'bg-indigo-500 border-indigo-400'
                  : 'bg-slate-800 border-slate-600'
              } ${index === currentSection && isPlaying ? 'animate-pulse ring-4 ring-indigo-500/30' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Section list */}
      <div className="space-y-2">
        {sections.map((section, index) => (
          <SectionItem
            key={section.id}
            section={section}
            index={index}
            isActive={index === currentSection}
            isComplete={index < currentSection}
            isPlaying={index === currentSection && isPlaying}
            onClick={onSectionClick ? () => onSectionClick(index) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

interface SectionItemProps {
  section: StorySection;
  index: number;
  isActive: boolean;
  isComplete: boolean;
  isPlaying: boolean;
  onClick?: () => void;
}

const SectionItem: React.FC<SectionItemProps> = ({
  section,
  index,
  isActive,
  isComplete,
  isPlaying,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
        isActive
          ? 'bg-indigo-500/20 border border-indigo-500/50'
          : isComplete
          ? 'bg-slate-800/30 border border-transparent'
          : 'bg-slate-900/30 border border-transparent opacity-50'
      } ${onClick ? 'hover:bg-slate-800/50 cursor-pointer' : 'cursor-default'}`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
        isActive
          ? 'bg-indigo-500/30'
          : isComplete
          ? 'bg-emerald-500/20'
          : 'bg-slate-800/50'
      }`}>
        {isComplete ? (
          <span className="text-emerald-400">✓</span>
        ) : isPlaying ? (
          <span className="animate-pulse">{section.icon}</span>
        ) : (
          section.icon
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-sm ${
          isActive ? 'text-indigo-200' : isComplete ? 'text-slate-300' : 'text-slate-500'
        }`}>
          {index + 1}. {section.name}
        </div>
        <div className={`text-xs truncate ${
          isActive ? 'text-indigo-300/70' : 'text-slate-500'
        }`}>
          {section.description}
        </div>
      </div>

      {/* Playing indicator */}
      {isPlaying && (
        <div className="flex gap-0.5">
          <div className="w-1 h-4 bg-indigo-400 rounded-full animate-[soundbar_0.5s_ease-in-out_infinite]" />
          <div className="w-1 h-4 bg-indigo-400 rounded-full animate-[soundbar_0.5s_ease-in-out_infinite_0.1s]" />
          <div className="w-1 h-4 bg-indigo-400 rounded-full animate-[soundbar_0.5s_ease-in-out_infinite_0.2s]" />
        </div>
      )}
    </button>
  );
};

// Compact version for smaller screens
export const StoryProgressCompact: React.FC<StoryProgressProps> = ({
  currentSection,
  totalSections = 5,
  isPlaying = false,
}) => {
  const sections = STORY_STRUCTURE.slice(0, totalSections);
  const current = sections[currentSection];

  return (
    <div className="flex items-center gap-3 bg-slate-900/60 rounded-xl px-4 py-3 border border-slate-700/50">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        isPlaying ? 'bg-indigo-500/30 animate-pulse' : 'bg-slate-800/50'
      }`}>
        {current?.icon || '📖'}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-500 mb-1">
          Part {currentSection + 1} of {sections.length}
        </div>
        <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="text-sm font-medium text-slate-300">
        {current?.name}
      </div>
    </div>
  );
};

// Add CSS for soundbar animation
const style = document.createElement('style');
style.textContent = `
  @keyframes soundbar {
    0%, 100% { transform: scaleY(0.3); }
    50% { transform: scaleY(1); }
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}
