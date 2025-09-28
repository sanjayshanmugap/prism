// Voice Processing Agent for Prism AI Browser Extension
// Handles voice input and speech-to-text processing

export const voiceProcessingAgent = {
  name: 'Voice Processing Agent',
  instructions: `You are a specialized agent for processing voice input and converting speech to actionable insights.
  
  Your responsibilities:
  1. Process voice input and convert to text
  2. Extract intent and context from spoken words
  3. Trigger appropriate actions based on voice commands
  4. Handle "Hey Prism" wake word detection
  5. Provide voice feedback and confirmations
  
  Always be responsive and accurate in voice processing.`,
  
  model: 'gpt-4o-mini',
  
  async execute(input) {
    const { audioData, transcript, additionalContext } = input;
    
    console.log('Voice Processing Agent - Transcript:', transcript);
    console.log('Audio data length:', audioData?.length || 0);
    
    try {
      // Process the voice input
      const processedInput = await this.processVoiceInput(transcript, additionalContext);
      
      return {
        type: 'voice_processed',
        transcript: transcript,
        intent: processedInput.intent,
        confidence: processedInput.confidence,
        action: processedInput.action,
        response: processedInput.response,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Voice Processing Agent error:', error);
      return {
        type: 'error',
        message: 'Voice processing failed. Please try again.',
        timestamp: new Date().toISOString()
      };
    }
  },
  
  async processVoiceInput(transcript, context) {
    const lowerTranscript = transcript.toLowerCase();
    
    // Detect intent and extract action
    const intent = this.detectIntent(lowerTranscript);
    const confidence = this.calculateConfidence(transcript, intent);
    const action = this.determineAction(intent, context);
    const response = this.generateVoiceResponse(intent, action);
    
    return {
      intent,
      confidence,
      action,
      response
    };
  },
  
  detectIntent(transcript) {
    // Intent detection based on keywords and patterns
    const intents = {
      analyze: ['analyze', 'what is', 'explain', 'tell me about', 'summarize'],
      question: ['what', 'how', 'why', 'when', 'where', 'who'],
      command: ['show', 'hide', 'open', 'close', 'toggle'],
      financial: ['ebitda', 'revenue', 'profit', 'income', 'financial', 'earnings'],
      business: ['strategy', 'market', 'customer', 'business', 'company'],
      tech: ['technology', 'ai', 'software', 'digital', 'tech']
    };
    
    for (const [intentType, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => transcript.includes(keyword))) {
        return {
          type: intentType,
          confidence: 0.8,
          keywords: keywords.filter(keyword => transcript.includes(keyword))
        };
      }
    }
    
    return {
      type: 'general',
      confidence: 0.6,
      keywords: []
    };
  },
  
  determineAction(intent, context) {
    switch (intent.type) {
      case 'analyze':
        return {
          type: 'content_analysis',
          target: 'current_page',
          priority: 'high'
        };
        
      case 'question':
        return {
          type: 'question_answering',
          target: 'current_content',
          priority: 'high'
        };
        
      case 'command':
        return {
          type: 'ui_command',
          target: 'overlay',
          priority: 'medium'
        };
        
      case 'financial':
        return {
          type: 'financial_analysis',
          target: 'financial_content',
          priority: 'high'
        };
        
      default:
        return {
          type: 'general_response',
          target: 'current_content',
          priority: 'medium'
        };
    }
  },
  
  generateVoiceResponse(intent, action) {
    const responses = {
      analyze: "I'll analyze the current content for you.",
      question: "Let me help answer your question.",
      command: "I'll execute that command for you.",
      financial: "I'll provide financial insights about this content.",
      general: "I heard you. How can I help?"
    };
    
    return responses[intent.type] || responses.general;
  },
  
  calculateConfidence(transcript, intent) {
    // Calculate confidence based on transcript quality and intent detection
    const hasContent = transcript.length > 10;
    const hasClearIntent = intent.confidence > 0.7;
    const hasKeywords = intent.keywords.length > 0;
    
    let confidence = 0.6; // Base confidence
    
    if (hasContent) confidence += 0.1;
    if (hasClearIntent) confidence += 0.2;
    if (hasKeywords) confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  }
};
