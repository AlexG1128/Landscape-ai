import type { YardAnalysis } from '../../types.js';

export interface AnalyzeInput {
  /** base64 image (data URI or raw base64). */
  image: string;
  /** Estimated USDA hardiness zone for the user's location. */
  zone: number;
  lat?: number;
  lng?: number;
  /** Optional free-text note from the user describing what they want. */
  note?: string;
}

/**
 * The contract every AI backend must satisfy. Swap implementations by setting
 * AI_PROVIDER in the environment and registering the provider in `factory.ts`.
 */
export interface AIProvider {
  readonly name: string;
  analyzeYard(input: AnalyzeInput): Promise<YardAnalysis>;
}
