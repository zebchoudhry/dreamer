import React, { useState } from 'react';
import { 
  StoryInput, 
  ChildProfile, 
  AccessibilitySettings,
  DEFAULT_GENRES, 
  DEFAULT_SETTINGS,
  DEFAULT_ACCESSIBILITY,
  CALM_ACCESSIBILITY,
} from '../types';
import { Card, Button, Input, Select, Toggle, SectionHeader } from './ui';
import { BlueprintSelector } from './BlueprintSelector';
import { AccessibilityPanel } from './AccessibilityPanel';

interface StoryFormProps {
  profile?: ChildProfile;
  onSubmit: (input: StoryInput) => void;
  isGenerating: boolean;
}

export const StoryForm: React.FC<StoryFormProps> = ({
  profile,
  onSubmit,
  isGenerating,
}) => {
  const [mode, setMode] = useState<'STANDARD' | 'CALM_SUPPORT'>('STANDARD');
  const [childName, setChildName] = useState(profile?.name || '');
  const [childAge, setChildAge] = useState(profile?.age || 4);
  const [gender, setGender] = useState(profile?.gender || 'neutral');
  const [genre, setGenre] = useState('Animals');
  const [setting, setSetting] = useState('Forest');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('short');
  const [blueprintId, setBlueprintId] = useState(profile?.preferredBlueprint || 'neutral');
  
  // Personal details
  const [familyMembers, setFamilyMembers] = useState(profile?.familyMembers || '');
  const [siblings, setSiblings] = useState(profile?.siblings || '');
  const [pets, setPets] = useState(profile?.pets || '');
  const [comfortItem, setComfortItem] = useState(profile?.comfortItem || '');

  // Accessibility
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(
    profile?.accessibility || DEFAULT_ACCESSIBILITY
  );
  const [showAccessibility, setShowAccessibility] = useState(false);

  // Custom genre/setting
  const [customGenre, setCustomGenre] = useState('');
  const [customSetting, setCustomSetting] = useState('');
  const [isCustomGenre, setIsCustomGenre] = useState(false);
  const [isCustomSetting, setIsCustomSetting] = useState(false);

  const handleModeChange = (newMode: 'STANDARD' | 'CALM_SUPPORT') => {
    setMode(newMode);
    if (newMode === 'CALM_SUPPORT') {
      setAccessibility(CALM_ACCESSIBILITY);
    } else {
      setAccessibility(DEFAULT_ACCESSIBILITY);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!childName.trim()) {
      return;
    }

    const input: StoryInput = {
      childName: childName.trim(),
      childAge,
      gender: gender as any,
      genre: isCustomGenre ? customGenre : genre,
      setting: isCustomSetting ? customSetting : setting,
      length,
      mode,
      blueprintId,
      familyMembers: familyMembers.trim() || undefined,
      siblings: siblings.trim() || undefined,
      pets: pets.trim() || undefined,
      comfortItem: comfortItem.trim() || undefined,
      accessibility,
    };

    onSubmit(input);
  };

  return (
    <Card title="Story Creator" subtitle="Customize every detail">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mode Toggle */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Mode
          </label>
          <div className="flex p-1 bg-slate-900/60 rounded-xl border border-slate-700/50">
            <button
              type="button"
              onClick={() => handleModeChange('STANDARD')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                mode === 'STANDARD'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ✨ Standard
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('CALM_SUPPORT')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                mode === 'CALM_SUPPORT'
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🧘 Calm Support
            </button>
          </div>
          {mode === 'CALM_SUPPORT' && (
            <p className="text-xs text-teal-400 mt-2">
              Low-stimulation mode with predictable structure, literal language, and visual progress.
            </p>
          )}
        </div>

        {/* Child Details */}
        <div className="space-y-4 p-4 bg-slate-900/40 rounded-2xl border border-slate-700/30">
          <SectionHeader icon="👤" title="The Child" color="indigo" />
          
          <Input
            label="Name"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="Child's name"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Age
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={childAge}
                onChange={(e) => setChildAge(parseInt(e.target.value) || 4)}
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>
            <Select
              label="Pronouns"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={[
                { value: 'girl', label: 'She/Her' },
                { value: 'boy', label: 'He/Him' },
                { value: 'neutral', label: 'They/Them' },
              ]}
            />
          </div>
        </div>

        {/* Personal Details */}
        <div className="space-y-4 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/20">
          <SectionHeader icon="💜" title="Personal Touches" color="purple" />
          <p className="text-xs text-slate-500 -mt-2">
            These will be woven into the story naturally.
          </p>
          
          <Input
            value={familyMembers}
            onChange={(e) => setFamilyMembers(e.target.value)}
            placeholder="Family members (Mum, Dad, Grandma...)"
          />
          <Input
            value={siblings}
            onChange={(e) => setSiblings(e.target.value)}
            placeholder="Siblings' names"
          />
          <Input
            value={pets}
            onChange={(e) => setPets(e.target.value)}
            placeholder="Pets' names"
          />
          <Input
            value={comfortItem}
            onChange={(e) => setComfortItem(e.target.value)}
            placeholder="Favorite toy or comfort item"
          />
        </div>

        {/* Story Settings */}
        <div className="space-y-4 p-4 bg-slate-900/40 rounded-2xl border border-slate-700/30">
          <SectionHeader icon="📖" title="The Tale" color="blue" />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                label="Genre"
                value={isCustomGenre ? '_custom' : genre}
                onChange={(e) => {
                  if (e.target.value === '_custom') {
                    setIsCustomGenre(true);
                  } else {
                    setIsCustomGenre(false);
                    setGenre(e.target.value);
                  }
                }}
                options={[
                  ...DEFAULT_GENRES.map(g => ({ value: g, label: g })),
                  { value: '_custom', label: 'Custom...' },
                ]}
              />
              {isCustomGenre && (
                <Input
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="Your genre"
                  className="mt-2"
                />
              )}
            </div>
            
            <div>
              <Select
                label="Setting"
                value={isCustomSetting ? '_custom' : setting}
                onChange={(e) => {
                  if (e.target.value === '_custom') {
                    setIsCustomSetting(true);
                  } else {
                    setIsCustomSetting(false);
                    setSetting(e.target.value);
                  }
                }}
                options={[
                  ...DEFAULT_SETTINGS.map(s => ({ value: s, label: s })),
                  { value: '_custom', label: 'Custom...' },
                ]}
              />
              {isCustomSetting && (
                <Input
                  value={customSetting}
                  onChange={(e) => setCustomSetting(e.target.value)}
                  placeholder="Your setting"
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <Select
            label="Length"
            value={length}
            onChange={(e) => setLength(e.target.value as any)}
            options={[
              { value: 'short', label: 'Short (~2 min)' },
              { value: 'medium', label: 'Medium (~4 min)' },
              { value: 'long', label: 'Long (~6 min)' },
            ]}
          />
        </div>

        {/* Author Style */}
        <div className="space-y-4 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20">
          <SectionHeader icon="✍️" title="Writing Style" color="amber" />
          
          <BlueprintSelector
            selectedId={blueprintId}
            onChange={setBlueprintId}
            calmModeActive={mode === 'CALM_SUPPORT'}
          />
        </div>

        {/* Accessibility Settings Toggle */}
        <button
          type="button"
          onClick={() => setShowAccessibility(!showAccessibility)}
          className="w-full flex items-center justify-between p-3 bg-teal-500/5 rounded-xl border border-teal-500/20 text-left hover:bg-teal-500/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span>⚙️</span>
            <span className="text-sm font-medium text-teal-300">Accessibility Settings</span>
          </div>
          <svg 
            className={`w-5 h-5 text-teal-400 transition-transform ${showAccessibility ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAccessibility && (
          <AccessibilityPanel
            settings={accessibility}
            onChange={setAccessibility}
          />
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full py-4"
          size="lg"
          isLoading={isGenerating}
        >
          {isGenerating ? 'Weaving your story...' : '✨ Create Story'}
        </Button>
      </form>
    </Card>
  );
};
