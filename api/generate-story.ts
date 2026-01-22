// Vercel Serverless Function - keeps API key secure
// Deploy to: /api/generate-story.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface StoryRequest {
  input: {
    childName: string;
    childAge: number;
    gender: string;
    genre: string;
    setting: string;
    length: string;
    mode: string;
    blueprintId: string;
    familyMembers?: string;
    siblings?: string;
    pets?: string;
    comfortItem?: string;
    socialStoryId?: string;
    socialStoryCustom?: Record<string, string>;
    accessibility: {
      sensoryLevel: string;
      useSimpleLanguage: boolean;
      predictableStructure: boolean;
    };
  };
  blueprintPrompt: string;
  feedback?: string;
  originalStory?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { input, blueprintPrompt, feedback, originalStory } = req.body as StoryRequest;

    const systemInstruction = buildSystemPrompt(input, blueprintPrompt);
    const userPrompt = buildUserPrompt(input, feedback, originalStory);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: input.mode === 'CALM_SUPPORT' ? 0.5 : 0.7,
          maxOutputTokens: input.length === 'long' ? 2000 : input.length === 'medium' ? 1200 : 700,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No story generated');
    }

    // Parse into sections if predictable structure is enabled
    const sections = input.accessibility.predictableStructure 
      ? parseIntoSections(content) 
      : undefined;

    return res.status(200).json({ 
      content: content.trim(),
      sections,
    });

  } catch (error: any) {
    console.error('Story generation error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to generate story' 
    });
  }
}

function buildSystemPrompt(input: StoryRequest['input'], blueprintPrompt: string): string {
  const pronouns = input.gender === 'boy' 
    ? 'he/him' 
    : input.gender === 'girl' 
    ? 'she/her' 
    : 'they/them';

  const personalization = `
CHILD DETAILS:
- Name: ${input.childName}
- Age: ${input.childAge}
- Pronouns: ${pronouns}

PERSONALIZATION (weave these in naturally):
- Family members: ${input.familyMembers || 'Not specified'}
- Siblings: ${input.siblings || 'Not specified'}  
- Pets: ${input.pets || 'Not specified'}
- Comfort item: ${input.comfortItem || 'Not specified'}
`;

  const accessibilityRules = input.accessibility.sensoryLevel !== 'standard' ? `
ACCESSIBILITY REQUIREMENTS (CRITICAL):
- Use literal language only. NO metaphors, idioms, or figurative speech.
- Short, clear sentences. One idea per sentence.
- Predictable, repetitive structure.
- Gentle transitions between scenes.
- Name emotions explicitly ("felt happy" not "heart soared").
- Describe what characters do, not abstract feelings.
- Use concrete, observable details.
` : '';

  const structureRule = input.accessibility.predictableStructure ? `
STORY STRUCTURE (MANDATORY - follow exactly):
Write the story in exactly 5 clearly marked sections:

[SECTION 1: THE BEGINNING]
Introduce the setting and ${input.childName}. Everything is calm and safe.

[SECTION 2: THE FRIEND]  
A kind friend (animal, toy, or gentle creature) appears.

[SECTION 3: THE WONDER]
Something small and interesting happens. No conflict, just gentle discovery.

[SECTION 4: THE COZY MOMENT]
Warmth, comfort, and connection. Include the comfort item if specified.

[SECTION 5: SLEEP TIME]
${input.childName} settles into bed, feeling loved. End with sleep.

Mark each section clearly with [SECTION X: NAME] headers.
` : '';

  return `
ROLE: Bedtime Story Creator for ${input.childName}, age ${input.childAge}.

${personalization}

${accessibilityRules}

${structureRule}

AUTHOR STYLE:
${blueprintPrompt}

ABSOLUTE RULES:
- No conflict, villains, danger, or scary elements
- No getting lost or separated from family
- No loud noises, sudden events, or surprises
- Story ends with the character safe in bed, feeling loved
- Maintain a slow, soothing pace throughout
- ${input.familyMembers ? `Include family members (${input.familyMembers}) as sources of warmth` : ''}
- ${input.comfortItem ? `The comfort item (${input.comfortItem}) provides safety during quiet moments` : ''}
`.trim();
}

function buildUserPrompt(
  input: StoryRequest['input'], 
  feedback?: string, 
  originalStory?: string
): string {
  const lengthGuide = {
    short: '300 words (2 minutes reading)',
    medium: '600 words (4 minutes reading)', 
    long: '900 words (6 minutes reading)',
  }[input.length];

  if (feedback && originalStory) {
    return `
Please refine this story based on the feedback. Keep all personalization.

FEEDBACK: "${feedback}"

ORIGINAL STORY:
${originalStory}

Maintain the same length (${lengthGuide}) and style.
`;
  }

  if (input.mode === 'SOCIAL_STORY' && input.socialStoryId) {
    const customDetails = input.socialStoryCustom 
      ? Object.entries(input.socialStoryCustom).map(([k, v]) => `- ${k}: ${v}`).join('\n')
      : '';
    
    return `
Write a social story to help ${input.childName} prepare for: ${input.socialStoryId}

Custom details:
${customDetails}

The story should:
1. Explain what will happen step by step
2. Describe what ${input.childName} might see, hear, and feel
3. Provide coping strategies
4. End with reassurance and returning home safely
5. Be approximately ${lengthGuide}
`;
  }

  return `
Write a ${input.mode === 'CALM_SUPPORT' ? 'low-stimulation, highly predictable' : 'gentle'} bedtime story.

Genre: ${input.genre}
Setting: ${input.setting}
Length: ${lengthGuide}

Output the story only, no preamble or commentary.
`;
}

function parseIntoSections(content: string): string[] {
  // Try to split by section markers
  const sectionRegex = /\[SECTION \d+:.*?\]/gi;
  const parts = content.split(sectionRegex).filter(s => s.trim());
  
  if (parts.length >= 5) {
    return parts.slice(0, 5).map(s => s.trim());
  }
  
  // Fallback: split into roughly equal parts
  const paragraphs = content.split(/\n\n+/);
  const chunkSize = Math.ceil(paragraphs.length / 5);
  const sections: string[] = [];
  
  for (let i = 0; i < 5; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, paragraphs.length);
    sections.push(paragraphs.slice(start, end).join('\n\n'));
  }
  
  return sections;
}
