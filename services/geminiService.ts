
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { StoryInput } from "../types";

// Note: process.env.API_KEY is handled externally
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateBedtimeStory = async (input: StoryInput): Promise<string> => {
  const ai = getAI();
  
  const lengthPrompt = input.length === 'short' 
    ? 'approximately 2 minutes reading time (~300 words)' 
    : input.length === 'medium' 
    ? 'approximately 4 minutes reading time (~600 words)' 
    : 'approximately 6 minutes reading time (~900 words)';

  const pronounGuidance = input.gender === 'boy' 
    ? 'Use male pronouns (he/him).' 
    : input.gender === 'girl' 
    ? 'Use female pronouns (she/her).' 
    : 'Use gender-neutral pronouns (they/them).';

  const personalizationContext = `
    PERSONAL TOUCHES:
    ${input.familyMembers ? `- Family present: ${input.familyMembers}. They should appear as comforting, supportive presences.` : ''}
    ${input.pets ? `- Animal friends: ${input.pets}. They should be gentle companions in the story.` : ''}
    ${input.comfortItem ? `- Special item: ${input.comfortItem}. This item should provide comfort and security during the story's resolution.` : ''}
  `.trim();

  const systemInstruction = `
    SAFETY PHILOSOPHY:
    You are a gentle, child-safe storyteller. Your goal is to ensure content is appropriate for a ${input.childAge}-year-old. 
    Avoid truly horrific, sexual, or violent themes. 
    If a user suggests something slightly "scary" or "complex" (like a storm or a dragon), do not refuse to write. Instead, pivot the story to show how that element is actually cozy, friendly, or easily solved (e.g., the storm sounds like a drum, the dragon breathes bubbles).
    
    ENVIRONMENTAL RULES:
    - Use clear atmosphere words that describe sounds or feelings (e.g., rustling leaves, gentle waves, crackling fire).
    - Limit the story to no more than TWO distinct environments.
    - Keep the setting stable and calm. Transition slowly.
    
    CONTENT RULES:
    - Write for a ${input.childAge} year old child using simple, melodic language.
    - ${pronounGuidance}
    - Short, clear sentences. Warm, reassuring tone.
    - No moralizing, lecturing, or educational framing.
    - Focus on safety, kindness, and reassurance.
    - Always end with a safe, sleepy conclusion (getting cozy, yawning, falling asleep).
    - Write in third person using "${input.childName}" naturally.
    - Plain text only.
    
    ${personalizationContext}
    
    Length: ${lengthPrompt}.
  `.trim();

  const prompt = `
    Write a soothing bedtime story about ${input.childName} (${input.childAge} years old).
    Genre: ${input.genre}.
    Setting: ${input.setting}.
    The story should be a peaceful journey towards sleep, featuring ${input.childName}'s familiar world.
  `.trim();

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    if (!response.text) {
      throw new Error("Content was not generated. Please try a different theme.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Error generating story:", error);
    throw new Error("The storyteller is taking a quiet nap. Let's try weaving a different tale together.");
  }
};

export const generateStoryAudio = async (text: string, voice: string = 'Kore'): Promise<Uint8Array> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      safetySettings: [
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
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
