// Web Search Agent using Perplexity API
// Handles web search queries and synthesis of multiple sources

class WebSearchAgent {
  constructor() {
    this.name = 'Web Search Agent';
    this.apiKey = null;
    this.baseURL = 'https://api.perplexity.ai/chat/completions';
  }

  async initialize(apiKey) {
    this.apiKey = apiKey;
  }

  async execute(input) {
    const { query, context, maxResults = 5 } = input;
    
    if (!this.apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    try {
      // Perform web search using Perplexity
      const searchResults = await this.performWebSearch(query, context, maxResults);
      
      // Synthesize results from multiple sources
      const synthesis = await this.synthesizeResults(searchResults, query);
      
      return {
        query: query,
        results: searchResults,
        synthesis: synthesis,
        sources: searchResults.map(result => ({
          title: result.title,
          url: result.url,
          snippet: result.snippet
        })),
        confidence: this.calculateConfidence(searchResults),
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Web search error:', error);
      return {
        query: query,
        error: error.message,
        results: [],
        synthesis: 'Unable to perform web search at this time.',
        sources: [],
        confidence: 0.1,
        timestamp: Date.now()
      };
    }
  }

  async performWebSearch(query, context, maxResults) {
    const prompt = this.buildSearchPrompt(query, context);
    
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a web search specialist. Search the web for current, accurate information and provide detailed results with sources. Always include URLs and citations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;
    
    // Parse the response to extract structured results
    return this.parseSearchResults(content, query);
  }

  buildSearchPrompt(query, context) {
    let prompt = `Search the web for: "${query}"`;
    
    if (context) {
      prompt += `\n\nContext: ${context}`;
    }
    
    prompt += `\n\nPlease provide:
    1. A comprehensive summary of the search results
    2. Key facts and insights
    3. Multiple sources with URLs
    4. Recent information (prioritize current data)
    
    Format your response as structured information with clear sections.`;
    
    return prompt;
  }

  parseSearchResults(content, originalQuery) {
    // Parse the Perplexity response to extract structured data
    const results = [];
    
    // Simple parsing - in a real implementation, you'd use more sophisticated parsing
    const lines = content.split('\n');
    let currentResult = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Look for URLs
      const urlMatch = trimmedLine.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        if (currentResult) {
          results.push(currentResult);
        }
        currentResult = {
          url: urlMatch[0],
          title: this.extractTitleFromLine(trimmedLine),
          snippet: ''
        };
      } else if (currentResult && trimmedLine) {
        currentResult.snippet += trimmedLine + ' ';
      }
    }
    
    if (currentResult) {
      results.push(currentResult);
    }
    
    // If no structured results found, create a fallback
    if (results.length === 0) {
      results.push({
        url: 'https://perplexity.ai',
        title: `Search results for: ${originalQuery}`,
        snippet: content.substring(0, 200) + '...'
      });
    }
    
    return results;
  }

  extractTitleFromLine(line) {
    // Extract title from a line that contains a URL
    const urlMatch = line.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      const beforeUrl = line.substring(0, line.indexOf(urlMatch[0])).trim();
      const afterUrl = line.substring(line.indexOf(urlMatch[0]) + urlMatch[0].length).trim();
      
      if (beforeUrl) {
        return beforeUrl;
      } else if (afterUrl) {
        return afterUrl.split(' ').slice(0, 5).join(' ');
      }
    }
    
    return 'Search Result';
  }

  async synthesizeResults(searchResults, query) {
    // Use OpenAI to synthesize results from multiple sources
    if (!searchResults.length) {
      return 'No search results found.';
    }
    
    const sourcesText = searchResults.map((result, index) => 
      `Source ${index + 1}: ${result.title}\nURL: ${result.url}\nContent: ${result.snippet}`
    ).join('\n\n');
    
    const synthesisPrompt = `
    Based on the following web search results for "${query}", provide a comprehensive synthesis:
    
    ${sourcesText}
    
    Please synthesize this information into:
    1. A clear summary of the main findings
    2. Key insights and trends
    3. Important facts and figures
    4. Any contradictions or different perspectives
    5. Overall conclusion
    
    Be objective and cite sources appropriately.
    `;
    
    try {
      // This would typically use your OpenAI integration
      // For now, return a simple synthesis
      return this.createSimpleSynthesis(searchResults, query);
    } catch (error) {
      console.error('Synthesis error:', error);
      return this.createSimpleSynthesis(searchResults, query);
    }
  }

  createSimpleSynthesis(searchResults, query) {
    const mainPoints = searchResults.map(result => result.snippet).join(' ');
    
    return `
    **Search Results Summary for: ${query}**
    
    Based on ${searchResults.length} sources, here are the key findings:
    
    ${mainPoints.substring(0, 500)}...
    
    **Sources:** ${searchResults.map(r => r.title).join(', ')}
    `;
  }

  calculateConfidence(searchResults) {
    if (!searchResults.length) return 0.1;
    
    // Simple confidence calculation based on number of sources and content quality
    let confidence = 0.5;
    
    // More sources = higher confidence
    confidence += Math.min(searchResults.length * 0.1, 0.3);
    
    // Check for quality indicators
    const hasUrls = searchResults.some(r => r.url && r.url.includes('http'));
    if (hasUrls) confidence += 0.1;
    
    const hasContent = searchResults.some(r => r.snippet && r.snippet.length > 50);
    if (hasContent) confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  }
}

export const webSearchAgent = new WebSearchAgent();
