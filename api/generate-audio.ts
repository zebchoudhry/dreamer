// Vercel Serverless Function for Text-to-Speech
// Deploy to: /api/generate-audio.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_TTS_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface TTSRequest {
  text: string;
  voice: string;
  speed?: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const { text, voice = 'Kore' } = req.body as TTSRequest;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // For now, return a placeholder - Gemini TTS has specific requirements
    // This would integrate with Gemini's TTS or fall back to Web Speech API on client
    const response = await fetch(`${GEMINI_TTS_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      // Fallback: client will use Web Speech API
      return res.status(200).json({ 
        fallback: true,
        message: 'Use client-side speech synthesis' 
      });
    }

    const data = await response.json();
    const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioData) {
      return res.status(200).json({ 
        fallback: true,
        message: 'Use client-side speech synthesis' 
      });
    }

    return res.status(200).json({ 
      audio: audioData,
      format: 'base64',
      sampleRate: 24000,
    });

  } catch (error: any) {
    console.error('TTS error:', error);
    return res.status(200).json({ 
      fallback: true,
      message: 'Use client-side speech synthesis' 
    });
  }
}
