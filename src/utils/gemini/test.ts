import { GeminiClient } from './client';
import { env } from '../../config/env';

export async function testGeminiConnection(): Promise<{
  isConfigured: boolean;
  isConnected: boolean;
  error?: string;
}> {
  try {
    // Check if API key is configured
    if (!env.GEMINI_API_KEY) {
      return {
        isConfigured: false,
        isConnected: false,
        error: 'Gemini API key is not configured'
      };
    }

    // Test simple prompt
    const client = GeminiClient.getInstance();
    const testPrompt = 'Say "hello" if you can receive this message.';
    const response = await client.generateContent(testPrompt);

    const isConnected = response.toLowerCase().includes('hello');

    return {
      isConfigured: true,
      isConnected,
      error: isConnected ? undefined : 'Unexpected response from API'
    };

  } catch (error) {
    return {
      isConfigured: Boolean(env.GEMINI_API_KEY),
      isConnected: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}