# Environment Setup for Prism AI Overlay

## Required API Keys

To use the AI features, you need to set up the following API keys:

### 1. OpenAI API Key
- Go to [OpenAI Platform](https://platform.openai.com/api-keys)
- Create a new API key
- Copy the key

### 2. Perplexity API Key
- Go to [Perplexity AI](https://www.perplexity.ai/settings/api)
- Create a new API key
- Copy the key

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following content:

```bash
# OpenAI API Key (for live insights)
OPENAI_API_KEY=your_openai_api_key_here

# Perplexity API Key (for question answering)
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Next.js Environment
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Alternative: Client-side Environment Variables

If you prefer to set environment variables on the client side, you can also use:

```bash
# For client-side access
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

## Features

- **Live Insights**: Uses OpenAI to analyze conversation transcripts and provide real-time insights
- **Question Answering**: Uses Perplexity to answer questions with up-to-date information
- **Speech Recognition**: Built-in browser speech recognition for voice input
- **Keyboard Shortcut**: Press `Cmd + \` to toggle the overlay

## Usage

1. Set up your API keys as described above
2. Start the development server: `npm run dev`
3. Open your browser and navigate to `http://localhost:3000`
4. Click the microphone button or press `Cmd + \` to start the overlay
5. Speak to generate live insights and ask questions

## Troubleshooting

- Make sure your API keys are correctly set in the environment variables
- Check the browser console for any error messages
- Ensure you have microphone permissions enabled in your browser
- Speech recognition works best in Chrome and Edge browsers
