import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-24 animate-in fade-in duration-1000">
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-light text-slate-100 tracking-tight leading-tight">
          Easier bedtimes for gentle nights
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Unlock a calmer evening. Every personalization feature is enabled for your testing, from family details to soothing soundscapes.
        </p>
      </section>

      <section className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 p-6 bg-slate-800/20 rounded-3xl border border-slate-700/30">
            <div className="text-2xl mb-2">❤️</div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400">Personal Details</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Weave in the names of family members, siblings, pets, and their favorite comfort toys.
            </p>
          </div>
          <div className="space-y-4 p-6 bg-slate-800/20 rounded-3xl border border-slate-700/30">
            <div className="text-2xl mb-2">🧘</div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400">Calm Support</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Use the specialized low-stimulation mode designed for neurodivergent children.
            </p>
          </div>
          <div className="space-y-4 p-6 bg-slate-800/20 rounded-3xl border border-slate-700/30">
            <div className="text-2xl mb-2">🎵</div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400">Soundscapes</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Layer your stories with gentle forest rain, cozy hearth fires, or ocean waves.
            </p>
          </div>
        </div>
      </section>

      <section className="text-center pb-24 space-y-8">
        <div className="p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-[2.5rem] max-w-lg mx-auto">
          <p className="text-slate-400 text-sm italic mb-6">
            "All features are currently unlocked for this testing session."
          </p>
          <button 
            onClick={onStart}
            className="w-full px-10 py-4 bg-slate-100 text-slate-900 rounded-full font-bold hover:bg-white transition-all shadow-xl shadow-white/5 active:scale-95"
          >
            Enter the Dreamweaver
          </button>
        </div>
      </section>

      <section className="text-center opacity-40">
        <p className="text-slate-500 text-xs tracking-[0.2em] uppercase font-black">
          Handcrafted for gentle moments
        </p>
      </section>
    </div>
  );
};