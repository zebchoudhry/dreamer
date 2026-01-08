import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-24 animate-in fade-in duration-1000">
      {/* 1. Headline & 2. Sub-headline */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-light text-slate-100 tracking-tight leading-tight">
          Easier bedtimes for gentle nights
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          We are here to help when reading aloud feels difficult, making sure your family still has a quiet moment together at the end of the day.
        </p>
      </section>

      {/* 3. How It Works */}
      <section className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400">Share details</h3>
            <p className="text-slate-300 leading-relaxed">
              Enter a few simple details about what your child might enjoy tonight.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400">A story is created</h3>
            <p className="text-slate-300 leading-relaxed">
              A calm, predictable bedtime story is written specifically for your child.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400">Listen together</h3>
            <p className="text-slate-300 leading-relaxed">
              You can listen to the story together as your child prepares for sleep.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Pricing & Tiers */}
      <section className="space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Tier */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-10 flex flex-col">
            <div className="mb-8">
              <h3 className="text-2xl font-medium text-slate-100 mb-2">Free – Always Available</h3>
              <p className="text-indigo-300 text-lg font-medium">£0 / month</p>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              This tier never expires. There are no trials, no countdowns, and no surprise paywalls. It is designed so that families are never excluded from having a calm bedtime.
            </p>

            <ul className="space-y-4 text-slate-300 mb-10 flex-grow">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 flex-shrink-0" />
                <span>Personalised bedtime stories</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 flex-shrink-0" />
                <span>Child name and age</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 flex-shrink-0" />
                <span>Choice of setting and genre</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 flex-shrink-0" />
                <span>Calm, predictable story structure</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 flex-shrink-0" />
                <span>No ads or data selling</span>
              </li>
            </ul>

            <div className="pt-8 border-t border-slate-700/50">
              <p className="text-slate-500 text-xs italic leading-relaxed">
                To keep the app running, this version includes a few gentle boundaries. You can create a limited number of stories each month. Stories cannot be saved for later, and we focus on simple settings without extra family details.
              </p>
            </div>
          </div>

          {/* Supporter Tier */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-3xl p-10 flex flex-col">
            <div className="mb-8">
              <h3 className="text-2xl font-medium text-slate-100 mb-2">Supporter</h3>
              <p className="text-indigo-300 text-lg font-medium">£5.99 / month</p>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Supporting the app is a way to keep this tool available if you find yourself using it regularly. This is a contribution to sustainability rather than an upgrade to your parenting.
            </p>

            <ul className="space-y-4 text-slate-200 mb-10 flex-grow">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 mt-2 flex-shrink-0" />
                <span>Unlimited stories</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 mt-2 flex-shrink-0" />
                <span>Save and replay favourites</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 mt-2 flex-shrink-0" />
                <span>Include family, pets, and toys</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 mt-2 flex-shrink-0" />
                <span>Calm Support mode</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 mt-2 flex-shrink-0" />
                <span>Gentle background sound support</span>
              </li>
            </ul>

            <div className="pt-8 border-t border-indigo-500/20">
              <p className="text-slate-500 text-xs italic leading-relaxed">
                You can pause or cancel at any time. There is no pressure to stay subscribed and no loss of access to your dignity if you choose to stop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Ethics & Reassurance */}
      <section className="bg-slate-800/20 border border-slate-800 rounded-3xl p-10 text-center space-y-4">
        <h3 className="text-xl text-slate-200 font-medium">A space without judgement</h3>
        <p className="text-slate-400 leading-relaxed max-w-xl mx-auto">
          This app does not judge. Some nights you will have the energy to read, and some nights you will use this tool. Both are completely okay. Using the free version is always supported.
        </p>
      </section>

      {/* 6. Accessibility Statement */}
      <section className="text-center">
        <p className="text-slate-500 text-sm leading-relaxed">
          If this would help your family but cost is a problem, you can still use the free version or get in touch. No explanations required.
        </p>
      </section>

      {/* 7. Final Call to Action */}
      <section className="text-center pb-24">
        <button 
          onClick={onStart}
          className="px-10 py-4 bg-slate-100 text-slate-900 rounded-full font-medium hover:bg-white transition-colors"
        >
          Start with the free version
        </button>
      </section>
    </div>
  );
};
