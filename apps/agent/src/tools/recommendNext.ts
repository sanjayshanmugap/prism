import type { RecommendationCard } from '@prism/shared';

export async function recommendNext(params: {
  topic: string;
  recent: string[];
}): Promise<{ cards: RecommendationCard[] }> {
  const { topic, recent } = params;

  try {
    // For MVP, generate recommendations based on topic keywords
    const recommendations = await generateRecommendations(topic, recent);
    
    return {
      cards: recommendations.slice(0, 4), // Limit to 4 recommendations
    };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return {
      cards: [], // Return empty array on error
    };
  }
}

async function generateRecommendations(
  topic: string,
  recent: string[]
): Promise<RecommendationCard[]> {
  // Extract key terms from topic
  const keyTerms = extractTopicTerms(topic);
  
  // Generate recommendations based on terms
  const recommendations: RecommendationCard[] = [];
  
  // Add related news sources
  for (const term of keyTerms.slice(0, 2)) {
    const newsRecommendations = generateNewsRecommendations(term, recent);
    recommendations.push(...newsRecommendations);
  }
  
  // Add educational resources
  const educationalRecommendations = generateEducationalRecommendations(keyTerms, recent);
  recommendations.push(...educationalRecommendations);
  
  // Filter out recently viewed items
  const filtered = recommendations.filter(rec => 
    !recent.some(recentUrl => normalizeUrl(rec.url) === normalizeUrl(recentUrl))
  );
  
  return filtered;
}

function extractTopicTerms(topic: string): string[] {
  // Simple term extraction - in production use NLP
  const words = topic.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !isStopWord(word));
  
  // Remove duplicates and return top terms
  return [...new Set(words)].slice(0, 5);
}

function isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'between',
    'this', 'that', 'these', 'those', 'what', 'which', 'when',
    'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
    'more', 'most', 'other', 'some', 'such', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just'
  ]);
  
  return stopWords.has(word.toLowerCase());
}

function generateNewsRecommendations(
  term: string,
  recent: string[]
): RecommendationCard[] {
  const recommendations: RecommendationCard[] = [];
  
  // Major news sources with search URLs
  const newsSources = [
    {
      name: 'Reuters',
      baseUrl: 'https://www.reuters.com/search/news?blob=',
      domain: 'reuters.com'
    },
    {
      name: 'Associated Press',
      baseUrl: 'https://apnews.com/search?q=',
      domain: 'apnews.com'
    },
    {
      name: 'BBC News',
      baseUrl: 'https://www.bbc.com/search?q=',
      domain: 'bbc.com'
    },
    {
      name: 'NPR',
      baseUrl: 'https://www.npr.org/search?query=',
      domain: 'npr.org'
    }
  ];
  
  // Add one recommendation per major source
  newsSources.slice(0, 2).forEach(source => {
    recommendations.push({
      title: `${term} - Latest from ${source.name}`,
      url: `${source.baseUrl}${encodeURIComponent(term)}`,
      description: `Recent news coverage about ${term} from ${source.name}`,
      publisher: source.domain,
    });
  });
  
  return recommendations;
}

function generateEducationalRecommendations(
  keyTerms: string[],
  recent: string[]
): RecommendationCard[] {
  const recommendations: RecommendationCard[] = [];
  
  // Educational sources
  const sources = [
    {
      name: 'Wikipedia',
      baseUrl: 'https://en.wikipedia.org/wiki/',
      domain: 'wikipedia.org',
      description: 'Comprehensive encyclopedia article'
    },
    {
      name: 'Britannica',
      baseUrl: 'https://www.britannica.com/search?query=',
      domain: 'britannica.com',
      description: 'Authoritative reference material'
    }
  ];
  
  // Add educational resources for top terms
  keyTerms.slice(0, 2).forEach((term, index) => {
    const source = sources[index % sources.length];
    recommendations.push({
      title: `${term.charAt(0).toUpperCase() + term.slice(1)} - ${source.name}`,
      url: `${source.baseUrl}${encodeURIComponent(term)}`,
      description: `${source.description} about ${term}`,
      publisher: source.domain,
    });
  });
  
  return recommendations;
}

function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove query params and fragments for comparison
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
  } catch {
    return url;
  }
}