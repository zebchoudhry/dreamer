import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioState, StoryVoice, VOICES } from '../types';

interface UseAudioPlayerReturn {
  audioState: AudioState;
  playStory: (text: string, voice: StoryVoice, sections?: string[]) => Promise<void>;
  pauseAudio: () => void;
  resumeAudio: () => void;
  stopAudio: () => void;
  skipToSection: (sectionIndex: number) => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [audioState, setAudioState] = useState<AudioState>({ status: 'idle' });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sectionsRef = useRef<string[]>([]);
  const currentSectionRef = useRef(0);
  const voiceRef = useRef<StoryVoice>('Kore');
  const isUsingWebSpeechRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const stopAudio = useCallback(() => {
    // Stop AudioBuffer playback
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      audioSourceRef.current = null;
    }

    // Stop Web Speech API
    if (isUsingWebSpeechRef.current) {
      window.speechSynthesis.cancel();
      speechSynthRef.current = null;
    }

    setAudioState({ status: 'idle' });
    currentSectionRef.current = 0;
  }, []);

  const pauseAudio = useCallback(() => {
    if (isUsingWebSpeechRef.current) {
      window.speechSynthesis.pause();
      setAudioState({ 
        status: 'paused', 
        currentSection: currentSectionRef.current 
      });
    }
    // Note: AudioBuffer doesn't support pause natively
    // Would need to track position and recreate
  }, []);

  const resumeAudio = useCallback(() => {
    if (isUsingWebSpeechRef.current) {
      window.speechSynthesis.resume();
      setAudioState({ 
        status: 'playing', 
        currentSection: currentSectionRef.current 
      });
    }
  }, []);

  const playSection = useCallback(async (sectionIndex: number) => {
    if (sectionIndex >= sectionsRef.current.length) {
      setAudioState({ status: 'idle' });
      return;
    }

    currentSectionRef.current = sectionIndex;
    setAudioState({ status: 'playing', currentSection: sectionIndex });

    const text = sectionsRef.current[sectionIndex];
    const voiceConfig = VOICES.find(v => v.id === voiceRef.current);
    const speed = voiceConfig?.speed || 0.9;

    try {
      // Try API first
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          voice: voiceRef.current,
          speed,
        }),
      });

      const data = await response.json();

      if (data.fallback) {
        // Use Web Speech API as fallback
        await playWithWebSpeech(text, speed, sectionIndex);
      } else if (data.audio) {
        // Play API-generated audio
        await playAudioBuffer(data.audio, data.sampleRate, sectionIndex);
      }
    } catch (error) {
      // Fallback to Web Speech
      await playWithWebSpeech(text, speed, sectionIndex);
    }
  }, []);

  const playWithWebSpeech = useCallback((
    text: string, 
    speed: number, 
    sectionIndex: number
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      isUsingWebSpeechRef.current = true;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.lang.startsWith('en') && v.name.toLowerCase().includes('female')
      ) || voices.find(v => v.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        const nextSection = sectionIndex + 1;
        if (nextSection < sectionsRef.current.length) {
          playSection(nextSection);
        } else {
          setAudioState({ status: 'idle' });
        }
        resolve();
      };

      utterance.onerror = (event) => {
        setAudioState({ status: 'error', message: event.error });
        reject(new Error(event.error));
      };

      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }, [playSection]);

  const playAudioBuffer = useCallback(async (
    base64Audio: string,
    sampleRate: number,
    sectionIndex: number
  ): Promise<void> => {
    isUsingWebSpeechRef.current = false;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    
    // Decode base64 to Uint8Array
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert to AudioBuffer (assuming 16-bit PCM)
    const dataInt16 = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
    const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }

    // Play the buffer
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    source.onended = () => {
      const nextSection = sectionIndex + 1;
      if (nextSection < sectionsRef.current.length) {
        playSection(nextSection);
      } else {
        setAudioState({ status: 'idle' });
      }
    };

    audioSourceRef.current = source;
    source.start();
  }, [playSection]);

  const playStory = useCallback(async (
    text: string, 
    voice: StoryVoice,
    sections?: string[]
  ) => {
    stopAudio();
    
    voiceRef.current = voice;
    sectionsRef.current = sections || [text];
    
    setAudioState({ status: 'loading' });

    // Load voices if using Web Speech (they load async)
    if (window.speechSynthesis.getVoices().length === 0) {
      await new Promise<void>(resolve => {
        window.speechSynthesis.onvoiceschanged = () => resolve();
        setTimeout(resolve, 1000); // Timeout fallback
      });
    }

    await playSection(0);
  }, [stopAudio, playSection]);

  const skipToSection = useCallback((sectionIndex: number) => {
    if (sectionIndex >= 0 && sectionIndex < sectionsRef.current.length) {
      stopAudio();
      playSection(sectionIndex);
    }
  }, [stopAudio, playSection]);

  return {
    audioState,
    playStory,
    pauseAudio,
    resumeAudio,
    stopAudio,
    skipToSection,
  };
}
