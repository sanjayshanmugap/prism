// Content script for Prism AI Extension
// This script injects the Prism overlay into web pages and analyzes page content

class PrismContentScript {
  constructor() {
    this.isOverlayVisible = false;
    this.isListening = false;
    this.overlayContainer = null;
    this.settings = {};
    this.pageContent = "";
    this.aiInsights = [];
    this.isAnalyzing = false;
    this.voiceAdapter = null;
    this.continuousListening = false;
    this.lastTranscript = "";
    this.init();
  }

  async init() {
    // Load settings
    await this.loadSettings();

    // Set up message listeners
    chrome.runtime.onMessage.addListener(this.onMessage.bind(this));

    // Create overlay container
    this.createOverlayContainer();

    // Set up voice recognition if enabled
    if (this.settings.hotkeyEnabled) {
      this.setupVoiceRecognition();
    }

    // Analyze current page content
    this.analyzePageContent();

    // Check if this is a video call page and auto-activate if enabled
    if (this.settings.autoActivate) {
      this.checkAutoActivation();
    }
  }

  async loadSettings() {
    try {
      this.settings = await chrome.storage.sync.get([
        "overlayEnabled",
        "isListening",
        "autoActivate",
        "hotkeyEnabled",
      ]);
    } catch (error) {
      console.error("Failed to load settings:", error);
      this.settings = {
        overlayEnabled: false,
        isListening: false,
        autoActivate: true,
        hotkeyEnabled: true,
      };
    }
  }

  onMessage(message, sender, sendResponse) {
    switch (message.action) {
      case "toggleOverlay":
        this.toggleOverlay(message.enabled);
        break;
      case "toggleListening":
        this.toggleListening(message.listening);
        break;
      case "autoActivateOverlay":
        this.autoActivateOverlay();
        break;
      case "analyzePageContent":
        this.analyzePageContent();
        sendResponse({ success: true });
        break;
      case "getPageContent":
        sendResponse({ content: this.pageContent, insights: this.aiInsights });
        break;
      case "processSelection":
        this.processSelection(message.actionType, message.selectedText);
        sendResponse({ success: true });
        break;
      case "analyzeLink":
        this.analyzeLink(message.linkUrl);
        sendResponse({ success: true });
        break;
      case "analyzeImage":
        this.analyzeImage(message.imageUrl);
        sendResponse({ success: true });
        break;
    }
  }

  analyzePageContent() {
    // Extract meaningful content from the page
    this.pageContent = this.extractPageContent();

    // Generate AI insights
    this.generateAIInsights();

    // Update overlay if visible
    if (this.isOverlayVisible) {
      this.updateInsightsPanel();
    }
  }

  extractPageContent() {
    // Remove script, style, and other non-content elements
    const elementsToRemove = [
      "script",
      "style",
      "nav",
      "footer",
      "header",
      "aside",
    ];
    const contentElements = document.body.cloneNode(true);

    elementsToRemove.forEach((tag) => {
      const elements = contentElements.getElementsByTagName(tag);
      for (let i = elements.length - 1; i >= 0; i--) {
        elements[i].parentNode.removeChild(elements[i]);
      }
    });

    // Extract text content
    let text = contentElements.textContent || contentElements.innerText || "";

    // Clean up whitespace
    text = text.replace(/\s+/g, " ").trim();

    // Get page title and URL
    const title = document.title;
    const url = window.location.href;

    // Get meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const description = metaDescription
      ? metaDescription.getAttribute("content")
      : "";

    return {
      title,
      url,
      description,
      text: text.substring(0, 5000), // Limit to first 5000 characters
      wordCount: text.split(" ").length,
      timestamp: new Date().toISOString(),
    };
  }

  generateAIInsights() {
    const content = this.pageContent;
    this.aiInsights = [];

    // Basic content analysis
    if (content.text) {
      // Reading time estimation
      const wordsPerMinute = 200;
      const readingTime = Math.ceil(content.wordCount / wordsPerMinute);
      this.aiInsights.push({
        type: "reading_time",
        icon: "📖",
        title: `${readingTime} min read`,
        description: `Estimated reading time based on ${content.wordCount} words`,
      });

      // Content type detection
      const contentType = this.detectContentType(content);
      this.aiInsights.push({
        type: "content_type",
        icon: contentType.icon,
        title: contentType.type,
        description: contentType.description,
      });

      // Key topics extraction (simple keyword analysis)
      const topics = this.extractKeyTopics(content.text);
      if (topics.length > 0) {
        this.aiInsights.push({
          type: "topics",
          icon: "🏷️",
          title: "Key Topics",
          description: topics.slice(0, 3).join(", "),
        });
      }

      // Page sentiment analysis (basic)
      const sentiment = this.analyzeSentiment(content.text);
      this.aiInsights.push({
        type: "sentiment",
        icon: sentiment.icon,
        title: sentiment.label,
        description: sentiment.description,
      });

      // Actionable items detection
      const actions = this.detectActionItems(content.text);
      if (actions.length > 0) {
        this.aiInsights.push({
          type: "actions",
          icon: "✅",
          title: `${actions.length} Action Items`,
          description: actions[0].substring(0, 60) + "...",
        });
      }
    }
  }

  detectContentType(content) {
    const text = content.text.toLowerCase();
    const title = content.title.toLowerCase();
    const url = content.url.toLowerCase();

    if (
      url.includes("github.com") ||
      text.includes("repository") ||
      text.includes("commit")
    ) {
      return {
        type: "Code Repository",
        icon: "💻",
        description: "Software development content",
      };
    }
    if (
      url.includes("stackoverflow.com") ||
      url.includes("docs.") ||
      text.includes("documentation")
    ) {
      return {
        type: "Documentation",
        icon: "📚",
        description: "Technical documentation or Q&A",
      };
    }
    if (
      text.includes("tutorial") ||
      text.includes("how to") ||
      text.includes("step by step")
    ) {
      return {
        type: "Tutorial",
        icon: "🎓",
        description: "Educational or instructional content",
      };
    }
    if (
      url.includes("news") ||
      url.includes("blog") ||
      text.includes("published") ||
      text.includes("author")
    ) {
      return {
        type: "Article/Blog",
        icon: "📰",
        description: "News or blog content",
      };
    }
    if (
      url.includes("product") ||
      text.includes("price") ||
      text.includes("buy now") ||
      text.includes("cart")
    ) {
      return {
        type: "E-commerce",
        icon: "🛒",
        description: "Shopping or product page",
      };
    }
    return { type: "Web Page", icon: "🌐", description: "General web content" };
  }

  extractKeyTopics(text) {
    // Simple keyword extraction based on frequency and importance
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const stopWords = [
      "that",
      "this",
      "with",
      "from",
      "they",
      "been",
      "have",
      "were",
      "said",
      "each",
      "which",
      "their",
      "time",
      "will",
      "about",
      "would",
      "there",
      "could",
      "other",
      "more",
      "very",
      "what",
      "know",
      "just",
      "first",
      "into",
      "over",
      "think",
      "also",
      "your",
      "work",
      "life",
      "only",
      "can",
      "still",
      "should",
      "after",
      "being",
      "now",
      "made",
      "before",
      "here",
      "through",
      "when",
      "where",
      "much",
      "some",
      "these",
      "many",
      "then",
      "them",
      "well",
      "were",
    ];

    const filteredWords = words.filter((word) => !stopWords.includes(word));
    const wordFreq = {};

    filteredWords.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  }

  analyzeSentiment(text) {
    const positive = [
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "fantastic",
      "love",
      "like",
      "enjoy",
      "happy",
      "best",
      "awesome",
      "perfect",
      "brilliant",
    ];
    const negative = [
      "bad",
      "terrible",
      "awful",
      "hate",
      "dislike",
      "worst",
      "horrible",
      "disappointing",
      "frustrating",
      "annoying",
      "poor",
      "difficult",
    ];

    const words = text.toLowerCase().split(/\W+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach((word) => {
      if (positive.includes(word)) positiveCount++;
      if (negative.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) {
      return {
        label: "Positive",
        icon: "😊",
        description: "Generally positive content",
      };
    } else if (negativeCount > positiveCount) {
      return {
        label: "Negative",
        icon: "😔",
        description: "Some negative sentiment detected",
      };
    }
    return {
      label: "Neutral",
      icon: "😐",
      description: "Balanced or neutral tone",
    };
  }

  detectActionItems(text) {
    const actionPatterns = [
      /\b(?:need to|should|must|have to|remember to|don't forget to)\s+([^.!?]+)/gi,
      /\b(?:todo|to do|action item|task):\s*([^.!?]+)/gi,
      /\b(?:follow up|check|review|update|contact|call|email|send)\s+([^.!?]+)/gi,
    ];

    const actions = [];
    actionPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        actions.push(...matches);
      }
    });

    return actions.slice(0, 5); // Return max 5 action items
  }

  createOverlayContainer() {
    // Create container for the overlay
    this.overlayContainer = document.createElement("div");
    this.overlayContainer.id = "prism-ai-overlay";
    this.overlayContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999999;
            pointer-events: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

    // Inject styles
    this.injectStyles();

    document.body.appendChild(this.overlayContainer);
  }

  injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
            #prism-ai-overlay {
                --glass-bg: rgba(255, 255, 255, 0.1);
                --glass-border: rgba(255, 255, 255, 0.2);
                --primary-color: #7c3aed;
                --success-color: #10b981;
                --warning-color: #f59e0b;
                --text-primary: #ffffff;
                --text-secondary: rgba(255, 255, 255, 0.7);
            }

            .prism-glass-panel {
                background: var(--glass-bg);
                backdrop-filter: blur(10px);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }

            .prism-control-bar {
                position: fixed;
                top: 24px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 1000000;
                pointer-events: auto;
                padding: 12px 24px;
                display: flex;
                align-items: center;
                gap: 16px;
                color: var(--text-primary);
            }

            .prism-button {
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
                color: var(--text-primary);
            }

            .prism-button:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .prism-button.listening {
                background: var(--warning-color);
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            .prism-mic-button {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 1000000;
                pointer-events: auto;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: var(--primary-color);
                border: none;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
                box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
            }

            .prism-mic-button:hover {
                transform: scale(1.05);
            }

            .prism-mic-button.listening {
                background: var(--warning-color);
                animation: pulse 2s infinite;
            }

            .prism-insights-panel {
                position: fixed;
                top: 80px;
                left: 24px;
                width: 320px;
                max-height: calc(100vh - 120px);
                z-index: 999999;
                pointer-events: auto;
                padding: 20px;
                color: var(--text-primary);
            }

            .prism-ai-panel {
                position: fixed;
                top: 80px;
                right: 24px;
                width: 320px;
                max-height: calc(100vh - 120px);
                z-index: 999999;
                pointer-events: auto;
                padding: 20px;
                color: var(--text-primary);
            }

            .prism-panel-title {
                font-weight: 600;
                margin-bottom: 12px;
                font-size: 14px;
            }

            .prism-insight-item {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 8px;
                font-size: 13px;
                line-height: 1.4;
            }

            .prism-waveform {
                width: 60px;
                height: 20px;
                display: flex;
                align-items: end;
                gap: 2px;
            }

            .prism-waveform-bar {
                width: 3px;
                background: var(--success-color);
                border-radius: 2px;
                animation: waveform 1.5s ease-in-out infinite;
            }

            .prism-waveform-bar:nth-child(2) { animation-delay: 0.1s; }
            .prism-waveform-bar:nth-child(3) { animation-delay: 0.2s; }
            .prism-waveform-bar:nth-child(4) { animation-delay: 0.3s; }
            .prism-waveform-bar:nth-child(5) { animation-delay: 0.4s; }

            @keyframes waveform {
                0%, 100% { height: 4px; }
                50% { height: 16px; }
            }

            .prism-hidden {
                display: none !important;
            }
        `;

    document.head.appendChild(style);
  }

  toggleOverlay(enabled) {
    this.isOverlayVisible = enabled;

    if (enabled) {
      this.showOverlay();
    } else {
      this.hideOverlay();
    }
  }

  showOverlay() {
    const insightsHtml = this.aiInsights
      .map(
        (insight) => `
            <div class="prism-insight-item">
                ${insight.icon} <strong>${insight.title}:</strong> ${insight.description}
            </div>
        `
      )
      .join("");

    this.overlayContainer.innerHTML = `
            <!-- Control Bar -->
            <div class="prism-control-bar prism-glass-panel">
                <button class="prism-button" id="prism-refresh" title="Refresh Analysis">
                    🔄
                </button>
                <div class="prism-waveform" id="prism-waveform" style="display: none;">
                    <div class="prism-waveform-bar"></div>
                    <div class="prism-waveform-bar"></div>
                    <div class="prism-waveform-bar"></div>
                    <div class="prism-waveform-bar"></div>
                    <div class="prism-waveform-bar"></div>
                </div>
                                <span style="font-size: 12px; color: var(--text-secondary);" id="prism-status">
                    ${this.isAnalyzing ? "Analyzing..." : "Ready"}
                </span>
                <div class="prism-listening-indicator" id="prism-listening-indicator" style="display: ${
                  this.isListening ? "flex" : "none"
                };">
                    <div class="prism-pulse-ring"></div>
                    <div class="prism-pulse-ring prism-pulse-ring-delay"></div>
                    🎤
                </div>
                <button class="prism-button ${
                  this.isListening ? "listening" : ""
                }" id="prism-mic-toggle" title="Toggle Microphone">
                    🎤
                </button>
                <button class="prism-button" id="prism-hide" title="Hide Overlay">
                    ❌
                </button>
            </div>

            <!-- Page Analysis Panel -->
            <div class="prism-insights-panel prism-glass-panel">
                <div class="prism-panel-title">📊 Page Analysis</div>
                <div class="prism-insight-item">
                    <strong>🌐 Page:</strong> ${
                      this.pageContent.title || "Untitled"
                    }
                </div>
                ${
                  insightsHtml ||
                  '<div class="prism-insight-item">� Analyzing page content...</div>'
                }
                <button class="prism-refresh-button" id="prism-refresh-analysis" style="margin-top: 12px; padding: 8px 16px; background: rgba(124, 58, 237, 0.2); border: 1px solid rgba(124, 58, 237, 0.4); border-radius: 6px; color: white; cursor: pointer; font-size: 12px;">
                    🔄 Re-analyze Page
                </button>
            </div>

            <!-- AI Assistant Panel -->
            <div class="prism-ai-panel prism-glass-panel">
                <div class="prism-panel-title">🤖 AI Assistant</div>
                <div class="prism-insight-item">
                    ${
                      this.isListening
                        ? "🎧 Listening for your command..."
                        : "💭 Click the microphone to start voice commands"
                    }
                </div>
                <div class="prism-insight-item">
                    <strong>💡 Quick Actions:</strong>
                    <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="prism-quick-action" data-action="summarize">📝 Summarize</button>
                        <button class="prism-quick-action" data-action="questions">❓ Q&A</button>
                        <button class="prism-quick-action" data-action="translate">🌍 Translate</button>
                    </div>
                </div>
                <div class="prism-insight-item" id="prism-ai-response" style="display: none;">
                    <strong>✨ AI Response:</strong>
                    <div id="prism-ai-response-content"></div>
                </div>
            </div>

            <!-- Floating Microphone Button -->
            <button class="prism-mic-button ${
              this.isListening ? "listening" : ""
            }" id="prism-floating-mic" title="Toggle Voice Recognition">
                🎤
            </button>
        `;

    this.setupOverlayEventListeners();

    if (this.isListening) {
      this.updateWaveform();
    }
  }

  hideOverlay() {
    this.overlayContainer.innerHTML = "";
  }

  setupOverlayEventListeners() {
    // Control bar buttons
    const refreshButton = document.getElementById("prism-refresh");
    const micToggle = document.getElementById("prism-mic-toggle");
    const hideButton = document.getElementById("prism-hide");
    const floatingMic = document.getElementById("prism-floating-mic");
    const refreshAnalysis = document.getElementById("prism-refresh-analysis");

    if (refreshButton) {
      refreshButton.addEventListener("click", () => {
        this.analyzePageContent();
        this.updateInsightsPanel();
      });
    }

    if (micToggle) {
      micToggle.addEventListener("click", () => {
        this.toggleListening(!this.isListening);
      });
    }

    if (hideButton) {
      hideButton.addEventListener("click", () => {
        this.toggleOverlay(false);
        // Update popup state
        chrome.storage.sync.set({ overlayEnabled: false });
      });
    }

    if (floatingMic) {
      floatingMic.addEventListener("click", () => {
        this.toggleListening(!this.isListening);
      });
    }

    if (refreshAnalysis) {
      refreshAnalysis.addEventListener("click", () => {
        this.analyzePageContent();
        this.updateInsightsPanel();
      });
    }

    // Quick action buttons
    const quickActions = document.querySelectorAll(".prism-quick-action");
    quickActions.forEach((button) => {
      button.addEventListener("click", (e) => {
        const action = e.target.getAttribute("data-action");
        this.handleQuickAction(action);
      });
    });
  }

  handleQuickAction(action) {
    const responseElement = document.getElementById("prism-ai-response");
    const responseContent = document.getElementById(
      "prism-ai-response-content"
    );

    if (!responseElement || !responseContent) return;

    responseElement.style.display = "block";
    responseContent.innerHTML = "Processing...";

    setTimeout(() => {
      let response = "";

      switch (action) {
        case "summarize":
          response = this.generateSummary();
          break;
        case "questions":
          response = this.generateQuestions();
          break;
        case "translate":
          response =
            "Translation feature coming soon. Currently analyzing page in English.";
          break;
        default:
          response = "Unknown action requested.";
      }

      responseContent.innerHTML = response;
    }, 1000);
  }

  generateSummary() {
    const content = this.pageContent;
    if (!content.text) return "No content to summarize.";

    // Simple extractive summary - take first few sentences
    const sentences = content.text.match(/[^\.!?]+[\.!?]+/g) || [];
    const summary = sentences.slice(0, 3).join(" ");

    return `<div style="margin-top: 8px;">
            <strong>Page Summary:</strong><br>
            ${summary.substring(0, 200)}${summary.length > 200 ? "..." : ""}
            <br><br>
            <em>📊 ${content.wordCount} words • ${Math.ceil(
      content.wordCount / 200
    )} min read</em>
        </div>`;
  }

  generateQuestions() {
    const topics = this.extractKeyTopics(this.pageContent.text).slice(0, 3);

    if (topics.length === 0) return "No key topics identified for questions.";

    const questions = topics
      .map(
        (topic) => `• What is ${topic.toLowerCase()} and why is it important?`
      )
      .join("<br>");

    return `<div style="margin-top: 8px;">
            <strong>Suggested Questions:</strong><br>
            ${questions}
            <br>• How does this relate to current trends?
        </div>`;
  }

  updateInsightsPanel() {
    if (!this.isOverlayVisible) return;

    // Re-render the entire overlay with updated insights
    this.showOverlay();
  }

  toggleListening(listening) {
    this.isListening = listening;

    // Update storage
    chrome.storage.sync.set({ isListening: listening });

    // Notify background script for badge update
    chrome.runtime.sendMessage({
      action: "notifyListening",
      listening: listening,
    });

    // Update UI if overlay is visible
    if (this.isOverlayVisible) {
      this.updateListeningUI();
    }

    if (listening) {
      this.startListening();
    } else {
      this.stopListening();
    }
  }

  updateListeningUI() {
    const micButton = document.getElementById("prism-mic-toggle");
    const floatingMic = document.getElementById("prism-floating-mic");
    const waveform = document.getElementById("prism-waveform");
    const listeningIndicator = document.getElementById(
      "prism-listening-indicator"
    );

    if (micButton) {
      micButton.className = `prism-button ${
        this.isListening ? "listening" : ""
      }`;
    }

    if (floatingMic) {
      floatingMic.className = `prism-mic-button ${
        this.isListening ? "listening" : ""
      }`;
    }

    if (waveform) {
      waveform.style.display = this.isListening ? "flex" : "none";
    }

    if (listeningIndicator) {
      listeningIndicator.style.display = this.isListening ? "flex" : "none";
    }

    // Update AI panel content
    this.updateAIPanel();
  }

  updateAIPanel() {
    if (!this.isOverlayVisible) return;

    // This would be replaced with actual AI response logic
    const aiPanel = document.querySelector(".prism-ai-panel");
    if (aiPanel) {
      const statusMessage = this.isListening
        ? '🎧 Actively listening... Try saying "Hey Prism" or give a command!'
        : "💭 Click the microphone to start voice commands";

      aiPanel.innerHTML = `
        <div class="prism-panel-title">🤖 AI Assistant</div>
        <div class="prism-insight-item">
          ${statusMessage}
        </div>
        <div class="prism-insight-item">
          <strong>💡 Quick Actions:</strong>
          <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="prism-quick-action" data-action="summarize">📝 Summarize</button>
            <button class="prism-quick-action" data-action="questions">❓ Q&A</button>
            <button class="prism-quick-action" data-action="translate">🌍 Translate</button>
          </div>
        </div>
        <div class="prism-insight-item" id="prism-ai-response" style="display: none;">
          <strong>✨ AI Response:</strong>
          <div id="prism-ai-response-content"></div>
        </div>
      `;

      // Re-attach event listeners for quick action buttons
      const quickActions = aiPanel.querySelectorAll(".prism-quick-action");
      quickActions.forEach((button) => {
        button.addEventListener("click", (e) => {
          const action = e.target.getAttribute("data-action");
          this.handleQuickAction(action);
        });
      });
    }
  }

  updateWaveform() {
    // Animate waveform bars when listening
    if (!this.isListening) return;

    const waveform = document.getElementById("prism-waveform");
    if (waveform) {
      waveform.style.display = "flex";
    }
  }

  startListening() {
    console.log("Starting voice recognition with Cedar-OS adapter...");

    if (!this.voiceAdapter) {
      this.initializeSpeechRecognition();
      // Wait a moment for initialization
      setTimeout(() => {
        if (this.voiceAdapter) {
          this.voiceAdapter.startListening();
        }
      }, 100);
    } else {
      this.voiceAdapter.startListening();
    }
  }

  stopListening() {
    console.log("Stopping voice recognition...");

    if (this.voiceAdapter) {
      this.voiceAdapter.stopListening();
    } else {
      // Fallback to old implementation if adapter not ready
      this.continuousListening = false;
      if (this.speechRecognition) {
        try {
          this.speechRecognition.stop();
        } catch (error) {
          console.error("Error stopping speech recognition:", error);
        }
      }
    }

    this.updateVoiceStatus("💭 Ready", "ready");
  }

  initializeSpeechRecognition() {
    // Load Cedar-OS voice adapter
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("cedar-voice-adapter.js");
    script.onload = () => {
      // Initialize Cedar-OS voice adapter
      this.voiceAdapter = new window.CedarVoiceAdapter();

      // Set up event handlers
      this.voiceAdapter.setEventHandlers({
        onStateChange: (state) => this.handleVoiceStateChange(state),
        onTranscript: (transcript) => this.handleVoiceTranscript(transcript),
        onResponse: (response, audioUrl) =>
          this.handleVoiceResponse(response, audioUrl),
      });

      // Configure voice settings
      this.voiceAdapter.updateVoiceSettings({
        language: "en-US",
        voiceId: "alloy",
        useBrowserTTS: true,
        autoAddToMessages: true,
      });

      console.log("Cedar-OS voice adapter initialized");
    };
    document.head.appendChild(script);
  }

  handleRecognitionFailure() {
    // Stop continuous listening on failure
    this.continuousListening = false;
    this.isListening = false;
    this.updateListeningUI();
    chrome.storage.sync.set({ isListening: false });

    // Notify background script
    chrome.runtime.sendMessage({
      action: "notifyListening",
      listening: false,
    });
  }

  // Cedar-OS Voice Adapter Event Handlers
  handleVoiceStateChange(state) {
    this.isListening = state.isListening;
    this.isSpeaking = state.isSpeaking;

    if (state.voiceError) {
      console.error("Voice error:", state.voiceError);
      this.updateVoiceStatus(`❌ ${state.voiceError}`, "error");

      if (state.voicePermissionStatus === "denied") {
        this.showMicrophonePermissionMessage();
      }
    } else if (state.isListening) {
      this.updateVoiceStatus("🎧 Listening...", "listening");
      this.continuousListening = true;
    } else if (state.isSpeaking) {
      this.updateVoiceStatus("🔊 Speaking...", "speaking");
    } else {
      this.updateVoiceStatus("💭 Ready", "ready");
      this.continuousListening = false;
    }

    this.updateListeningUI();
    chrome.storage.sync.set({ isListening: state.isListening });

    // Notify background script
    chrome.runtime.sendMessage({
      action: "notifyListening",
      listening: state.isListening,
    });
  }

  handleVoiceTranscript(transcript) {
    console.log("Voice transcript:", transcript);
    this.lastTranscript = transcript;
    this.updateVoiceTranscript(transcript);
    this.processVoiceCommand(transcript);
  }

  handleVoiceResponse(response, audioUrl) {
    console.log("AI response:", response);

    // Show response in AI panel
    const responseElement = document.getElementById("prism-ai-response");
    const responseContent = document.getElementById(
      "prism-ai-response-content"
    );

    if (responseElement && responseContent) {
      responseElement.style.display = "block";
      responseContent.innerHTML = `
        <div style="margin-top: 8px;">
          <strong>🤖 AI Response:</strong><br>
          ${response}
        </div>
      `;
    }
  }

  processVoiceCommand(transcript) {
    console.log("Processing voice command:", transcript);

    const lowerTranscript = transcript.toLowerCase();

    // Check for "Hey Prism" activation
    if (
      lowerTranscript.includes("hey prism") ||
      lowerTranscript.includes("hi prism")
    ) {
      this.handlePrismActivation(transcript);
      return;
    }

    // Process other commands
    if (
      lowerTranscript.includes("summarize") ||
      lowerTranscript.includes("summary")
    ) {
      this.handleQuickAction("summarize");
    } else if (
      lowerTranscript.includes("analyze") ||
      lowerTranscript.includes("analysis")
    ) {
      this.analyzePageContent();
      this.updateInsightsPanel();
    } else if (lowerTranscript.includes("translate")) {
      this.handleQuickAction("translate");
    } else if (
      lowerTranscript.includes("explain") ||
      lowerTranscript.includes("help")
    ) {
      this.handleQuickAction("questions");
    } else if (
      lowerTranscript.includes("hide") ||
      lowerTranscript.includes("close")
    ) {
      this.toggleOverlay(false);
      chrome.storage.sync.set({ overlayEnabled: false });
    } else if (
      lowerTranscript.includes("stop listening") ||
      lowerTranscript.includes("stop")
    ) {
      this.toggleListening(false);
    } else {
      // Generic AI response for unrecognized commands
      this.handleGenericVoiceQuery(transcript);
    }
  }

  handlePrismActivation(transcript) {
    this.updateVoiceStatus("✨ Prism activated!", "success");

    // Show overlay if not visible
    if (!this.isOverlayVisible) {
      this.toggleOverlay(true);
      chrome.storage.sync.set({ overlayEnabled: true });
    }

    // Show activation message in AI panel
    const responseElement = document.getElementById("prism-ai-response");
    const responseContent = document.getElementById(
      "prism-ai-response-content"
    );

    if (responseElement && responseContent) {
      responseElement.style.display = "block";
      responseContent.innerHTML = `
        <div style="margin-top: 8px;">
          <strong>👋 Hey there!</strong><br>
          Prism AI is now active and ready to help.<br><br>
          <em>You said: "${transcript}"</em><br><br>
          Try saying:<br>
          • "Summarize this page"<br>
          • "Analyze the content"<br>
          • "Explain this to me"<br>
          • "Stop listening"
        </div>
      `;
    }
  }

  handleGenericVoiceQuery(transcript) {
    const responseElement = document.getElementById("prism-ai-response");
    const responseContent = document.getElementById(
      "prism-ai-response-content"
    );

    if (responseElement && responseContent) {
      responseElement.style.display = "block";
      responseContent.innerHTML = `
        <div style="margin-top: 8px;">
          <strong>🎤 Voice Command Received:</strong><br>
          "${transcript}"<br><br>
          <em>💡 I heard you, but I'm not sure how to help with that specific request. 
          Try commands like "summarize", "analyze", "explain", or "translate".</em>
        </div>
      `;
    }
  }

  updateVoiceStatus(message, type = "ready") {
    const statusElement = document.getElementById("prism-status");
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = `prism-voice-status ${type}`;
    }
  }

  updateVoiceTranscript(transcript) {
    // Show real-time transcript in AI panel
    const responseElement = document.getElementById("prism-ai-response");
    const responseContent = document.getElementById(
      "prism-ai-response-content"
    );

    if (responseElement && responseContent) {
      responseElement.style.display = "block";
      responseContent.innerHTML = `
        <div style="margin-top: 8px;">
          <strong>🎤 Listening...</strong><br>
          <em style="opacity: 0.8;">"${transcript}"</em>
        </div>
      `;
    }
  }

  showMicrophonePermissionMessage() {
    const responseElement = document.getElementById("prism-ai-response");
    const responseContent = document.getElementById(
      "prism-ai-response-content"
    );

    if (responseElement && responseContent) {
      responseElement.style.display = "block";
      responseContent.innerHTML = `
        <div style="margin-top: 8px; color: #f59e0b;">
          <strong>🚫 Microphone Access Required</strong><br>
          Please allow microphone access to use voice commands.<br><br>
          <em>Click the microphone icon in your browser's address bar and select "Allow".</em>
        </div>
      `;
    }
  }

  setupVoiceRecognition() {
    // Initialize speech recognition on setup
    this.initializeSpeechRecognition();

    // Set up "Hey Prism" continuous listening if enabled
    if (this.settings.hotkeyEnabled) {
      this.setupContinuousListening();
    }

    console.log("Voice recognition setup complete");
  }

  setupContinuousListening() {
    // This would set up background listening for "Hey Prism"
    // Note: Continuous background listening may have privacy implications
    // For now, we'll only listen when explicitly activated
    console.log("Continuous listening setup - ready for manual activation");
  }

  async checkAutoActivation() {
    // Check if this is a video call page
    const response = await chrome.runtime.sendMessage({
      action: "detectVideoCall",
    });

    if (response && response.isVideoCall && this.settings.autoActivate) {
      // Auto-activate after a short delay
      setTimeout(() => {
        this.autoActivateOverlay();
      }, 3000);
    }
  }

  autoActivateOverlay() {
    if (!this.isOverlayVisible) {
      this.toggleOverlay(true);
      chrome.storage.sync.set({ overlayEnabled: true });
    }
  }

  processSelection(actionType, selectedText) {
    // Ensure overlay is visible
    if (!this.isOverlayVisible) {
      this.toggleOverlay(true);
    }

    // Show the AI response panel with processing message
    const responseElement = document.getElementById("prism-ai-response");
    const responseContent = document.getElementById(
      "prism-ai-response-content"
    );

    if (responseElement && responseContent) {
      responseElement.style.display = "block";
      responseContent.innerHTML = `Processing ${actionType} for selected text...`;

      // Process the selection based on action type
      setTimeout(() => {
        let result = "";
        switch (actionType) {
          case "summarize":
            result = this.summarizeText(selectedText);
            break;
          case "explain":
            result = this.explainText(selectedText);
            break;
          case "translate":
            result = this.translateText(selectedText);
            break;
          default:
            result = "Unknown action requested.";
        }
        responseContent.innerHTML = result;
      }, 1000);
    }
  }

  summarizeText(text) {
    // Simple text summarization
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
    const summary =
      sentences.length > 3 ? sentences.slice(0, 2).join(" ") : text;

    return `<div>
            <strong>📝 Summary:</strong><br>
            ${summary}
            <br><br>
            <em>Original: ${text.length} characters → Summary: ${summary.length} characters</em>
        </div>`;
  }

  explainText(text) {
    // Basic text explanation
    const wordCount = text.split(" ").length;
    const hasJargon =
      /\b(?:API|JSON|HTTP|CSS|HTML|JavaScript|database|server|client|framework|library|algorithm|function|variable|method|class|object|array|string|boolean|integer|float)\b/i.test(
        text
      );

    let explanation = `<div><strong>💡 Analysis:</strong><br>`;

    if (hasJargon) {
      explanation += `This appears to be technical content with ${wordCount} words. `;
      explanation += `It contains programming or technical terminology. `;
    } else {
      explanation += `This is general text content with ${wordCount} words. `;
    }

    if (text.includes("?")) {
      explanation += `The text contains questions. `;
    }

    if (text.includes("!")) {
      explanation += `The text has emphasis or exclamations. `;
    }

    explanation += `</div>`;
    return explanation;
  }

  translateText(text) {
    // Placeholder for translation - in a real implementation, you'd use a translation API
    return `<div>
            <strong>🌍 Translation:</strong><br>
            <em>Translation feature would connect to a service like Google Translate API.</em><br><br>
            <strong>Original text:</strong><br>
            "${text}"<br><br>
            <strong>Detected language:</strong> Auto-detected (feature coming soon)<br>
            <strong>Target language:</strong> User preference (feature coming soon)
        </div>`;
  }

  analyzeLink(linkUrl) {
    // Ensure overlay is visible
    if (!this.isOverlayVisible) {
      this.toggleOverlay(true);
    }

    const responseElement = document.getElementById("prism-ai-response");
    const responseContent = document.getElementById(
      "prism-ai-response-content"
    );

    if (responseElement && responseContent) {
      responseElement.style.display = "block";
      responseContent.innerHTML = `Analyzing link...`;

      setTimeout(() => {
        const analysis = this.getLinkAnalysis(linkUrl);
        responseContent.innerHTML = analysis;
      }, 1000);
    }
  }

  getLinkAnalysis(url) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const path = urlObj.pathname;
      const params = urlObj.searchParams;

      let analysis = `<div><strong>🔗 Link Analysis:</strong><br><br>`;
      analysis += `<strong>Domain:</strong> ${domain}<br>`;
      analysis += `<strong>Path:</strong> ${path}<br>`;

      if (params.size > 0) {
        analysis += `<strong>Parameters:</strong> ${params.size} found<br>`;
      }

      // Analyze domain type
      if (domain.includes("github.com")) {
        analysis += `<strong>Type:</strong> 📱 GitHub Repository<br>`;
      } else if (domain.includes("stackoverflow.com")) {
        analysis += `<strong>Type:</strong> ❓ Stack Overflow Q&A<br>`;
      } else if (
        domain.includes("youtube.com") ||
        domain.includes("youtu.be")
      ) {
        analysis += `<strong>Type:</strong> 📹 YouTube Video<br>`;
      } else if (domain.includes("twitter.com") || domain.includes("x.com")) {
        analysis += `<strong>Type:</strong> 🐦 Social Media Post<br>`;
      } else if (domain.includes("linkedin.com")) {
        analysis += `<strong>Type:</strong> 💼 LinkedIn Content<br>`;
      } else {
        analysis += `<strong>Type:</strong> 🌐 Web Page<br>`;
      }

      analysis += `<br><strong>Security:</strong> ${
        url.startsWith("https:") ? "🔒 Secure (HTTPS)" : "⚠️ Not Secure (HTTP)"
      }<br>`;
      analysis += `</div>`;

      return analysis;
    } catch (error) {
      return `<div><strong>🔗 Link Analysis:</strong><br>Invalid URL format</div>`;
    }
  }

  analyzeImage(imageUrl) {
    // Ensure overlay is visible
    if (!this.isOverlayVisible) {
      this.toggleOverlay(true);
    }

    const responseElement = document.getElementById("prism-ai-response");
    const responseContent = document.getElementById(
      "prism-ai-response-content"
    );

    if (responseElement && responseContent) {
      responseElement.style.display = "block";
      responseContent.innerHTML = `Analyzing image...`;

      setTimeout(() => {
        const analysis = this.getImageAnalysis(imageUrl);
        responseContent.innerHTML = analysis;
      }, 1000);
    }
  }

  getImageAnalysis(imageUrl) {
    try {
      const urlObj = new URL(imageUrl);
      const filename = urlObj.pathname.split("/").pop();
      const extension = filename.split(".").pop().toLowerCase();

      let analysis = `<div><strong>🖼️ Image Analysis:</strong><br><br>`;
      analysis += `<strong>Filename:</strong> ${filename}<br>`;
      analysis += `<strong>Format:</strong> ${extension.toUpperCase()}<br>`;

      // Basic format analysis
      switch (extension) {
        case "jpg":
        case "jpeg":
          analysis += `<strong>Type:</strong> 📸 JPEG Photo (compressed)<br>`;
          break;
        case "png":
          analysis += `<strong>Type:</strong> 🎨 PNG Image (lossless)<br>`;
          break;
        case "gif":
          analysis += `<strong>Type:</strong> 🎬 GIF Animation<br>`;
          break;
        case "svg":
          analysis += `<strong>Type:</strong> 📐 SVG Vector Graphics<br>`;
          break;
        case "webp":
          analysis += `<strong>Type:</strong> 🚀 WebP Modern Format<br>`;
          break;
        default:
          analysis += `<strong>Type:</strong> 🖼️ Image File<br>`;
      }

      analysis += `<strong>URL:</strong> ${
        imageUrl.length > 60 ? imageUrl.substring(0, 60) + "..." : imageUrl
      }<br>`;
      analysis += `<br><em>💡 Note: Advanced image description would require AI vision APIs like OpenAI GPT-4V or Google Cloud Vision.</em>`;
      analysis += `</div>`;

      return analysis;
    } catch (error) {
      return `<div><strong>🖼️ Image Analysis:</strong><br>Unable to analyze image URL</div>`;
    }
  }
}

// Initialize content script when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new PrismContentScript();
  });
} else {
  new PrismContentScript();
}
