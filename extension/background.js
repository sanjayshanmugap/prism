// Prism AI Overlay Background Script
// Handles voice recognition, AI processing, and communication with content scripts

class PrismAIBackground {
  constructor() {
    this.isListening = false;
    this.recognition = null;
    this.init();
  }

  init() {
    // Initialize speech recognition
    this.setupSpeechRecognition();
    
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
    chrome.tabs.sendMessage(tabId, {
      action: 'listeningStateChanged',
      isListening: isListening
    });
  }

  async processVoiceInput(text, tabId) {
    console.log('Processing voice input:', text);
    
    // Get current tab content for context
    const tabContent = await this.getTabContent(tabId);
    
    // TODO: Integrate with CedarOS + Mastra for AI processing
    // This is where we'll add the OpenAI integration
    
    return {
      originalText: text,
      processedText: text,
      context: tabContent,
      timestamp: Date.now()
    };
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
    
    // TODO: Integrate with CedarOS + Mastra for content analysis
    // This will be where we implement the AI analysis and summarization
    
    return {
      summary: 'Content analysis will be implemented with CedarOS + Mastra',
      insights: ['AI insights will be generated here'],
      actions: ['Suggested actions will appear here'],
      timestamp: Date.now()
    };
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
