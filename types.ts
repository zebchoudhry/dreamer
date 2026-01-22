// ============================================
// CORE TYPES
// ============================================

export type StoryLength = 'short' | 'medium' | 'long';
export type ChildGender = 'boy' | 'girl' | 'neutral';
export type StoryVoice = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

// ============================================
// AUTISM / NEURODIVERSITY SUPPORT
// ============================================

export type SensoryLevel = 'standard' | 'low' | 'minimal';

export interface AccessibilitySettings {
  sensoryLevel: SensoryLevel;
  showStoryProgress: boolean;      // Visual progress indicator
  useSimpleLanguage: boolean;      // Avoid metaphors/idioms
  predictableStructure: boolean;   // Same 5-part structure always
  fontSize: 'normal' | 'large' | 'xlarge';
  fontFamily: 'default' | 'dyslexic' | 'serif';
  reduceAnimations: boolean;
  highContrast: boolean;
}

export interface SocialStoryTemplate {
  id: string;
  title: string;
  scenario: string;
  prompts: string[];  // Guided questions to customize
}

export const SOCIAL_STORY_TEMPLATES: SocialStoryTemplate[] = [
  {
    id: 'dentist',
    title: 'Going to the Dentist',
    scenario: 'Preparing for a dental visit',
    prompts: ['When is the appointment?', 'Who will take them?', 'What reward after?'],
  },
  {
    id: 'visitors',
    title: 'Having Visitors',
    scenario: 'When people come to our home',
    prompts: ['Who is coming?', 'What time?', 'Where can they have quiet time?'],
  },
  {
    id: 'new_place',
    title: 'Going Somewhere New',
    scenario: 'Visiting an unfamiliar location',
    prompts: ['Where are we going?', 'What will we do there?', 'How long will we stay?'],
  },
  {
    id: 'plans_change',
    title: 'When Plans Change',
    scenario: 'Learning flexibility with routine changes',
    prompts: ['What was the original plan?', 'What might change?', 'What can we do instead?'],
  },
  {
    id: 'big_feelings',
    title: 'Big Feelings',
    scenario: 'Understanding and managing emotions',
    prompts: ['What feeling?', 'What helps them calm down?', 'Who can they talk to?'],
  },
];

// Story structure for predictable autism-friendly stories
export interface StorySection {
  id: number;
  name: string;
  description: string;
  icon: string;
}

export const STORY_STRUCTURE: StorySection[] = [
  { id: 1, name: 'The Beginning', description: 'Where we are and who we meet', icon: '🏠' },
  { id: 2, name: 'The Friend', description: 'Someone kind joins the adventure', icon: '🤝' },
  { id: 3, name: 'The Wonder', description: 'Something interesting happens', icon: '✨' },
  { id: 4, name: 'The Cozy Moment', description: 'Feeling safe and happy', icon: '💝' },
  { id: 5, name: 'Sleep Time', description: 'Settling down for rest', icon: '🌙' },
];

// ============================================
// AUTHOR BLUEPRINTS
// ============================================

export type VocabularyStyle = 'simple' | 'playful' | 'invented_words' | 'formal' | 'poetic';
export type SentenceStyle = 'short_punchy' | 'flowing' | 'rhythmic' | 'conversational';
export type HumorStyle = 'absurdist' | 'wordplay' | 'slapstick' | 'gentle' | 'warm' | 'none';

export interface AuthorBlueprint {
  id: string;
  author: string;
  description: string;
  era: string;
  traits: {
    vocabulary: VocabularyStyle;
    sentenceStructure: SentenceStyle;
    humor: HumorStyle;
    themes: string[];
    signature: string[];        // Signature elements
    avoidedElements: string[];  // Things to skip for bedtime
  };
  promptModifiers: string;
  samplePhrasing: string;
  compatibleWithCalm: boolean;  // Safe for low-stimulation mode
}

export const AUTHOR_BLUEPRINTS: AuthorBlueprint[] = [
  {
    id: 'dahl',
    author: 'Roald Dahl',
    description: 'Mischievous and inventive',
    era: '1960s-1990s',
    traits: {
      vocabulary: 'invented_words',
      sentenceStructure: 'short_punchy',
      humor: 'absurdist',
      themes: ['mischief', 'child cleverness', 'silly adults', 'unexpected magic'],
      signature: ['made-up words', 'gleeful narration', 'delicious descriptions'],
      avoidedElements: ['mean punishments', 'scary creatures', 'villains'],
    },
    promptModifiers: `Write like Roald Dahl: Use invented words like "scrumdiddlyumptious" and "gloriumptious". 
      Adults are bumbling and funny. The child is clever and brave. 
      Short punchy sentences. Gleeful, conspiratorial tone as if sharing a secret with the reader.
      Describe food and treats with excessive delicious detail.`,
    samplePhrasing: '"And oh, what a splendiferous thing happened next!"',
    compatibleWithCalm: false,
  },
  {
    id: 'carroll',
    author: 'Lewis Carroll',
    description: 'Whimsical wordplay and wonder',
    era: '1860s-1890s',
    traits: {
      vocabulary: 'playful',
      sentenceStructure: 'rhythmic',
      humor: 'wordplay',
      themes: ['nonsense logic', 'curiosity', 'dream worlds', 'riddles'],
      signature: ['logical nonsense', 'tea parties', 'talking creatures', 'size changes'],
      avoidedElements: ['confusing anxiety', 'getting lost', 'threatening queens'],
    },
    promptModifiers: `Write like Lewis Carroll: Playful nonsense that follows its own dream logic.
      Include gentle riddles and wordplay. The protagonist is curious and unafraid.
      Things are delightfully not quite what they seem. Talking animals speak in riddles.
      "Curiouser and curiouser" wonder, never scary confusion.`,
    samplePhrasing: '"If I had a world of my own, everything would be nonsense."',
    compatibleWithCalm: false,
  },
  {
    id: 'milne',
    author: 'A.A. Milne',
    description: 'Gentle adventures with loyal friends',
    era: '1920s',
    traits: {
      vocabulary: 'simple',
      sentenceStructure: 'conversational',
      humor: 'gentle',
      themes: ['friendship', 'small adventures', 'home comfort', 'simple pleasures'],
      signature: ['loyal friends', 'honey', 'forest walks', 'thinking spots'],
      avoidedElements: ['heffalumps', 'being lost', 'storms'],
    },
    promptModifiers: `Write like A.A. Milne: Gentle, conversational tone about small adventures.
      Friendship is everything. Simple observations become profound.
      The forest/garden is safe and familiar. Include cozy snacks and quiet thinking moments.
      "What day is it?" "It's today." "My favorite day."`,
    samplePhrasing: '"Sometimes the smallest things take up the most room in your heart."',
    compatibleWithCalm: true,
  },
  {
    id: 'potter',
    author: 'Beatrix Potter',
    description: 'Cozy animal tales in miniature worlds',
    era: '1900s-1930s',
    traits: {
      vocabulary: 'formal',
      sentenceStructure: 'flowing',
      humor: 'warm',
      themes: ['domestic life', 'animal homes', 'gardens', 'seasons'],
      signature: ['detailed homes', 'proper manners', 'tiny clothes', 'garden settings'],
      avoidedElements: ['Mr. McGregor chasing', 'danger', 'getting in trouble'],
    },
    promptModifiers: `Write like Beatrix Potter: Small animals living proper, cozy lives.
      Detailed descriptions of tiny homes with little furniture and clothes.
      Formal but warm narration. Gardens and countryside settings.
      Focus on domestic comforts: warm beds, good food, tidy homes.`,
    samplePhrasing: '"Once upon a time there were four little Rabbits, and their names were Flopsy, Mopsy, Cotton-tail, and Peter."',
    compatibleWithCalm: true,
  },
  {
    id: 'sendak',
    author: 'Maurice Sendak',
    description: 'Wild imagination safely contained',
    era: '1960s-2000s',
    traits: {
      vocabulary: 'simple',
      sentenceStructure: 'rhythmic',
      humor: 'none',
      themes: ['imagination', 'wildness', 'returning home', 'being loved'],
      signature: ['wild things', 'sailing away', 'moon', 'returning to dinner'],
      avoidedElements: ['scary monsters', 'being alone', 'punishment'],
    },
    promptModifiers: `Write like Maurice Sendak: Simple, powerful sentences with a dream-like quality.
      Imagination runs wild but home is always waiting. 
      Strong rhythm that begs to be read aloud.
      The wild adventure always ends with returning to warmth and love.
      "And it was still hot."`,
    samplePhrasing: '"Let the wild rumpus start!" ... "And Max sailed back over a year and in and out of weeks and through a day"',
    compatibleWithCalm: true,
  },
  {
    id: 'carle',
    author: 'Eric Carle',
    description: 'Repetitive, colorful, and reassuring',
    era: '1960s-2020s',
    traits: {
      vocabulary: 'simple',
      sentenceStructure: 'rhythmic',
      humor: 'gentle',
      themes: ['growth', 'nature', 'counting', 'transformation'],
      signature: ['repetition', 'days of the week', 'food lists', 'beautiful metamorphosis'],
      avoidedElements: ['complexity', 'danger', 'sadness'],
    },
    promptModifiers: `Write like Eric Carle: Simple, repetitive structure that builds predictably.
      Use patterns: days of the week, counting, or growing sequences.
      Each section follows the same format. Gentle transformation at the end.
      "On Monday he ate through one apple. But he was still hungry."`,
    samplePhrasing: '"In the light of the moon, a little egg lay on a leaf."',
    compatibleWithCalm: true,
  },
  {
    id: 'seuss',
    author: 'Dr. Seuss',
    description: 'Rhyming nonsense with heart',
    era: '1950s-1990s',
    traits: {
      vocabulary: 'invented_words',
      sentenceStructure: 'rhythmic',
      humor: 'absurdist',
      themes: ['individuality', 'kindness', 'persistence', 'silliness'],
      signature: ['rhymes', 'made-up creatures', 'tongue twisters', 'moral lessons'],
      avoidedElements: ['Grinch meanness', 'environmental doom', 'exclusion'],
    },
    promptModifiers: `Write like Dr. Seuss: Bouncy rhymes and invented creatures.
      Made-up words that are fun to say. Gentle moral woven in.
      Absurd situations treated matter-of-factly.
      "From there to here, from here to there, funny things are everywhere."`,
    samplePhrasing: '"You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose."',
    compatibleWithCalm: false,
  },
  {
    id: 'neutral',
    author: 'Classic Bedtime',
    description: 'Warm, gentle, universally soothing',
    era: 'Timeless',
    traits: {
      vocabulary: 'simple',
      sentenceStructure: 'flowing',
      humor: 'warm',
      themes: ['comfort', 'safety', 'love', 'sleep'],
      signature: ['cozy beds', 'moonlight', 'gentle parents', 'warm blankets'],
      avoidedElements: ['anything stimulating'],
    },
    promptModifiers: `Write a classic gentle bedtime story: Warm, flowing prose.
      Focus entirely on comfort, safety, and love. 
      Soft sensory details: warm blankets, gentle moonlight, quiet sounds.
      The world is safe and sleep is welcome.`,
    samplePhrasing: '"The moon watched over the quiet house as everyone settled into their cozy beds."',
    compatibleWithCalm: true,
  },
];

// ============================================
// STORY INPUT & OUTPUT
// ============================================

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  gender: ChildGender;
  familyMembers: string;
  siblings: string;
  pets: string;
  comfortItem: string;
  favoriteThings: string[];
  accessibility: AccessibilitySettings;
  preferredBlueprint: string;
  createdAt: number;
}

export interface StoryInput {
  childName: string;
  childAge: number;
  gender: ChildGender;
  genre: string;
  setting: string;
  length: StoryLength;
  mode: 'STANDARD' | 'CALM_SUPPORT' | 'SOCIAL_STORY';
  blueprintId: string;
  familyMembers?: string;
  siblings?: string;
  pets?: string;
  comfortItem?: string;
  socialStoryId?: string;
  socialStoryCustom?: Record<string, string>;
  accessibility: AccessibilitySettings;
}

export interface StoryResponse {
  id: string;
  content: string;
  sections?: string[];  // Parsed into 5 sections for progress display
  timestamp: number;
  input: StoryInput;
  blueprintUsed: string;
  rating?: number;
  fellAsleepDuring?: number;  // Which section they fell asleep (parent feedback)
}

// ============================================
// APP STATE MACHINE
// ============================================

export type AppView = 
  | { type: 'landing' }
  | { type: 'profile_select' }
  | { type: 'profile_create' }
  | { type: 'story_form'; profile: ChildProfile }
  | { type: 'generating'; input: StoryInput }
  | { type: 'story'; story: StoryResponse; audioState: AudioState }
  | { type: 'library' }
  | { type: 'social_story_builder'; template: SocialStoryTemplate }
  | { type: 'settings' };

export type AudioState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'playing'; currentSection: number }
  | { status: 'paused'; currentSection: number }
  | { status: 'error'; message: string };

// ============================================
// SOUNDSCAPES
// ============================================

export interface Soundscape {
  id: string;
  label: string;
  url: string;
  icon: string;
  volumeDefault: number;
}

export const SOUNDSCAPES: Soundscape[] = [
  { id: 'none', label: 'No Sound', url: '', icon: '🔇', volumeDefault: 0 },
  { id: 'rain', label: 'Gentle Rain', url: '/sounds/rain.mp3', icon: '🌧️', volumeDefault: 0.3 },
  { id: 'forest', label: 'Forest Night', url: '/sounds/forest.mp3', icon: '🌲', volumeDefault: 0.2 },
  { id: 'ocean', label: 'Ocean Waves', url: '/sounds/ocean.mp3', icon: '🌊', volumeDefault: 0.25 },
  { id: 'fire', label: 'Cozy Fireplace', url: '/sounds/fire.mp3', icon: '🔥', volumeDefault: 0.2 },
  { id: 'wind', label: 'Soft Wind', url: '/sounds/wind.mp3', icon: '🍃', volumeDefault: 0.15 },
];

// ============================================
// VOICES
// ============================================

export const VOICES: { id: StoryVoice; label: string; desc: string; speed: number }[] = [
  { id: 'Kore', label: 'Kore', desc: 'Warm & Gentle', speed: 0.9 },
  { id: 'Puck', label: 'Puck', desc: 'Playful & Bright', speed: 1.0 },
  { id: 'Zephyr', label: 'Zephyr', desc: 'Calm & Slow', speed: 0.85 },
  { id: 'Charon', label: 'Charon', desc: 'Deep & Reassuring', speed: 0.9 },
  { id: 'Fenrir', label: 'Fenrir', desc: 'Soft & Whispering', speed: 0.8 },
];

// ============================================
// GENRES & SETTINGS
// ============================================

export const DEFAULT_GENRES = [
  'Animals',
  'Adventure',
  'Fairy Tale',
  'Space',
  'Everyday Life',
  'Friendship',
  'Nature',
  'Tiny Worlds',
  'Magic',
  'Seasons',
];

export const DEFAULT_SETTINGS = [
  'Home',
  'Forest',
  'Garden',
  'Castle',
  'Ocean',
  'Farm',
  'Mountains',
  'Treehouse',
  'Meadow',
  'Starry Sky',
];

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  sensoryLevel: 'standard',
  showStoryProgress: false,
  useSimpleLanguage: false,
  predictableStructure: false,
  fontSize: 'normal',
  fontFamily: 'default',
  reduceAnimations: false,
  highContrast: false,
};

export const CALM_ACCESSIBILITY: AccessibilitySettings = {
  sensoryLevel: 'low',
  showStoryProgress: true,
  useSimpleLanguage: true,
  predictableStructure: true,
  fontSize: 'large',
  fontFamily: 'default',
  reduceAnimations: true,
  highContrast: false,
};
