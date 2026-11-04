import type { AIProvider, AnalyzeInput } from './types.js';
import type { Suggestion, YardAnalysis, Sun } from '../../types.js';
import { PLANTS } from '../../data/plants.js';
import { zoneInRange } from '../zone.js';

/**
 * Offline AI stand-in. Produces realistic, varied output so the whole app runs
 * end-to-end with no API keys. The suggestion logic here is deliberately real
 * (it filters the catalog by zone + sun + layering) so the mock output feels
 * genuine and the UI can be built against meaningful data.
 */
export class MockAIProvider implements AIProvider {
  readonly name = 'mock';

  async analyzeYard(input: AnalyzeInput): Promise<YardAnalysis> {
    // Simulate a touch of latency so the loading UI is exercised.
    await delay(600);

    const estimatedSun: Sun = 'full-sun';

    const zoneOk = PLANTS.filter((p) => zoneInRange(input.zone, p.zones));

    const pick = (pred: (tags: string[]) => boolean): typeof PLANTS =>
      zoneOk.filter((p) => pred(p.tags));

    const suggestions: Suggestion[] = [];

    const anchor = pick((t) => t.includes('vertical') && t.includes('evergreen'))[0];
    if (anchor) {
      suggestions.push({
        plant: anchor,
        reason:
          'Breaks up the large blank wall with year-round vertical structure and evergreen color.',
        placement: 'Back of the bed, against the house wall near the window.',
      });
    }

    const midFlower = pick((t) => t.includes('flowering') && t.includes('showy'))[0];
    if (midFlower) {
      suggestions.push({
        plant: midFlower,
        reason:
          'Mid-height blooms pop beautifully against white siding and give the bed a season of color.',
        placement: 'Middle layer of the bed, in front of the evergreens.',
      });
    }

    const structure = pick((t) => t.includes('structure') && t.includes('low'))[0];
    if (structure) {
      suggestions.push({
        plant: structure,
        reason: 'Tidy evergreen globes give the bed a clean, intentionally designed look.',
        placement: 'Spaced along the front of the bed as repeating anchors.',
      });
    }

    const edging = pick((t) => t.includes('edging') && t.includes('drought-tolerant'))[0];
    if (edging) {
      suggestions.push({
        plant: edging,
        reason:
          'Soft mounding color hugs the curved paver border, making the sweep look purposeful and lush.',
        placement: 'Along the inner edge of the paver curve.',
      });
    }

    const moisture = pick((t) => t.includes('moisture-loving'))[0];
    if (moisture) {
      suggestions.push({
        plant: moisture,
        reason:
          'Thrives in the damp runoff near the downspout where many plants would struggle.',
        placement: 'The bare corner by the downspout.',
      });
    }

    // Ensure we always return a handful even if some picks were empty.
    for (const p of zoneOk) {
      if (suggestions.length >= 6) break;
      if (!suggestions.some((s) => s.plant.id === p.id)) {
        suggestions.push({
          plant: p,
          reason: `A reliable choice for your area (USDA zone ${input.zone}).`,
          placement: 'Open sunny ground in the main bed.',
        });
      }
    }

    return {
      summary:
        'A sunny side yard with a beautiful curved paver border and a large blank wall — a great canvas. ' +
        'Layering tall evergreens, mid-height flowering shrubs, and a soft front border will make the space feel designed and lush.',
      detectedFeatures: [
        'Curved charcoal paver edging',
        'Large blank house wall',
        'Healthy existing lawn',
        'Downspout / runoff corner',
        'Strong afternoon sun',
      ],
      estimatedSun,
      suggestions: suggestions.slice(0, 6),
      redesign: {
        imageUrl: PLACEHOLDER_REDESIGN,
        description:
          'The blank wall is layered with slim evergreens by the window, blue hydrangeas at mid-height, ' +
          'and a front ribbon of lavender and black-eyed Susans over fresh dark mulch. Soft catmint hugs the ' +
          'inner curve of the pavers, ferns fill the shady downspout corner, and solar lights trace the path.',
      },
    };
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A small inline SVG data URI so the UI has something to render with no network. */
const PLACEHOLDER_REDESIGN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
      <rect width="800" height="600" fill="#eef3ec"/>
      <rect y="380" width="800" height="220" fill="#8bbf6a"/>
      <circle cx="160" cy="330" r="70" fill="#5a8f4a"/>
      <circle cx="300" cy="350" r="55" fill="#6fa85a"/>
      <rect x="520" y="250" width="40" height="150" fill="#3f6b33"/>
      <rect x="590" y="230" width="40" height="170" fill="#3f6b33"/>
      <text x="400" y="80" font-family="sans-serif" font-size="34" fill="#355e2a"
        text-anchor="middle" font-weight="bold">Redesign preview (mock)</text>
      <text x="400" y="120" font-family="sans-serif" font-size="18" fill="#4a7a3c"
        text-anchor="middle">Add an AI provider key to generate a real image</text>
    </svg>`,
  );
