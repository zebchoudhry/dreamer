
import { GoogleGenAI } from "@google/genai";
import { StoryInput } from "../types";

export const generateBedtimeStory = async (
  input: StoryInput, 
  feedback?: string, 
  originalStory?: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is not configured in this environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const lengthPrompt = input.length === 'short' 
    ? 'approximately 2 minutes (about 300 words)' 
    : input.length === 'medium' 
    ? 'approximately 4 minutes (about 600 words)' 
    : 'approximately 6 minutes (about 900 words)';

  const pronounGuidance = input.gender === 'boy' 
    ? 'Use male pronouns (he/him).' 
    : input.gender === 'girl' 
    ? 'Use female pronouns (she/her).' 
    : 'Use gender-neutral pronouns (they/them).';

  const personalizationContext = `
    PERSONALISATION THREADS (MANDATORY):
    - Family Members (Parents/Adults): ${input.familyMembers || 'Not specified'}
    - Siblings: ${input.siblings || 'Not specified'}
    - Pets: ${input.pets || 'Not specified'}
    - Comfort toy/item: ${input.comfortItem || 'Not specified'}
    
    INSTRUCTIONS: 
    1. Integration: These people, pets, and objects are real parts of ${input.childName}'s world. They must be mentioned as sources of warmth and safety.
    2. Role: Family/Siblings should be present in the story (e.g., tucked in nearby, or part of the journey).
    3. Comfort: The pet or comfort item should provide comfort during the story's quiet moments.
  `.trim();

  const systemInstruction = `
    ROLE: A supportive, calm Bedtime Story Assistant.
    PURPOSE: Create a soothing, personalized narrative for ${input.childName} (Age ${input.childAge}).
    TONE: Slow-paced, descriptive, and very safe.
    
    ${personalizationContext}
    
    ${input.mode === 'CALM_SUPPORT' ? 
      `MODE: CALM_SUPPORT (Neurodiversity friendly). Use literal language only. No metaphors. Rhythmic repetition. Predictable flow.` : 
      `MODE: STANDARD. Gentle, cozy, and imaginative. Use domestic miniatures (small beautiful details).`
    }

    RULES: No conflict, no villains, no dark elements. The story ends with the character in bed, feeling loved and falling asleep.
    PRONOUNS: ${pronounGuidance}
  `.trim();

  let prompt = `Write a ${input.mode} story for ${input.childName}. 
    Genre: ${input.genre}. 
    Setting: ${input.setting}. 
    Length: ${lengthPrompt}. 
    Output plain text only.`;

  if (feedback && originalStory) {
    prompt = `Refine this story: "${feedback}". Keep all personalization threads. Original: "${originalStory}"`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    if (!response.text) throw new Error("The storyteller is quiet.");
    return response.text.trim();
  } catch (error: any) {
    throw new Error(error.message || "The storyteller is resting.");
  }
};

export const generateStoryAudio = async (text: string, voice: string = 'Kore'): Promise<Uint8Array> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio created.");
  return decodeBase64(base64Audio);
};

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}
