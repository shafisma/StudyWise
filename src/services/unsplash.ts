// src/services/unsplash.ts
'use server';
/**
 * @fileOverview A service for interacting with the Unsplash API.
 * 
 * - searchUnsplashImage - Fetches a single image from Unsplash based on a query.
 */

interface UnsplashImage {
    urls: {
        regular: string;
    };
    alt_description: string;
}

interface UnsplashResponse {
    results: UnsplashImage[];
    total: number;
}

/**
 * Fetches the URL of the first image result from Unsplash for a given query.
 * @param query The search query.
 * @returns A promise that resolves to the URL of the first image.
 * @throws An error if the API key is missing or if the request fails.
 */
export async function searchUnsplashImage(query: string): Promise<string> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
        throw new Error('Unsplash Access Key is not configured in environment variables.');
    }

    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.append('query', query);
    url.searchParams.append('page', '1');
    url.searchParams.append('per_page', '1');
    url.searchParams.append('orientation', 'landscape'); // Prefer landscape images

    try {
        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Client-ID ${accessKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Unsplash API responded with status: ${response.status}`);
        }

        const data: UnsplashResponse = await response.json();
        
        if (data.total === 0 || data.results.length === 0) {
            throw new Error('No images found for the query.');
        }

        return data.results[0].urls.regular;

    } catch (error) {
        console.error('Failed to fetch image from Unsplash:', error);
        throw new Error('An error occurred while fetching an image from Unsplash.');
    }
}
