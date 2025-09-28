export type Citation = {
  title: string;
  url: string;
  publisher?: string;
  publishedAt?: string;
};

export type Brief = {
  id: string;
  query: string;
  context?: {
    url?: string;
    title?: string;
    timestampSec?: number;
  };
  title: string;
  summary: string;
  bullets: string[];
  citations: Citation[];
  createdAt: string;
};

export type AskRequest = {
  query: string;
  mode: 'article' | 'video' | 'highlight';
  selectionText?: string;
  context?: {
    url?: string;
    title?: string;
    timestampSec?: number;
  };
};

export type AskResponse = 
  | { ok: true; brief: Brief }
  | { ok: false; error: string };

// Additional utility types
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export type PerplexitySearchParams = {
  query: string;
  context?: {
    url?: string;
    title?: string;
    content?: string;
  };
};

export type PerplexitySearchResult = {
  answer: string;
  citations: Citation[];
};

export type TranscriptSlice = {
  text: string;
  startTime?: number;
  endTime?: number;
};

export type RecommendationCard = {
  title: string;
  url: string;
  description?: string;
  publisher?: string;
};