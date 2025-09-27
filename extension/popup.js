// Extension popup script
class PrismPopup {
  constructor() {
    this.isOverlayEnabled = false;
    this.isListening = false;
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        "overlayEnabled",
        "isListening",
        "autoActivate",
        "hotkeyEnabled",
      ]);

      this.isOverlayEnabled = result.overlayEnabled || false;
      this.isListening = result.isListening || false;

      // Update checkboxes
      document.getElementById("auto-activate").checked =
        result.autoActivate !== false;
      document.getElementById("hotkey-enabled").checked =
        result.hotkeyEnabled !== false;

      // Load page analysis data
      await this.loadPageAnalysis();
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  async loadPageAnalysis() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab) {
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: "getPageContent",
        });

        if (response && response.content) {
          this.updatePageInfo(response.content, response.insights);
        }
      }
    } catch (error) {
      console.log("Could not load page analysis:", error);
    }
  }

  updatePageInfo(content, insights) {
    const pageInfoElement = document.getElementById("page-info");
    if (pageInfoElement && content) {
      pageInfoElement.innerHTML = `
                <div class="page-summary">
                    <strong>${content.title || "Current Page"}</strong>
                    <div style="font-size: 11px; margin-top: 4px; opacity: 0.8;">
                        📊 ${content.wordCount} words • ${Math.ceil(
        content.wordCount / 200
      )} min read
                    </div>
                    ${
                      insights && insights.length > 0
                        ? `
                        <div style="font-size: 11px; margin-top: 6px;">
                            ${insights[0].icon} ${insights[0].title}
                        </div>
                    `
                        : ""
                    }
                </div>
            `;
    }
  }

  async analyzePage() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab) {
        await chrome.tabs.sendMessage(tab.id, {
          action: "analyzePageContent",
        });

        // Refresh page info after analysis
        setTimeout(() => this.loadPageAnalysis(), 500);
      }
    } catch (error) {
      console.error("Failed to analyze page:", error);
    }
  }

  setupEventListeners() {
    // Toggle overlay button
    document.getElementById("toggle-overlay").addEventListener("click", () => {
      this.toggleOverlay();
    });

    // Toggle listening button
    document
      .getElementById("toggle-listening")
      .addEventListener("click", () => {
        this.toggleListening();
      });

    // Settings checkboxes
    document.getElementById("auto-activate").addEventListener("change", (e) => {
      this.saveSetting("autoActivate", e.target.checked);
    });

    document
      .getElementById("hotkey-enabled")
      .addEventListener("change", (e) => {
        this.saveSetting("hotkeyEnabled", e.target.checked);
      });

    // Settings button (placeholder)
    document.getElementById("settings-button").addEventListener("click", () => {
      // Could open options page in the future
      console.log("Advanced settings clicked");
    });

    // Analyze page button
    document.getElementById("analyze-page").addEventListener("click", () => {
      this.analyzePage();
    });
  }

  async toggleOverlay() {
    this.isOverlayEnabled = !this.isOverlayEnabled;
    await this.saveSetting("overlayEnabled", this.isOverlayEnabled);

    // Send message to content script
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, {
        action: "toggleOverlay",
        enabled: this.isOverlayEnabled,
      });
    }

    this.updateUI();
  }

  async toggleListening() {
    if (!this.isOverlayEnabled) return;

    this.isListening = !this.isListening;
    await this.saveSetting("isListening", this.isListening);

    // Send message to content script
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          action: "toggleListening",
          listening: this.isListening,
        });
      } catch (error) {
        console.error("Failed to toggle listening:", error);
        // Show error message to user
        this.showMicrophoneError();
        // Reset state
        this.isListening = false;
        await this.saveSetting("isListening", false);
      }
    }

    this.updateUI();
  }

  showMicrophoneError() {
    const statusText = document
      .getElementById("status-indicator")
      .querySelector("span");
    const statusDot = document
      .getElementById("status-indicator")
      .querySelector(".status-dot");

    if (statusText && statusDot) {
      statusText.textContent = "Microphone Error";
      statusDot.className = "status-dot error";

      // Reset after 3 seconds
      setTimeout(() => {
        this.updateUI();
      }, 3000);
    }
  }

  async saveSetting(key, value) {
    try {
      await chrome.storage.sync.set({ [key]: value });
    } catch (error) {
      console.error("Failed to save setting:", error);
    }
  }

  updateUI() {
    // Update overlay button
    const overlayButton = document.getElementById("overlay-button-text");
    const listeningButton = document.getElementById("toggle-listening");
    const listeningButtonText = document.getElementById(
      "listening-button-text"
    );
    const statusIndicator = document.getElementById("status-indicator");
    const statusDot = statusIndicator.querySelector(".status-dot");
    const statusText = statusIndicator.querySelector("span");

    if (this.isOverlayEnabled) {
      overlayButton.textContent = "Disable Overlay";
      listeningButton.disabled = false;

      if (this.isListening) {
        listeningButtonText.textContent = "Stop Listening";
        statusDot.className = "status-dot listening";
        statusText.textContent = "Listening...";
      } else {
        listeningButtonText.textContent = "Start Listening";
        statusDot.className = "status-dot";
        statusText.textContent = "Active";
      }
    } else {
      overlayButton.textContent = "Enable Overlay";
      listeningButton.disabled = true;
      listeningButtonText.textContent = "Start Listening";
      statusDot.className = "status-dot";
      statusText.textContent = "Ready";
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new PrismPopup();
});
