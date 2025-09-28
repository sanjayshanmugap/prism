import fetch from 'node-fetch';
import type { PerplexitySearchParams, PerplexitySearchResult, Citation } from '@prism/shared';
import { dedupeCitations } from '@prism/shared';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export class PerplexityClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(params: PerplexitySearchParams): Promise<PerplexitySearchResult> {
    const { query, context } = params;

    let prompt = `Answer the following question concisely with 2-5 authoritative sources. 
Question: ${query}`;

    if (context?.url || context?.title) {
      prompt += `\n\nContext: User is currently reading "${context.title || 'a web page'}"`;
      if (context.url) {
        prompt += ` at ${context.url}`;
      }
      if (context.content) {
        prompt += `\n\nRelevant excerpt: ${context.content.slice(0, 500)}`;
      }
    }

    prompt += `\n\nProvide a clear, factual answer with proper citations. If uncertain, say so clearly.`;

    try {
      const response = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful research assistant. Provide concise, well-sourced answers.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.2,
          return_citations: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json() as any;
      const answer = data.choices?.[0]?.message?.content || 'No answer received';
      
      // Extract citations from the response
      const citations: Citation[] = this.extractCitations(data);

      return {
        answer,
        citations: dedupeCitations(citations),
      };
    } catch (error) {
      console.error('Perplexity search error:', error);
      throw new Error(`Failed to search: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractCitations(data: any): Citation[] {
    const citations: Citation[] = [];

    // Extract from citations field if available
    if (data.citations && Array.isArray(data.citations)) {
      for (const citation of data.citations) {
        if (citation.url && citation.title) {
          citations.push({
            title: citation.title,
            url: citation.url,
            publisher: citation.publisher || this.extractPublisher(citation.url),
            publishedAt: citation.published_at,
          });
        }
      }
    }

    // Fallback: extract URLs from the answer text
    if (citations.length === 0) {
      const answer = data.choices?.[0]?.message?.content || '';
      const urlRegex = /https?:\/\/[^\s)]+/g;
      const urls = answer.match(urlRegex) || [];
      
      for (const url of urls.slice(0, 5)) { // Limit to 5 citations
        citations.push({
          title: this.generateTitleFromUrl(url),
          url,
          publisher: this.extractPublisher(url),
        });
      }
    }

    return citations;
  }

  private extractPublisher(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'Unknown';
    }
  }

  private generateTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      const path = urlObj.pathname;
      
      if (path && path !== '/') {
        const segments = path.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        if (lastSegment) {
          return `${domain} - ${lastSegment.replace(/[-_]/g, ' ')}`;
        }
      }
      
      return domain;
    } catch {
      return 'Source';
    }
  }
}