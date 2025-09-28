// Prism AI Overlay Content Script
// Injects the overlay components into web pages

class PrismAIOverlay {
  constructor() {
    this.overlay = null;
    this.isVisible = false;
    this.isListening = false;
    this.isMinimized = false;
    this.cedarStore = {
      messages: [],
      isProcessing: false,
      currentInsights: [],
      currentActions: []
    };
    this.init();
  }

  init() {
    console.log('Prism AI Overlay: Initializing content script');
    
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createOverlay());
    } else {
      this.createOverlay();
    }

    // Listen for messages from background script and popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sendResponse);
      return true; // Keep message channel open
    });

    // Handle extension context invalidation
    chrome.runtime.onConnect.addListener((port) => {
      port.onDisconnect.addListener(() => {
        console.log('Extension context invalidated');
      });
    });

    // Add keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  createOverlay() {
    console.log('Prism AI Overlay: Creating overlay');
    
    // Check if overlay already exists
    if (document.getElementById('prism-ai-overlay')) {
      console.log('Prism AI Overlay: Overlay already exists');
      return;
    }

    // Create main overlay container
    this.overlay = document.createElement('div');
    this.overlay.id = 'prism-ai-overlay';
    this.overlay.className = 'prism-hidden prism-overlay-container';
    
    // Detect background brightness and add appropriate class
    this.detectBackgroundBrightness();
    
    // Inject overlay HTML
    this.overlay.innerHTML = this.getOverlayHTML();
    
    // Add to page
    document.body.appendChild(this.overlay);
    
    // Bind event listeners
    this.bindEventListeners();
    
    console.log('Prism AI Overlay: Overlay created and added to page');
  }

  detectBackgroundBrightness() {
    // Simple background detection
    const bodyStyles = window.getComputedStyle(document.body);
    const bgColor = bodyStyles.backgroundColor;
    
    // Check if background is light
    let hasLightBackground = false;
    
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
      const rgb = bgColor.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        const brightness = (parseInt(rgb[0]) + parseInt(rgb[1]) + parseInt(rgb[2])) / 3;
        hasLightBackground = brightness > 128;
      }
    }
    
    // Also check for common light backgrounds
    const lightSelectors = [
      'body[style*="background-color: white"]',
      'body[style*="background-color: #fff"]',
      'body[style*="background-color: #ffffff"]',
      '.bg-white', '.bg-gray-50', '.bg-gray-100'
    ];
    
    lightSelectors.forEach(selector => {
      if (document.querySelector(selector)) {
        hasLightBackground = true;
      }
    });
    
    if (hasLightBackground) {
      this.overlay.classList.add('light-background');
    }
  }

  getOverlayHTML() {
    return `
      <div class="glass-panel prism-overlay-main">
        <!-- Control Bar -->
        <div class="prism-control-bar">
          <div class="prism-flex prism-items-center prism-gap-3">
            <!-- Play/Pause Button -->
            <button class="prism-action-button" id="prism-play-btn">
              <svg class="prism-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-4a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </button>

            <!-- Voice Waveform -->
            <div class="prism-voice-waveform" id="prism-waveform">
              <div class="prism-wave-bar"></div>
              <div class="prism-wave-bar"></div>
              <div class="prism-wave-bar"></div>
              <div class="prism-wave-bar"></div>
              <div class="prism-wave-bar"></div>
            </div>

            <!-- Timer -->
            <div class="prism-timer">00:00</div>

            <!-- Ask AI Button -->
            <button class="prism-button prism-button-ask-ai" id="prism-ask-ai">
              <svg class="prism-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              Ask AI
            </button>

            <!-- Show/Hide Toggle -->
            <button class="prism-button prism-button-ghost" id="prism-toggle-btn">
              <svg class="prism-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>

          <!-- Keyboard Shortcuts -->
          <div class="prism-shortcuts">
            <span class="prism-badge">⌘ ⇧</span>
            <span class="prism-badge">⌘ \\</span>
          </div>
        </div>

        <!-- Main Content -->
        <div class="prism-main-content" id="prism-main-content">
          <!-- Live Insights Panel -->
          <div class="prism-panel" id="prism-insights">
            <div class="glass-panel prism-space-y-4">
              <!-- Header -->
              <div class="prism-flex prism-items-center prism-justify-between">
                <div class="prism-flex prism-items-center prism-gap-2">
                  <div class="prism-status-dot prism-bg-blue-500 prism-animate-pulse"></div>
                  <h3 class="prism-text-white prism-font-semibold">Live insights</h3>
                </div>
                <button class="prism-button prism-button-ghost">
                  <svg class="prism-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                  </svg>
                </button>
              </div>

              <!-- Content Analysis Status -->
              <div class="prism-content-analysis">
                <div class="prism-flex prism-items-center prism-gap-2 prism-mb-3">
                  <div class="prism-status-dot prism-bg-green-500"></div>
                  <span class="prism-text-white-80 prism-text-sm">Content Analysis</span>
                </div>

                <!-- Insights List -->
                <div class="prism-insights-list" id="prism-insights-list">
                  <div class="prism-insight-item">
                    <div class="prism-flex prism-items-center prism-gap-2">
                      <div class="prism-topic-dot prism-bg-blue-500"></div>
                      <span class="prism-text-white-90 prism-text-sm">Analyzing content...</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="prism-actions">
                <h4 class="prism-text-white-80 prism-text-xs prism-font-semibold prism-mb-2">Actions</h4>
                <div class="prism-actions-grid" id="prism-actions-grid">
                  <button class="prism-action-button active">
                    <svg class="prism-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span class="prism-text-sm">Get insights</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Response Panel -->
          <div class="prism-panel" id="prism-ai-response">
            <div class="glass-panel prism-space-y-4">
              <!-- Header -->
              <div class="prism-flex prism-items-center prism-justify-between">
                <div class="prism-flex prism-items-center prism-gap-2">
                  <div class="prism-status-dot prism-bg-red-500 prism-animate-pulse"></div>
                  <h3 class="prism-text-white prism-font-semibold">AI response</h3>
                </div>
                <div class="prism-flex prism-items-center prism-gap-2">
                  <button class="prism-button prism-button-ghost">
                    <svg class="prism-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                  </button>
                  <button class="prism-button prism-button-ghost">
                    <svg class="prism-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Question -->
              <div class="prism-question-bg prism-rounded-lg prism-p-3">
                <p class="prism-text-white-90 prism-text-sm">What are the differences between EBITDA and net income?</p>
              </div>

              <!-- Response -->
              <div class="prism-space-y-3">
                <div class="prism-text-white-90 prism-text-sm prism-leading-relaxed" id="prism-ai-text">
                  EBITDA is earnings before interest, taxes, depreciation, and amortization. Net income is profit after all expenses are deducted, giving a more complete picture of profitability.
                </div>

                <div class="prism-flex prism-items-center prism-gap-2 prism-pt-2">
                  <div class="prism-confidence-badge prism-badge">95% confidence</div>
                  <button class="prism-button prism-text-xs">
                    <svg class="prism-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    View sources
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEventListeners() {
    // Play/Pause button
    document.getElementById('prism-play-btn')?.addEventListener('click', () => {
      this.toggleListening();
    });

    // Ask AI button
    document.getElementById('prism-ask-ai')?.addEventListener('click', () => {
      this.triggerAnalysis();
    });

    // Toggle visibility button
    document.getElementById('prism-toggle-btn')?.addEventListener('click', () => {
      this.toggleMinimize();
    });

    // Microphone button (if exists)
    document.getElementById('prism-mic-btn')?.addEventListener('click', () => {
      this.toggleListening();
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + Shift - Toggle listening
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Shift') {
        e.preventDefault();
        this.toggleListening();
      }
      
      // Cmd/Ctrl + Backslash - Toggle overlay
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        this.toggleVisibility();
      }
    });
  }

  async handleMessage(request, sendResponse) {
    try {
      console.log('Prism AI Overlay: Handling message:', request.action);
      
      switch (request.action) {
        case 'toggleOverlay':
          this.toggleVisibility();
          sendResponse({ success: true });
          break;
        case 'toggleListening':
          this.toggleListening();
          sendResponse({ success: true });
          break;
        case 'updateInsights':
          await this.updateInsights(request.data);
          sendResponse({ success: true });
          break;
        case 'updateAIResponse':
          await this.updateAIResponse(request.data);
          sendResponse({ success: true });
          break;
        case 'triggerAutoAnalysis':
          await this.triggerAutoAnalysis();
          sendResponse({ success: true });
          break;
        case 'performWebSearch':
          await this.performWebSearch(request.query, request.context);
          sendResponse({ success: true });
          break;
        case 'getCedarStore':
          sendResponse({ success: true, data: this.cedarStore });
          break;
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Content script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // Safe message sending with error handling
  async sendMessageSafely(message) {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      console.error('Extension context error:', error);
      return {
        success: false,
        error: 'Extension context invalidated',
        fallback: true
      };
    }
  }

  toggleVisibility() {
    console.log('Prism AI Overlay: Toggling visibility');
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.overlay.classList.remove('prism-hidden');
      // Trigger auto-analysis after a short delay
      setTimeout(() => {
        this.triggerAutoAnalysis();
      }, 500);
    } else {
      this.overlay.classList.add('prism-hidden');
    }
  }

  toggleListening() {
    console.log('Prism AI Overlay: Toggling listening');
    this.isListening = !this.isListening;
    
    const micBtn = document.getElementById('prism-mic-btn') || document.getElementById('prism-play-btn');
    const waveform = document.getElementById('prism-waveform');
    
    if (this.isListening) {
      micBtn?.classList.add('listening-pulse');
      micBtn?.classList.remove('pulse-glow');
      waveform?.classList.remove('prism-hidden');
      this.startVoiceRecognition();
    } else {
      micBtn?.classList.remove('listening-pulse');
      micBtn?.classList.add('pulse-glow');
      waveform?.classList.add('prism-hidden');
      this.stopVoiceRecognition();
    }
    
    // Notify background script
    this.sendMessageSafely({
      action: 'listeningStateChanged',
      isListening: this.isListening
    });
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    const mainContent = document.getElementById('prism-main-content');
    const toggleBtn = document.getElementById('prism-toggle-btn');
    
    if (this.isMinimized) {
      mainContent?.classList.add('prism-hidden');
      toggleBtn?.querySelector('svg')?.setAttribute('d', 'M19 9l-7 7-7-7');
    } else {
      mainContent?.classList.remove('prism-hidden');
      toggleBtn?.querySelector('svg')?.setAttribute('d', 'M5 15l7-7 7 7');
    }
  }

  startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      console.log('Voice recognition started');
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        console.log('Voice input:', finalTranscript);
        this.processVoiceInput(finalTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.start();
  }

  stopVoiceRecognition() {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }

  async processVoiceInput(text) {
    console.log('Processing voice input:', text);
    
    try {
      const response = await this.sendMessageSafely({
        action: 'processVoiceInput',
        text: text
      });
      
      if (response.success && response.data) {
        await this.updateAIResponse(response.data);
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
    }
  }

  async triggerAutoAnalysis() {
    console.log('Prism AI Overlay: Triggering auto-analysis');
    
    try {
      const response = await this.sendMessageSafely({
        action: 'triggerAnalysis',
        content: {
          url: window.location.href,
          title: document.title,
          text: document.body.innerText
        }
      });
      
      if (response.success && response.data) {
        await this.updateInsights(response.data);
        await this.updateAIResponse(response.data);
      }
    } catch (error) {
      console.error('Error triggering analysis:', error);
    }
  }

  async updateInsights(data) {
    console.log('Updating insights:', data);
    
    const insightsList = document.getElementById('prism-insights-list');
    const actionsGrid = document.getElementById('prism-actions-grid');
    
    if (insightsList && data.insights) {
      insightsList.innerHTML = data.insights.map(insight => `
        <div class="prism-insight-item">
          <div class="prism-flex prism-items-center prism-gap-2">
            <div class="prism-topic-dot prism-bg-blue-500"></div>
            <span class="prism-text-white-90 prism-text-sm">${insight}</span>
          </div>
        </div>
      `).join('');
    }
    
    if (actionsGrid && data.actions) {
      actionsGrid.innerHTML = data.actions.map(action => `
        <button class="prism-action-button active">
          <svg class="prism-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span class="prism-text-sm">${action}</span>
        </button>
      `).join('');
    }
  }

  async updateAIResponse(data) {
    console.log('Updating AI response:', data);
    
    const aiText = document.getElementById('prism-ai-text');
    const confidenceBadge = document.querySelector('.prism-confidence-badge');
    
    if (aiText && data.summary) {
      aiText.textContent = data.summary;
    }
    
    if (confidenceBadge && data.confidence) {
      confidenceBadge.textContent = `${Math.round(data.confidence * 100)}% confidence`;
    }
  }

  async performWebSearch(query, context) {
    console.log('Prism AI Overlay: Performing web search for:', query);
    
    try {
      const response = await this.sendMessageSafely({
        action: 'webSearch',
        query: query,
        context: context
      });
      
      if (response.success && response.data) {
        await this.updateAIResponse(response.data);
        await this.updateInsights({
          insights: [`Web search completed for: ${query}`],
          actions: response.data.sources?.map(source => `View: ${source.title}`) || []
        });
      }
    } catch (error) {
      console.error('Error performing web search:', error);
    }
  }

  updateListeningState(isListening) {
    this.isListening = isListening;
    const micBtn = document.getElementById('prism-mic-btn') || document.getElementById('prism-play-btn');
    const waveform = document.getElementById('prism-waveform');
    
    if (isListening) {
      micBtn?.classList.add('listening-pulse');
      micBtn?.classList.remove('pulse-glow');
      waveform?.classList.remove('prism-hidden');
    } else {
      micBtn?.classList.remove('listening-pulse');
      micBtn?.classList.add('pulse-glow');
      waveform?.classList.add('prism-hidden');
    }
  }
}

// Initialize overlay
console.log('Prism AI Overlay: Loading content script');
new PrismAIOverlay();