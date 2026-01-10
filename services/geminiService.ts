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
    PERSONALISATION (MANDATORY INCLUSION):
    - Family Members: ${input.familyMembers || 'None'}
    - Pets: ${input.pets || 'None'}
    - Comfort toy/item: ${input.comfortItem || 'None'}
    
    INSTRUCTIONS: 
    1. If family members are listed, weave them into the story as safe, loving figures nearby or part of the journey. 
    2. If pets are mentioned, include them as gentle companions. 
    3. If a comfort toy is mentioned, describe it as being held close or present for comfort.
    These details are grounding threads to make the story feel deeply safe and personal.
  `.trim();

  const standardBlueprints = `
    LITERARY BLUEPRINTS:
    1. THE POTTER BLUEPRINT: Cozy, domestic miniatures and safe small worlds.
    2. THE MILNE BLUEPRINT: Quiet, philosophical friendship and slow walking.
    3. THE WISE BROWN BLUEPRINT: Ritual of naming objects and noticing the world slowing down.
  `;

  const modeInstructions = input.mode === 'CALM_SUPPORT' ? `
    MODE: CALM_SUPPORT (Low-stimulation)
    - LANGUAGE: Literal and concrete. NO metaphors or abstract imagery.
    - STRUCTURE: Predictable and rhythmic. No sudden changes or surprises.
    - ENDING: Rhythmic focus on breathing and the body resting in bed.
  ` : `
    MODE: STANDARD (Gentle and descriptive)
    ${standardBlueprints}
  `;

  const systemInstruction = `
    ROLE: A supportive, calm Bedtime Story Assistant.
    PURPOSE: Reduce bedtime anxiety through soothing narrative.
    RULES: No conflict, no villains, no questions to the listener, simple comforting language.
    
    ${personalizationContext}
    
    ${modeInstructions}
    
    STRUCTURE:
    1. Introduction to ${input.childName}'s safe world.
    2. A gentle moment of discovery or wonder.
    3. Weaving in the family/pets/toys as sources of safety.
    4. A slow, fading transition to deep sleep.
    
    PRONOUNS: ${pronounGuidance}
  `.trim();

  let prompt = `Write a ${input.mode} story for ${input.childName}. 
    Genre: ${input.genre}. 
    Setting: ${input.setting}. 
    Length: ${lengthPrompt}. 
    Output plain text only.`;

  if (feedback && originalStory) {
    prompt = `Refine this story: "${feedback}". Keep the calm tone and all personalization details. Original story: "${originalStory}"`;
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

    if (!response.text) throw new Error("The storyteller is quiet. Please try again.");
    return response.text.trim();
  } catch (error: any) {
    console.error("Story Generation Error:", error);
    throw new Error(error.message || "The storyteller is resting.");
  }
};

export const generateStoryAudio = async (text: string, voice: string = 'Kore'): Promise<Uint8Array> => {
  if (!process.env.API_KEY) {
    throw new Error("Voice feature requires an API key.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
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

    let base64Audio: string | undefined;
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          base64Audio = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Audio) throw new Error("No audio was created.");
    return decodeBase64(base64Audio);
  } catch (error: any) {
    console.error("TTS Error:", error);
    throw new Error(error.message || "Failed to weave the audio.");
  }
};

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
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
  let alignedData = data;
  if (data.byteLength % 2 !== 0) alignedData = data.slice(0, data.byteLength - 1);
  const dataInt16 = new Int16Array(alignedData.buffer, alignedData.byteOffset, alignedData.byteLength / 2);
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