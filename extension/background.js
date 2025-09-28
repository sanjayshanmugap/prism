// Prism AI Overlay Background Script
// Handles AI processing and communication with content scripts

class PrismAIBackground {
  constructor() {
    this.isListening = false;
    this.apiConfig = null;
    this.cedarStore = this.createCedarStore();
    this.init();
  }

  async init() {
    console.log('Prism AI Background: Initializing');
    
    // Load API configuration
    await this.loadApiConfig();
    
    // Listen for messages from content scripts and popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Handle extension icon click
    chrome.action.onClicked.addListener((tab) => {
      this.toggleOverlay(tab.id);
    });

    console.log('Prism AI Background: Initialized successfully');
  }

  async loadApiConfig() {
    try {
      // Load API configuration from the config file
      const response = await fetch(chrome.runtime.getURL('config/api-config.js'));
      const configText = await response.text();
      
      // Extract API keys from config (simple regex approach)
      const openaiKeyMatch = configText.match(/openaiApiKey:\s*['"`]([^'"`]+)['"`]/);
      const perplexityKeyMatch = configText.match(/perplexityApiKey:\s*['"`]([^'"`]+)['"`]/);
      
      this.apiConfig = {
        openaiApiKey: openaiKeyMatch ? openaiKeyMatch[1] : null,
        perplexityApiKey: perplexityKeyMatch ? perplexityKeyMatch[1] : null
      };
      
      console.log('Prism AI Background: API config loaded', {
        openai: !!this.apiConfig.openaiApiKey,
        perplexity: !!this.apiConfig.perplexityApiKey
      });
    } catch (error) {
      console.error('Error loading API config:', error);
      this.apiConfig = { openaiApiKey: null, perplexityApiKey: null };
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

  async handleMessage(request, sender, sendResponse) {
    try {
      console.log('Prism AI Background: Handling message:', request.action);
      
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
          try {
            await chrome.tabs.sendMessage(sender.tab.id, {
              action: 'updateInsights',
              data: autoAnalysis
            });
          } catch (error) {
            console.error('Error sending analysis to content script:', error);
          }
          sendResponse({ success: true, data: autoAnalysis });
          break;
        case 'webSearch':
          const searchResults = await this.performWebSearch(request.query, request.context, sender.tab.id);
          sendResponse({ success: true, data: searchResults });
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
    console.log('Prism AI Background: Listening state changed:', isListening);
    
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
    console.log('Prism AI Background: Processing voice input:', text);
    
    try {
      // Get current tab content for context
      const tabContent = await this.getTabContent(tabId);
      
      // Process with OpenAI directly
      const voiceResponse = await this.processWithOpenAI('voice', {
        transcript: text,
        context: tabContent
      });
      
      // If voice processing indicates content analysis needed, trigger it
      if (voiceResponse.intent && (voiceResponse.intent.includes('analyze') || voiceResponse.intent.includes('explain'))) {
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
    let systemPrompt = 'You are a helpful AI assistant. Always respond in valid JSON format.';
    
    if (type === 'voice') {
      prompt = `User said: "${data.transcript}". Current web content: "${data.context?.text?.substring(0, 200)}...". Determine the user's intent and if content analysis is required. Respond in JSON format with 'intent' and 'action' fields.`;
    } else if (type === 'content') {
      prompt = `Analyze this web content from "${data.content?.url || 'webpage'}": "${data.content?.text?.substring(0, 1000)}...". Provide a concise summary, 2-3 key insights, and 3-4 suggested actions related to the content. Respond in JSON format with 'summary', 'insights' array, and 'actions' array.`;
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    
    try {
      return JSON.parse(content);
    } catch (error) {
      // If JSON parsing fails, return structured response
      return {
        intent: type === 'voice' ? 'analyze' : 'content_analysis',
        summary: content || 'Analysis completed',
        insights: ['Analysis completed', 'Content processed'],
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
    console.log('Prism AI Background: Analyzing content for tab:', tabId);
    
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

  async performWebSearch(query, context, tabId) {
    console.log('Prism AI Background: Performing web search for:', query);
    
    if (!this.apiConfig?.perplexityApiKey) {
      return {
        query: query,
        error: 'Perplexity API key not configured',
        results: [],
        synthesis: 'Web search not available. Please configure Perplexity API key.',
        sources: [],
        confidence: 0.1,
        timestamp: Date.now()
      };
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiConfig.perplexityApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a web search specialist. Search the web for current, accurate information and provide detailed results with sources. Always include URLs and citations.'
            },
            {
              role: 'user',
              content: `Search the web for: "${query}"${context ? `\n\nContext: ${context}` : ''}\n\nPlease provide a comprehensive summary with sources and URLs.`
            }
          ],
          max_tokens: 1000,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;
      
      // Parse and structure the response
      const searchResults = this.parseSearchResponse(content, query);
      
      return {
        query: query,
        results: searchResults,
        synthesis: content,
        sources: searchResults.map(r => ({ title: r.title, url: r.url, snippet: r.snippet })),
        confidence: 0.85,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Web search error:', error);
      return {
        query: query,
        error: error.message,
        results: [],
        synthesis: 'Unable to perform web search at this time.',
        sources: [],
        confidence: 0.1,
        timestamp: Date.now()
      };
    }
  }

  parseSearchResponse(content, query) {
    const results = [];
    const lines = content.split('\n');
    
    // Simple parsing to extract URLs and content
    let currentResult = null;
    
    for (const line of lines) {
      const urlMatch = line.match(/https?:\/\/[^\s\)]+/g);
      if (urlMatch) {
        urlMatch.forEach(url => {
          if (currentResult) {
            results.push(currentResult);
          }
          currentResult = {
            url: url,
            title: this.extractTitleFromLine(line),
            snippet: line.replace(url, '').trim()
          };
        });
      } else if (currentResult && line.trim()) {
        currentResult.snippet += ' ' + line.trim();
      }
    }
    
    if (currentResult) {
      results.push(currentResult);
    }
    
    // Fallback if no structured results
    if (results.length === 0) {
      results.push({
        url: 'https://perplexity.ai',
        title: `Search results for: ${query}`,
        snippet: content.substring(0, 200)
      });
    }
    
    return results;
  }

  extractTitleFromLine(line) {
    const urlMatch = line.match(/https?:\/\/[^\s\)]+/);
    if (urlMatch) {
      const beforeUrl = line.substring(0, line.indexOf(urlMatch[0])).trim();
      if (beforeUrl) {
        return beforeUrl;
      }
    }
    return 'Search Result';
  }

  async toggleOverlay(tabId) {
    try {
      console.log('Prism AI Background: Toggling overlay for tab:', tabId);
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
console.log('Prism AI Background: Starting background script');
new PrismAIBackground();