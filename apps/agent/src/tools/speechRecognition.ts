import { WebSocket } from 'ws';

export class DeepgramClient {
  private apiKey: string;
  private ws: WebSocket | null = null;
  private isConnected = false;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async startStreaming(onTranscription: (text: string) => void, onError?: (error: Error) => void): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Deepgram API key is required');
    }

    const deepgramUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=en-US&smart_format=true&interim_results=true&endpointing=300`;

    try {
      this.ws = new WebSocket(deepgramUrl, {
        headers: {
          Authorization: `Token ${this.apiKey}`,
        },
      });

      this.ws.on('open', () => {
        console.log('Deepgram WebSocket connected');
        this.isConnected = true;
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString());
          
          if (response.channel?.alternatives?.[0]?.transcript) {
            const transcript = response.channel.alternatives[0].transcript;
            if (transcript.trim() && response.is_final) {
              onTranscription(transcript);
            }
          }
        } catch (error) {
          console.error('Error parsing Deepgram response:', error);
          onError?.(error as Error);
        }
      });

      this.ws.on('error', (error) => {
        console.error('Deepgram WebSocket error:', error);
        this.isConnected = false;
        onError?.(error);
      });

      this.ws.on('close', () => {
        console.log('Deepgram WebSocket closed');
        this.isConnected = false;
      });

    } catch (error) {
      console.error('Failed to connect to Deepgram:', error);
      throw error;
    }
  }

  sendAudioData(audioData: Buffer): void {
    if (this.ws && this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(audioData);
    }
  }

  stopStreaming(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  isStreamingActive(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }
}

// Fallback STT using browser's built-in recognition (for testing)
export class BrowserSTT {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  async startListening(onResult: (text: string) => void, onError?: (error: Error) => void): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported in this environment');
    }

    if (this.isListening) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        this.isListening = false;
        resolve();
      };

      this.recognition.onerror = (event: any) => {
        const error = new Error(`Speech recognition error: ${event.error}`);
        onError?.(error);
        this.isListening = false;
        reject(error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
        this.isListening = true;
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}