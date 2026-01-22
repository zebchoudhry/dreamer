import React, { useState } from 'react';
import { 
  SocialStoryTemplate, 
  SOCIAL_STORY_TEMPLATES,
  StoryInput,
  CALM_ACCESSIBILITY,
} from '../types';
import { Card, Button, Input, SectionHeader } from './ui';

interface SocialStoryBuilderProps {
  childName: string;
  childAge: number;
  onGenerate: (input: StoryInput) => void;
  onBack: () => void;
  isGenerating: boolean;
}

export const SocialStoryBuilder: React.FC<SocialStoryBuilderProps> = ({
  childName,
  childAge,
  onGenerate,
  onBack,
  isGenerating,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<SocialStoryTemplate | null>(null);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [customScenario, setCustomScenario] = useState('');

  const handleSelectTemplate = (template: SocialStoryTemplate) => {
    setSelectedTemplate(template);
    setCustomAnswers({});
  };

  const handleAnswerChange = (prompt: string, value: string) => {
    setCustomAnswers(prev => ({ ...prev, [prompt]: value }));
  };

  const handleGenerate = () => {
    if (!selectedTemplate && !customScenario) return;

    const input: StoryInput = {
      childName,
      childAge,
      gender: 'neutral',
      genre: 'Social Story',
      setting: 'Real Life',
      length: 'short',
      mode: 'SOCIAL_STORY',
      blueprintId: 'neutral',
      socialStoryId: selectedTemplate?.id || 'custom',
      socialStoryCustom: selectedTemplate 
        ? customAnswers 
        : { scenario: customScenario },
      accessibility: CALM_ACCESSIBILITY,
    };

    onGenerate(input);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-slate-200 text-sm mb-4"
        >
          ← Back to story types
        </button>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          Social Story Builder
        </h1>
        <p className="text-slate-400">
          Create stories that help {childName} prepare for new situations
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-teal-500/5 border-teal-500/20">
        <div className="flex gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="font-bold text-teal-300 mb-1">What are Social Stories?</h3>
            <p className="text-sm text-slate-400">
              Social stories help children understand and prepare for new or challenging 
              situations by describing what will happen step-by-step. They're especially 
              helpful for children who benefit from predictability and clear expectations.
            </p>
          </div>
        </div>
      </Card>

      {!selectedTemplate ? (
        <>
          {/* Template Selection */}
          <Card title="Choose a Scenario">
            <div className="grid gap-3">
              {SOCIAL_STORY_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="w-full p-4 bg-slate-900/40 rounded-xl border border-slate-700/50 text-left hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-200 group-hover:text-indigo-300">
                        {template.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {template.scenario}
                      </p>
                    </div>
                    <div className="text-2xl opacity-50 group-hover:opacity-100">
                      {getTemplateIcon(template.id)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Custom Scenario */}
          <Card title="Or Create Your Own">
            <div className="space-y-4">
              <textarea
                value={customScenario}
                onChange={(e) => setCustomScenario(e.target.value)}
                placeholder="Describe the situation you want to prepare for...

Example: We're going to a birthday party at a new friend's house. There will be loud music and lots of children."
                className="w-full h-32 bg-slate-900/60 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 resize-none"
              />
              <Button
                onClick={handleGenerate}
                disabled={!customScenario.trim()}
                isLoading={isGenerating}
                className="w-full"
              >
                Create Custom Social Story
              </Button>
            </div>
          </Card>
        </>
      ) : (
        /* Template Customization */
        <Card>
          <button
            onClick={() => setSelectedTemplate(null)}
            className="text-slate-400 hover:text-slate-200 text-sm mb-4"
          >
            ← Choose different scenario
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">{getTemplateIcon(selectedTemplate.id)}</div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                {selectedTemplate.title}
              </h2>
              <p className="text-slate-400 text-sm">
                {selectedTemplate.scenario}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <SectionHeader 
              icon="✏️" 
              title="Personalize the story" 
              color="teal" 
            />
            
            {selectedTemplate.prompts.map((prompt, index) => (
              <div key={index}>
                <label className="block text-sm text-slate-300 mb-1.5">
                  {prompt}
                </label>
                <input
                  type="text"
                  value={customAnswers[prompt] || ''}
                  onChange={(e) => handleAnswerChange(prompt, e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 outline-none focus:border-teal-500"
                  placeholder="Optional - leave blank for general advice"
                />
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/50 mb-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Story Preview
            </h4>
            <p className="text-sm text-slate-300">
              A story to help {childName} understand what will happen when{' '}
              {selectedTemplate.scenario.toLowerCase()}.
              {Object.values(customAnswers).some(v => v) && (
                <span className="text-teal-400">
                  {' '}Including personalized details about: {Object.entries(customAnswers)
                    .filter(([, v]) => v)
                    .map(([k]) => k.toLowerCase())
                    .join(', ')}.
                </span>
              )}
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            isLoading={isGenerating}
            className="w-full"
            size="lg"
          >
            ✨ Create Social Story
          </Button>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-slate-900/30">
        <h3 className="font-bold text-slate-300 mb-3 flex items-center gap-2">
          <span>📖</span> Tips for Using Social Stories
        </h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex gap-2">
            <span className="text-teal-400">•</span>
            Read the story several times before the event
          </li>
          <li className="flex gap-2">
            <span className="text-teal-400">•</span>
            Use a calm, reassuring voice
          </li>
          <li className="flex gap-2">
            <span className="text-teal-400">•</span>
            Let your child ask questions and express concerns
          </li>
          <li className="flex gap-2">
            <span className="text-teal-400">•</span>
            Revisit the story right before the event as a reminder
          </li>
          <li className="flex gap-2">
            <span className="text-teal-400">•</span>
            After the event, talk about how it went compared to the story
          </li>
        </ul>
      </Card>
    </div>
  );
};

function getTemplateIcon(id: string): string {
  const icons: Record<string, string> = {
    dentist: '🦷',
    visitors: '🏠',
    new_place: '🗺️',
    plans_change: '🔄',
    big_feelings: '💭',
  };
  return icons[id] || '📖';
}

// Compact card for selecting social story mode
export const SocialStoryCard: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-6 bg-teal-500/5 rounded-2xl border border-teal-500/20 text-left hover:bg-teal-500/10 hover:border-teal-500/30 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          📚
        </div>
        <div>
          <h3 className="font-bold text-teal-300 mb-1">Social Story</h3>
          <p className="text-sm text-slate-400">
            Prepare for dentist visits, new places, visitors, and more with 
            structured stories that explain what will happen.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Dentist', 'Visitors', 'New Places', 'Big Feelings'].map(tag => (
              <span 
                key={tag}
                className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
};
