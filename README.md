# 🌙 Dreamweaver

**AI-powered personalized bedtime stories with neurodiversity support**

Dreamweaver creates unique, personalized bedtime stories for children, with a special focus on features that help autistic children and those who benefit from predictable routines.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Core Story Generation
- **Personalized Stories** - Include child's name, age, family members, pets, and comfort items
- **Multiple Genres** - Animals, Adventure, Fairy Tales, Space, and more
- **Customizable Length** - Short (2 min), Medium (4 min), or Long (6 min) stories
- **Text-to-Speech** - 5 different voice options with adjustable speed
- **Story Library** - Save favorites and track what works

### 🧘 Neurodiversity Support
- **Calm Support Mode** - Low-stimulation stories with predictable structure
- **Visual Story Progress** - Shows exactly which part of the story we're in
- **Literal Language** - No metaphors, idioms, or figurative speech
- **5-Part Structure** - Same predictable pattern every time:
  1. The Beginning (setting)
  2. The Friend (someone kind)
  3. The Wonder (gentle discovery)
  4. The Cozy Moment (warmth and safety)
  5. Sleep Time (settling down)

### 📚 Social Stories
Special stories to help prepare for:
- Going to the dentist
- Having visitors
- Going somewhere new
- When plans change
- Managing big feelings

### ✍️ Author Blueprints
Stories styled after beloved authors:
- **Roald Dahl** - Invented words, gleeful mischief
- **Lewis Carroll** - Whimsical wordplay and wonder
- **A.A. Milne** - Gentle adventures with loyal friends
- **Beatrix Potter** - Cozy animal tales
- **Maurice Sendak** - Wild imagination safely contained
- **Eric Carle** - Repetitive, colorful, reassuring
- **Dr. Seuss** - Rhyming nonsense with heart

### ♿ Accessibility Features
- **Font Sizes** - Normal, Large, Extra Large
- **Dyslexia-Friendly Font** - OpenDyslexic support
- **High Contrast Mode**
- **Reduced Animations**
- **Sensory Level Control** - Standard, Low, or Minimal

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dreamweaver.git
cd dreamweaver

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Start development server
npm run dev
```

### Deployment to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add `GEMINI_API_KEY` as an environment variable
4. Deploy!

```bash
# Or use Vercel CLI
vercel --prod
```

## 🔐 Security

**API Key Protection**: Unlike the previous version, the API key is now kept server-side in Vercel serverless functions. It is never exposed to the client.

## 📁 Project Structure

```
dreamweaver/
├── api/                    # Vercel serverless functions
│   ├── generate-story.ts   # Story generation endpoint
│   └── generate-audio.ts   # TTS endpoint
├── components/             # React components
│   ├── ui.tsx             # Reusable UI components
│   ├── StoryForm.tsx      # Story creation form
│   ├── StoryDisplay.tsx   # Story reader
│   ├── StoryProgress.tsx  # Visual progress indicator
│   ├── BlueprintSelector.tsx  # Author style picker
│   ├── AccessibilityPanel.tsx # A11y settings
│   ├── SocialStoryBuilder.tsx # Social story creator
│   ├── ProfileManager.tsx # Child profiles
│   └── ...
├── hooks/                  # Custom React hooks
│   ├── useStoryGenerator.ts
│   ├── useAudioPlayer.ts
│   └── useStorage.ts
├── styles/                 # CSS
│   └── index.css
├── types.ts               # TypeScript types
├── App.tsx                # Main app component
└── main.tsx               # Entry point
```

## 🎯 How It Works

1. **Create a Profile** - Add child's details and preferences
2. **Choose Mode** - Standard or Calm Support
3. **Pick a Style** - Select an author blueprint
4. **Generate** - AI creates a unique story
5. **Listen** - Text-to-speech reads it aloud
6. **Save** - Keep favorites in your library

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build**: Vite
- **AI**: Google Gemini API
- **Deployment**: Vercel
- **State**: React hooks + localStorage

## 📝 API Reference

### POST /api/generate-story

Generate a new story.

```typescript
{
  input: {
    childName: string;
    childAge: number;
    gender: 'boy' | 'girl' | 'neutral';
    genre: string;
    setting: string;
    length: 'short' | 'medium' | 'long';
    mode: 'STANDARD' | 'CALM_SUPPORT' | 'SOCIAL_STORY';
    blueprintId: string;
    // Optional personalization
    familyMembers?: string;
    siblings?: string;
    pets?: string;
    comfortItem?: string;
  };
  blueprintPrompt: string;
  feedback?: string;      // For refinements
  originalStory?: string; // For refinements
}
```

### POST /api/generate-audio

Generate audio for text-to-speech.

```typescript
{
  text: string;
  voice: 'Kore' | 'Puck' | 'Zephyr' | 'Charon' | 'Fenrir';
  speed?: number;
}
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

## 🙏 Acknowledgments

- Inspired by the needs of families with autistic children
- Author blueprints respect the legacy of beloved children's authors
- Built with ❤️ for better bedtimes

---

**Made for gentle moments** 🌙
