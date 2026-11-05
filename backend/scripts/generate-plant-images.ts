/**
 * Generate a real photo for every plant in the catalog using Google Gemini's
 * image model, and write them to `src/data/plant-images.json` which the API
 * merges into the catalog automatically.
 *
 * ⚠️ This uses the PAID Gemini image model (free tier limit is 0), so running
 * it will incur a small per-image cost on your Gemini billing account.
 *
 * USAGE (run on your own machine, from the backend/ folder):
 *   AI_API_KEY=your_gemini_key npx tsx scripts/generate-plant-images.ts
 *
 * Options (env vars):
 *   LIMIT=5     only generate the first N (great for a cheap test run)
 *   ONLY=rose   only generate plants whose id/name contains this text
 *
 * Re-running skips plants that already have an image, so it's safe to resume.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLANTS } from '../src/data/plants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'src', 'data', 'plant-images.json');

const API_KEY = process.env.AI_API_KEY;
const MODEL = process.env.AI_IMAGE_MODEL ?? 'gemini-2.5-flash-image';
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;
const ONLY = process.env.ONLY?.toLowerCase();

if (!API_KEY) {
  console.error('❌ Set AI_API_KEY to your Gemini key. Example:');
  console.error('   AI_API_KEY=xxxx npx tsx scripts/generate-plant-images.ts');
  process.exit(1);
}

// Load any previously generated images so we can resume without re-paying.
const images: Record<string, string> = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, 'utf8'))
  : {};

async function generate(prompt: string): Promise<string | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
    },
  );
  if (!res.ok) {
    console.error(`  ⚠️  HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return null;
  }
  const body = (await res.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { mimeType: string; data: string } }[] } }[];
  };
  const part = body.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part?.inlineData) return null;
  return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
}

async function main() {
  let targets = PLANTS.filter((p) => !images[p.id]);
  if (ONLY) {
    targets = targets.filter(
      (p) => p.id.includes(ONLY) || p.name.toLowerCase().includes(ONLY),
    );
  }
  targets = targets.slice(0, LIMIT);

  console.log(`Generating images for ${targets.length} plant(s) with ${MODEL}…\n`);

  for (const plant of targets) {
    const prompt =
      `A single photorealistic ${plant.name} (${plant.scientificName ?? plant.category}) ` +
      `growing in a well-kept garden, natural daylight, shallow depth of field, ` +
      `high detail, no text or watermarks.`;
    process.stdout.write(`• ${plant.name}… `);
    try {
      const dataUri = await generate(prompt);
      if (dataUri) {
        images[plant.id] = dataUri;
        // Save after each success so a crash never loses progress.
        mkdirSync(dirname(OUT), { recursive: true });
        writeFileSync(OUT, JSON.stringify(images, null, 0));
        console.log('✓');
      } else {
        console.log('skipped (no image returned)');
      }
    } catch (e) {
      console.log(`failed: ${e instanceof Error ? e.message : e}`);
    }
    // Gentle pacing to respect rate limits.
    await new Promise((r) => setTimeout(r, 1200));
  }

  console.log(`\n✅ Done. ${Object.keys(images).length} image(s) saved to ${OUT}`);
  console.log('Restart the backend to serve them.');
}

main();
