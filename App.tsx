
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { StoryInput, StoryResponse, StoryVoice, StoryMode, VOICES, DEFAULT_GENRES, DEFAULT_SETTINGS, SOUNDSCAPES, Soundscape } from './types';
import { generateBedtimeStory, generateStoryAudio, decodeAudioData } from './services/geminiService';

const App: React.FC = () => {
  const [input, setInput] = useState<StoryInput>({
    childName: '',
    childAge: 4,
    gender: 'neutral',
    genre: 'Animals',
    setting: 'Forest',
    length: 'short',
    mode: 'STANDARD',
    familyMembers: '',
    pets: '',
    comfortItem: '',
  });
  
  const [customGenre, setCustomGenre] = useState('');
  const [customSetting, setCustomSetting] = useState('');
  const [isCustomGenre, setIsCustomGenre] = useState(false);
  const [isCustomSetting, setIsCustomSetting] = useState(false);

  const [selectedVoice, setSelectedVoice] = useState<StoryVoice>('Kore');
  const [currentStory, setCurrentStory] = useState<StoryResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [history, setHistory] = useState<StoryResponse[]>([]);
  const [savedStories, setSavedStories] = useState<StoryResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showTweakPanel, setShowTweakPanel] = useState(false);
  const [tweakText, setTweakText] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const [isAtmosphereEnabled, setIsAtmosphereEnabled] = useState(false);
  const [atmosphereVolume, setAtmosphereVolume] = useState(0.2);
  const [selectedSoundscape, setSelectedSoundscape] = useState<Soundscape>(SOUNDSCAPES[0]);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Persistence
  useEffect(() => {
    const savedHist = localStorage.getItem('dreamweaver_history');
    if (savedHist) try { setHistory(JSON.parse(savedHist)); } catch (e) {}
    const savedLib = localStorage.getItem('dreamweaver_library');
    if (savedLib) try { setSavedStories(JSON.parse(savedLib)); } catch (e) {}
    const savedVoice = localStorage.getItem('dreamweaver_voice') as StoryVoice;
    if (savedVoice && VOICES.some(v => v.id === savedVoice)) setSelectedVoice(savedVoice);
    
    const savedAtmosphere = localStorage.getItem('dreamweaver_atmosphere');
    if (savedAtmosphere) setIsAtmosphereEnabled(savedAtmosphere === 'true');
    const savedVol = localStorage.getItem('dreamweaver_vol');
    if (savedVol) setAtmosphereVolume(parseFloat(savedVol));
  }, []);

  useEffect(() => {
    localStorage.setItem('dreamweaver_history', JSON.stringify(history.slice(0, 10)));
  }, [history]);
  useEffect(() => {
    localStorage.setItem('dreamweaver_library', JSON.stringify(savedStories));
  }, [savedStories]);
  useEffect(() => {
    localStorage.setItem('dreamweaver_voice', selectedVoice);
    localStorage.setItem('dreamweaver_atmosphere', String(isAtmosphereEnabled));
    localStorage.setItem('dreamweaver_vol', String(atmosphereVolume));
  }, [selectedVoice, isAtmosphereEnabled, atmosphereVolume]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (!isAtmosphereEnabled) {
      if (ambientAudioRef.current) ambientAudioRef.current.pause();
      return;
    }
    if (!ambientAudioRef.current) {
      ambientAudioRef.current = new Audio(selectedSoundscape.url);
      ambientAudioRef.current.loop = true;
    } else if (ambientAudioRef.current.src !== selectedSoundscape.url) {
      ambientAudioRef.current.src = selectedSoundscape.url;
    }
    const targetVolume = isReading ? atmosphereVolume * 0.3 : atmosphereVolume;
    ambientAudioRef.current.volume = targetVolume;
    ambientAudioRef.current.play().catch(e => console.log("Audio play blocked", e));
  }, [isAtmosphereEnabled, selectedSoundscape, isReading, atmosphereVolume]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'genre') {
      if (value === 'CUSTOM') { setIsCustomGenre(true); setInput(prev => ({ ...prev, genre: '' })); } 
      else { setIsCustomGenre(false); setInput(prev => ({ ...prev, genre: value })); }
    } else if (name === 'setting') {
      if (value === 'CUSTOM') { setIsCustomSetting(true); setInput(prev => ({ ...prev, setting: '' })); } 
      else { setIsCustomSetting(false); setInput(prev => ({ ...prev, setting: value })); }
    } else {
      setInput(prev => ({ ...prev, [name]: name === 'childAge' ? parseInt(value) || 0 : value }));
    }
  };

  const handleGenerate = async (e?: React.FormEvent, isRefinement = false) => {
    if (e) e.preventDefault();
    const finalInput = { 
      ...input, 
      genre: isCustomGenre ? customGenre : input.genre, 
      setting: isCustomSetting ? customSetting : input.setting 
    };
    
    if (!finalInput.childName || !finalInput.genre || !finalInput.setting) {
      setError("Please ensure all story details are filled in.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    stopReading();
    
    try {
      const content = await generateBedtimeStory(
        finalInput, 
        isRefinement ? tweakText : undefined, 
        isRefinement ? currentStory?.content : undefined
      );
      
      const newStory: StoryResponse = { 
        id: Math.random().toString(36).substr(2, 9), 
        content, 
        timestamp: Date.now(), 
        input: finalInput 
      };
      
      setCurrentStory(newStory);
      setHistory(prev => [newStory, ...prev.filter(s => s.id !== newStory.id)]);
      
      if (isRefinement) {
        setShowTweakPanel(false);
        setTweakText('');
        setToast({ message: "Dream refined successfully ✨", type: 'success' });
      }
    } catch (err: any) { 
      setError(err.message || "The stars are hidden behind clouds. Let's try again in a moment."); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const toggleSaveStory = () => {
    if (!currentStory) return;
    const isCurrentlySaved = savedStories.some(s => s.id === currentStory.id);
    if (isCurrentlySaved) {
      setSavedStories(prev => prev.filter(s => s.id !== currentStory.id));
      setCurrentStory(prev => prev ? { ...prev, isSaved: false } : null);
    } else {
      const updatedStory = { ...currentStory, isSaved: true };
      setSavedStories(prev => [updatedStory, ...prev]);
      setCurrentStory(updatedStory);
    }
  };

  const stopReading = useCallback(() => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) {}
      audioSourceRef.current = null;
    }
    setIsReading(false);
    setIsAudioLoading(false);
  }, []);

  const handleReadAloud = async () => {
    if (isReading || isAudioLoading) { stopReading(); return; }
    if (!currentStory) return;
    setIsAudioLoading(true);
    setError(null);
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
      const pcmData = await generateStoryAudio(currentStory.content, selectedVoice);
      const audioBuffer = await decodeAudioData(pcmData, audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => { setIsReading(false); audioSourceRef.current = null; };
      audioSourceRef.current = source;
      setIsAudioLoading(false);
      setIsReading(true);
      source.start();
    } catch (err) {
      setIsAudioLoading(false);
      setError("The storyteller is resting. Let's read it together.");
    }
  };

  const handleReaction = (type: string) => {
    if (type === 'tweak') {
      setShowTweakPanel(!showTweakPanel);
      if (!showTweakPanel) {
        setTimeout(() => {
          const el = document.getElementById('tweak-panel');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      setToast({ message: "Thank you! Your feedback helps the stars shine brighter.", type: 'info' });
    }
  };

  const handleNewStory = () => {
    setCurrentStory(null);
    stopReading();
    setShowTweakPanel(false);
    setTweakText('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 relative">
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className={`px-6 py-3 rounded-full border shadow-2xl backdrop-blur-xl flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-100' : 'bg-slate-800/80 border-slate-700 text-slate-200'
          }`}>
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="opacity-50 hover:opacity-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      <header className="text-center mb-12 animate-in fade-in duration-1000">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-400 mb-2 drop-shadow-sm">
          Dreamweaver
        </h1>
        <p className="text-slate-400 text-lg font-light tracking-wide italic">"Where every word is a gentle hug"</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <Card title="The Loom" subtitle="Set your story's threads">
            <form onSubmit={(e) => handleGenerate(e)} className="space-y-4">
              {/* Mode Toggle */}
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Story Mode</label>
                <div className="flex p-1 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => setInput(prev => ({ ...prev, mode: 'STANDARD' }))}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${input.mode === 'STANDARD' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput(prev => ({ ...prev, mode: 'CALM_SUPPORT' }))}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${input.mode === 'CALM_SUPPORT' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Calm Support
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-slate-500 italic px-1">
                  {input.mode === 'STANDARD' ? 'Gentle and descriptive for everyone.' : 'Autism-informed, literal, and low-stimulation.'}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400/80 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  The Child
                </h4>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5">Child's Name</label>
                  <input
                    type="text"
                    name="childName"
                    value={input.childName}
                    onChange={handleInputChange}
                    placeholder="e.g. Leo"
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl px-4 py-2.5 text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5">Age</label>
                    <input
                      type="number"
                      name="childAge"
                      value={input.childAge}
                      onChange={handleInputChange}
                      min="1" max="12"
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl px-4 py-2.5 text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5">Gender</label>
                    <select
                      name="gender"
                      value={input.gender}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl px-4 py-2.5 text-slate-100 outline-none cursor-pointer"
                    >
                      <option value="girl">Girl</option>
                      <option value="boy">Boy</option>
                      <option value="neutral">Neutral</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="pt-4 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400/80 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Heart & Home
                </h4>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5">
                    <span>👨‍👩‍👧‍👦</span> Who is at home?
                  </label>
                  <input
                    type="text"
                    name="familyMembers"
                    value={input.familyMembers}
                    onChange={handleInputChange}
                    placeholder="e.g. Mum and Dad"
                    className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl px-4 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5">
                    <span>🐾</span> Animal Friends?
                  </label>
                  <input
                    type="text"
                    name="pets"
                    value={input.pets}
                    onChange={handleInputChange}
                    placeholder="e.g. Barnaby the cat"
                    className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl px-4 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5">
                    <span>🧸</span> Special Toy?
                  </label>
                  <input
                    type="text"
                    name="comfortItem"
                    value={input.comfortItem}
                    onChange={handleInputChange}
                    placeholder="e.g. Blue Bunny"
                    className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl px-4 py-2 text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none text-sm placeholder:text-slate-600"
                  />
                </div>
              </div>
              <div className="pt-4 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400/80 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  The Tale
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5">Genre</label>
                    <select
                      name="genre"
                      value={isCustomGenre ? 'CUSTOM' : input.genre}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl px-4 py-2.5 text-slate-100 outline-none cursor-pointer"
                    >
                      {DEFAULT_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                      <option value="CUSTOM">Custom...</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5">Setting</label>
                    <select
                      name="setting"
                      value={isCustomSetting ? 'CUSTOM' : input.setting}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl px-4 py-2.5 text-slate-100 outline-none cursor-pointer"
                    >
                      {DEFAULT_SETTINGS.map(s => <option key={s} value={s}>{s}</option>)}
                      <option value="CUSTOM">Custom...</option>
                    </select>
                  </div>
                </div>
                {(isCustomGenre || isCustomSetting) && (
                  <div className="space-y-3 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 animate-in slide-in-from-top-2">
                    {isCustomGenre && (
                      <input
                        type="text"
                        value={customGenre}
                        onChange={(e) => setCustomGenre(e.target.value)}
                        placeholder="Custom Genre..."
                        className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-2 text-slate-100 outline-none text-sm"
                      />
                    )}
                    {isCustomSetting && (
                      <input
                        type="text"
                        value={customSetting}
                        onChange={(e) => setCustomSetting(e.target.value)}
                        placeholder="Custom Setting..."
                        className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl px-4 py-2 text-slate-100 outline-none text-sm"
                      />
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5">Story Length</label>
                  <select
                    name="length"
                    value={input.length}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl px-4 py-2.5 text-slate-100 outline-none"
                  >
                    <option value="short">Short (~2 min)</option>
                    <option value="medium">Medium (~4 min)</option>
                    <option value="long">Long (~6 min)</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full mt-6" size="lg" isLoading={isGenerating}>
                {currentStory ? 'Weave New Tale' : 'Begin Weaving'}
              </Button>
            </form>
          </Card>
          
          <div className="space-y-8 pt-4">
            <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.25em] mb-4 px-2 flex items-center gap-3">
              <div className="w-4 h-[1px] bg-indigo-500/30"></div>
              The Library
            </h3>
            {savedStories.length === 0 ? (
              <p className="text-[10px] text-slate-600 italic px-4 py-2">Heart a story to save it here forever...</p>
            ) : (
              <div className="space-y-2.5">
                {savedStories.map(story => (
                  <button
                    key={story.id}
                    onClick={() => { setCurrentStory(story); setInput(story.input); stopReading(); }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      currentStory?.id === story.id 
                      ? 'bg-indigo-900/40 border-indigo-500/50 text-indigo-100 shadow-lg shadow-indigo-900/20' 
                      : 'bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-sm truncate">{story.input.childName}</p>
                      <div className="flex items-center gap-2">
                        {story.input.mode === 'CALM_SUPPORT' && <span className="text-[8px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded border border-teal-500/30 uppercase tracking-tighter">Support</span>}
                        <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
                      </div>
                    </div>
                    <p className="text-[10px] opacity-60 font-medium">{story.input.genre} • {story.input.setting}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          {error && <div className="mb-6 bg-rose-900/30 border border-rose-500/50 text-rose-200 p-5 rounded-2xl text-sm italic animate-in fade-in zoom-in-95">{error}</div>}
          {currentStory ? (
            <div className="space-y-8 animate-in zoom-in-95 duration-700">
              <div className="flex justify-start">
                <Button variant="ghost" size="sm" onClick={handleNewStory} className="flex items-center gap-2 text-indigo-300 hover:text-indigo-100 border border-indigo-500/20 hover:border-indigo-500/50 px-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  New Story
                </Button>
              </div>
              <Card className={`relative overflow-visible shadow-2xl transition-all duration-500 border-slate-700/50`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                  <div className="flex items-center gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-[0.2em] border ${currentStory.input.mode === 'CALM_SUPPORT' ? 'bg-teal-500/10 border-teal-500/20 text-teal-300' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'}`}>
                          {currentStory.input.mode}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-700/30 text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] border border-slate-700/50">
                          {currentStory.input.genre}
                        </span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-bold text-slate-100 tracking-tight">{currentStory.input.childName}'s Tale</h2>
                    </div>
                    <button 
                      onClick={toggleSaveStory}
                      className={`p-3.5 rounded-full transition-all duration-500 ${
                        savedStories.some(s => s.id === currentStory.id)
                        ? 'text-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/20 scale-110'
                        : 'text-slate-600 hover:text-rose-400 bg-slate-700/30 hover:bg-rose-400/5'
                      }`}
                    >
                      <svg className="w-8 h-8" fill={savedStories.some(s => s.id === currentStory.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto bg-slate-900/60 p-4 rounded-[2rem] border border-slate-700/50 shadow-inner backdrop-blur-xl">
                    <div className="flex items-center gap-4 w-full">
                      <select
                        value={selectedVoice}
                        onChange={(e) => { setSelectedVoice(e.target.value as StoryVoice); stopReading(); }}
                        className="bg-transparent text-sm text-slate-400 hover:text-indigo-300 outline-none cursor-pointer pr-4 font-bold transition-colors"
                      >
                        {VOICES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                      </select>
                      <Button 
                        variant={isReading ? 'danger' : 'primary'}
                        size="md" 
                        onClick={handleReadAloud}
                        isLoading={isAudioLoading}
                        className={`flex-1 min-w-[130px] rounded-2xl shadow-xl ${isReading ? 'animate-pulse' : ''}`}
                      >
                        {isReading ? 'Stop Reading' : 'Read Aloud'}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mb-10 p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col md:flex-row items-center gap-6">
                  <div className="flex items-center gap-4 min-w-[140px]">
                    <button 
                      onClick={() => setIsAtmosphereEnabled(!isAtmosphereEnabled)}
                      className={`p-3 rounded-2xl transition-all duration-300 shadow-lg ${isAtmosphereEnabled ? 'bg-indigo-500 text-white shadow-indigo-500/20' : 'bg-slate-700/50 text-slate-400 hover:text-slate-200'}`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </button>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Atmosphere</span>
                      <span className={`text-xs font-bold ${isAtmosphereEnabled ? 'text-indigo-300' : 'text-slate-600'}`}>
                        {isAtmosphereEnabled ? 'Active' : 'Silent'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {SOUNDSCAPES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedSoundscape(s); if (!isAtmosphereEnabled) setIsAtmosphereEnabled(true); }}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border ${
                          selectedSoundscape.id === s.id && isAtmosphereEnabled
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-100' 
                          : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                        }`}
                      >
                        <span>{s.icon}</span>
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <input 
                      type="range" 
                      min="0" max="1" step="0.01" 
                      value={atmosphereVolume} 
                      onChange={(e) => setAtmosphereVolume(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                  </div>
                </div>
                <div className="story-text text-xl md:text-2xl text-slate-200 whitespace-pre-wrap leading-loose italic border-l-4 border-indigo-500/20 pl-10 md:pl-14 py-6 mb-12 drop-shadow-sm">
                  {currentStory.content}
                </div>
                <div className="space-y-12 mt-20 border-t border-slate-700/30 pt-12">
                  <div className="text-center space-y-2">
                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Reflection</h3>
                    <p className="text-2xl font-bold text-slate-100 tracking-tight italic">How was tonight's dream?</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => handleReaction('magical')} className="group p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-400/50 hover:bg-indigo-500/10 transition-all text-left flex flex-col gap-3 shadow-sm">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-xl">✨</div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm uppercase tracking-wider">Magical</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">Perfect rhythm for our night.</p>
                      </div>
                    </button>
                    <button onClick={() => handleReaction('sleepy')} className="group p-6 rounded-[2rem] bg-purple-500/5 border border-purple-500/10 hover:border-purple-400/50 hover:bg-purple-500/10 transition-all text-left flex flex-col gap-3 shadow-sm">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center text-xl">😴</div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm uppercase tracking-wider">Sleepy</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">Gentle enough to lull a sleepyhead.</p>
                      </div>
                    </button>
                    <button onClick={() => handleReaction('tweak')} className={`group p-6 rounded-[2rem] transition-all text-left flex flex-col gap-3 shadow-sm border ${showTweakPanel ? 'bg-amber-500/20 border-amber-500/50' : 'bg-slate-700/5 border-slate-700 hover:border-slate-500'}`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl ${showTweakPanel ? 'bg-amber-500/30 text-amber-100 animate-spin-slow' : 'bg-slate-700/30 text-slate-400'}`}>🛠️</div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm uppercase tracking-wider">Tweak Threads</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1">Adjust a detail or change the ending.</p>
                      </div>
                    </button>
                  </div>
                  {showTweakPanel && (
                    <div id="tweak-panel" className="p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-[2.5rem] animate-in slide-in-from-top-6">
                      <div className="flex flex-col gap-6">
                        <textarea
                          value={tweakText}
                          onChange={(e) => setTweakText(e.target.value)}
                          placeholder="Tell us your wish..."
                          className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl px-6 py-5 text-slate-100 outline-none transition-all placeholder:text-slate-600 min-h-[120px] text-lg resize-none italic"
                        />
                        <div className="flex justify-end gap-4">
                          <button onClick={() => { setShowTweakPanel(false); setTweakText(''); }} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors px-4">Close</button>
                          <Button variant="primary" size="md" onClick={() => handleGenerate(undefined, true)} isLoading={isGenerating} disabled={!tweakText.trim()}>Polish the Tale</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-20 pt-10 border-t border-slate-700/30 flex items-center justify-between">
                  <span className="font-semibold italic text-indigo-300/60 text-lg">Goodnight, {currentStory.input.childName}...</span>
                  <div className="flex items-center gap-3 pr-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500/40 animate-pulse [animation-delay:0.3s]"></div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="h-full min-h-[650px] flex flex-col items-center justify-center text-center px-10 border-2 border-dashed border-slate-700/30 rounded-[3rem] bg-slate-800/5 backdrop-blur-sm transition-all hover:bg-slate-800/15 group">
              {isGenerating ? (
                <div className="space-y-10 animate-in fade-in duration-700">
                  <div className="relative w-40 h-40 mx-auto">
                    <div className="absolute inset-0 border-[8px] border-indigo-500/5 rounded-full"></div>
                    <div className="absolute inset-0 border-[8px] border-t-indigo-400/80 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 m-auto w-14 h-14 text-indigo-300 animate-pulse flex items-center justify-center">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-indigo-200 tracking-tight">Warping the Loom...</h3>
                    <p className="text-slate-500 italic max-w-sm mx-auto font-medium text-lg leading-relaxed">Gathering starlight to weave a story just for {input.childName || "a precious one"}.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-10 max-w-xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-500/15 via-purple-500/5 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20 shadow-2xl">
                    <svg className="w-16 h-16 text-indigo-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <div className="space-y-5">
                    <h3 className="text-4xl font-bold text-slate-100 mb-4 tracking-tight">A Story Awaits</h3>
                    <p className="text-slate-400 text-xl leading-relaxed px-6 font-light italic">"Tucked in tight and watching the moon, your special story will start very soon."</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <footer className="mt-32 text-center text-slate-600 text-[9px] tracking-[0.4em] uppercase font-black opacity-40 pb-12 border-t border-slate-800/40 pt-12">
        <p>© Dreamweaver • Handcrafted Lullabies for Small Dreamers</p>
      </footer>
    </div>
  );
};

export default App;
