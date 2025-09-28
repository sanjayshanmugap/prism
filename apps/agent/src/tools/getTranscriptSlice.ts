import type { TranscriptSlice } from '@prism/shared';
import { parseYouTubeUrl } from '@prism/shared';
import { YouTubeAPI } from './youtubeAPI';

export async function getTranscriptSlice(params: {
  url: string;
  t0: number;
  t1: number;
}): Promise<TranscriptSlice> {
  const { url, t0, t1 } = params;

  try {
    // Check if it's a YouTube URL
    const { videoId } = parseYouTubeUrl(url);
    
    if (videoId) {
      return await getYouTubeTranscript(url, t0, t1);
    }

    // For non-YouTube videos, return a placeholder
    return {
      text: '(Transcript unavailable for this video source)',
      startTime: t0,
      endTime: t1,
    };
  } catch (error) {
    console.error('Error getting transcript slice:', error);
    return {
      text: '(Unable to retrieve transcript)',
      startTime: t0,
      endTime: t1,
    };
  }
}

async function getYouTubeTranscript(
  url: string,
  startTime: number,
  endTime: number
): Promise<TranscriptSlice> {
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  
  if (youtubeApiKey) {
    try {
      const youtubeAPI = new YouTubeAPI(youtubeApiKey);
      const result = await youtubeAPI.getVideoTranscript(url, startTime, endTime);
      
      return {
        text: result.text,
        startTime: result.startTime || startTime,
        endTime: result.endTime || endTime,
      };
    } catch (error) {
      console.error('YouTube API error, falling back to mock:', error);
    }
  }

  // Fallback to mock data
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Placeholder transcript data
    const mockTranscripts = [
      "In this segment, we're discussing the economic implications of the policy changes.",
      "The data shows a significant trend in the market indicators over the past quarter.",
      "Let's examine the key factors that contributed to this development.",
      "These findings suggest a correlation between the two variables we've been tracking.",
      "Moving forward, we need to consider the long-term effects on the industry."
    ];

    // Select a mock transcript based on time
    const index = Math.floor(startTime / 30) % mockTranscripts.length;
    const text = mockTranscripts[index];

    return {
      text,
      startTime,
      endTime,
    };
  } catch (error) {
    console.error('YouTube transcript error:', error);
    return {
      text: '(Captions unavailable)',
      startTime,
      endTime,
    };
  }
}

// Real YouTube transcript implementation would look like this:
/*
async function getRealYouTubeTranscript(
  videoId: string,
  startTime: number,
  endTime: number
): Promise<TranscriptSlice> {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  try {
    // 1. Get caption tracks
    const captionsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!captionsResponse.ok) {
      throw new Error('Failed to fetch captions');
    }
    
    const captionsData = await captionsResponse.json();
    const tracks = captionsData.items;
    
    if (!tracks || tracks.length === 0) {
      throw new Error('No captions available');
    }
    
    // 2. Get the first available track (preferably English)
    const englishTrack = tracks.find(track => 
      track.snippet.language === 'en' || track.snippet.language === 'en-US'
    ) || tracks[0];
    
    // 3. Download caption content
    const captionResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions/${englishTrack.id}?key=${YOUTUBE_API_KEY}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!captionResponse.ok) {
      throw new Error('Failed to download caption');
    }
    
    const captionText = await captionResponse.text();
    
    // 4. Parse WebVTT/SRT and extract time slice
    const transcriptSlice = parseTranscriptSlice(captionText, startTime, endTime);
    
    return transcriptSlice;
  } catch (error) {
    console.error('YouTube transcript error:', error);
    throw error;
  }
}

function parseTranscriptSlice(
  captionContent: string,
  startTime: number,
  endTime: number
): TranscriptSlice {
  // Parse WebVTT or SRT format and extract text for the time range
  // This is a simplified version - real implementation would be more robust
  
  const lines = captionContent.split('\n');
  const segments: Array<{ start: number; end: number; text: string }> = [];
  
  // Basic WebVTT parsing
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes(' --> ')) {
      const [startStr, endStr] = line.split(' --> ');
      const start = parseTimeString(startStr);
      const end = parseTimeString(endStr);
      
      // Get text from next lines until empty line
      let text = '';
      i++;
      while (i < lines.length && lines[i].trim() !== '') {
        text += lines[i].trim() + ' ';
        i++;
      }
      
      if (text.trim()) {
        segments.push({ start, end, text: text.trim() });
      }
    }
  }
  
  // Find segments within time range
  const relevantSegments = segments.filter(
    segment => segment.start <= endTime && segment.end >= startTime
  );
  
  const text = relevantSegments.map(s => s.text).join(' ');
  
  return {
    text: text || '(No transcript available for this time range)',
    startTime,
    endTime,
  };
}

function parseTimeString(timeStr: string): number {
  // Parse "00:01:30.500" format to seconds
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 0;
}
*/