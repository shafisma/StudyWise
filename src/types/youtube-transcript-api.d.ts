// src/types/youtube-transcript-api.d.ts
declare module 'youtube-transcript-api' {
  export default class TranscriptClient {
    constructor(options?: Record<string, any>);
    ready: Promise<void>;
    getTranscript(videoId: string): Promise<{
      transcript: Array<{ text: string }>;
    }>;
  }
}
