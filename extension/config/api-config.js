// API Configuration for Prism AI Extension
// Configure your API keys and endpoints here

export const apiConfig = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
    model: 'gpt-4o-mini',
    maxTokens: 1000,
    temperature: 0.7,
    baseURL: 'https://api.openai.com/v1'
  },
  
  // Perplexity Configuration
  perplexity: {
    perplexityApiKey: process.env.PERPLEXITY_API_KEY || 'your-perplexity-api-key-here',
    model: 'llama-3.1-sonar-large-128k-online',
    baseURL: 'https://api.perplexity.ai'
  },
  
  // Mastra Configuration
  mastra: {
    baseURL: process.env.MASTRA_BASE_URL || 'http://localhost:3000',
    timeout: 30000,
    retryAttempts: 3
  },
  
  // CedarOS Configuration
  cedar: {
    enableDebug: false,
    persistMessages: true,
    maxMessages: 100,
    autoAnalysis: true
  },
  
  // Extension Settings
  extension: {
    autoAnalyzeOnShow: true,
    enableVoiceRecognition: true,
    enableWebSearch: false, // Will be enabled with Perplexity integration
    analysisDelay: 500, // ms
    maxRetries: 3
  }
};

// Environment detection
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// API Key validation
export function validateApiKeys() {
  const issues = [];
  
  if (!apiConfig.openai.apiKey || apiConfig.openai.apiKey.includes('your-')) {
    issues.push('OpenAI API key not configured');
  }
  
  if (!apiConfig.perplexity.apiKey || apiConfig.perplexity.apiKey.includes('your-')) {
    issues.push('Perplexity API key not configured (optional)');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

// Get API configuration for specific service
export function getApiConfig(service) {
  return apiConfig[service] || null;
}

// Update API key (for settings)
export function updateApiKey(service, key) {
  if (apiConfig[service]) {
    apiConfig[service].apiKey = key;
  }
}
