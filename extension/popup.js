// Prism AI Overlay Popup Script
// Handles popup interface and communicates with background script

class PrismAIPopup {
  constructor() {
    this.isListening = false;
    this.isOverlayVisible = false;
    this.init();
  }

  async init() {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Bind event listeners
    this.bindEventListeners(tab.id);
    
    // Update status
    await this.updateStatus();
  }

  bindEventListeners(tabId) {
    // Toggle overlay button
    document.getElementById('toggleOverlay')?.addEventListener('click', async () => {
      await this.toggleOverlay(tabId);
    });

    // Toggle listening button
    document.getElementById('toggleListening')?.addEventListener('click', async () => {
      await this.toggleListening(tabId);
    });

    // Settings toggles
    this.setupSettingsToggles();
  }

  setupSettingsToggles() {
    const toggles = document.querySelectorAll('.toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        this.saveSetting(toggle.id, toggle.classList.contains('active'));
      });
    });
  }

  async toggleOverlay(tabId) {
    try {
      await chrome.tabs.sendMessage(tabId, { action: 'toggleOverlay' });
      this.isOverlayVisible = !this.isOverlayVisible;
      this.updateStatus();
    } catch (error) {
      console.error('Error toggling overlay:', error);
    }
  }

  async toggleListening(tabId) {
    try {
      await chrome.tabs.sendMessage(tabId, { action: 'toggleListening' });
      this.isListening = !this.isListening;
      this.updateStatus();
    } catch (error) {
      console.error('Error toggling listening:', error);
    }
  }

  async updateStatus() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    if (this.isListening) {
      statusDot?.classList.add('listening');
      statusText.textContent = 'Listening...';
    } else {
      statusDot?.classList.remove('listening');
      statusText.textContent = this.isOverlayVisible ? 'Overlay Active' : 'Ready';
    }
  }

  async saveSetting(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get([
        'autoStart',
        'wakeWord', 
        'aiAnalysis'
      ]);
      
      // Update toggle states
      Object.entries(result).forEach(([key, value]) => {
        const toggle = document.getElementById(key);
        if (toggle) {
          if (value) {
            toggle.classList.add('active');
          } else {
            toggle.classList.remove('active');
          }
        }
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PrismAIPopup();
});
