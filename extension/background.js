// Prism AI Overlay Background Script
// Handles voice recognition, AI processing, and communication with content scripts
// Compatible with Chrome Extension Manifest V3

class PrismAIBackground {
  constructor() {
    this.isListening = false;
    this.recognition = null;
    this.cedarStore = this.createCedarStore();
    this.apiConfig = null;
    this.init();
  }

  init() {
    // Initialize speech recognition
    this.setupSpeechRecognition();
    
    // Load API configuration
    this.loadApiConfig();
    
    // Listen for messages from content scripts and popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Handle extension icon click
    chrome.action.onClicked.addListener((tab) => {
      this.toggleOverlay(tab.id);
    });
  }

  async loadApiConfig() {
    try {
      // Load API configuration dynamically
      const response = await fetch(chrome.runtime.getURL('config/api-config.js'));
      const configText = await response.text();
      
      // Extract API key from config (simple approach)
      const apiKeyMatch = configText.match(/apiKey:\s*['"`]([^'"`]+)['"`]/);
      this.apiConfig = {
        openaiApiKey: apiKeyMatch ? apiKeyMatch[1] : null
      };
      
      console.log('API config loaded:', !!this.apiConfig.openaiApiKey);
    } catch (error) {
      console.error('Error loading API config:', error);
      this.apiConfig = { openaiApiKey: null };
    }
  }

  createCedarStore() {
    let messages = [];
    let listeners = [];

    return {
      getMessages: () => messages,
      addMessage: (message) => {
        messages = [...messages, message];
        listeners.forEach(listener => listener(messages));
      },
      clearMessages: () => {
        messages = [];
        listeners.forEach(listener => listener(messages));
      },
      subscribe: (listener) => {
        listeners.push(listener);
        return () => {
          listeners = listeners.filter(l => l !== listener);
        };
      },
      isProcessing: false,
      currentInsights: [],
      currentActions: []
    };
  }

  setupSpeechRecognition() {
    // Note: Web Speech API is not available in service workers
    // This will need to be handled in content script or popup
    console.log('Speech recognition setup - will be handled in content script');
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'listeningStateChanged':
          await this.handleListeningStateChange(request.isListening, sender.tab.id);
          sendResponse({ success: true });
          break;
        case 'processVoiceInput':
          const result = await this.processVoiceInput(request.text, sender.tab.id);
          sendResponse({ success: true, data: result });
          break;
        case 'getTabContent':
          const content = await this.getTabContent(sender.tab.id);
          sendResponse({ success: true, data: content });
          break;
        case 'analyzeContent':
          const analysis = await this.analyzeContent(request.content, sender.tab.id);
          sendResponse({ success: true, data: analysis });
          break;
        case 'getCedarStore':
          sendResponse({ success: true, data: this.cedarStore });
          break;
        case 'clearMessages':
          this.cedarStore.clearMessages();
          sendResponse({ success: true });
          break;
        case 'triggerAnalysis':
          const autoAnalysis = await this.analyzeContent(request.content, sender.tab.id);
          // Send analysis to content script
          chrome.tabs.sendMessage(sender.tab.id, {
            action: 'updateInsights',
            data: autoAnalysis
          });
          sendResponse({ success: true, data: autoAnalysis });
          break;
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async handleListeningStateChange(isListening, tabId) {
    this.isListening = isListening;
    
    // Notify content script of state change
    try {
      await chrome.tabs.sendMessage(tabId, {
        action: 'listeningStateChanged',
        isListening: isListening
      });
    } catch (error) {
      console.error('Error sending listening state change:', error);
    }
  }

  async processVoiceInput(text, tabId) {
    console.log('Processing voice input:', text);
    
    try {
      // Get current tab content for context
      const tabContent = await this.getTabContent(tabId);
      
      // Process with OpenAI directly (simplified approach)
      const voiceResponse = await this.processWithOpenAI('voice', {
        transcript: text,
        context: tabContent
      });
      
      // If voice processing indicates content analysis needed, trigger it
      if (voiceResponse.intent && voiceResponse.intent.includes('analyze')) {
        const analysisResponse = await this.analyzeContent(tabContent, tabId);
        
        return {
          originalText: text,
          voiceResponse: voiceResponse,
          analysisResponse: analysisResponse,
          context: tabContent,
          timestamp: Date.now()
        };
      }
      
      return {
        originalText: text,
        voiceResponse: voiceResponse,
        context: tabContent,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Error processing voice input:', error);
      return {
        originalText: text,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  async processWithOpenAI(type, data) {
    if (!this.apiConfig?.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let prompt = '';
    if (type === 'voice') {
      prompt = `You are a voice command processing AI. User said: "${data.transcript}". Current web content: "${data.context?.text?.substring(0, 200)}...". Determine the user's intent and if content analysis is required. Respond in JSON format with 'intent' and 'action' fields.`;
    } else if (type === 'content') {
      prompt = `Analyze this web content: "${data.content?.text?.substring(0, 1000)}...". Provide a concise summary, 2-3 key insights, and 3-4 suggested actions related to the content. Respond in JSON format.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiConfig.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant. Always respond in valid JSON format.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    
    try {
      return JSON.parse(content);
    } catch (error) {
      // If JSON parsing fails, return structured response
      return {
        intent: type === 'voice' ? 'analyze' : 'content_analysis',
        summary: content,
        insights: ['Analysis completed'],
        actions: ['View details', 'Ask follow-up', 'Save insights']
      };
    }
  }

  async getTabContent(tabId) {
    try {
      // Inject script to extract page content
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          return {
            url: window.location.href,
            title: document.title,
            text: document.body.innerText,
            html: document.body.innerHTML
          };
        }
      });
      
      return results[0]?.result || null;
    } catch (error) {
      console.error('Error getting tab content:', error);
      return null;
    }
  }

  async analyzeContent(content, tabId) {
    console.log('Analyzing content for tab:', tabId);
    
    try {
      // Process with OpenAI directly
      const analysisResponse = await this.processWithOpenAI('content', {
        content: content
      });
      
      // Update Cedar store with the analysis
      this.cedarStore.addMessage(analysisResponse);
      
      return {
        summary: analysisResponse.summary || 'Content analyzed successfully',
        insights: analysisResponse.insights || ['Analyzing content for insights...'],
        actions: analysisResponse.actions || ['Suggested actions will appear here'],
        confidence: 0.8,
        sources: [{ name: 'Web Content', url: content?.url || 'Unknown' }],
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Error analyzing content:', error);
      return {
        summary: 'Error analyzing content',
        insights: ['Unable to analyze content at this time'],
        actions: ['Please try again'],
        confidence: 0.1,
        sources: [],
        timestamp: Date.now()
      };
    }
  }

  async toggleOverlay(tabId) {
    try {
      // Send message to content script to toggle overlay
      await chrome.tabs.sendMessage(tabId, {
        action: 'toggleOverlay'
      });
    } catch (error) {
      console.error('Error toggling overlay:', error);
    }
  }
}

// Initialize background script
new PrismAIBackground();