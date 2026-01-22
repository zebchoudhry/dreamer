import React, { useState } from 'react';
import { AuthorBlueprint, AUTHOR_BLUEPRINTS } from '../types';
import { Card } from './ui';

interface BlueprintSelectorProps {
  selectedId: string;
  onChange: (id: string) => void;
  calmModeActive?: boolean;
}

export const BlueprintSelector: React.FC<BlueprintSelectorProps> = ({
  selectedId,
  onChange,
  calmModeActive = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const selected = AUTHOR_BLUEPRINTS.find(b => b.id === selectedId);

  // Filter for calm-compatible if in calm mode
  const availableBlueprints = calmModeActive
    ? AUTHOR_BLUEPRINTS.filter(b => b.compatibleWithCalm)
    : AUTHOR_BLUEPRINTS;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Story Style
        </label>
        {calmModeActive && (
          <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
            Calm-friendly only
          </span>
        )}
      </div>

      {/* Selected blueprint preview */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className={`p-4 rounded-xl border transition-all ${
          expanded 
            ? 'bg-indigo-500/10 border-indigo-500/50' 
            : 'bg-slate-900/60 border-slate-700 hover:border-slate-600'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-slate-100">
                {selected?.author || 'Select a style'}
              </div>
              <div className="text-sm text-slate-400 mt-0.5">
                {selected?.description}
              </div>
            </div>
            <svg 
              className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {selected && (
            <div className="mt-3 text-xs text-slate-500 italic">
              {selected.samplePhrasing}
            </div>
          )}
        </div>
      </button>

      {/* Expanded selection */}
      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in slide-in-from-top-2">
          {availableBlueprints.map(blueprint => (
            <BlueprintCard
              key={blueprint.id}
              blueprint={blueprint}
              isSelected={blueprint.id === selectedId}
              onSelect={() => {
                onChange(blueprint.id);
                setExpanded(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface BlueprintCardProps {
  blueprint: AuthorBlueprint;
  isSelected: boolean;
  onSelect: () => void;
}

const BlueprintCard: React.FC<BlueprintCardProps> = ({
  blueprint,
  isSelected,
  onSelect,
}) => {
  const traitIcons: Record<string, string> = {
    simple: '📝',
    playful: '🎭',
    invented_words: '✨',
    formal: '📜',
    poetic: '🌸',
    short_punchy: '⚡',
    flowing: '🌊',
    rhythmic: '🎵',
    conversational: '💬',
    absurdist: '🤪',
    wordplay: '🔤',
    slapstick: '🎪',
    gentle: '🌿',
    warm: '☀️',
    none: '😌',
  };

  return (
    <button
      onClick={onSelect}
      className={`p-3 rounded-xl border text-left transition-all ${
        isSelected
          ? 'bg-indigo-500/20 border-indigo-500/50'
          : 'bg-slate-900/40 border-slate-700/50 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-sm text-slate-100">
            {blueprint.author}
          </div>
          <div className="text-xs text-slate-500">
            {blueprint.era}
          </div>
        </div>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400 mb-2">
        {blueprint.description}
      </div>

      {/* Trait badges */}
      <div className="flex flex-wrap gap-1">
        <span className="inline-flex items-center gap-1 text-[10px] bg-slate-800/50 text-slate-400 px-1.5 py-0.5 rounded">
          {traitIcons[blueprint.traits.vocabulary]} {blueprint.traits.vocabulary.replace('_', ' ')}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] bg-slate-800/50 text-slate-400 px-1.5 py-0.5 rounded">
          {traitIcons[blueprint.traits.humor]} {blueprint.traits.humor}
        </span>
      </div>

      {blueprint.compatibleWithCalm && (
        <div className="mt-2 text-[10px] text-teal-400 flex items-center gap-1">
          <span>✓</span> Calm-friendly
        </div>
      )}
    </button>
  );
};

// Full detail view for a blueprint
export const BlueprintDetail: React.FC<{ blueprint: AuthorBlueprint }> = ({ blueprint }) => {
  return (
    <Card className="bg-slate-900/60">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-3xl">
          📚
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-100">{blueprint.author}</h3>
          <p className="text-slate-400">{blueprint.description}</p>
          <p className="text-sm text-slate-500">{blueprint.era}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Writing Traits
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/30 rounded-lg p-2">
              <div className="text-[10px] text-slate-500">Vocabulary</div>
              <div className="text-sm text-slate-200">{blueprint.traits.vocabulary.replace('_', ' ')}</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-2">
              <div className="text-[10px] text-slate-500">Sentences</div>
              <div className="text-sm text-slate-200">{blueprint.traits.sentenceStructure.replace('_', ' ')}</div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-2">
              <div className="text-[10px] text-slate-500">Humor</div>
              <div className="text-sm text-slate-200">{blueprint.traits.humor}</div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Signature Elements
          </h4>
          <div className="flex flex-wrap gap-1">
            {blueprint.traits.signature.map((sig, i) => (
              <span key={i} className="text-xs bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded-lg">
                {sig}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Themes
          </h4>
          <div className="flex flex-wrap gap-1">
            {blueprint.traits.themes.map((theme, i) => (
              <span key={i} className="text-xs bg-purple-500/10 text-purple-300 px-2 py-1 rounded-lg">
                {theme}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Example Style
          </h4>
          <p className="text-slate-300 italic text-sm">
            {blueprint.samplePhrasing}
          </p>
        </div>
      </div>
    </Card>
  );
};
