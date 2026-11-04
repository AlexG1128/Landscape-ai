// Shared domain types for Landscape AI.

export type PlantCategory =
  | 'flower'
  | 'shrub'
  | 'tree'
  | 'vegetable'
  | 'herb'
  | 'groundcover'
  | 'grass'
  | 'seed';

export type Sun = 'full-sun' | 'part-sun' | 'shade';
export type Water = 'low' | 'medium' | 'high';

export interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  category: PlantCategory;
  sun: Sun;
  water: Water;
  /** USDA hardiness zones this plant tolerates, inclusive range, e.g. [4, 9]. */
  zones: [number, number];
  bloomSeason?: string;
  matureHeightFt?: [number, number];
  description: string;
  /** Tags used by the suggestion engine, e.g. "evergreen", "pollinator", "drought-tolerant". */
  tags: string[];
}

/** A single recommended plant plus the reasoning shown to the user. */
export interface Suggestion {
  plant: Plant;
  reason: string;
  /** Where in the yard it belongs, e.g. "back of bed against wall". */
  placement: string;
}

export interface YardAnalysis {
  summary: string;
  detectedFeatures: string[];
  estimatedSun: Sun;
  suggestions: Suggestion[];
  redesign: RedesignResult;
}

export interface RedesignResult {
  /** URL or data URI of the redesigned image. Mock returns a placeholder. */
  imageUrl: string;
  /** Human-readable description of the redesign vision. */
  description: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  openNow?: boolean;
  /** Deep link to the store / retailer search. */
  url?: string;
  distanceMiles?: number;
}

export interface AnalyzeRequest {
  /** base64-encoded image (data URI or raw). */
  image: string;
  lat?: number;
  lng?: number;
}
