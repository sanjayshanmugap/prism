// Background service worker for Prism AI Extension

class PrismBackground {
  constructor() {
    this.init();
  }

  init() {
    // Listen for extension installation
    chrome.runtime.onInstalled.addListener(this.onInstalled.bind(this));

    // Listen for messages from content scripts and popup
    chrome.runtime.onMessage.addListener(this.onMessage.bind(this));

    // Listen for tab updates to handle video call detection
    chrome.tabs.onUpdated.addListener(this.onTabUpdated.bind(this));

    // Listen for keyboard commands
    chrome.commands.onCommand.addListener(this.onCommand.bind(this));

    // Set up context menus
    this.setupContextMenus();
  }

  async onInstalled(details) {
    console.log("Prism AI Extension installed:", details);

    // Set default settings
    await chrome.storage.sync.set({
      overlayEnabled: false,
      isListening: false,
      autoActivate: true,
      hotkeyEnabled: true,
    });

    // Set up context menus
    this.setupContextMenus();
  }

  async onMessage(message, sender, sendResponse) {
    switch (message.action) {
      case "getSettings":
        const settings = await chrome.storage.sync.get();
        sendResponse(settings);
        break;

      case "saveSettings":
        await chrome.storage.sync.set(message.settings);
        sendResponse({ success: true });
        break;

      case "detectVideoCall":
        // Check if current page is a video call platform
        const isVideoCall = await this.detectVideoCallPage(sender.tab);
        sendResponse({ isVideoCall });
        break;

      case "notifyListening":
        // Update badge when listening state changes
        this.updateBadge(message.listening);
        break;

      default:
        console.log("Unknown message action:", message.action);
    }

    return true; // Keep message channel open for async response
  }

  async onTabUpdated(tabId, changeInfo, tab) {
    // Check if auto-activate is enabled
    const settings = await chrome.storage.sync.get(["autoActivate"]);
    if (!settings.autoActivate) return;

    // Only process when page is completely loaded
    if (changeInfo.status !== "complete") return;

    // Check if this is a video call platform
    const isVideoCall = await this.detectVideoCallPage(tab);

    if (isVideoCall) {
      // Send message to content script to auto-enable overlay
      try {
        chrome.tabs.sendMessage(tabId, {
          action: "autoActivateOverlay",
        });
      } catch (error) {
        console.log("Could not send message to tab:", error);
      }
    }
  }

  async detectVideoCallPage(tab) {
    if (!tab || !tab.url) return false;

    // List of known video call platforms
    const videoCallDomains = [
      "meet.google.com",
      "zoom.us",
      "teams.microsoft.com",
      "webex.com",
      "whereby.com",
      "discord.com",
      "skype.com",
      "jitsi.org",
      "bluejeans.com",
      "gotomeeting.com",
    ];

    try {
      const url = new URL(tab.url);
      return videoCallDomains.some((domain) => url.hostname.includes(domain));
    } catch (error) {
      return false;
    }
  }

  updateBadge(listening) {
    if (listening) {
      chrome.action.setBadgeText({ text: "●" });
      chrome.action.setBadgeBackgroundColor({ color: "#f59e0b" });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }
  }

  setupContextMenus() {
    // Clear existing context menus first
    chrome.contextMenus.removeAll(() => {
      // Create parent menu
      chrome.contextMenus.create({
        id: "prism-main",
        title: "🔮 Prism AI",
        contexts: ["page", "selection", "link", "image"],
      });

      // Toggle overlay
      chrome.contextMenus.create({
        id: "prism-toggle-overlay",
        parentId: "prism-main",
        title: "📱 Toggle Overlay",
        contexts: ["page"],
      });

      // Analyze page
      chrome.contextMenus.create({
        id: "prism-analyze-page",
        parentId: "prism-main",
        title: "🔍 Analyze Page",
        contexts: ["page"],
      });

      // Separator
      chrome.contextMenus.create({
        id: "prism-separator-1",
        parentId: "prism-main",
        type: "separator",
        contexts: ["page"],
      });

      // Quick actions for selected text
      chrome.contextMenus.create({
        id: "prism-summarize-selection",
        parentId: "prism-main",
        title: "📝 Summarize Selection",
        contexts: ["selection"],
      });

      chrome.contextMenus.create({
        id: "prism-explain-selection",
        parentId: "prism-main",
        title: "💡 Explain Selection",
        contexts: ["selection"],
      });

      chrome.contextMenus.create({
        id: "prism-translate-selection",
        parentId: "prism-main",
        title: "🌍 Translate Selection",
        contexts: ["selection"],
      });

      // Link analysis
      chrome.contextMenus.create({
        id: "prism-analyze-link",
        parentId: "prism-main",
        title: "🔗 Analyze Link",
        contexts: ["link"],
      });

      // Image analysis
      chrome.contextMenus.create({
        id: "prism-describe-image",
        parentId: "prism-main",
        title: "🖼️ Describe Image",
        contexts: ["image"],
      });

      // Setup context menu click handler
      chrome.contextMenus.onClicked.addListener(
        this.onContextMenuClicked.bind(this)
      );
    });
  }

  async onCommand(command) {
    console.log("Command received:", command);

    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!activeTab) return;

    switch (command) {
      case "toggle-overlay":
        // Toggle overlay on current tab
        try {
          const settings = await chrome.storage.sync.get(["overlayEnabled"]);
          const newState = !settings.overlayEnabled;

          await chrome.storage.sync.set({ overlayEnabled: newState });

          chrome.tabs.sendMessage(activeTab.id, {
            action: "toggleOverlay",
            enabled: newState,
          });
        } catch (error) {
          console.error("Failed to toggle overlay:", error);
        }
        break;

      case "quick-analyze":
        // Quick analyze current page
        try {
          chrome.tabs.sendMessage(activeTab.id, {
            action: "analyzePageContent",
          });

          // Show overlay if not visible
          const settings = await chrome.storage.sync.get(["overlayEnabled"]);
          if (!settings.overlayEnabled) {
            await chrome.storage.sync.set({ overlayEnabled: true });
            chrome.tabs.sendMessage(activeTab.id, {
              action: "toggleOverlay",
              enabled: true,
            });
          }
        } catch (error) {
          console.error("Failed to analyze page:", error);
        }
        break;
    }
  }

  async onContextMenuClicked(info, tab) {
    console.log("Context menu clicked:", info.menuItemId, info);

    switch (info.menuItemId) {
      case "prism-toggle-overlay":
        try {
          const settings = await chrome.storage.sync.get(["overlayEnabled"]);
          const newState = !settings.overlayEnabled;

          await chrome.storage.sync.set({ overlayEnabled: newState });

          chrome.tabs.sendMessage(tab.id, {
            action: "toggleOverlay",
            enabled: newState,
          });
        } catch (error) {
          console.error("Failed to toggle overlay from context menu:", error);
        }
        break;

      case "prism-analyze-page":
        try {
          chrome.tabs.sendMessage(tab.id, {
            action: "analyzePageContent",
          });

          // Show overlay if not visible
          const settings = await chrome.storage.sync.get(["overlayEnabled"]);
          if (!settings.overlayEnabled) {
            await chrome.storage.sync.set({ overlayEnabled: true });
            chrome.tabs.sendMessage(tab.id, {
              action: "toggleOverlay",
              enabled: true,
            });
          }
        } catch (error) {
          console.error("Failed to analyze page from context menu:", error);
        }
        break;

      case "prism-summarize-selection":
        this.handleTextSelection(tab.id, "summarize", info.selectionText);
        break;

      case "prism-explain-selection":
        this.handleTextSelection(tab.id, "explain", info.selectionText);
        break;

      case "prism-translate-selection":
        this.handleTextSelection(tab.id, "translate", info.selectionText);
        break;

      case "prism-analyze-link":
        this.handleLinkAnalysis(tab.id, info.linkUrl);
        break;

      case "prism-describe-image":
        this.handleImageAnalysis(tab.id, info.srcUrl);
        break;
    }
  }

  async handleTextSelection(tabId, action, selectedText) {
    try {
      // Ensure overlay is visible
      const settings = await chrome.storage.sync.get(["overlayEnabled"]);
      if (!settings.overlayEnabled) {
        await chrome.storage.sync.set({ overlayEnabled: true });
        chrome.tabs.sendMessage(tabId, {
          action: "toggleOverlay",
          enabled: true,
        });

        // Wait a bit for overlay to load
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Send selection to content script for processing
      chrome.tabs.sendMessage(tabId, {
        action: "processSelection",
        actionType: action,
        selectedText: selectedText,
      });
    } catch (error) {
      console.error("Failed to handle text selection:", error);
    }
  }

  async handleLinkAnalysis(tabId, linkUrl) {
    try {
      // Ensure overlay is visible
      const settings = await chrome.storage.sync.get(["overlayEnabled"]);
      if (!settings.overlayEnabled) {
        await chrome.storage.sync.set({ overlayEnabled: true });
        chrome.tabs.sendMessage(tabId, {
          action: "toggleOverlay",
          enabled: true,
        });

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      chrome.tabs.sendMessage(tabId, {
        action: "analyzeLink",
        linkUrl: linkUrl,
      });
    } catch (error) {
      console.error("Failed to handle link analysis:", error);
    }
  }

  async handleImageAnalysis(tabId, imageUrl) {
    try {
      // Ensure overlay is visible
      const settings = await chrome.storage.sync.get(["overlayEnabled"]);
      if (!settings.overlayEnabled) {
        await chrome.storage.sync.set({ overlayEnabled: true });
        chrome.tabs.sendMessage(tabId, {
          action: "toggleOverlay",
          enabled: true,
        });

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      chrome.tabs.sendMessage(tabId, {
        action: "analyzeImage",
        imageUrl: imageUrl,
      });
    } catch (error) {
      console.error("Failed to handle image analysis:", error);
    }
  }
}

// Initialize background script
new PrismBackground();
