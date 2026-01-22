import React from 'react';
import { AccessibilitySettings, SensoryLevel } from '../types';
import { Toggle, Select } from './ui';

interface AccessibilityPanelProps {
  settings: AccessibilitySettings;
  onChange: (settings: AccessibilitySettings) => void;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  settings,
  onChange,
}) => {
  const update = (key: keyof AccessibilitySettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6 p-4 bg-teal-500/5 rounded-2xl border border-teal-500/20 animate-in slide-in-from-top-2">
      <div className="flex items-center gap-2 text-teal-400">
        <span className="text-lg">♿</span>
        <h3 className="font-bold text-sm">Accessibility & Sensory Settings</h3>
      </div>

      {/* Sensory Level */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Sensory Level
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['standard', 'low', 'minimal'] as SensoryLevel[]).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => update('sensoryLevel', level)}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                settings.sensoryLevel === level
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              {level === 'standard' && '🌟 Standard'}
              {level === 'low' && '🌙 Low'}
              {level === 'minimal' && '🤫 Minimal'}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          {settings.sensoryLevel === 'standard' && 'Full range of descriptive language and imagery.'}
          {settings.sensoryLevel === 'low' && 'Reduced sensory details, calmer descriptions.'}
          {settings.sensoryLevel === 'minimal' && 'Very simple descriptions, no intense sensory language.'}
        </p>
      </div>

      {/* Story Structure */}
      <div className="space-y-4 pt-4 border-t border-slate-700/30">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Story Structure
        </h4>
        
        <Toggle
          label="Show Story Progress"
          description="Visual progress indicator showing which part of the story we're in"
          checked={settings.showStoryProgress}
          onChange={(v) => update('showStoryProgress', v)}
        />

        <Toggle
          label="Predictable Structure"
          description="Story always follows the same 5-part pattern"
          checked={settings.predictableStructure}
          onChange={(v) => update('predictableStructure', v)}
        />

        <Toggle
          label="Simple Language"
          description="No metaphors, idioms, or figurative speech"
          checked={settings.useSimpleLanguage}
          onChange={(v) => update('useSimpleLanguage', v)}
        />
      </div>

      {/* Visual Preferences */}
      <div className="space-y-4 pt-4 border-t border-slate-700/30">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Visual Preferences
        </h4>

        <Select
          label="Font Size"
          value={settings.fontSize}
          onChange={(e) => update('fontSize', e.target.value)}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'large', label: 'Large' },
            { value: 'xlarge', label: 'Extra Large' },
          ]}
        />

        <Select
          label="Font Style"
          value={settings.fontFamily}
          onChange={(e) => update('fontFamily', e.target.value)}
          options={[
            { value: 'default', label: 'Default' },
            { value: 'dyslexic', label: 'Dyslexia-Friendly' },
            { value: 'serif', label: 'Serif (Traditional)' },
          ]}
        />

        <Toggle
          label="High Contrast"
          description="Increased contrast for better readability"
          checked={settings.highContrast}
          onChange={(v) => update('highContrast', v)}
        />

        <Toggle
          label="Reduce Animations"
          description="Minimize motion and transitions"
          checked={settings.reduceAnimations}
          onChange={(v) => update('reduceAnimations', v)}
        />
      </div>

      {/* Presets */}
      <div className="pt-4 border-t border-slate-700/30">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Quick Presets
        </h4>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({
              sensoryLevel: 'standard',
              showStoryProgress: false,
              useSimpleLanguage: false,
              predictableStructure: false,
              fontSize: 'normal',
              fontFamily: 'default',
              reduceAnimations: false,
              highContrast: false,
            })}
            className="text-xs px-3 py-1.5 bg-slate-800/50 text-slate-400 rounded-lg hover:bg-slate-700/50"
          >
            Reset to Default
          </button>
          <button
            type="button"
            onClick={() => onChange({
              sensoryLevel: 'low',
              showStoryProgress: true,
              useSimpleLanguage: true,
              predictableStructure: true,
              fontSize: 'large',
              fontFamily: 'default',
              reduceAnimations: true,
              highContrast: false,
            })}
            className="text-xs px-3 py-1.5 bg-teal-500/20 text-teal-300 rounded-lg hover:bg-teal-500/30"
          >
            🧘 Calm Mode
          </button>
          <button
            type="button"
            onClick={() => onChange({
              sensoryLevel: 'minimal',
              showStoryProgress: true,
              useSimpleLanguage: true,
              predictableStructure: true,
              fontSize: 'xlarge',
              fontFamily: 'dyslexic',
              reduceAnimations: true,
              highContrast: true,
            })}
            className="text-xs px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30"
          >
            ♿ Maximum Support
          </button>
        </div>
      </div>
    </div>
  );
};

// Utility component to apply accessibility styles to story content
interface AccessibleTextProps {
  children: React.ReactNode;
  settings: AccessibilitySettings;
  className?: string;
}

export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  settings,
  className = '',
}) => {
  const fontSizeClasses = {
    normal: 'text-lg',
    large: 'text-xl',
    xlarge: 'text-2xl',
  };

  const fontFamilyClasses = {
    default: '',
    dyslexic: 'font-mono tracking-wide', // Would ideally use OpenDyslexic font
    serif: 'font-serif',
  };

  return (
    <div
      className={`
        ${fontSizeClasses[settings.fontSize]}
        ${fontFamilyClasses[settings.fontFamily]}
        ${settings.highContrast ? 'text-white' : 'text-slate-200'}
        ${settings.reduceAnimations ? '' : 'transition-all duration-300'}
        leading-relaxed
        ${className}
      `}
      style={{
        letterSpacing: settings.fontFamily === 'dyslexic' ? '0.05em' : undefined,
        lineHeight: settings.fontSize === 'xlarge' ? '1.8' : '1.7',
      }}
    >
      {children}
    </div>
  );
};
