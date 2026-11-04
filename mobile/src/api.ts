import Constants from 'expo-constants';
import type { AnalyzeResponse, Plant, PlantDetail, StoresResponse } from './types';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  'http://localhost:3000';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed (${res.status}): ${text}`);
  }
  return (await res.json()) as T;
}

export const api = {
  baseUrl: API_URL,

  async health() {
    return json<{ status: string; aiProvider: string; googlePlaces: string }>(
      await fetch(`${API_URL}/health`),
    );
  },

  async getPlants(params: { category?: string; search?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.category) qs.set('category', params.category);
    if (params.search) qs.set('search', params.search);
    const res = await fetch(`${API_URL}/plants?${qs.toString()}`);
    return json<{ plants: Plant[] }>(res);
  },

  async getPlant(id: string) {
    return json<PlantDetail>(await fetch(`${API_URL}/plants/${id}`));
  },

  async analyze(input: { image: string; lat?: number; lng?: number }) {
    const res = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return json<AnalyzeResponse>(res);
  },

  async getStores(params: { lat?: number; lng?: number; query?: string }) {
    const qs = new URLSearchParams();
    if (params.lat !== undefined) qs.set('lat', String(params.lat));
    if (params.lng !== undefined) qs.set('lng', String(params.lng));
    if (params.query) qs.set('query', params.query);
    return json<StoresResponse>(await fetch(`${API_URL}/stores?${qs.toString()}`));
  },
};
