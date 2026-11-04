import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { registerRoutes } from './routes.js';

async function main() {
  const app = Fastify({
    logger: true,
    bodyLimit: 15 * 1024 * 1024, // 15 MB to allow base64 yard photos
  });

  await app.register(cors, { origin: true });
  await registerRoutes(app);

  try {
    await app.listen({ port: config.port, host: config.host });
    app.log.info(`🌿 Landscape AI backend listening on http://${config.host}:${config.port}`);
    app.log.info(`AI provider: ${config.ai.provider} | Google Places: ${config.googlePlacesApiKey ? 'live' : 'mock'}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
