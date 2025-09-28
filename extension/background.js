// Prism AI Overlay Background Script
// Handles voice recognition, AI processing, and communication with content scripts
// Integrated with CedarOS + Mastra for AI functionality

import { mastraConfig, processAgentResponse, createCedarStore } from './backend/mastra-config.js';

class PrismAIBackground {
  constructor() {
    this.isListening = false;
    this.recognition = null;
    this.cedarStore = createCedarStore();
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
    chrome.tabs.sendMessage(tabId, {
      action: 'listeningStateChanged',
      isListening: isListening
    });
  }

  async processVoiceInput(text, tabId) {
    console.log('Processing voice input:', text);
    
    try {
      // Get current tab content for context
      const tabContent = await this.getTabContent(tabId);
      
      // Process with CedarOS + Mastra voice agent
      const voiceResponse = await processAgentResponse('voiceProcessing', {
        transcript: text,
        additionalContext: {
          webContent: tabContent,
          tabId: tabId
        }
      });
      
      // If voice processing indicates content analysis needed, trigger it
      if (voiceResponse.action?.type === 'content_analysis') {
        const analysisResponse = await processAgentResponse('contentAnalysis', {
          prompt: text,
          additionalContext: {
            webContent: tabContent,
            voiceIntent: voiceResponse.intent
          }
        });
        
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
      // Process with CedarOS + Mastra content analysis agent
      const analysisResponse = await processAgentResponse('contentAnalysis', {
        prompt: 'Analyze this web content and provide insights',
        additionalContext: {
          webContent: content,
          tabId: tabId
        }
      });
      
      // Update Cedar store with the analysis
      this.cedarStore.addMessage(analysisResponse);
      
      return {
        summary: analysisResponse.content || 'Content analyzed successfully',
        insights: analysisResponse.insights || ['Analyzing content for insights...'],
        actions: analysisResponse.actions || ['Suggested actions will appear here'],
        confidence: analysisResponse.confidence || 0.8,
        sources: analysisResponse.sources || [],
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Error analyzing content:', error);
      return {
        summary: 'Error analyzing content',
        insights: ['Unable to analyze content at this time'],
        actions: ['Please try again'],
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
