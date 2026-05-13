import React, { useState } from 'react';
import { StoryResponse, StoryVoice, VOICES, AudioState } from '../types';
import { Card, Button, Select } from './ui';
import { StoryProgress, StoryProgressCompact } from './StoryProgress';
import { AccessibleText } from './AccessibilityPanel';

interface StoryDisplayProps {
  story: StoryResponse;
  audioState: AudioState;
  selectedVoice: StoryVoice;
  onVoiceChange: (voice: StoryVoice) => void;
  onPlayAudio: () => void;
  onPauseAudio: () => void;
  onStopAudio: () => void;
  onSkipToSection: (index: number) => void;
  onSaveStory: () => void;
  onRateStory: (rating: number) => void;
  onTweak: (feedback: string) => void;
  onNewStory: () => void;
  isSaved: boolean;
  isGenerating: boolean;
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({
  story,
  audioState,
  selectedVoice,
  onVoiceChange,
  onPlayAudio,
  onPauseAudio,
  onStopAudio,
  onSkipToSection,
  onSaveStory,
  onRateStory,
  onTweak,
  onNewStory,
  isSaved,
  isGenerating,
}) => {
  const [showTweakPanel, setShowTweakPanel] = useState(false);
  const [tweakText, setTweakText] = useState('');
  const [showRating, setShowRating] = useState(false);

  const showProgress = story.input.accessibility.showStoryProgress && story.sections;
  const currentSection = audioState.status === 'playing' || audioState.status === 'paused'
    ? audioState.currentSection
    : 0;

  const handleTweakSubmit = () => {
    if (tweakText.trim()) {
      onTweak(tweakText);
      setShowTweakPanel(false);
      setTweakText('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Story Progress (if enabled) */}
      {showProgress && (
        <div className="lg:hidden">
          <StoryProgressCompact
            currentSection={currentSection}
            totalSections={story.sections?.length}
            isPlaying={audioState.status === 'playing'}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Story Card */}
        <div className={showProgress ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <Card>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-100">
                  {story.input.childName}'s Story
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {story.blueprintUsed} style • {story.input.genre} • {story.input.setting}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Select
                  value={selectedVoice}
                  onChange={(e) => onVoiceChange(e.target.value as StoryVoice)}
                  options={VOICES.map(v => ({ 
                    value: v.id, 
                    label: `${v.label} - ${v.desc}` 
                  }))}
                  className="min-w-[150px]"
                />
                <AudioControls
                  audioState={audioState}
                  onPlay={onPlayAudio}
                  onPause={onPauseAudio}
                  onStop={onStopAudio}
                />
              </div>
            </div>

            {/* Story Content */}
            <AccessibleText 
              settings={story.input.accessibility}
              className="whitespace-pre-wrap"
            >
              {story.sections ? (
                <div className="space-y-6">
                  {story.sections.map((section, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl transition-all ${
                        currentSection === index && audioState.status === 'playing'
                          ? 'bg-indigo-500/10 border border-indigo-500/30'
                          : 'hover:bg-slate-800/30'
                      }`}
                      onClick={() => onSkipToSection(index)}
                    >
                      {section}
                    </div>
                  ))}
                </div>
              ) : (
                story.content
              )}
            </AccessibleText>

            {/* Actions */}
            <div className="mt-10 pt-6 border-t border-slate-700/50">
              <div className="flex flex-wrap justify-center gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowTweakPanel(!showTweakPanel)}
                  icon={<span>🛠️</span>}
                >
                  Tweak
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={onSaveStory}
                  icon={<span>{isSaved ? '✓' : '💾'}</span>}
                  disabled={isSaved}
                >
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowRating(!showRating)}
                  icon={<span>⭐</span>}
                >
                  Rate
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={onNewStory}
                  icon={<span>✨</span>}
                >
                  New Story
                </Button>
              </div>

              {/* Tweak Panel */}
              {showTweakPanel && (
                <div className="mt-6 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 animate-in slide-in-from-top-2">
                  <h4 className="text-sm font-bold text-slate-300 mb-3">
                    What would you like to change?
                  </h4>
                  <textarea
                    value={tweakText}
                    onChange={(e) => setTweakText(e.target.value)}
                    placeholder="e.g., Make it shorter, add more about the pet, make the ending happier..."
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 resize-none h-24"
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <Button variant="ghost" onClick={() => setShowTweakPanel(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleTweakSubmit} isLoading={isGenerating}>
                      Refine Story
                    </Button>
                  </div>
                </div>
              )}

              {/* Rating Panel */}
              {showRating && (
                <div className="mt-6 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 animate-in slide-in-from-top-2">
                  <h4 className="text-sm font-bold text-slate-300 mb-3">
                    How was this story?
                  </h4>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => {
                          onRateStory(rating);
                          setShowRating(false);
                        }}
                        className={`w-12 h-12 rounded-xl text-2xl transition-all hover:scale-110 ${
                          story.rating && rating <= story.rating
                            ? 'bg-amber-500/30'
                            : 'bg-slate-800/50 hover:bg-slate-700/50'
                        }`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-3">
                    Your feedback helps improve future stories
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Story Progress Sidebar (if enabled) */}
        {showProgress && (
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-6">
              <StoryProgress
                currentSection={currentSection}
                totalSections={story.sections?.length}
                isPlaying={audioState.status === 'playing'}
                onSectionClick={onSkipToSection}
              />
              
              {/* Fell Asleep Tracker */}
              <div className="mt-4 p-4 bg-slate-900/40 rounded-2xl border border-slate-700/30">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Sleep Tracker
                </h4>
                <p className="text-sm text-slate-400 mb-3">
                  Tap when they fall asleep to help us learn what works best.
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  icon={<span>😴</span>}
                >
                  They fell asleep!
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Audio control buttons
interface AudioControlsProps {
  audioState: AudioState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  audioState,
  onPlay,
  onPause,
  onStop,
}) => {
  if (audioState.status === 'loading') {
    return (
      <Button isLoading variant="primary">
        Loading...
      </Button>
    );
  }

  if (audioState.status === 'playing') {
    return (
      <div className="flex gap-2">
        <Button onClick={onPause} variant="secondary" icon={<span>⏸️</span>}>
          Pause
        </Button>
        <Button onClick={onStop} variant="danger" icon={<span>⏹️</span>}>
          Stop
        </Button>
      </div>
    );
  }

  if (audioState.status === 'paused') {
    return (
      <div className="flex gap-2">
        <Button onClick={onPlay} variant="primary" icon={<span>▶️</span>}>
          Resume
        </Button>
        <Button onClick={onStop} variant="ghost" icon={<span>⏹️</span>}>
          Stop
        </Button>
      </div>
    );
  }

  if (audioState.status === 'error') {
    return (
      <div className="text-sm text-rose-400">
        Audio unavailable
      </div>
    );
  }

  return (
    <Button onClick={onPlay} variant="primary" icon={<span>🔊</span>}>
      Read Aloud
    </Button>
  );
};
