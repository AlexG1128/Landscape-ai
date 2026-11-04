import { config, hasGooglePlaces } from '../config.js';
import type { Store } from '../types.js';

interface FindStoresArgs {
  lat?: number;
  lng?: number;
  /** Optional plant/product name to build retailer search deep links. */
  query?: string;
}

/**
 * Finds nearby garden centers / hardware stores.
 *
 * - If GOOGLE_PLACES_API_KEY is set and coordinates are provided, it queries
 *   the Google Places "Nearby Search" (New) API.
 * - Otherwise it returns realistic mock stores so the app runs offline.
 */
export async function findStores({ lat, lng, query }: FindStoresArgs): Promise<Store[]> {
  if (hasGooglePlaces() && lat !== undefined && lng !== undefined) {
    try {
      return await fetchFromGooglePlaces(lat, lng, query);
    } catch (err) {
      console.error('[stores] Google Places failed, falling back to mock:', err);
    }
  }
  return mockStores(query);
}

async function fetchFromGooglePlaces(
  lat: number,
  lng: number,
  query?: string,
): Promise<Store[]> {
  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': config.googlePlacesApiKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.currentOpeningHours.openNow,places.googleMapsUri',
    },
    body: JSON.stringify({
      includedTypes: ['home_improvement_store', 'garden_center', 'hardware_store'],
      maxResultCount: 12,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 20000, // 20 km
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Google Places HTTP ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as GooglePlacesResponse;
  const places = data.places ?? [];

  return places.map((p) => ({
    id: p.id,
    name: p.displayName?.text ?? 'Store',
    address: p.formattedAddress ?? '',
    lat: p.location?.latitude ?? lat,
    lng: p.location?.longitude ?? lng,
    rating: p.rating,
    openNow: p.currentOpeningHours?.openNow,
    url: p.googleMapsUri,
    distanceMiles: haversineMiles(lat, lng, p.location?.latitude ?? lat, p.location?.longitude ?? lng),
  }));
}

/** Retailer search deep links — the retailer shows its own live inventory. */
export function retailerSearchLinks(query: string): { name: string; url: string }[] {
  const q = encodeURIComponent(query);
  return [
    { name: 'Home Depot', url: `https://www.homedepot.com/s/${q}` },
    { name: "Lowe's", url: `https://www.lowes.com/search?searchTerm=${q}` },
    { name: 'Walmart Garden', url: `https://www.walmart.com/search?q=${q}` },
  ];
}

function mockStores(query?: string): Store[] {
  const link = query ? retailerSearchLinks(query)[0].url : undefined;
  return [
    {
      id: 'mock-hd',
      name: 'The Home Depot',
      address: '1200 Garden Way',
      lat: 0,
      lng: 0,
      rating: 4.3,
      openNow: true,
      url: link ?? 'https://www.homedepot.com/b/Outdoors-Garden-Center/N-5yc1vZbx6k',
      distanceMiles: 2.4,
    },
    {
      id: 'mock-lowes',
      name: "Lowe's Home Improvement",
      address: '850 Market Street',
      lat: 0,
      lng: 0,
      rating: 4.1,
      openNow: true,
      url: query
        ? retailerSearchLinks(query)[1].url
        : 'https://www.lowes.com/pl/Plants-planters-Lawn-garden/4294612558',
      distanceMiles: 3.1,
    },
    {
      id: 'mock-nursery',
      name: 'Green Thumb Local Nursery',
      address: '42 Orchard Lane',
      lat: 0,
      lng: 0,
      rating: 4.8,
      openNow: false,
      distanceMiles: 4.7,
    },
  ];
}

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8; // miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

interface GooglePlacesResponse {
  places?: Array<{
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    location?: { latitude: number; longitude: number };
    rating?: number;
    currentOpeningHours?: { openNow?: boolean };
    googleMapsUri?: string;
  }>;
}
