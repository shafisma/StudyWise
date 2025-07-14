'use server';
/**
 * @fileOverview A service for interacting with the YouTube API.
 * 
 * - getYouTubeTranscript - Fetches the transcript for a given YouTube video URL.
 */

import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Fetches the transcript for a given YouTube video URL.
 * @param url The URL of the YouTube video.
 * @returns A promise that resolves to the full transcript text.
 * @throws An error if the transcript cannot be fetched.
 */
export async function getYouTubeTranscript(url: string): Promise<string> {
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(url);
        if (!transcript || transcript.length === 0) {
            throw new Error('No transcript found for this video.');
        }
        // Combine all parts of the transcript into a single string
        return transcript.map(item => item.text).join(' ');
    } catch (error) {
        console.error(`Failed to fetch transcript for URL: ${url}`, error);
        throw new Error('Could not retrieve transcript. The video may not have subtitles enabled or the URL may be invalid.');
    }
}
