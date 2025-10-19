// utils/readingTime.ts

/**
 * Calculates the estimated speaking time for a given text.
 * @param text The article content string.
 * @param wpm Words per minute speaking rate (default is 150 WPM for speaking aloud).
 * @returns The estimated time in minutes, rounded up.
 */
export function calculateSpeechTime(text: string, wpm: number = 150): number {
    if (!text || text.length === 0) {
        return 0;
    }

    // A simple regex to count words by splitting on whitespace
    // Handles various whitespace characters (spaces, tabs, newlines)
    const wordCount = text.trim().split(/\s+/).length;

    // Calculate minutes, rounding up to the nearest whole minute
    // to give a generous estimate (e.g., 0.1 min becomes 1 min)
    const minutes = Math.ceil(wordCount / wpm);

    return minutes;
}