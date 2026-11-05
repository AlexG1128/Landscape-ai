import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PLANTS, getPlantById } from './data/plants.js';
import { createAIProvider } from './services/ai/factory.js';
import { estimateZoneFromLat } from './services/zone.js';
import { findStores, retailerSearchLinks } from './services/stores.js';
import { config } from './config.js';

const ai = createAIProvider();

export async function registerRoutes(app: FastifyInstance) {
  // Health / status — handy for confirming which providers are live.
  app.get('/health', async () => ({
    status: 'ok',
    aiProvider: ai.name,
    googlePlaces: config.googlePlacesApiKey ? 'live' : 'mock',
  }));

  // ---- Plant catalog ----
  app.get('/plants', async (req) => {
    const schema = z.object({
      category: z.string().optional(),
      sun: z.string().optional(),
      search: z.string().optional(),
    });
    const { category, sun, search } = schema.parse(req.query ?? {});

    let results = PLANTS;
    if (category) results = results.filter((p) => p.category === category);
    if (sun) results = results.filter((p) => p.sun === sun);
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.scientificName?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)),
      );
    }
    return { plants: results };
  });

  app.get('/plants/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const plant = getPlantById(id);
    if (!plant) return reply.code(404).send({ error: 'Plant not found' });
    return {
      plant,
      buyLinks: retailerSearchLinks(plant.name),
    };
  });

  // ---- Yard analysis + redesign ----
  app.post('/analyze', async (req, reply) => {
    const schema = z.object({
      image: z.string().min(1, 'image (base64) is required'),
      lat: z.number().optional(),
      lng: z.number().optional(),
      note: z.string().max(1000).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.flatten() });
    }
    const { image, lat, lng, note } = parsed.data;
    const zone = estimateZoneFromLat(lat);

    const analysis = await ai.analyzeYard({ image, zone, lat, lng, note });
    return { zone, analysis };
  });

  // ---- Nearby stores ----
  app.get('/stores', async (req) => {
    const schema = z.object({
      lat: z.coerce.number().optional(),
      lng: z.coerce.number().optional(),
      query: z.string().optional(),
    });
    const { lat, lng, query } = schema.parse(req.query ?? {});
    const stores = await findStores({ lat, lng, query });
    return {
      stores,
      buyLinks: query ? retailerSearchLinks(query) : [],
    };
  });
}
