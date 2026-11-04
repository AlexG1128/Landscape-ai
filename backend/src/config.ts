import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? '0.0.0.0',
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY ?? '',
  ai: {
    provider: (process.env.AI_PROVIDER ?? 'mock').toLowerCase(),
    apiKey: process.env.AI_API_KEY ?? '',
  },
} as const;

export const hasGooglePlaces = () => config.googlePlacesApiKey.length > 0;
