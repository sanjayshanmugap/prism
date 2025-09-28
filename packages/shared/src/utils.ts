// Utility functions for URL normalization and deduplication
export const normalizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Remove tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
    trackingParams.forEach(param => urlObj.searchParams.delete(param));
    
    // Remove trailing slash
    if (urlObj.pathname.endsWith('/') && urlObj.pathname.length > 1) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    
    return urlObj.toString();
  } catch {
    return url;
  }
};

export const dedupeCitations = (citations: Array<{ url: string; [key: string]: unknown }>): typeof citations => {
  const seen = new Set<string>();
  return citations.filter(citation => {
    const normalized = normalizeUrl(citation.url);
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
};

export const generateId = (): string => {
  return crypto.randomUUID();
};

export const formatTimestamp = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const secondsStr = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
  return `${minutes}:${secondsStr}`;
};

export const parseYouTubeUrl = (url: string): { videoId?: string; timestampSec?: number } => {
  try {
    const urlObj = new URL(url);
    let videoId: string | undefined;
    let timestampSec: number | undefined;

    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      videoId = urlObj.searchParams.get('v') || undefined;
    }

    const t = urlObj.searchParams.get('t');
    if (t) {
      // Parse timestamp (e.g., "1m30s" or "90")
      const match = t.match(/^(?:(\d+)m)?(?:(\d+)s?)?$/);
      if (match) {
        const minutes = parseInt(match[1] || '0', 10);
        const seconds = parseInt(match[2] || '0', 10);
        timestampSec = minutes * 60 + seconds;
      } else {
        timestampSec = parseInt(t, 10) || undefined;
      }
    }

    return { videoId, timestampSec };
  } catch {
    return {};
  }
};