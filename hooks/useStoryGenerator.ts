import { useState, useCallback } from 'react';
import { StoryInput, StoryResponse, AUTHOR_BLUEPRINTS } from '../types';

interface UseStoryGeneratorReturn {
  isGenerating: boolean;
  error: string | null;
  generateStory: (input: StoryInput, feedback?: string, originalStory?: string) => Promise<StoryResponse | null>;
  clearError: () => void;
}

export function useStoryGenerator(): UseStoryGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStory = useCallback(async (
    input: StoryInput,
    feedback?: string,
    originalStory?: string
  ): Promise<StoryResponse | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const blueprint = AUTHOR_BLUEPRINTS.find(b => b.id === input.blueprintId) 
        || AUTHOR_BLUEPRINTS.find(b => b.id === 'neutral')!;

      // Check if blueprint is compatible with calm mode
      if (input.mode === 'CALM_SUPPORT' && !blueprint.compatibleWithCalm) {
        // Switch to a calm-compatible blueprint
        const calmBlueprint = AUTHOR_BLUEPRINTS.find(b => b.compatibleWithCalm) 
          || AUTHOR_BLUEPRINTS.find(b => b.id === 'neutral')!;
        input = { ...input, blueprintId: calmBlueprint.id };
      }

      const finalBlueprint = AUTHOR_BLUEPRINTS.find(b => b.id === input.blueprintId)!;

      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          blueprintPrompt: finalBlueprint.promptModifiers,
          feedback,
          originalStory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate story');
      }

      const data = await response.json();

      const story: StoryResponse = {
        id: generateId(),
        content: data.content,
        sections: data.sections,
        timestamp: Date.now(),
        input,
        blueprintUsed: finalBlueprint.author,
      };

      return story;

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    isGenerating,
    error,
    generateStory,
    clearError,
  };
}

function generateId(): string {
  return `story_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
