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

  const familyContext = `
    Optional family context (Mention ONLY if provided):
    - Parents: ${input.familyMembers || 'None'}
    - Pets: ${input.pets || 'None'}
    - Comfort toy: ${input.comfortItem || 'None'}
  `.trim();

  const standardBlueprints = `
    In STANDARD mode, masterfully blend these literary blueprints:
    1. THE SEUSS BLUEPRINT: Rhythmic, musical cadence.
    2. THE CARLE BLUEPRINT: Focus on concrete textures.
    3. THE POTTER BLUEPRINT: Cozy, domestic miniatures.
    4. THE MILNE BLUEPRINT: Quiet, philosophical friendship.
    5. THE WISE BROWN BLUEPRINT: Ritual of naming and noticing.
  `;

  const modeInstructions = input.mode === 'CALM_SUPPORT' ? `
    MODE: CALM_SUPPORT (Autism-informed, low-stimulation)
    - LANGUAGE: Literal ONLY. NO metaphors, NO idioms.
    - STRUCTURE: Highly predictable. No surprises.
    - ENDING: Explicit transition to sleep.
  ` : `
    MODE: STANDARD (General gentle story)
    ${standardBlueprints}
  `;

  const systemInstruction = `
    ROLE: Calm Bedtime Story Generator.
    PURPOSE: Reduce bedtime pressure. Soothing, predictable experience.
    RULES: No conflict, no questions to listener, simple language.
    STRUCTURE: 1. Intro 2. Safe experience 3. Resolution 4. Signal sleep.
    ${modeInstructions}
    PRONOUNS: ${pronounGuidance}
    ${familyContext}
  `.trim();

  let prompt = `Write a ${input.mode} story for ${input.childName}. 
    Genre: ${input.genre}. 
    Setting: ${input.setting}. 
    Length: ${lengthPrompt}. 
    Output plain text only.`;

  if (feedback && originalStory) {
    prompt = `Refine this story: "${feedback}". Original story: "${originalStory}"`;
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

    if (!response.text) throw new Error("No text content received from the storyteller.");
    return response.text.trim();
  } catch (error: any) {
    console.error("Story Generation Error:", error);
    throw new Error(error.message || "The storyteller is resting.");
  }
};

export const generateStoryAudio = async (text: string, voice: string = 'Kore'): Promise<Uint8Array> => {
  if (!process.env.API_KEY) {
    throw new Error("Voice feature requires an API key to be set in environment variables.");
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

    // Safely extract audio data from parts
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

    if (!base64Audio) {
      throw new Error("The API returned a successful response, but no audio data was found in the message.");
    }

    return decodeBase64(base64Audio);
  } catch (error: any) {
    console.error("TTS Generation Error:", error);
    // Provide specific guidance for common errors
    if (error.message?.includes('403')) throw new Error("API Key permissions issue. Check if TTS model is enabled.");
    if (error.message?.includes('429')) throw new Error("Quota exceeded. Please try again in a minute.");
    throw new Error(error.message || "Failed to weave the audio threads.");
  }
};

function decodeBase64(base64: string): Uint8Array {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    throw new Error("Failed to decode the voice data.");
  }
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  let alignedData = data;
  if (data.byteLength % 2 !== 0) {
    alignedData = data.slice(0, data.byteLength - 1);
  }

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