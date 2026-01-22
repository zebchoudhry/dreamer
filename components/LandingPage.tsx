import React from 'react';
import { Button } from './ui';

interface LandingPageProps {
  onStart: () => void;
  onViewLibrary: () => void;
  hasProfiles: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStart, 
  onViewLibrary,
  hasProfiles,
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl text-center space-y-8 animate-in fade-in duration-1000">
          {/* Logo/Brand */}
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center border border-indigo-500/20">
              <span className="text-4xl">🌙</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
              Dreamweaver
            </h1>
            <p className="text-xl text-slate-400 max-w-lg mx-auto">
              Personalized bedtime stories that help your child drift off to sleep
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <FeatureCard
              icon="💜"
              title="Deeply Personal"
              description="Weave in family names, pets, and favorite toys"
            />
            <FeatureCard
              icon="🧘"
              title="Calm Support"
              description="Neurodiversity-friendly mode with predictable structure"
            />
            <FeatureCard
              icon="✍️"
              title="Author Styles"
              description="Stories inspired by Roald Dahl, Beatrix Potter & more"
            />
          </div>

          {/* CTA */}
          <div className="pt-8 space-y-4">
            <Button 
              onClick={onStart}
              size="lg"
              className="px-12"
            >
              {hasProfiles ? 'Continue' : 'Create Your First Story'}
            </Button>
            
            {hasProfiles && (
              <div>
                <button 
                  onClick={onViewLibrary}
                  className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
                >
                  View saved stories →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Neurodiversity Badge */}
      <div className="py-8 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
            <div className="flex items-center gap-3 bg-teal-500/10 px-4 py-2 rounded-2xl border border-teal-500/20">
              <span className="text-2xl">♿</span>
              <div>
                <p className="text-sm font-semibold text-teal-300">Neurodiversity Friendly</p>
                <p className="text-xs text-teal-400/70">Designed with autistic children in mind</p>
              </div>
            </div>
            <div className="text-slate-500 text-sm max-w-sm">
              Our Calm Support mode uses literal language, predictable structure, 
              and visual progress indicators to help anxious sleepers.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-slate-600 text-xs uppercase tracking-widest font-bold">
          Handcrafted for gentle moments
        </p>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="p-6 bg-slate-800/30 rounded-3xl border border-slate-700/30 text-center hover:bg-slate-800/40 transition-colors">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  );
};

// Simplified onboarding for first-time users
export const QuickStart: React.FC<{ onComplete: (name: string) => void }> = ({ onComplete }) => {
  const [name, setName] = React.useState('');

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center space-y-8 animate-in fade-in">
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-indigo-500/20 rounded-2xl flex items-center justify-center">
          <span className="text-3xl">👋</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-100">
          Let's create a story!
        </h2>
        <p className="text-slate-400">
          First, tell us who the story is for.
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Child's name"
          className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-4 text-lg text-center text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500"
          autoFocus
        />
        
        <Button 
          onClick={() => name.trim() && onComplete(name.trim())}
          disabled={!name.trim()}
          size="lg"
          className="w-full"
        >
          Continue →
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        You can add more details like age, family members, and preferences next.
      </p>
    </div>
  );
};
