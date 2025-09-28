import fetch from 'node-fetch';
import { parseYouTubeUrl } from '@prism/shared';

export class YouTubeAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getVideoTranscript(url: string, startTime?: number, endTime?: number): Promise<{
    text: string;
    startTime?: number;
    endTime?: number;
  }> {
    const { videoId } = parseYouTubeUrl(url);
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    try {
      // First, get the video details to find caption tracks
      const videoData = await this.getVideoDetails(videoId);
      
      // Get available caption tracks
      const captionTracks = await this.getCaptionTracks(videoId);
      
      if (captionTracks.length === 0) {
        return {
          text: '(No captions available for this video)',
          startTime,
          endTime,
        };
      }

      // Prefer English captions
      const englishTrack = captionTracks.find(track => 
        track.snippet.language === 'en' || 
        track.snippet.language === 'en-US' ||
        track.snippet.language === 'en-GB'
      ) || captionTracks[0];

      // Download and parse the caption content
      const captionContent = await this.downloadCaptions(englishTrack.id);
      
      // Extract text for the specified time range
      const transcriptText = this.extractTimeSlice(captionContent, startTime, endTime);

      return {
        text: transcriptText || '(No transcript available for this time range)',
        startTime,
        endTime,
      };

    } catch (error) {
      console.error('YouTube API error:', error);
      
      // Fallback to mock data for development
      return {
        text: this.getMockTranscript(startTime || 0),
        startTime,
        endTime,
      };
    }
  }

  private async getVideoDetails(videoId: string): Promise<any> {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found');
    }

    return data.items[0];
  }

  private async getCaptionTracks(videoId: string): Promise<any[]> {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`YouTube Captions API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.items || [];
  }

  private async downloadCaptions(captionId: string): Promise<string> {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${this.apiKey}`,
      {
        headers: {
          'Accept': 'text/vtt', // Request WebVTT format
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Caption download error: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  }

  private extractTimeSlice(vttContent: string, startTime?: number, endTime?: number): string {
    if (!startTime && !endTime) {
      // Return first few lines if no time range specified
      return this.parseVTTContent(vttContent).slice(0, 5).map(c => c.text).join(' ');
    }

    const captions = this.parseVTTContent(vttContent);
    const start = startTime || 0;
    const end = endTime || start + 10; // Default 10 second window

    const relevantCaptions = captions.filter(caption => 
      caption.startTime <= end && caption.endTime >= start
    );

    return relevantCaptions.map(c => c.text).join(' ');
  }

  private parseVTTContent(vttContent: string): Array<{
    startTime: number;
    endTime: number;
    text: string;
  }> {
    const captions: Array<{ startTime: number; endTime: number; text: string }> = [];
    const lines = vttContent.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for timestamp lines (format: "00:00:01.000 --> 00:00:03.000")
      if (line.includes(' --> ')) {
        const [startStr, endStr] = line.split(' --> ');
        const startTime = this.parseVTTTimestamp(startStr);
        const endTime = this.parseVTTTimestamp(endStr);
        
        // Get caption text from following lines
        let text = '';
        i++;
        while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes(' --> ')) {
          text += lines[i].trim() + ' ';
          i++;
        }
        i--; // Back up one since the loop will increment
        
        if (text.trim()) {
          captions.push({
            startTime,
            endTime,
            text: text.trim(),
          });
        }
      }
    }

    return captions;
  }

  private parseVTTTimestamp(timeStr: string): number {
    // Parse WebVTT timestamp format: "00:01:30.500"
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseFloat(parts[2]);
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  }

  private getMockTranscript(startTime: number): string {
    // Mock transcript data for development/fallback
    const mockSegments = [
      "In today's discussion, we're exploring the fundamental concepts that drive innovation in technology.",
      "The key factors we need to consider include scalability, user experience, and long-term sustainability.",
      "Research shows that successful implementations often share common characteristics across different industries.",
      "Let's examine the data that supports these findings and understand the broader implications.",
      "Moving forward, we'll need to balance these considerations with practical constraints and user needs.",
    ];

    // Select segment based on timestamp
    const segmentIndex = Math.floor(startTime / 30) % mockSegments.length;
    return mockSegments[segmentIndex];
  }

  async searchVideos(query: string, maxResults = 5): Promise<Array<{
    videoId: string;
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnailUrl: string;
  }>> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube Search API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      return (data.items || []).map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails.medium?.url || '',
      }));

    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }
}