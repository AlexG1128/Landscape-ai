import type { AIProvider, AnalyzeInput } from './types.js';
import type { Suggestion, YardAnalysis, Sun } from '../../types.js';
import { PLANTS, getPlantById } from '../../data/plants.js';
import { MockAIProvider } from './mockProvider.js';

/**
 * Real AI provider backed by Google Gemini.
 *
 *  - Yard analysis uses a Gemini vision model with a structured JSON schema,
 *    so we get back reliable, parseable suggestions instead of free text.
 *  - The redesign uses Gemini 2.5 Flash Image ("Nano Banana"), which performs
 *    image-to-image editing: it keeps the user's actual house/yard and adds the
 *    landscaping, returning a new image inline (base64).
 *
 * Get a key at https://aistudio.google.com/ → "Get API key", then set:
 *   AI_PROVIDER=gemini
 *   AI_API_KEY=your_key
 *
 * If any Gemini call fails, we fall back to the mock so the app never breaks.
 */
export class GeminiAIProvider implements AIProvider {
  readonly name = 'gemini';

  private readonly base = 'https://generativelanguage.googleapis.com/v1beta';
  private readonly visionModel = 'gemini-2.5-flash';
  private readonly imageModel = 'gemini-2.5-flash-image';
  private readonly fallback = new MockAIProvider();

  constructor(private readonly apiKey: string) {}

  async analyzeYard(input: AnalyzeInput): Promise<YardAnalysis> {
    try {
      const { mime, data } = splitDataUri(input.image);

      // Run suggestions (vision) and redesign (image) in parallel.
      const [analysis, redesign] = await Promise.all([
        this.getSuggestions(input, mime, data),
        this.getRedesign(input, mime, data).catch((e) => {
          console.error('[gemini] redesign failed, using placeholder:', e);
          return null;
        }),
      ]);

      if (redesign) {
        // Real AI redesign succeeded.
        analysis.redesign = { ...redesign, available: true };
      } else {
        // Image model unavailable (e.g. not on the current plan). Borrow the
        // mock's placeholder image + description so the UI never shows a blank,
        // and mark it as not a real redesign.
        const mock = await this.fallback.analyzeYard(input);
        analysis.redesign = {
          imageUrl: mock.redesign.imageUrl,
          description:
            'AI redesign images are not available on your current Gemini plan, so this is a ' +
            'preview. Your plant suggestions below are real. Enable billing on your Gemini ' +
            'API project to generate a redesigned photo of your actual yard.',
          available: false,
        };
      }
      return analysis;
    } catch (err) {
      console.error('[gemini] analyzeYard failed, falling back to mock:', err);
      return this.fallback.analyzeYard(input);
    }
  }

  // ---- 1. Vision analysis → structured suggestions ----
  private async getSuggestions(
    input: AnalyzeInput,
    mime: string,
    data: string,
  ): Promise<YardAnalysis> {
    const catalogForPrompt = PLANTS.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      sun: p.sun,
      zones: p.zones,
    }));

    const prompt = [
      'You are a professional landscape designer. Analyze this yard photo.',
      `The user is in USDA hardiness zone ${input.zone}.`,
      input.note
        ? `The user specifically wants: "${input.note}". Prioritize this in your picks and reasoning.`
        : '',
      'Choose 4-6 plants ONLY from the provided catalog that suit this specific yard',
      '(consider the detected sun exposure, existing features, and the hardiness zone).',
      'For each pick, give a short reason tied to what you see, and a placement in the yard.',
      'Here is the catalog you must choose from (use the exact id):',
      JSON.stringify(catalogForPrompt),
    ]
      .filter(Boolean)
      .join('\n');

    const schema = {
      type: 'OBJECT',
      properties: {
        summary: { type: 'STRING' },
        detectedFeatures: { type: 'ARRAY', items: { type: 'STRING' } },
        estimatedSun: { type: 'STRING', enum: ['full-sun', 'part-sun', 'shade'] },
        suggestions: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              plantId: { type: 'STRING' },
              reason: { type: 'STRING' },
              placement: { type: 'STRING' },
            },
            required: ['plantId', 'reason', 'placement'],
          },
        },
      },
      required: ['summary', 'detectedFeatures', 'estimatedSun', 'suggestions'],
    };

    const res = await fetch(
      `${this.base}/models/${this.visionModel}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }, { inlineData: { mimeType: mime, data } }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        }),
      },
    );

    if (!res.ok) throw new Error(`vision HTTP ${res.status}: ${await res.text()}`);

    const body = (await res.json()) as GeminiGenerateResponse;
    const text = body.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
    if (!text) throw new Error('vision returned no text');

    const parsed = JSON.parse(text) as {
      summary: string;
      detectedFeatures: string[];
      estimatedSun: Sun;
      suggestions: { plantId: string; reason: string; placement: string }[];
    };

    // Map returned plant ids back to full catalog entries; drop unknown ids.
    const suggestions: Suggestion[] = parsed.suggestions
      .map((s) => {
        const plant = getPlantById(s.plantId);
        return plant ? { plant, reason: s.reason, placement: s.placement } : null;
      })
      .filter((s): s is Suggestion => s !== null);

    return {
      summary: parsed.summary,
      detectedFeatures: parsed.detectedFeatures,
      estimatedSun: parsed.estimatedSun,
      suggestions,
      // Placeholder; always replaced in analyzeYard() before returning.
      redesign: { imageUrl: '', description: '', available: false },
    };
  }

  // ---- 2. Image-to-image redesign ----
  private async getRedesign(
    input: AnalyzeInput,
    mime: string,
    data: string,
  ): Promise<{ imageUrl: string; description: string }> {
    const prompt =
      'Redesign this exact yard with professional landscaping. Keep the house, ' +
      'structures, and perspective unchanged. Add tasteful, climate-appropriate ' +
      'planting beds, layered shrubs and flowers against bare walls, a tidy mulched ' +
      'border, and ground cover along edges. Make it look realistic and photographic.' +
      (input.note ? ` The homeowner specifically wants: ${input.note}.` : '');

    const res = await fetch(
      `${this.base}/models/${this.imageModel}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }, { inlineData: { mimeType: mime, data } }],
            },
          ],
        }),
      },
    );

    if (!res.ok) throw new Error(`image HTTP ${res.status}: ${await res.text()}`);

    const body = (await res.json()) as GeminiGenerateResponse;
    const parts = body.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p) => p.inlineData);
    const textPart = parts.find((p) => p.text);

    if (!imgPart?.inlineData) throw new Error('image response had no image part');

    return {
      imageUrl: `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`,
      description:
        textPart?.text ??
        'A redesigned view of your yard with layered, climate-appropriate planting.',
    };
  }
}

/** Accepts a data URI ("data:image/jpeg;base64,....") or raw base64. */
function splitDataUri(image: string): { mime: string; data: string } {
  const match = /^data:(.+?);base64,(.*)$/s.exec(image);
  if (match) return { mime: match[1], data: match[2] };
  return { mime: 'image/jpeg', data: image };
}

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: { mimeType: string; data: string };
      }>;
    };
  }>;
}
