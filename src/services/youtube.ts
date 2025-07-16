// src/services/youtube.ts
'use server';

import TranscriptClient from 'youtube-transcript-api';

/**
 * Extracts the YouTube video ID from a URL.
 * @param url A YouTube watch URL or direct ID.
 * @returns The video ID.
 * @throws If no ID is found.
 */
function extractVideoId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (!match) throw new Error(`Invalid YouTube URL or ID: ${url}`);
  return match[1];
}

let client: TranscriptClient | null = null;

/**
 * Fetches the transcript text for a YouTube video.
 * @param url YouTube video URL or ID.
 * @returns Full transcript text, or an empty string if unavailable.
 */
export async function getYouTubeTranscript(url: string): Promise<string> {
  const videoId = extractVideoId(url);

  if (!client) {
    client = new TranscriptClient({
      headers: { 'User-Agent': 'Mozilla/5.0' },
      // optional: timeout, proxy, etc
    });
    await client.ready;
  }

  try {
    const result = await client.getTranscript(videoId);
    if (!result || !result.transcript || result.transcript.length === 0) {
      console.warn('No transcript found for:', videoId);
      return '';
    }
    return result.transcript.map(s => s.text).join(' ');
  } catch (err: any) {
    console.error(`Transcript fetch failed for ${videoId}:`, err);
    return '';
  }
}
