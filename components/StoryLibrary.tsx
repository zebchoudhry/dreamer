import React, { useState } from 'react';
import { StoryResponse } from '../types';
import { Card, Button, EmptyState } from './ui';

interface StoryLibraryProps {
  stories: StoryResponse[];
  onSelectStory: (story: StoryResponse) => void;
  onDeleteStory: (id: string) => void;
  onBack: () => void;
}

export const StoryLibrary: React.FC<StoryLibraryProps> = ({
  stories,
  onSelectStory,
  onDeleteStory,
  onBack,
}) => {
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStories = stories
    .filter(story => {
      if (filter === 'favorites' && (!story.rating || story.rating < 4)) return false;
      if (searchTerm && !story.input.childName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  const groupedByChild = filteredStories.reduce((acc, story) => {
    const name = story.input.childName;
    if (!acc[name]) acc[name] = [];
    acc[name].push(story);
    return acc;
  }, {} as Record<string, StoryResponse[]>);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button 
            onClick={onBack}
            className="text-slate-400 hover:text-slate-200 text-sm mb-2 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-slate-100">Story Library</h1>
          <p className="text-slate-400 mt-1">{stories.length} stories saved</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex p-1 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            All Stories
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              filter === 'favorites' ? 'bg-amber-600 text-white' : 'text-slate-400'
            }`}
          >
            ⭐ Favorites
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500"
        />
      </div>

      {/* Stories */}
      {filteredStories.length === 0 ? (
        <EmptyState
          icon={<span className="text-4xl">📚</span>}
          title="No stories yet"
          description={filter === 'favorites' 
            ? "You haven't favorited any stories yet. Rate stories 4+ stars to add them here."
            : "Create your first story to start building your library."
          }
          action={
            <Button onClick={onBack}>
              Create a Story
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByChild).map(([childName, childStories]) => (
            <div key={childName}>
              <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-sm">
                  {childName.charAt(0).toUpperCase()}
                </span>
                {childName}'s Stories
                <span className="text-sm font-normal text-slate-500">
                  ({childStories.length})
                </span>
              </h2>
              
              <div className="grid gap-4">
                {childStories.map(story => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onSelect={() => onSelectStory(story)}
                    onDelete={() => onDeleteStory(story.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface StoryCardProps {
  story: StoryResponse;
  onSelect: () => void;
  onDelete: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onSelect, onDelete }) => {
  const [showDelete, setShowDelete] = useState(false);
  
  const date = new Date(story.timestamp);
  const dateStr = date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });

  const preview = story.content.substring(0, 150) + '...';

  return (
    <div 
      className="group relative bg-slate-800/30 rounded-2xl border border-slate-700/30 overflow-hidden hover:border-slate-600/50 transition-all"
    >
      <button
        onClick={onSelect}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-slate-200">
                {story.input.genre} in {story.input.setting}
              </span>
              {story.rating && story.rating >= 4 && (
                <span className="text-amber-400">⭐</span>
              )}
              {story.input.mode === 'CALM_SUPPORT' && (
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded">
                  Calm
                </span>
              )}
            </div>
            
            <p className="text-sm text-slate-400 line-clamp-2 mb-2">
              {preview}
            </p>
            
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>{dateStr}</span>
              <span>•</span>
              <span>{story.blueprintUsed}</span>
              <span>•</span>
              <span>{story.input.length}</span>
            </div>
          </div>
          
          <div className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
            📖
          </div>
        </div>
      </button>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (showDelete) {
            onDelete();
          } else {
            setShowDelete(true);
            setTimeout(() => setShowDelete(false), 3000);
          }
        }}
        className={`absolute top-2 right-2 p-2 rounded-lg transition-all ${
          showDelete 
            ? 'bg-rose-600 text-white' 
            : 'bg-slate-800/50 text-slate-500 opacity-0 group-hover:opacity-100'
        }`}
      >
        {showDelete ? '🗑️ Confirm' : '🗑️'}
      </button>
    </div>
  );
};

// Stats component for the library
export const LibraryStats: React.FC<{ stories: StoryResponse[] }> = ({ stories }) => {
  const totalStories = stories.length;
  const favoriteStories = stories.filter(s => s.rating && s.rating >= 4).length;
  const calmStories = stories.filter(s => s.input.mode === 'CALM_SUPPORT').length;
  const uniqueChildren = new Set(stories.map(s => s.input.childName)).size;

  const genreCounts = stories.reduce((acc, s) => {
    acc[s.input.genre] = (acc[s.input.genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topGenre = Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <StatCard label="Total Stories" value={totalStories} icon="📚" />
      <StatCard label="Favorites" value={favoriteStories} icon="⭐" />
      <StatCard label="Calm Mode" value={calmStories} icon="🧘" />
      <StatCard label="Children" value={uniqueChildren} icon="👶" />
      <StatCard label="Top Genre" value={topGenre} icon="🏆" />
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: string }> = ({ 
  label, 
  value, 
  icon 
}) => (
  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-xl font-bold text-slate-100">{value}</div>
    <div className="text-xs text-slate-500">{label}</div>
  </div>
);
