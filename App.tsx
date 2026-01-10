
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { LandingPage } from './components/LandingPage';
import { StoryInput, StoryResponse, StoryVoice, StoryMode, VOICES, DEFAULT_GENRES, DEFAULT_SETTINGS, SOUNDSCAPES, Soundscape } from './types';
import { generateBedtimeStory, generateStoryAudio, decodeAudioData } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [input, setInput] = useState<StoryInput>({
    childName: '',
    childAge: 4,
    gender: 'neutral',
    genre: 'Animals',
    setting: 'Forest',
    length: 'short',
    mode: 'STANDARD',
    familyMembers: '',
    siblings: '',
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

  useEffect(() => {
    const savedLib = localStorage.getItem('dreamweaver_library');
    if (savedLib) try { setSavedStories(JSON.parse(savedLib)); } catch (e) {}
    
    const savedAtmosphere = localStorage.getItem('dreamweaver_atmosphere');
    if (savedAtmosphere) setIsAtmosphereEnabled(savedAtmosphere === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('dreamweaver_library', JSON.stringify(savedStories));
  }, [savedStories]);

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
    ambientAudioRef.current.volume = isReading ? atmosphereVolume * 0.3 : atmosphereVolume;
    ambientAudioRef.current.play().catch(() => {});
  }, [isAtmosphereEnabled, selectedSoundscape, isReading, atmosphereVolume]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'genre' && value === 'CUSTOM') { setIsCustomGenre(true); } 
    else if (name === 'setting' && value === 'CUSTOM') { setIsCustomSetting(true); }
    else {
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
    
    if (!finalInput.childName) {
      setError("Please tell us the child's name.");
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
      if (isRefinement) {
        setShowTweakPanel(false);
        setTweakText('');
        setToast({ message: "Story refined ✨", type: 'success' });
      }
    } catch (err: any) { 
      setError(err.message); 
    } finally { 
      setIsGenerating(false); 
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
    try {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
      const pcmData = await generateStoryAudio(currentStory.content, selectedVoice);
      const buffer = await decodeAudioData(pcmData, audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsReading(false);
      audioSourceRef.current = source;
      setIsAudioLoading(false);
      setIsReading(true);
      source.start();
    } catch (err: any) {
      setIsAudioLoading(false);
      setError(err.message);
    }
  };

  if (view === 'landing') return <LandingPage onStart={() => setView('app')} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 relative min-h-screen">
      <header className="flex justify-between items-center mb-12">
        <button onClick={() => setView('landing')} className="text-left group">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">Dreamweaver</h1>
          <p className="text-slate-500 text-[9px] uppercase tracking-widest mt-1">Return to home</p>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <Card title="The Loom" subtitle="Every thread is active for your test">
            <form onSubmit={(e) => handleGenerate(e)} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Mode</label>
                <div className="flex p-1 bg-slate-900/60 rounded-xl border border-slate-700/50">
                  <button type="button" onClick={() => setInput(p => ({...p, mode: 'STANDARD'}))} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${input.mode === 'STANDARD' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Standard</button>
                  <button type="button" onClick={() => setInput(p => ({...p, mode: 'CALM_SUPPORT'}))} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${input.mode === 'CALM_SUPPORT' ? 'bg-teal-600 text-white' : 'text-slate-500'}`}>Calm Support</button>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-slate-900/40 rounded-2xl border border-slate-700/30">
                <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> The Child
                </h4>
                <input type="text" name="childName" value={input.childName} onChange={handleInputChange} placeholder="Child's Name" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 outline-none" required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" name="childAge" value={input.childAge} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 outline-none" />
                  <select name="gender" value={input.gender} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 outline-none"><option value="girl">Girl</option><option value="boy">Boy</option><option value="neutral">Neutral</option></select>
                </div>
              </div>

              {/* PERSONAL TOUCHES SECTION - ALWAYS VISIBLE */}
              <div className="space-y-4 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/20 shadow-lg shadow-purple-500/5">
                <h4 className="text-[10px] font-black uppercase text-purple-400 tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Personal Ties
                </h4>
                <div className="space-y-3">
                  <input type="text" name="familyMembers" value={input.familyMembers} onChange={handleInputChange} placeholder="Mum, Dad, Grandma..." className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600" />
                  <input type="text" name="siblings" value={input.siblings} onChange={handleInputChange} placeholder="Siblings' names..." className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600" />
                  <input type="text" name="pets" value={input.pets} onChange={handleInputChange} placeholder="Pets' names..." className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600" />
                  <input type="text" name="comfortItem" value={input.comfortItem} onChange={handleInputChange} placeholder="Favorite toy/blanket..." className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600" />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-slate-900/40 rounded-2xl border border-slate-700/30">
                <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> The Tale
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <select name="genre" value={isCustomGenre ? 'CUSTOM' : input.genre} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs">{DEFAULT_GENRES.map(g => <option key={g} value={g}>{g}</option>)}<option value="CUSTOM">Custom...</option></select>
                  <select name="setting" value={isCustomSetting ? 'CUSTOM' : input.setting} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs">{DEFAULT_SETTINGS.map(s => <option key={s} value={s}>{s}</option>)}<option value="CUSTOM">Custom...</option></select>
                </div>
                <select name="length" value={input.length} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs"><option value="short">Short</option><option value="medium">Medium</option><option value="long">Long</option></select>
              </div>

              <Button type="submit" className="w-full py-4 text-lg" isLoading={isGenerating}>Begin Weaving</Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-8 min-h-[600px]">
          {error && <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-sm italic">{error}</div>}
          
          {currentStory ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card>
                <div className="flex justify-between items-start mb-10">
                  <h2 className="text-4xl font-bold">{currentStory.input.childName}'s Tale</h2>
                  <div className="flex gap-4">
                    <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value as StoryVoice)} className="bg-slate-900 p-2 rounded-xl text-xs">{VOICES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}</select>
                    <Button onClick={handleReadAloud} isLoading={isAudioLoading} variant={isReading ? 'danger' : 'primary'}>{isReading ? 'Stop' : 'Read'}</Button>
                  </div>
                </div>
                <div className="story-text text-xl italic text-slate-200 leading-relaxed whitespace-pre-wrap">{currentStory.content}</div>
                <div className="mt-12 border-t border-slate-700 pt-8 flex justify-center gap-6">
                  <Button variant="ghost" onClick={() => setShowTweakPanel(!showTweakPanel)}>🛠️ Tweak</Button>
                  <Button variant="ghost" onClick={() => setView('app')}>✨ New Story</Button>
                </div>
                {showTweakPanel && (
                  <div className="mt-6 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                    <textarea value={tweakText} onChange={(e) => setTweakText(e.target.value)} placeholder="What should change?" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 outline-none mb-4" />
                    <Button onClick={() => handleGenerate(undefined, true)} isLoading={isGenerating}>Polish</Button>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-8 border border-indigo-500/20">
                <svg className="w-12 h-12 text-indigo-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">A Story Awaits</h3>
              <p className="text-slate-400 italic">"Every detail you add weaves a more magical dream."</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
