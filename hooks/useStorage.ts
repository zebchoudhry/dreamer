import { useState, useEffect, useCallback } from 'react';
import { ChildProfile, StoryResponse, DEFAULT_ACCESSIBILITY } from '../types';

const PROFILES_KEY = 'dreamweaver_profiles';
const LIBRARY_KEY = 'dreamweaver_library';
const SETTINGS_KEY = 'dreamweaver_settings';

// ============================================
// PROFILES HOOK
// ============================================

interface UseProfilesReturn {
  profiles: ChildProfile[];
  activeProfile: ChildProfile | null;
  createProfile: (profile: Omit<ChildProfile, 'id' | 'createdAt'>) => ChildProfile;
  updateProfile: (id: string, updates: Partial<ChildProfile>) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string | null) => void;
}

export function useProfiles(): UseProfilesReturn {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfiles(parsed.profiles || []);
        setActiveProfileId(parsed.activeProfileId || null);
      }
    } catch (e) {
      console.error('Failed to load profiles:', e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify({
      profiles,
      activeProfileId,
    }));
  }, [profiles, activeProfileId]);

  const createProfile = useCallback((
    profileData: Omit<ChildProfile, 'id' | 'createdAt'>
  ): ChildProfile => {
    const newProfile: ChildProfile = {
      ...profileData,
      id: `profile_${Date.now()}`,
      createdAt: Date.now(),
    };
    setProfiles(prev => [...prev, newProfile]);
    return newProfile;
  }, []);

  const updateProfile = useCallback((id: string, updates: Partial<ChildProfile>) => {
    setProfiles(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) {
      setActiveProfileId(null);
    }
  }, [activeProfileId]);

  const setActiveProfile = useCallback((id: string | null) => {
    setActiveProfileId(id);
  }, []);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;

  return {
    profiles,
    activeProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
  };
}

// ============================================
// STORY LIBRARY HOOK
// ============================================

interface UseLibraryReturn {
  stories: StoryResponse[];
  saveStory: (story: StoryResponse) => void;
  deleteStory: (id: string) => void;
  rateStory: (id: string, rating: number) => void;
  markFellAsleep: (id: string, section: number) => void;
  getStoriesForProfile: (childName: string) => StoryResponse[];
  getFavorites: () => StoryResponse[];
}

export function useLibrary(): UseLibraryReturn {
  const [stories, setStories] = useState<StoryResponse[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LIBRARY_KEY);
      if (saved) {
        setStories(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load library:', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(stories));
  }, [stories]);

  const saveStory = useCallback((story: StoryResponse) => {
    setStories(prev => {
      // Check for duplicate
      if (prev.some(s => s.id === story.id)) {
        return prev.map(s => s.id === story.id ? story : s);
      }
      return [story, ...prev];
    });
  }, []);

  const deleteStory = useCallback((id: string) => {
    setStories(prev => prev.filter(s => s.id !== id));
  }, []);

  const rateStory = useCallback((id: string, rating: number) => {
    setStories(prev => prev.map(s => 
      s.id === id ? { ...s, rating } : s
    ));
  }, []);

  const markFellAsleep = useCallback((id: string, section: number) => {
    setStories(prev => prev.map(s => 
      s.id === id ? { ...s, fellAsleepDuring: section } : s
    ));
  }, []);

  const getStoriesForProfile = useCallback((childName: string) => {
    return stories.filter(s => 
      s.input.childName.toLowerCase() === childName.toLowerCase()
    );
  }, [stories]);

  const getFavorites = useCallback(() => {
    return stories.filter(s => s.rating && s.rating >= 4);
  }, [stories]);

  return {
    stories,
    saveStory,
    deleteStory,
    rateStory,
    markFellAsleep,
    getStoriesForProfile,
    getFavorites,
  };
}

// ============================================
// SOUNDSCAPE HOOK
// ============================================

interface UseSoundscapeReturn {
  isPlaying: boolean;
  currentSound: string;
  volume: number;
  play: (soundUrl: string) => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  fadeVolume: (targetVolume: number, duration: number) => void;
}

export function useSoundscape(): UseSoundscapeReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState('');
  const [volume, setVolumeState] = useState(0.2);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const play = useCallback((soundUrl: string) => {
    if (!soundUrl) {
      if (audio) {
        audio.pause();
      }
      setIsPlaying(false);
      return;
    }

    let audioElement = audio;
    
    if (!audioElement || audioElement.src !== soundUrl) {
      if (audioElement) {
        audioElement.pause();
      }
      audioElement = new Audio(soundUrl);
      audioElement.loop = true;
      audioElement.volume = volume;
      setAudio(audioElement);
    }

    audioElement.play().catch(e => {
      console.error('Soundscape play error:', e);
    });
    
    setCurrentSound(soundUrl);
    setIsPlaying(true);
  }, [audio, volume]);

  const stop = useCallback(() => {
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
  }, [audio]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  }, [audio]);

  const fadeVolume = useCallback((targetVolume: number, duration: number) => {
    if (!audio) return;
    
    const startVolume = audio.volume;
    const startTime = Date.now();
    
    const fade = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      audio.volume = startVolume + (targetVolume - startVolume) * progress;
      
      if (progress < 1) {
        requestAnimationFrame(fade);
      } else {
        setVolumeState(targetVolume);
      }
    };
    
    requestAnimationFrame(fade);
  }, [audio]);

  return {
    isPlaying,
    currentSound,
    volume,
    play,
    stop,
    setVolume,
    fadeVolume,
  };
}

// ============================================
// APP SETTINGS HOOK
// ============================================

interface AppSettings {
  defaultVoice: string;
  defaultSoundscape: string;
  soundscapeVolume: number;
  autoSaveStories: boolean;
  showTutorial: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultVoice: 'Kore',
  defaultSoundscape: 'none',
  soundscapeVolume: 0.2,
  autoSaveStories: true,
  showTutorial: true,
};

interface UseSettingsReturn {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
