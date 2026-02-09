# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## 🆕 Echo-Friendly AI Assistant Feature

Study Buddy now includes an advanced **Echo-Friendly AI Assistant** that communicates with you in your language using your communication style!

### Key Features ✨
- 🌍 **Auto-Language Detection**: Automatically detects and responds in 8+ languages (English, Hindi, Spanish, French, German, Portuguese, Japanese, Chinese)
- 🎭 **Communication Style Matching**: Detects your tone (enthusiastic, inquisitive, brief, neutral) and responds accordingly
- 🎤 **Voice Support**: Speak your questions & listen to explanations
- 📚 **Personalized Learning**: Experience adapts to your unique learning style
- ⚡ **Real-time Streaming**: Get instant, streaming responses

### Quick Start
1. Navigate to `/echo-assistant` in your app
2. Ask a question in any language
3. The assistant auto-detects your language & style
4. Get personalized explanations

### Documentation
- **[Echo Assistant User Guide](./ECHO_ASSISTANT_GUIDE.md)** - Complete user guide with features & best practices
- **[Setup & Deployment](./ECHO_ASSISTANT_SETUP.md)** - Technical setup instructions for developers
- **[Examples & Code Samples](./ECHO_ASSISTANT_EXAMPLES.md)** - Usage examples and integration guides

### Files Added
```
src/
├── components/
│   └── EchoFriendlyAssistant.tsx    # New Echo Assistant component
├── lib/
│   └── languageDetector.ts          # Language & style detection utilities
├── pages/
│   └── EchoAssistant.tsx            # Echo Assistant page

supabase/functions/
└── echo-assistant/
    └── index.ts                      # Server-side echo assistant logic

Documentation/
├── ECHO_ASSISTANT_GUIDE.md          # User guide
├── ECHO_ASSISTANT_SETUP.md          # Setup guide
└── ECHO_ASSISTANT_EXAMPLES.md       # Code examples
```

---

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend Functions)
- Framer Motion (Animations)
- React Markdown (Content Rendering)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

### Deploying the Echo Assistant

For the Echo Assistant to work, you need to deploy the backend function:

```bash
# Deploy the echo-assistant function to Supabase
supabase functions deploy echo-assistant
```

Set the required environment variable in Supabase:
```bash
supabase secrets set LOVABLE_API_KEY="your-api-key"
```

See [ECHO_ASSISTANT_SETUP.md](./ECHO_ASSISTANT_SETUP.md) for detailed instructions.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## Getting Help

- 📖 Check the documentation files for detailed guides
- 🐛 Report issues in GitHub Issues
- 💬 Ask questions in discussions

