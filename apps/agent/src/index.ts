import type { AskRequest, AskResponse, Brief } from '@prism/shared';
import { generateId, validateBrief } from '@prism/shared';
import { PerplexityClient } from './tools/perplexitySearch';
import { summarizeSelection } from './tools/summarizeSelection';
import { getTranscriptSlice } from './tools/getTranscriptSlice';
import { recommendNext } from './tools/recommendNext';

export class MastraAgent {
  private perplexityClient: PerplexityClient;

  constructor() {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is required');
    }
    this.perplexityClient = new PerplexityClient(apiKey);
  }

  async processRequest(request: AskRequest): Promise<AskResponse> {
    try {
      switch (request.mode) {
        case 'article':
          return await this.handleArticleMode(request);
        case 'video':
          return await this.handleVideoMode(request);
        case 'highlight':
          return await this.handleHighlightMode(request);
        default:
          return {
            ok: false,
            error: `Unsupported mode: ${(request as any).mode}`,
          };
      }
    } catch (error) {
      console.error('Agent processing error:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async handleArticleMode(request: AskRequest): Promise<AskResponse> {
    try {
      // Search using Perplexity
      const searchResult = await this.perplexityClient.search({
        query: request.query,
        context: {
          url: request.context?.url,
          title: request.context?.title,
        },
      });

      // Get recommendations
      const recommendations = await recommendNext({
        topic: request.query,
        recent: [], // In production, this would come from user history
      });

      // Create Brief
      const brief: Brief = {
        id: generateId(),
        query: request.query,
        context: request.context,
        title: this.generateTitle(request.query, searchResult.answer),
        summary: this.extractSummary(searchResult.answer),
        bullets: this.extractBullets(searchResult.answer),
        citations: searchResult.citations,
        createdAt: new Date().toISOString(),
      };

      // Validate the brief
      const validation = validateBrief(brief);
      if (!validation.success) {
        console.error('Brief validation failed:', validation.error);
        return {
          ok: false,
          error: 'Failed to generate valid brief',
        };
      }

      return {
        ok: true,
        brief,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to process article request',
      };
    }
  }

  private async handleVideoMode(request: AskRequest): Promise<AskResponse> {
    try {
      let contextText = '';
      
      // Get transcript if timestamp is provided
      if (request.context?.url && request.context?.timestampSec !== undefined) {
        const timestampSec = request.context.timestampSec;
        const transcript = await getTranscriptSlice({
          url: request.context.url,
          t0: Math.max(0, timestampSec - 5), // 5 seconds before
          t1: timestampSec + 5, // 5 seconds after
        });
        contextText = transcript.text;
      }

      // Search using Perplexity with video context
      const searchResult = await this.perplexityClient.search({
        query: request.query,
        context: {
          url: request.context?.url,
          title: request.context?.title,
          content: contextText,
        },
      });

      // Create Brief
      const brief: Brief = {
        id: generateId(),
        query: request.query,
        context: request.context,
        title: this.generateTitle(request.query, searchResult.answer),
        summary: this.extractSummary(searchResult.answer),
        bullets: this.extractBullets(searchResult.answer),
        citations: searchResult.citations,
        createdAt: new Date().toISOString(),
      };

      const validation = validateBrief(brief);
      if (!validation.success) {
        return {
          ok: false,
          error: 'Failed to generate valid brief',
        };
      }

      return {
        ok: true,
        brief,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to process video request',
      };
    }
  }

  private async handleHighlightMode(request: AskRequest): Promise<AskResponse> {
    try {
      if (!request.selectionText) {
        return {
          ok: false,
          error: 'Selection text is required for highlight mode',
        };
      }

      // Summarize selection
      const selectionSummary = await summarizeSelection({
        text: request.selectionText,
        url: request.context?.url,
      });

      // Create Brief
      const brief: Brief = {
        id: generateId(),
        query: request.query || 'Explain selection',
        context: request.context,
        title: selectionSummary.title,
        summary: selectionSummary.summary,
        bullets: selectionSummary.bullets,
        citations: selectionSummary.citations,
        createdAt: new Date().toISOString(),
      };

      const validation = validateBrief(brief);
      if (!validation.success) {
        return {
          ok: false,
          error: 'Failed to generate valid brief',
        };
      }

      return {
        ok: true,
        brief,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to process highlight request',
      };
    }
  }

  private generateTitle(query: string, answer: string): string {
    // Extract first sentence or use query
    const firstSentence = answer.split(/[.!?]/)[0]?.trim();
    if (firstSentence && firstSentence.length < 80) {
      return firstSentence;
    }
    
    // Fallback to query
    return query.length > 60 ? `${query.slice(0, 57)}...` : query;
  }

  private extractSummary(answer: string): string {
    // Take first 2-3 sentences as summary
    const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 3).join('. ').trim() + '.';
  }

  private extractBullets(answer: string): string[] {
    // Look for bullet points or numbered lists in the answer
    const lines = answer.split('\n').map(line => line.trim());
    const bullets: string[] = [];
    
    for (const line of lines) {
      // Check for bullet points or numbered items
      if (line.match(/^[-•*]\s+/) || line.match(/^\d+\.\s+/)) {
        bullets.push(line.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, ''));
      }
    }
    
    // If no bullets found, create them from sentences
    if (bullets.length === 0) {
      const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 20);
      return sentences.slice(0, 5).map(s => s.trim());
    }
    
    return bullets.slice(0, 7); // Limit to 7 bullets max
  }
}

// Start the agent
export async function startAgent(): Promise<void> {
  const agent = new MastraAgent();
  
  // Listen for IPC messages from Electron main process
  process.on('message', async (message: any) => {
    if (message.type === 'ask') {
      const response = await agent.processRequest(message.data);
      process.send?.({
        type: 'response',
        id: message.id,
        data: response,
      });
    }
  });
  
  // Signal that agent is ready
  process.send?.({ type: 'ready' });
  
  console.log('Mastra agent started and ready');
}