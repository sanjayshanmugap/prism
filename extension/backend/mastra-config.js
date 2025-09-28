// Mastra Configuration for Prism AI Browser Extension
// Configures the Mastra backend with CedarOS integration

import { contentAnalysisAgent } from './agents/content-analysis-agent.js';
import { voiceProcessingAgent } from './agents/voice-processing-agent.js';

export const mastraConfig = {
  // Agent configuration
  agents: {
    contentAnalysis: contentAnalysisAgent,
    voiceProcessing: voiceProcessingAgent
  },
  
  // API configuration
  api: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.7
    }
  },
  
  // CedarOS integration
  cedar: {
    store: {
      enableDebug: false,
      persistMessages: true,
      maxMessages: 100
    },
    
    // Message handling
    messageTypes: {
      'message': 'handleMessageResponse',
      'voice_processed': 'handleVoiceResponse',
      'error': 'handleErrorResponse'
    }
  },
  
  // Browser extension specific settings
  extension: {
    permissions: ['activeTab', 'storage', 'background'],
    contentScripts: ['content.js'],
    backgroundScript: 'background.js'
  },
  
  // Error handling
  errorHandling: {
    retryAttempts: 3,
    retryDelay: 1000,
    fallbackResponse: 'I apologize, but I encountered an error. Please try again.'
  }
};

// Helper function to get agent by name
export function getAgent(agentName) {
  return mastraConfig.agents[agentName];
}

// Helper function to process agent response
export async function processAgentResponse(agentName, input) {
  try {
    const agent = getAgent(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }
    
    const response = await agent.execute(input);
    return response;
    
  } catch (error) {
    console.error(`Error processing agent ${agentName}:`, error);
    return {
      type: 'error',
      message: mastraConfig.errorHandling.fallbackResponse,
      timestamp: new Date().toISOString()
    };
  }
}

// CedarOS store integration
export function createCedarStore() {
  return {
    messages: [],
    isProcessing: false,
    currentContext: null,
    
    // Message management
    addMessage(message) {
      this.messages.push({
        ...message,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      });
      
      // Limit message history
      if (this.messages.length > mastraConfig.cedar.store.maxMessages) {
        this.messages = this.messages.slice(-mastraConfig.cedar.store.maxMessages);
      }
    },
    
    // Set processing state
    setProcessing(processing) {
      this.isProcessing = processing;
    },
    
    // Update context
    updateContext(context) {
      this.currentContext = context;
    },
    
    // Clear messages
    clearMessages() {
      this.messages = [];
    }
  };
}
