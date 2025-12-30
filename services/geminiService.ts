
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { StoryInput } from "../types";

// Note: process.env.API_KEY is handled externally
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * LITERARY BLUEPRINTS
 * Derived from public domain classics to guide the AI's stylistic choices.
 */
const BLUEPRINTS = {
  POTTER: {
    style: "Beatrix Potter / Nature",
    focus: "Miniature sensory details, soft nature sounds, the gentle busyness of small creatures.",
    guideline: "Describe the specific texture of things—the velvet of a leaf, the dampness of moss. Use rhythmic, lilting sentences."
  },
  MILNE: {
    style: "A.A. Milne / Whimsical Home",
    focus: "Gentle humor, simple but profound dialogue, a deep sense of safety and companionship.",
    guideline: "Focus on the comfort of being together. Use dialogue that is slightly repetitive and very reassuring. No high stakes, just 'being'."
  },
  GRAHAME: {
    style: "Kenneth Grahame / Atmospheric Adventure",
    focus: "Lush environment descriptions, the 'spirit' of a place, a slow journey toward a cozy end.",
    guideline: "Paint a picture with words. Describe the light filtering through trees or the sound of water. The setting is a character itself."
  },
  CARROLL: {
    style: "Lewis Carroll / Whimsical Wonder",
    focus: "Curious logic, gentle nonsense, and bright, shifting colors.",
    guideline: "Look at the world from an unusual angle. Describe a star as if it were a glowing button or the moon as a silver saucer. Focus on gentle surprises."
  },
  KIPLING: {
    style: "Rudyard Kipling / The Mythic Origin",
    focus: "Rhythmic address, repetition, and an 'ancient' warmth.",
    guideline: "Use an affectionate tone like 'O my small explorer'. Explain why things are the way they are (e.g., why the toy bunny has soft ears). Use satisfying, repetitive phrases."
  },
  DAHL: {
    style: "Roald Dahl / Magical Mischief",
    focus: "Inventive words, playful rebellion, and vivid, 'sparky' descriptions.",
    guideline: "Write with a twinkle in your eye. Invent a gentle, silly word for a sound (like 'splatch-winkle'). Describe characters with one slightly exaggerated feature. The magic should feel surprising and cheeky but settle into a quiet, cozy safety at the end."
  }
};

const selectBlueprint = (input: StoryInput) => {
  if (input.genre === 'Mischief') {
    return BLUEPRINTS.DAHL;
  }
  if (input.genre === 'Animals' || input.setting === 'Forest' || input.setting === 'Farm') {
    return BLUEPRINTS.POTTER;
  }
  if (input.genre === 'Everyday Life' || input.setting === 'Home' || input.setting === 'Night Garden') {
    return BLUEPRINTS.MILNE;
  }
  if (input.genre === 'Space' || input.genre === 'Adventure') {
    return BLUEPRINTS.CARROLL;
  }
  if (input.genre === 'Fairy Tale') {
    return BLUEPRINTS.KIPLING;
  }
  return BLUEPRINTS.GRAHAME; // Default for others like City, Castle, Ocean
};

export const generateBedtimeStory = async (
  input: StoryInput, 
  feedback?: string, 
  originalStory?: string
): Promise<string> => {
  const ai = getAI();
  const blueprint = selectBlueprint(input);
  
  const lengthPrompt = input.length === 'short' 
    ? 'approximately 300 words' 
    : input.length === 'medium' 
    ? 'approximately 600 words' 
    : 'approximately 900 words';

  const pronounGuidance = input.gender === 'boy' 
    ? 'Use male pronouns (he/him).' 
    : input.gender === 'girl' 
    ? 'Use female pronouns (she/her).' 
    : 'Use gender-neutral pronouns (they/them).';

  const personalizationContext = `
    PERSONAL TOUCHES:
    ${input.familyMembers ? `- Family present: ${input.familyMembers}. They are the soft background of the story, like a warm blanket.` : ''}
    ${input.pets ? `- Animal friends: ${input.pets}. They move quietly and stay close.` : ''}
    ${input.comfortItem ? `- Special item: ${input.comfortItem}. This item is a source of quiet magic or deep peace.` : ''}
  `.trim();

  const systemInstruction = `
    ROLE: 
    You are a master children's storyteller inspired by classic literature (${blueprint.style}). 
    Your tone is calm, supportive, and deeply atmospheric.
    
    LITERARY GUIDELINES (The ${blueprint.style} Style):
    - ${blueprint.focus}
    - ${blueprint.guideline}
    - ABSOLUTELY FORBIDDEN: AI cliches like "Once upon a time in a land far away", "Little did they know", or "The moral of the story is".
    - SENSORY ANCHOR: Every paragraph must include one soft sound (rustling, humming) or one gentle touch (soft, warm, fuzzy).
    
    CONTENT RULES:
    - Target Age: ${input.childAge} years old. Use sophisticated but accessible vocabulary.
    - ${pronounGuidance}
    - Pace: Extremely slow. Describe the setting more than the action.
    - Structure: The character discovers a peaceful place, has a small gentle moment, then slowly prepares for sleep.
    - Ending: Always end with the character feeling perfectly safe, tucked in, and closing their eyes.
    - Format: Plain text only. No markdown.
    
    ${personalizationContext}
  `.trim();

  let prompt = `
    Weave a tale about ${input.childName}.
    Theme: ${input.genre} in the ${input.setting}.
    Length: ${lengthPrompt}.
    Start the story with a sensory observation of the ${input.setting}.
  `.trim();

  if (feedback && originalStory) {
    prompt = `
      The parent has a wish for this story.
      ORIGINAL STORY: "${originalStory}"
      THE WISH: "${feedback}"
      
      REWRITE the story incorporating the wish while maintaining the ${blueprint.style} literary quality and the focus on ${input.childName}.
    `.trim();
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        temperature: 0.9, 
      },
    });

    if (!response.text) {
      throw new Error("The stars are too dim to read by. Try a different setting.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Error generating story:", error);
    throw new Error("The storyteller is dreaming of new ideas. Let's try again in a heartbeat.");
  }
};

export const generateStoryAudio = async (text: string, voice: string = 'Kore'): Promise<Uint8Array> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    return decodeBase64(base64Audio);
  } catch (error) {
    console.error("Error generating audio:", error);
    throw error;
  }
};

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
