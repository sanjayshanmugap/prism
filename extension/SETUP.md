# Prism AI Extension Setup Guide

## Phase 2: CedarOS + Mastra Integration Complete! 🚀

The extension now includes full AI integration with CedarOS + Mastra for intelligent content analysis and voice processing.

## 🔧 Setup Instructions

### 1. API Keys Configuration

#### OpenAI API Key (Required)
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Update the configuration in `config/api-config.js`:

```javascript
export const apiConfig = {
  openai: {
    apiKey: 'sk-your-actual-openai-api-key-here',
    // ... other settings
  }
};
```

#### Perplexity API Key (Optional - for Phase 3)
1. Get your API key from [Perplexity AI](https://perplexity.ai/pro)
2. Update the configuration in `config/api-config.js`:

```javascript
export const apiConfig = {
  perplexity: {
    apiKey: 'pplx-your-actual-perplexity-api-key-here',
    // ... other settings
  }
};
```

### 2. Environment Variables (Alternative)
You can also set environment variables:

```bash
export OPENAI_API_KEY="sk-your-actual-openai-api-key-here"
export PERPLEXITY_API_KEY="pplx-your-actual-perplexity-api-key-here"
```

## 🎯 New Features Added

### ✅ AI-Powered Content Analysis
- **Automatic Analysis**: Content is analyzed when overlay is shown
- **Live Insights**: Real-time insights about webpage content
- **Smart Actions**: Context-aware action suggestions
- **Confidence Scoring**: AI confidence levels displayed

### ✅ Voice Processing Integration
- **Speech Recognition**: Enhanced voice input processing
- **Intent Detection**: Understands user intent from voice commands
- **Action Triggers**: Voice commands trigger appropriate AI actions
- **Wake Word Support**: "Hey Prism" detection ready

### ✅ CedarOS Store Integration
- **Message Management**: Persistent message history
- **State Management**: Real-time state updates
- **Context Awareness**: Maintains conversation context
- **Error Handling**: Robust error handling and fallbacks

## 🔄 How It Works

### Content Analysis Flow
1. **User shows overlay** → Triggers auto-analysis
2. **Background script** → Extracts webpage content
3. **Content Analysis Agent** → Processes content with AI
4. **Live Insights Panel** → Updates with real insights
5. **AI Response Panel** → Shows AI-generated summary

### Voice Processing Flow
1. **User speaks** → Voice input captured
2. **Voice Processing Agent** → Converts speech to intent
3. **Intent Analysis** → Determines required action
4. **Content Analysis** → Triggers if needed
5. **Response Generation** → Updates overlay with results

## 🧪 Testing the Integration

### Test Content Analysis
1. Navigate to any website (news, financial, technical)
2. Click extension icon or use `⌘ \` shortcut
3. Watch as insights populate automatically
4. Check confidence scores and action suggestions

### Test Voice Commands
1. Click microphone button or use `⌘ ⇧` shortcut
2. Say commands like:
   - "Analyze this content"
   - "What is this about?"
   - "Explain the main points"
3. Watch for AI responses and insights

### Test Different Content Types
- **Financial sites**: Should detect financial terms and concepts
- **News sites**: Should extract key topics and themes
- **Technical docs**: Should identify technical concepts
- **E-commerce**: Should recognize product and business content

## 🐛 Troubleshooting

### Common Issues

#### "API key not configured"
- Ensure your OpenAI API key is properly set in `config/api-config.js`
- Check that the key starts with `sk-`

#### "No insights generated"
- Check browser console for errors
- Verify webpage content is accessible
- Ensure API key has sufficient credits

#### "Voice not working"
- Check microphone permissions
- Ensure voice recognition is supported in your browser
- Try different voice commands

### Debug Mode
Enable debug mode in `config/api-config.js`:

```javascript
export const apiConfig = {
  cedar: {
    enableDebug: true,
    // ... other settings
  }
};
```

## 📊 Performance Considerations

### API Usage
- **OpenAI GPT-4o-mini**: Cost-effective for content analysis
- **Token Limits**: Configured for 1000 tokens max per request
- **Rate Limiting**: Built-in retry logic for API failures

### Browser Performance
- **Lazy Loading**: AI agents load only when needed
- **Caching**: Responses cached to reduce API calls
- **Non-blocking**: AI processing doesn't block UI

## 🚀 Next Steps

### Phase 3: Perplexity Integration
- Web search capabilities
- Multi-source synthesis
- Real-time information updates

### Phase 4: Subagent Architecture
- Multi-agent reasoning
- Cross-validation
- Anti-hallucination measures

## 📝 Configuration Options

### Auto-Analysis Settings
```javascript
extension: {
  autoAnalyzeOnShow: true,    // Auto-analyze when overlay shows
  enableVoiceRecognition: true, // Enable voice features
  analysisDelay: 500,         // Delay before analysis (ms)
  maxRetries: 3              // Max API retry attempts
}
```

### AI Model Settings
```javascript
openai: {
  model: 'gpt-4o-mini',      // AI model to use
  maxTokens: 1000,           // Max response length
  temperature: 0.7,          // Response creativity (0-1)
}
```

The extension is now fully integrated with CedarOS + Mastra and ready for intelligent AI-powered web analysis! 🎉
