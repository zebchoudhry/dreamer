import React, { useState, useCallback, useEffect } from 'react';
import { 
  StoryInput, 
  StoryResponse, 
  StoryVoice,
  AppView,
  ChildProfile,
  SOUNDSCAPES,
} from './types';
import { 
  useStoryGenerator, 
  useAudioPlayer, 
  useProfiles,
  useLibrary, 
  useSoundscape,
  useSettings,
} from './hooks';
import {
  LandingPage,
  QuickStart,
  StoryForm,
  StoryDisplay,
  StoryLibrary,
  Toast,
  ProfileManager,
  ProfileSelector,
  SoundscapeControls,
  SoundscapeIndicator,
  SocialStoryBuilder,
} from './components';

const App: React.FC = () => {
  // App state machine
  const [view, setView] = useState<AppView>({ type: 'landing' });
  
  // Hooks
  const { isGenerating, error: genError, generateStory, clearError } = useStoryGenerator();
  const { audioState, playStory, pauseAudio, resumeAudio, stopAudio, skipToSection } = useAudioPlayer();
  const { profiles, activeProfile, createProfile, updateProfile, deleteProfile, setActiveProfile } = useProfiles();
  const { stories, saveStory, deleteStory, rateStory, markFellAsleep } = useLibrary();
  const soundscape = useSoundscape();
  const { settings, updateSettings } = useSettings();

  // Local state
  const [currentStory, setCurrentStory] = useState<StoryResponse | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<StoryVoice>('Kore');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [quickStartName, setQuickStartName] = useState<string | null>(null);
  const [showProfiles, setShowProfiles] = useState(false);
  const [showSoundscape, setShowSoundscape] = useState(false);
  const [showSocialStory, setShowSocialStory] = useState(false);

  // Show error as toast
  useEffect(() => {
    if (genError) {
      setToast({ message: genError, type: 'error' });
      clearError();
    }
  }, [genError, clearError]);

  // Apply default soundscape from settings
  useEffect(() => {
    if (settings.defaultSoundscape && settings.defaultSoundscape !== 'none') {
      const sound = SOUNDSCAPES.find(s => s.id === settings.defaultSoundscape);
      if (sound) {
        soundscape.play(sound.url);
        soundscape.setVolume(settings.soundscapeVolume);
      }
    }
  }, []);

  // Handle story generation
  const handleGenerateStory = useCallback(async (input: StoryInput) => {
    stopAudio();
    
    const story = await generateStory(input);
    if (story) {
      setCurrentStory(story);
      setView({ type: 'story', story, audioState: { status: 'idle' } });
      
      // Auto-save if enabled
      if (settings.autoSaveStories) {
        saveStory(story);
      }
    }
  }, [generateStory, stopAudio, settings.autoSaveStories, saveStory]);

  // Handle story refinement
  const handleTweakStory = useCallback(async (feedback: string) => {
    if (!currentStory) return;
    
    const refined = await generateStory(currentStory.input, feedback, currentStory.content);
    if (refined) {
      setCurrentStory(refined);
      setView({ type: 'story', story: refined, audioState: { status: 'idle' } });
      setToast({ message: 'Story refined ✨', type: 'success' });
    }
  }, [currentStory, generateStory]);

  // Handle audio playback
  const handlePlayAudio = useCallback(() => {
    if (!currentStory) return;
    playStory(currentStory.content, selectedVoice, currentStory.sections);
  }, [currentStory, selectedVoice, playStory]);

  // Handle saving
  const handleSaveStory = useCallback(() => {
    if (currentStory) {
      saveStory(currentStory);
      setToast({ message: 'Story saved to library', type: 'success' });
    }
  }, [currentStory, saveStory]);

  // Handle rating
  const handleRateStory = useCallback((rating: number) => {
    if (currentStory) {
      rateStory(currentStory.id, rating);
      setCurrentStory({ ...currentStory, rating });
      setToast({ message: `Rated ${rating} stars`, type: 'success' });
    }
  }, [currentStory, rateStory]);

  // Check if current story is saved
  const isCurrentStorySaved = currentStory 
    ? stories.some(s => s.id === currentStory.id)
    : false;

  // Get current soundscape object
  const currentSoundscapeObj = SOUNDSCAPES.find(s => s.url === soundscape.currentSound) || null;

  // Render based on current view
  const renderView = () => {
    // Social story builder overlay
    if (showSocialStory && activeProfile) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <SocialStoryBuilder
            childName={activeProfile.name}
            childAge={activeProfile.age}
            onGenerate={handleGenerateStory}
            onBack={() => setShowSocialStory(false)}
            isGenerating={isGenerating}
          />
        </div>
      );
    }

    switch (view.type) {
      case 'landing':
        return (
          <LandingPage
            onStart={() => {
              if (profiles.length > 0) {
                setView({ type: 'story_form', profile: activeProfile! });
              } else if (stories.length > 0) {
                setView({ type: 'story_form', profile: undefined as any });
              } else {
                setQuickStartName(null);
              }
            }}
            onViewLibrary={() => setView({ type: 'library' })}
            hasProfiles={profiles.length > 0 || stories.length > 0}
          />
        );

      case 'story_form':
        // Quick start flow for new users
        if (quickStartName === null && stories.length === 0 && profiles.length === 0) {
          return (
            <QuickStart 
              onComplete={(name) => {
                setQuickStartName(name);
                // Create profile automatically
                const profile = createProfile({
                  name,
                  age: 4,
                  gender: 'neutral',
                  familyMembers: '',
                  siblings: '',
                  pets: '',
                  comfortItem: '',
                  favoriteThings: [],
                  accessibility: {
                    sensoryLevel: 'standard',
                    showStoryProgress: false,
                    useSimpleLanguage: false,
                    predictableStructure: false,
                    fontSize: 'normal',
                    fontFamily: 'default',
                    reduceAnimations: false,
                    highContrast: false,
                  },
                  preferredBlueprint: 'neutral',
                });
                setActiveProfile(profile.id);
              }} 
            />
          );
        }

        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Header 
              onBack={() => setView({ type: 'landing' })}
              profiles={profiles}
              activeProfile={activeProfile}
              onSelectProfile={setActiveProfile}
              onManageProfiles={() => setShowProfiles(true)}
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <StoryForm
                  profile={activeProfile || (quickStartName ? { 
                    name: quickStartName,
                    age: 4,
                    gender: 'neutral',
                  } as any : undefined)}
                  onSubmit={handleGenerateStory}
                  isGenerating={isGenerating}
                />
                
                {/* Social Story shortcut */}
                {activeProfile && (
                  <button
                    onClick={() => setShowSocialStory(true)}
                    className="w-full mt-4 p-4 bg-teal-500/5 rounded-2xl border border-teal-500/20 text-left hover:bg-teal-500/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📚</span>
                      <div>
                        <div className="font-semibold text-teal-300 text-sm">Social Story Builder</div>
                        <div className="text-xs text-slate-500">Prepare for dentist, visitors, new places...</div>
                      </div>
                    </div>
                  </button>
                )}
              </div>
              <div className="lg:col-span-7">
                <EmptyStoryPanel />
                
                {/* Soundscape controls */}
                <div className="mt-6">
                  <SoundscapeControls
                    currentSound={soundscape.currentSound}
                    volume={soundscape.volume}
                    isPlaying={soundscape.isPlaying}
                    onSoundChange={(url) => {
                      if (url) {
                        soundscape.play(url);
                      } else {
                        soundscape.stop();
                      }
                    }}
                    onVolumeChange={soundscape.setVolume}
                    onToggle={() => {
                      if (soundscape.isPlaying) {
                        soundscape.stop();
                      } else if (soundscape.currentSound) {
                        soundscape.play(soundscape.currentSound);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'story':
        return (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Header 
              onBack={() => setView({ type: 'story_form', profile: activeProfile! })}
              profiles={profiles}
              activeProfile={activeProfile}
              onSelectProfile={setActiveProfile}
              onManageProfiles={() => setShowProfiles(true)}
            />
            {currentStory && (
              <StoryDisplay
                story={currentStory}
                audioState={audioState}
                selectedVoice={selectedVoice}
                onVoiceChange={setSelectedVoice}
                onPlayAudio={handlePlayAudio}
                onPauseAudio={pauseAudio}
                onStopAudio={stopAudio}
                onSkipToSection={skipToSection}
                onSaveStory={handleSaveStory}
                onRateStory={handleRateStory}
                onTweak={handleTweakStory}
                onNewStory={() => setView({ type: 'story_form', profile: activeProfile! })}
                isSaved={isCurrentStorySaved}
                isGenerating={isGenerating}
              />
            )}
          </div>
        );

      case 'library':
        return (
          <StoryLibrary
            stories={stories}
            onSelectStory={(story) => {
              setCurrentStory(story);
              setView({ type: 'story', story, audioState: { status: 'idle' } });
            }}
            onDeleteStory={deleteStory}
            onBack={() => setView({ type: 'landing' })}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-slate-100">
      {renderView()}
      
      {/* Profile Manager Modal */}
      {showProfiles && (
        <ProfileManager
          profiles={profiles}
          activeProfile={activeProfile}
          onCreateProfile={createProfile}
          onUpdateProfile={updateProfile}
          onDeleteProfile={deleteProfile}
          onSelectProfile={setActiveProfile}
          onClose={() => setShowProfiles(false)}
        />
      )}

      {/* Soundscape Indicator */}
      {view.type === 'story' && (
        <SoundscapeIndicator
          sound={currentSoundscapeObj}
          isPlaying={soundscape.isPlaying}
          onClick={() => setShowSoundscape(true)}
        />
      )}
      
      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// Header component
interface HeaderProps {
  onBack: () => void;
  profiles?: ChildProfile[];
  activeProfile?: ChildProfile | null;
  onSelectProfile?: (id: string) => void;
  onManageProfiles?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onBack, 
  profiles = [], 
  activeProfile,
  onSelectProfile,
  onManageProfiles,
}) => (
  <header className="flex justify-between items-center mb-8">
    <button onClick={onBack} className="text-left group">
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
        Dreamweaver
      </h1>
      <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-0.5 group-hover:text-slate-400">
        ← Back
      </p>
    </button>
    
    {profiles.length > 0 && onSelectProfile && onManageProfiles && (
      <ProfileSelector
        profiles={profiles}
        activeProfile={activeProfile || null}
        onSelect={onSelectProfile}
        onManage={onManageProfiles}
      />
    )}
  </header>
);

// Empty state panel
const EmptyStoryPanel: React.FC = () => (
  <div className="h-full min-h-[500px] border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center p-12 text-center">
    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
      <svg className="w-10 h-10 text-indigo-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-slate-300 mb-2">A Story Awaits</h3>
    <p className="text-slate-500 text-sm max-w-xs">
      Fill in the details on the left and watch as we weave a personalized bedtime story.
    </p>
  </div>
);

export default App;
