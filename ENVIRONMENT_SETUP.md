# Environment Setup for Prism AI Overlay

## Required API Keys

To use the AI features, you need to set up the following API keys:

### 1. OpenAI API Key
- Go to [OpenAI Platform](https://platform.openai.com/api-keys)
- Create a new API key
- Copy the key

### 2. Perplexity API Key (Optional)
- Go to [Perplexity AI](https://www.perplexity.ai/settings/api)
- Create a new API key
- Copy the key

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following content:

```bash
# OpenAI API Key (for voice, live insights, and AI responses)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Optional: Server-side API key
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Perplexity API Key (for question answering)
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Next.js Environment
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Features

- **Voice Recognition**: Uses CedarOS + OpenAI Whisper for speech-to-text
- **Voice Synthesis**: Uses OpenAI TTS for text-to-speech
- **Live Insights**: Uses OpenAI to analyze conversation transcripts and provide real-time insights
- **Question Answering**: Uses Perplexity to answer questions with up-to-date information
- **Multi-language Support**: 10+ languages supported for voice input
- **Keyboard Shortcuts**: 
  - Press `Cmd + \` to toggle the overlay
  - Press `M` to toggle microphone (when not typing)
  - Press `Ctrl + D` to open debug panel

## Voice Configuration

The app uses CedarOS with the following voice settings:
- **Language**: English (US) - configurable in voice settings
- **Voice**: Alloy (OpenAI voice) - 6 voice options available
- **TTS**: OpenAI TTS (not browser TTS)
- **Auto-add to messages**: Voice interactions are added to chat history

## Usage

1. Set up your API keys as described above
2. Start the development server: `npm run dev`
3. Open your browser and navigate to `http://localhost:3000`
4. Click the microphone button or press `M` to start voice input
5. Press `Cmd + \` to toggle the overlay
6. Use voice settings (gear icon) to configure language and voice
7. Press `Ctrl + D` to open debug panel for troubleshooting

## Troubleshooting

- Make sure your `NEXT_PUBLIC_OPENAI_API_KEY` is correctly set
- Check the browser console for any error messages
- Ensure you have microphone permissions enabled in your browser
- Voice recognition works best in Chrome and Edge browsers
- Use the debug panel (`Ctrl + D`) to check voice state and configuration
- Check that the voice endpoint is set to `/api/voice` in the debug panel