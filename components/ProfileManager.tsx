import React, { useState } from 'react';
import { 
  ChildProfile, 
  AccessibilitySettings,
  DEFAULT_ACCESSIBILITY,
  AUTHOR_BLUEPRINTS,
} from '../types';
import { Card, Button, Input, Select, Toggle, SectionHeader } from './ui';
import { AccessibilityPanel } from './AccessibilityPanel';

interface ProfileManagerProps {
  profiles: ChildProfile[];
  activeProfile: ChildProfile | null;
  onCreateProfile: (profile: Omit<ChildProfile, 'id' | 'createdAt'>) => void;
  onUpdateProfile: (id: string, updates: Partial<ChildProfile>) => void;
  onDeleteProfile: (id: string) => void;
  onSelectProfile: (id: string | null) => void;
  onClose: () => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  profiles,
  activeProfile,
  onCreateProfile,
  onUpdateProfile,
  onDeleteProfile,
  onSelectProfile,
  onClose,
}) => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingProfile, setEditingProfile] = useState<ChildProfile | null>(null);

  const handleEdit = (profile: ChildProfile) => {
    setEditingProfile(profile);
    setView('edit');
  };

  const handleCreate = () => {
    setEditingProfile(null);
    setView('create');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">
                {view === 'list' && 'Child Profiles'}
                {view === 'create' && 'New Profile'}
                {view === 'edit' && `Edit ${editingProfile?.name}`}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {view === 'list' && 'Save preferences for each child'}
                {view === 'create' && 'Create a new child profile'}
                {view === 'edit' && 'Update profile settings'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {view === 'list' ? (
            <ProfileList
              profiles={profiles}
              activeProfileId={activeProfile?.id || null}
              onSelect={onSelectProfile}
              onEdit={handleEdit}
              onDelete={onDeleteProfile}
              onCreate={handleCreate}
            />
          ) : (
            <ProfileForm
              profile={editingProfile}
              onSave={(data) => {
                if (editingProfile) {
                  onUpdateProfile(editingProfile.id, data);
                } else {
                  onCreateProfile(data as Omit<ChildProfile, 'id' | 'createdAt'>);
                }
                setView('list');
              }}
              onCancel={() => setView('list')}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

// Profile List View
interface ProfileListProps {
  profiles: ChildProfile[];
  activeProfileId: string | null;
  onSelect: (id: string | null) => void;
  onEdit: (profile: ChildProfile) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const ProfileList: React.FC<ProfileListProps> = ({
  profiles,
  activeProfileId,
  onSelect,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">👶</span>
        </div>
        <h3 className="text-lg font-bold text-slate-300 mb-2">No profiles yet</h3>
        <p className="text-slate-500 text-sm mb-6">
          Create a profile to save preferences for each child
        </p>
        <Button onClick={onCreate}>
          Create First Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {profiles.map(profile => (
        <div
          key={profile.id}
          className={`p-4 rounded-xl border transition-all ${
            activeProfileId === profile.id
              ? 'bg-indigo-500/10 border-indigo-500/50'
              : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => onSelect(profile.id)}
              className="flex items-center gap-4 text-left flex-1"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-xl font-bold text-indigo-300">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-slate-100">
                  {profile.name}
                  {activeProfileId === profile.id && (
                    <span className="ml-2 text-xs bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </h3>
                <p className="text-sm text-slate-400">
                  {profile.age} years old • {profile.gender === 'boy' ? 'He/Him' : profile.gender === 'girl' ? 'She/Her' : 'They/Them'}
                </p>
                <div className="flex gap-2 mt-1">
                  {profile.accessibility.sensoryLevel !== 'standard' && (
                    <span className="text-[10px] bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded">
                      {profile.accessibility.sensoryLevel} sensory
                    </span>
                  )}
                  {profile.preferredBlueprint && profile.preferredBlueprint !== 'neutral' && (
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded">
                      {AUTHOR_BLUEPRINTS.find(b => b.id === profile.preferredBlueprint)?.author}
                    </span>
                  )}
                </div>
              </div>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(profile)}
                className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-slate-200"
              >
                ✏️
              </button>
              {confirmDelete === profile.id ? (
                <button
                  onClick={() => {
                    onDelete(profile.id);
                    setConfirmDelete(null);
                  }}
                  className="p-2 rounded-lg bg-rose-600 text-white"
                >
                  Confirm
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDelete(profile.id)}
                  className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-rose-400"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <Button onClick={onCreate} variant="secondary" className="w-full">
        + Add Another Child
      </Button>
    </div>
  );
};

// Profile Form
interface ProfileFormProps {
  profile: ChildProfile | null;
  onSave: (data: Partial<ChildProfile>) => void;
  onCancel: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age || 4);
  const [gender, setGender] = useState(profile?.gender || 'neutral');
  const [familyMembers, setFamilyMembers] = useState(profile?.familyMembers || '');
  const [siblings, setSiblings] = useState(profile?.siblings || '');
  const [pets, setPets] = useState(profile?.pets || '');
  const [comfortItem, setComfortItem] = useState(profile?.comfortItem || '');
  const [preferredBlueprint, setPreferredBlueprint] = useState(profile?.preferredBlueprint || 'neutral');
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(
    profile?.accessibility || DEFAULT_ACCESSIBILITY
  );
  const [showAccessibility, setShowAccessibility] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      age,
      gender: gender as any,
      familyMembers,
      siblings,
      pets,
      comfortItem,
      favoriteThings: [],
      preferredBlueprint,
      accessibility,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <SectionHeader icon="👤" title="Basic Info" color="indigo" />
        
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Child's name"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Age
            </label>
            <input
              type="number"
              min={1}
              max={12}
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 4)}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>
          <Select
            label="Pronouns"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={[
              { value: 'girl', label: 'She/Her' },
              { value: 'boy', label: 'He/Him' },
              { value: 'neutral', label: 'They/Them' },
            ]}
          />
        </div>
      </div>

      {/* Personal Details */}
      <div className="space-y-4">
        <SectionHeader icon="💜" title="Personal Details" color="purple" />
        
        <Input
          value={familyMembers}
          onChange={(e) => setFamilyMembers(e.target.value)}
          placeholder="Family members (Mum, Dad, Grandma...)"
        />
        <Input
          value={siblings}
          onChange={(e) => setSiblings(e.target.value)}
          placeholder="Siblings' names"
        />
        <Input
          value={pets}
          onChange={(e) => setPets(e.target.value)}
          placeholder="Pets' names"
        />
        <Input
          value={comfortItem}
          onChange={(e) => setComfortItem(e.target.value)}
          placeholder="Favorite toy or comfort item"
        />
      </div>

      {/* Preferred Style */}
      <div className="space-y-4">
        <SectionHeader icon="✍️" title="Preferred Style" color="amber" />
        
        <Select
          label="Default Story Style"
          value={preferredBlueprint}
          onChange={(e) => setPreferredBlueprint(e.target.value)}
          options={AUTHOR_BLUEPRINTS.map(b => ({
            value: b.id,
            label: `${b.author} - ${b.description}`,
          }))}
        />
      </div>

      {/* Accessibility */}
      <button
        type="button"
        onClick={() => setShowAccessibility(!showAccessibility)}
        className="w-full flex items-center justify-between p-3 bg-teal-500/5 rounded-xl border border-teal-500/20"
      >
        <span className="text-sm font-medium text-teal-300">
          ⚙️ Accessibility Settings
        </span>
        <span className={`transition-transform ${showAccessibility ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {showAccessibility && (
        <AccessibilityPanel
          settings={accessibility}
          onChange={setAccessibility}
        />
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {profile ? 'Save Changes' : 'Create Profile'}
        </Button>
      </div>
    </form>
  );
};

// Profile Selector (compact dropdown)
interface ProfileSelectorProps {
  profiles: ChildProfile[];
  activeProfile: ChildProfile | null;
  onSelect: (id: string) => void;
  onManage: () => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  profiles,
  activeProfile,
  onSelect,
  onManage,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300">
          {activeProfile ? activeProfile.name.charAt(0) : '?'}
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-slate-200">
            {activeProfile?.name || 'Select Child'}
          </div>
          {activeProfile && (
            <div className="text-[10px] text-slate-500">
              {activeProfile.age} years old
            </div>
          )}
        </div>
        <span className="text-slate-500">▼</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            {profiles.map(profile => (
              <button
                key={profile.id}
                onClick={() => {
                  onSelect(profile.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700/50 ${
                  activeProfile?.id === profile.id ? 'bg-indigo-500/10' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-200">
                    {profile.name}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {profile.age} years old
                  </div>
                </div>
              </button>
            ))}
            
            <div className="border-t border-slate-700">
              <button
                onClick={() => {
                  onManage();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-sm text-slate-400 hover:bg-slate-700/50"
              >
                ⚙️ Manage Profiles
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
