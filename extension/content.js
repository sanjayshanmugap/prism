// Prism AI Overlay Content Script
// Injects the overlay components into web pages

class PrismAIOverlay {
  constructor() {
    this.overlay = null;
    this.isVisible = false;
    this.isListening = false;
    this.isMinimized = false;
    this.init();
  }

  init() {
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createOverlay());
    } else {
      this.createOverlay();
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sendResponse);
    });
  }

  createOverlay() {
    // Create main overlay container
    this.overlay = document.createElement('div');
    this.overlay.id = 'prism-ai-overlay';
    this.overlay.className = 'prism-hidden prism-overlay-container';
    
    // Detect background brightness and add appropriate class
    this.detectBackgroundBrightness();
    
    // Inject overlay HTML
    this.overlay.innerHTML = this.getOverlayHTML();
    
    // Append to body
    document.body.appendChild(this.overlay);
    
    // Bind event listeners
    this.bindEventListeners();
  }

  detectBackgroundBrightness() {
    // Sample background color from different parts of the page
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1;
    canvas.height = 1;
    
    // Try to get background color from body
    const bodyStyle = window.getComputedStyle(document.body);
    const bgColor = bodyStyle.backgroundColor;
    
    // If we can't get a good sample, check if the page has light colors
    const hasLightBackground = this.checkForLightBackground();
    
    if (hasLightBackground) {
      this.overlay.classList.add('light-background');
    }
  }

  checkForLightBackground() {
    // Check common indicators of light backgrounds
    const body = document.body;
    const html = document.documentElement;
    
    // Check computed styles
    const bodyBg = window.getComputedStyle(body).backgroundColor;
    const htmlBg = window.getComputedStyle(html).backgroundColor;
    
    // Check for light color keywords or high RGB values
    const lightKeywords = ['white', 'light', '#fff', '#ffffff', 'rgb(255', 'rgba(255'];
    const bodyIsLight = lightKeywords.some(keyword => 
      bodyBg.toLowerCase().includes(keyword)
    );
    const htmlIsLight = lightKeywords.some(keyword => 
      htmlBg.toLowerCase().includes(keyword)
    );
    
    // Check for light theme indicators in classes
    const lightClasses = ['light', 'white', 'bg-white', 'bg-light'];
    const hasLightClass = lightClasses.some(className => 
      body.classList.contains(className) || html.classList.contains(className)
    );
    
    return bodyIsLight || htmlIsLight || hasLightClass;
  }

  getOverlayHTML() {
    return `
      <!-- Control Bar -->
      <div class="prism-control-bar">
        <div class="glass-panel">
          <!-- Play/Pause -->
          <button class="prism-button" id="prism-play-pause">
            <svg class="prism-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button>

          <!-- Voice Waveform (shown when listening) -->
          <div class="prism-voice-waveform prism-hidden" id="prism-waveform">
            <div class="prism-flex prism-gap-1">
              <div class="prism-w-1 prism-h-4 prism-bg-blue-400 prism-rounded-full waveform-bar"></div>
              <div class="prism-w-1 prism-h-3 prism-bg-blue-400 prism-rounded-full waveform-bar" style="animation-delay: 0.1s"></div>
              <div class="prism-w-1 prism-h-5 prism-bg-blue-400 prism-rounded-full waveform-bar" style="animation-delay: 0.2s"></div>
              <div class="prism-w-1 prism-h-2 prism-bg-blue-400 prism-rounded-full waveform-bar" style="animation-delay: 0.3s"></div>
              <div class="prism-w-1 prism-h-4 prism-bg-blue-400 prism-rounded-full waveform-bar" style="animation-delay: 0.4s"></div>
            </div>
          </div>

          <!-- Timer -->
          <div class="prism-text-white prism-text-sm prism-font-mono" id="prism-timer">00:18</div>

          <!-- Ask AI Button -->
          <button class="prism-button ask-ai" id="prism-ask-ai">
            Ask AI
          </button>

          <!-- Keyboard Shortcut -->
          <div class="prism-badge">⌘ ⇧</div>

          <!-- Show/Hide Toggle -->
          <button class="prism-button" id="prism-show-hide">
            <span class="prism-text-sm prism-mr-2">Show/Hide</span>
            <svg class="prism-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
          </button>

          <!-- Keyboard Shortcut -->
          <div class="prism-badge">⌘ \\</div>
        </div>
      </div>

      <!-- Main Overlay Panels -->
      <div class="prism-overlay-panels">
        <!-- Live Insights Panel -->
        <div class="prism-panel" id="prism-live-insights">
          <div class="glass-panel prism-space-y-6">
            <!-- Header -->
            <div class="prism-flex prism-items-center prism-gap-3">
              <svg class="prism-icon-lg prism-text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              <h3 class="prism-text-white prism-font-semibold">Live insights</h3>
              <div class="prism-flex prism-items-center prism-gap-2 prism-ml-auto">
                <button class="prism-button ghost">
                  <svg class="prism-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span class="prism-ml-1 prism-text-sm">Show transcript</span>
                </button>
                <button class="prism-button ghost">
                  <svg class="prism-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Current Topic -->
            <div class="prism-space-y-3">
              <h4 class="prism-text-white prism-font-medium">Financial terms discussion</h4>
              <div class="prism-space-y-2">
                <div class="prism-flex prism-items-start prism-gap-2">
                  <div class="prism-status-dot prism-bg-orange-400 prism-mt-2 prism-flex-shrink-0"></div>
                  <p class="prism-text-white-80 prism-text-sm prism-leading-relaxed">The conversation is shifting towards a discussion of common financial terms.</p>
                </div>
                <div class="prism-flex prism-items-start prism-gap-2">
                  <div class="prism-status-dot prism-bg-orange-400 prism-mt-2 prism-flex-shrink-0"></div>
                  <p class="prism-text-white-80 prism-text-sm prism-leading-relaxed">You were asked to explain the difference between EBITDA and net income.</p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="prism-space-y-3">
              <h4 class="prism-text-white prism-font-medium">Actions</h4>
              <div class="prism-space-y-2">
                <button class="prism-action-button">
                  <svg class="prism-icon prism-flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span class="prism-text-sm">Define EBITDA</span>
                </button>
                <button class="prism-action-button active">
                  <svg class="prism-icon prism-flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="prism-text-sm">What are the differences between EBITDA and net income?</span>
                </button>
                <button class="prism-action-button">
                  <svg class="prism-icon prism-flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  <span class="prism-text-sm">Suggest follow-up questions</span>
                </button>
                <button class="prism-action-button">
                  <svg class="prism-icon prism-flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <span class="prism-text-sm">What should I say next?</span>
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
          <button class="prism-button ghost">
            <svg class="prism-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          </button>
          <button class="prism-button ghost">
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
                  <span class="prism-mr-1">Sources</span>
                </button>
              </div>
            </div>

            <!-- Related Topics -->
            <div class="prism-space-y-2 prism-pt-2 border-t prism-border-overlay-10">
              <p class="prism-text-white-60 prism-text-xs prism-font-medium">Related topics</p>
              <div class="prism-flex prism-flex-wrap prism-gap-2">
                <button class="prism-topic-button">
                  Financial metrics
                </button>
                <button class="prism-topic-button">
                  Profitability analysis
                </button>
                <button class="prism-topic-button">
                  Cash flow
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Minimize/Maximize Control -->
      <div class="prism-minimize-control">
        <button class="prism-button" id="prism-minimize-toggle">
          <svg class="prism-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" id="prism-minimize-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
          </svg>
        </button>
      </div>

      <!-- Floating Microphone Button -->
      <div class="prism-mic-button">
        <button class="prism-w-16 prism-h-16 prism-rounded-full prism-transition-all prism-duration-300 prism-border-2 pulse-glow" id="prism-mic-main">
          <svg class="prism-icon-xl prism-text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" id="prism-mic-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
          </svg>
        </button>

        <!-- Tooltip -->
        <div class="prism-tooltip prism-hidden" id="prism-mic-tooltip">
          <div class="glass-panel prism-rounded-lg prism-px-3 prism-py-2 prism-whitespace-nowrap">
            <p class="prism-text-white prism-text-sm">Say "Hey Prism" or click to start</p>
          </div>
        </div>
      </div>
    `;
  }

  bindEventListeners() {
    // Show/Hide toggle
    const showHideBtn = this.overlay.querySelector('#prism-show-hide');
    showHideBtn?.addEventListener('click', () => this.toggleVisibility());

    // Ask AI button
    const askAiBtn = this.overlay.querySelector('#prism-ask-ai');
    askAiBtn?.addEventListener('click', () => this.toggleListening());

    // Minimize toggle
    const minimizeBtn = this.overlay.querySelector('#prism-minimize-toggle');
    minimizeBtn?.addEventListener('click', () => this.toggleMinimize());

    // Microphone button
    const micBtn = this.overlay.querySelector('#prism-mic-main');
    micBtn?.addEventListener('click', () => {
      this.toggleListening();
      this.showOverlay();
    });

    // Microphone hover
    micBtn?.addEventListener('mouseenter', () => this.showMicTooltip());
    micBtn?.addEventListener('mouseleave', () => this.hideMicTooltip());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  handleKeydown(e) {
    // Cmd/Ctrl + Shift - Toggle listening
    if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
      e.preventDefault();
      this.toggleListening();
    }
    
    // Cmd/Ctrl + Backslash - Toggle visibility
    if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
      e.preventDefault();
      this.toggleVisibility();
    }
  }

  handleMessage(request, sendResponse) {
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
        this.updateInsights(request.data);
        sendResponse({ success: true });
        break;
      case 'updateAIResponse':
        this.updateAIResponse(request.data);
        sendResponse({ success: true });
        break;
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.overlay.classList.remove('prism-hidden');
    } else {
      this.overlay.classList.add('prism-hidden');
    }
  }

  showOverlay() {
    if (!this.isVisible) {
      this.toggleVisibility();
    }
  }

  toggleListening() {
    this.isListening = !this.isListening;
    
    const askAiBtn = this.overlay.querySelector('#prism-ask-ai');
    const micBtn = this.overlay.querySelector('#prism-mic-main');
    const waveform = this.overlay.querySelector('#prism-waveform');
    
    if (this.isListening) {
      askAiBtn?.classList.add('listening');
      micBtn?.classList.add('listening-pulse');
      micBtn?.classList.remove('pulse-glow');
      waveform?.classList.remove('prism-hidden');
    } else {
      askAiBtn?.classList.remove('listening');
      micBtn?.classList.remove('listening-pulse');
      micBtn?.classList.add('pulse-glow');
      waveform?.classList.add('prism-hidden');
    }
    
    // Notify background script
    chrome.runtime.sendMessage({
      action: 'listeningStateChanged',
      isListening: this.isListening
    });
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    
    const panels = this.overlay.querySelectorAll('.prism-panel');
    const icon = this.overlay.querySelector('#prism-minimize-icon');
    
    panels.forEach(panel => {
      if (this.isMinimized) {
        panel.classList.add('minimized');
      } else {
        panel.classList.remove('minimized');
      }
    });
    
    // Update icon
    if (this.isMinimized) {
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>';
    } else {
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>';
    }
  }

  showMicTooltip() {
    const tooltip = this.overlay.querySelector('#prism-mic-tooltip');
    const tooltipText = tooltip?.querySelector('p');
    
    if (tooltip && tooltipText) {
      tooltipText.textContent = this.isListening ? "Stop listening" : 'Say "Hey Prism" or click to start';
      tooltip.classList.remove('prism-hidden');
    }
  }

  hideMicTooltip() {
    const tooltip = this.overlay.querySelector('#prism-mic-tooltip');
    tooltip?.classList.add('prism-hidden');
  }

  updateInsights(data) {
    // Update live insights panel with new data
    console.log('Updating insights:', data);
  }

  updateAIResponse(data) {
    // Update AI response panel with new data
    console.log('Updating AI response:', data);
  }
}

// Initialize overlay when script loads
new PrismAIOverlay();
