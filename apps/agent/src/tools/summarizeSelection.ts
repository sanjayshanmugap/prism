import type { Brief, Citation } from '@prism/shared';
import { generateId, dedupeCitations } from '@prism/shared';

export async function summarizeSelection(params: {
  text: string;
  url?: string;
}): Promise<{ title: string; summary: string; bullets: string[]; citations: Citation[] }> {
  const { text, url } = params;

  // For MVP, we'll create a simple summary
  // In production, this would use an LLM for better results
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const keyTerms = extractKeyTerms(text);
  
  const title = generateTitle(text, keyTerms);
  const summary = generateSummary(sentences, keyTerms);
  const bullets = generateBullets(sentences, keyTerms);
  const citations = await generateCitations(keyTerms, url);

  return {
    title,
    summary,
    bullets,
    citations: dedupeCitations(citations),
  };
}

function extractKeyTerms(text: string): string[] {
  // Simple keyword extraction - in production use NLP libraries
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  const entries: Array<[string, number]> = [];
  for (const word in frequency) {
    if (frequency.hasOwnProperty(word)) {
      entries.push([word, frequency[word]]);
    }
  }
  
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);
}

function generateTitle(text: string, keyTerms: string[]): string {
  // Extract first sentence or use key terms
  const firstSentence = text.split(/[.!?]/)[0]?.trim();
  if (firstSentence && firstSentence.length < 80) {
    return firstSentence;
  }
  
  const capitalizedTerms = keyTerms
    .slice(0, 3)
    .map(term => term.charAt(0).toUpperCase() + term.slice(1));
  
  return capitalizedTerms.join(', ') || 'Selected Text Summary';
}

function generateSummary(sentences: string[], keyTerms: string[]): string {
  // Select most relevant sentences based on key terms
  const scoredSentences = sentences.map(sentence => {
    const score = keyTerms.reduce((acc, term) => {
      return acc + (sentence.toLowerCase().includes(term) ? 1 : 0);
    }, 0);
    return { sentence: sentence.trim(), score };
  });

  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.sentence);

  return topSentences.join(' ') || 'This is a summary of the selected text.';
}

function generateBullets(sentences: string[], keyTerms: string[]): string[] {
  // Create bullet points from key concepts
  const bullets: string[] = [];
  
  // Add key terms as concepts
  keyTerms.slice(0, 3).forEach(term => {
    const relevantSentence = sentences.find(s => 
      s.toLowerCase().includes(term.toLowerCase())
    );
    if (relevantSentence) {
      bullets.push(`Key concept: ${term} - ${relevantSentence.slice(0, 100)}...`);
    }
  });

  // Add additional context bullets
  if (sentences.length > 0) {
    bullets.push(`Context: ${sentences[0].slice(0, 100)}...`);
  }

  return bullets.length > 0 ? bullets : ['Selected text analyzed'];
}

async function generateCitations(keyTerms: string[], sourceUrl?: string): Promise<Citation[]> {
  const citations: Citation[] = [];

  // Add source URL if provided
  if (sourceUrl) {
    try {
      const url = new URL(sourceUrl);
      citations.push({
        title: `Source: ${url.hostname}`,
        url: sourceUrl,
        publisher: url.hostname.replace('www.', ''),
      });
    } catch {
      // Invalid URL, skip
    }
  }

  // Add some default reference citations (in production, these would be from actual searches)
  keyTerms.slice(0, 2).forEach((term, index) => {
    citations.push({
      title: `${term.charAt(0).toUpperCase() + term.slice(1)} - Reference`,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(term)}`,
      publisher: 'Wikipedia',
    });
  });

  return citations;
}