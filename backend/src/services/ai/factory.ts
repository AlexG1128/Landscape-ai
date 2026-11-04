import { config } from '../../config.js';
import type { AIProvider } from './types.js';
import { MockAIProvider } from './mockProvider.js';

/**
 * Returns the configured AI provider.
 *
 * To add a real provider:
 *   1. Create a class implementing `AIProvider` (see `./mockProvider.ts`).
 *      It should send the image + prompt to your model and map the response
 *      into a `YardAnalysis`.
 *   2. Register it in the switch below under a provider key.
 *   3. Set AI_PROVIDER=<key> and AI_API_KEY=<secret> in `.env`.
 *
 * Example skeleton for a real provider:
 *
 *   export class GeminiAIProvider implements AIProvider {
 *     readonly name = 'gemini';
 *     constructor(private apiKey: string) {}
 *     async analyzeYard(input: AnalyzeInput): Promise<YardAnalysis> {
 *       // 1. call vision model with input.image to get suggestions
 *       // 2. call image model with input.image + prompt to get redesign
 *       // 3. map results into YardAnalysis
 *     }
 *   }
 */
export function createAIProvider(): AIProvider {
  switch (config.ai.provider) {
    // case 'gemini':
    //   if (!config.ai.apiKey) break;
    //   return new GeminiAIProvider(config.ai.apiKey);

    case 'mock':
    default:
      return new MockAIProvider();
  }
}
