// Content Analysis Agent for Prism AI Browser Extension
// Uses CedarOS + Mastra for AI-powered web content analysis

export const contentAnalysisAgent = {
  name: 'Content Analysis Agent',
  instructions: `You are an AI assistant specialized in analyzing web content and providing real-time insights. 
  
  Your role is to:
  1. Analyze web page content and context
  2. Provide live insights about the current topic/conversation
  3. Suggest relevant actions and follow-up questions
  4. Generate concise, helpful responses
  5. Identify key themes and financial/business concepts
  
  Always be concise, accurate, and helpful. Focus on actionable insights.`,
  
  model: 'gpt-4o-mini',
  
  async execute(input) {
    const { prompt, additionalContext } = input;
    
    console.log('Content Analysis Agent - User prompt:', prompt);
    console.log('Additional context:', additionalContext);
    
    try {
      // Extract web content from context
      const webContent = additionalContext?.webContent || {};
      const currentUrl = webContent.url || 'Unknown';
      const pageTitle = webContent.title || 'Untitled';
      const pageText = webContent.text || '';
      
      // Analyze the content and generate insights
      const analysis = await this.analyzeContent(prompt, webContent);
      
      return {
        type: 'message',
        content: analysis.response,
        insights: analysis.insights,
        actions: analysis.actions,
        confidence: analysis.confidence,
        sources: analysis.sources || [],
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Content Analysis Agent error:', error);
      return {
        type: 'message',
        content: 'I apologize, but I encountered an error while analyzing the content. Please try again.',
        confidence: 0,
        timestamp: new Date().toISOString()
      };
    }
  },
  
  async analyzeContent(prompt, webContent) {
    // This is where we'll implement the actual AI analysis
    // For now, we'll create a structured response based on the content
    
    const pageText = webContent.text || '';
    const url = webContent.url || '';
    
    // Extract key topics from the content
    const topics = this.extractTopics(pageText);
    const insights = this.generateInsights(pageText, topics);
    const actions = this.generateActions(prompt, topics);
    
    return {
      response: this.generateResponse(prompt, insights),
      insights: insights,
      actions: actions,
      confidence: this.calculateConfidence(pageText, topics),
      sources: [url]
    };
  },
  
  extractTopics(text) {
    // Simple topic extraction - in production, this would use more sophisticated NLP
    const words = text.toLowerCase().split(/\s+/);
    const financialTerms = ['ebitda', 'revenue', 'profit', 'income', 'cash flow', 'financial', 'earnings', 'expenses'];
    const businessTerms = ['strategy', 'market', 'customer', 'product', 'sales', 'growth', 'business'];
    const techTerms = ['technology', 'software', 'ai', 'machine learning', 'data', 'digital'];
    
    const topics = [];
    
    financialTerms.forEach(term => {
      if (words.some(word => word.includes(term))) {
        topics.push({ type: 'financial', term, relevance: 'high' });
      }
    });
    
    businessTerms.forEach(term => {
      if (words.some(word => word.includes(term))) {
        topics.push({ type: 'business', term, relevance: 'medium' });
      }
    });
    
    techTerms.forEach(term => {
      if (words.some(word => word.includes(term))) {
        topics.push({ type: 'technology', term, relevance: 'medium' });
      }
    });
    
    return topics;
  },
  
  generateInsights(text, topics) {
    const insights = [];
    
    if (topics.some(t => t.type === 'financial')) {
      insights.push("The conversation is shifting towards a discussion of common financial terms.");
    }
    
    if (topics.some(t => t.term === 'ebitda')) {
      insights.push("You were asked to explain the difference between EBITDA and net income.");
    }
    
    if (topics.some(t => t.type === 'business')) {
      insights.push("Business strategy and market dynamics are being discussed.");
    }
    
    if (topics.some(t => t.type === 'technology')) {
      insights.push("Technology and digital transformation topics are present.");
    }
    
    return insights.length > 0 ? insights : ["Analyzing current content for insights..."];
  },
  
  generateActions(prompt, topics) {
    const actions = [];
    
    // Generate context-aware actions
    if (topics.some(t => t.term === 'ebitda')) {
      actions.push({
        text: "What are the differences between EBITDA and net income?",
        active: true,
        type: "question"
      });
      actions.push({
        text: "Define EBITDA",
        active: false,
        type: "definition"
      });
    }
    
    actions.push({
      text: "Suggest follow-up questions",
      active: false,
      type: "suggestion"
    });
    
    actions.push({
      text: "What should I say next?",
      active: false,
      type: "recommendation"
    });
    
    return actions;
  },
  
  generateResponse(prompt, insights) {
    if (prompt.toLowerCase().includes('ebitda') && prompt.toLowerCase().includes('net income')) {
      return "EBITDA is earnings before interest, taxes, depreciation, and amortization. Net income is profit after all expenses are deducted, giving a more complete picture of profitability.";
    }
    
    return insights.length > 0 
      ? insights[0] 
      : "I'm analyzing the current content to provide you with relevant insights.";
  },
  
  calculateConfidence(text, topics) {
    // Calculate confidence based on content quality and topic relevance
    const hasContent = text.length > 100;
    const hasRelevantTopics = topics.length > 0;
    const hasFinancialContent = topics.some(t => t.type === 'financial');
    
    let confidence = 0.7; // Base confidence
    
    if (hasContent) confidence += 0.1;
    if (hasRelevantTopics) confidence += 0.1;
    if (hasFinancialContent) confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  }
};
