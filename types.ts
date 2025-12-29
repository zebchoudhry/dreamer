
export type StoryGenre = string;
export type StorySetting = string;
export type StoryLength = 'short' | 'medium' | 'long';
export type StoryVoice = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
export type ChildGender = 'boy' | 'girl' | 'neutral';

export interface StoryInput {
  childName: string;
  childAge: number;
  gender: ChildGender;
  genre: StoryGenre;
  setting: StorySetting;
  length: StoryLength;
  familyMembers?: string;
  pets?: string;
  comfortItem?: string;
}

export interface StoryResponse {
  content: string;
  id: string;
  timestamp: number;
  input: StoryInput;
  isSaved?: boolean;
}

export interface Soundscape {
  id: string;
  label: string;
  url: string;
  icon: string;
}

export const SOUNDSCAPES: Soundscape[] = [
  { 
    id: 'forest', 
    label: 'Forest Night', 
    url: 'https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3',
    icon: '🌲'
  },
  { 
    id: 'garden', 
    label: 'Night Garden', 
    url: 'https://assets.mixkit.co/active_storage/sfx/122/122-preview.mp3',
    icon: '🏡'
  },
  { 
    id: 'rain', 
    label: 'Gentle Rain', 
    url: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3',
    icon: '🌧️'
  },
  { 
    id: 'hearth', 
    label: 'Cozy Hearth', 
    url: 'https://www.soundjay.com/nature/sounds/fireplace-1.mp3',
    icon: '🔥'
  },
  { 
    id: 'ocean', 
    label: 'Ocean Dreams', 
    url: 'https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3',
    icon: '🌊'
  },
];

export const VOICES: { id: StoryVoice; label: string; desc: string }[] = [
  { id: 'Kore', label: 'Kore', desc: 'Warm & Gentle' },
  { id: 'Puck', label: 'Puck', desc: 'Playful & Bright' },
  { id: 'Zephyr', label: 'Zephyr', desc: 'Calm & Soothing' },
  { id: 'Charon', label: 'Charon', desc: 'Deep & Reassuring' },
  { id: 'Fenrir', label: 'Fenrir', desc: 'Soft & Whispering' },
];

export const DEFAULT_GENRES = ['Animals', 'Adventure', 'Fairy Tale', 'Space', 'Everyday Life'];
export const DEFAULT_SETTINGS = ['Home', 'Forest', 'Castle', 'City', 'Ocean', 'Farm', 'Night Garden'];
