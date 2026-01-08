import { GoogleGenAI } from "@google/genai";
import { StoryInput } from "../types";

export const generateBedtimeStory = async (
  input: StoryInput, 
  feedback?: string, 
  originalStory?: string
): Promise<string> => {
  // Debug check (will not log full key in production for security, just presence)
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your app settings.");
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

  // Full Expanded Literary Blueprints for STANDARD Mode (20 total)
  const standardBlueprints = `
    In STANDARD mode, masterfully blend these literary blueprints based on the chosen genre and setting:
    1. THE SEUSS BLUEPRINT: Rhythmic, predictable rhymes and musical, iambic cadence.
    2. THE CARLE BLUEPRINT: Focus on concrete textures (nubby, smooth, soft) and tactile sensations.
    3. THE POTTER BLUEPRINT: Cozy, domestic miniatures. Tiny tea sets and small wooden doors.
    4. THE SENDAK BLUEPRINT: Emotional mastery where the child character is the master of their world.
    5. THE MILNE BLUEPRINT: Quiet, philosophical friendship and simple wonder about the wind/clouds.
    6. THE DAHL BLUEPRINT: Magical "glow" and whimsy of the world without scary elements.
    7. THE WISE BROWN BLUEPRINT: Ritual of "naming and noticing" objects to create a hypnotic countdown.
    8. THE LOBEL BLUEPRINT: Comfortable stakes of friendship, sharing tea, and simple, kind dialogue.
    9. THE KEATS BLUEPRINT: Silent discovery—the crunch of snow or the soft breath of the wind.
    10. THE LIONNI BLUEPRINT: Beauty of colors and visual serenity. How colors "feel" (e.g., warm orange).
    11. THE SILVERSTEIN BLUEPRINT: Gentle absurdity and soft, whimsical "upside-down" logic.
    12. THE JANSSON BLUEPRINT: Philosophical coziness—the safety of "home" during a soft storm.
    13. THE WHITE BLUEPRINT: Lyrical realism—the smell of hay and the gentle passage of seasons.
    14. THE DONALDSON BLUEPRINT: Rhythmic wit and the "small outsmarting the big" with cleverness.
    15. THE JEFFERS BLUEPRINT: Cosmic perspective—explaining the vast universe as a friendly, shared home.
    16. THE VAN ALLSBURG BLUEPRINT: Ethereal mystery—focus on light, shadow, and dreamlike atmosphere.
    17. THE STEIG BLUEPRINT: Magical return—the relief of being found and returning to family safety.
    18. THE BRETT BLUEPRINT: Intricate detail—patterns on mittens, embroidery, and layers of the forest.
    19. THE DEPAOLA BLUEPRINT: Folklore hearth—grandmotherly warmth, shared meals, and ancient safety.
    20. THE WILLEMS BLUEPRINT: Emotional validation—validating big feelings and resolving them with comfort.
  `;

  // Mode Specific Instructions
  const modeInstructions = input.mode === 'CALM_SUPPORT' ? `
    MODE: CALM_SUPPORT (Autism-informed, low-stimulation, highly predictable)
    - LANGUAGE: Use literal language ONLY. NO metaphors, NO idioms, NO symbolism, NO abstract phrases.
    - NO METAPHORS: Never say "the stars are diamonds." Instead: "the stars are bright points of light."
    - STRUCTURE: Highly predictable sentence patterns. One stable setting. No surprises. No location changes.
    - SENSORY CONTENT: Avoid loudness/brightness/chaos. Use grounding sensations: weight, stillness, quiet, warmth.
    - TONE: Neutral-calm. Reassuring but even. Consistent, steady pacing.
    - ENDING: The ending must be explicit: quiet environment -> body at rest -> lights dim -> sleep.
  ` : `
    MODE: STANDARD (General, gentle bedtime story)
    - Use warm, gentle descriptive language. 
    - Emotional language should be simple and reassuring. 
    - Metaphors are allowed if they are clear, soft, and calming.
    ${standardBlueprints}
    - AVOID: Fast pacing, high-stakes conflict, or sudden loud changes.
  `;

  const systemInstruction = `
    ROLE: Calm Bedtime Story Generator.
    PURPOSE: Reduce bedtime pressure. Soothing, predictable listening experience.
    NOT a teaching or therapy tool. No moral lessons. No educational framing.
    
    GLOBAL RULES (APPLY TO ALL STORIES):
    - Simple, age-appropriate language. Short, clear sentences.
    - No jokes, sarcasm, or conflict escalation.
    - No instructions or commands directed at the child listener. 
    - No questions to the listener.
    - Do not invent new family members or pets. Use provided context only.
    
    STRUCTURE:
    1. Gentle introduction of ${input.childName} (Age ${input.childAge}).
    2. One small, safe experience (e.g., finding a soft leaf, watching the moon).
    3. Calm resolution.
    4. Predictable ending signaling rest and sleep.
    
    ${modeInstructions}
    
    PRONOUNS: ${pronounGuidance}
    ${familyContext}
  `.trim();

  let prompt = `Write a ${input.mode} story for ${input.childName}. 
    Genre: ${input.genre}. 
    Setting: ${input.setting}. 
    Length: ${lengthPrompt}. 
    Output plain text only. No titles, no headings, no emojis. Just the story.`;

  if (feedback && originalStory) {
    prompt = `Refine this story: "${feedback}". Maintain all strict ${input.mode} rules. Original story: "${originalStory}"`;
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

    if (!response.text) throw new Error("The storyteller is dreaming (No text generated).");
    return response.text.trim();
  } catch (error: any) {
    console.error("Error generating story:", error);
    // Pass the actual error message to the UI for debugging
    throw new Error(error.message || "The storyteller is resting. Please try again in a moment.");
  }
};

export const generateStoryAudio = async (text: string, voice: string = 'Kore'): Promise<Uint8Array> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'], // Use string literal for maximum compatibility
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned from the API.");

    return decodeBase64(base64Audio);
  } catch (error: any) {
    console.error("Error generating audio:", error);
    throw new Error(error.message || "Could not generate audio.");
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
  // Ensure we have an even number of bytes for 16-bit PCM.
  // If the data length is odd, Int16Array creation will fail.
  let alignedData = data;
  if (data.byteLength % 2 !== 0) {
    alignedData = data.slice(0, data.byteLength - 1);
  }

  // Use explicit buffer, offset, and length to be safe
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