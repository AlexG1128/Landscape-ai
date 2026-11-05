// Mirrors the backend domain types (kept in sync by hand for the MVP).

export type PlantCategory =
  | 'flower'
  | 'shrub'
  | 'tree'
  | 'vegetable'
  | 'herb'
  | 'groundcover'
  | 'grass'
  | 'seed';

export interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  category: PlantCategory;
  sun: 'full-sun' | 'part-sun' | 'shade';
  water: 'low' | 'medium' | 'high';
  zones: [number, number];
  bloomSeason?: string;
  matureHeightFt?: [number, number];
  description: string;
  tags: string[];
  imageUrl?: string;
}

export interface Suggestion {
  plant: Plant;
  reason: string;
  placement: string;
}

export interface RedesignResult {
  imageUrl: string;
  description: string;
  available: boolean;
}

export interface YardAnalysis {
  summary: string;
  detectedFeatures: string[];
  estimatedSun: string;
  suggestions: Suggestion[];
  redesign: RedesignResult;
}

export interface AnalyzeResponse {
  zone: number;
  analysis: YardAnalysis;
}

export interface BuyLink {
  name: string;
  url: string;
}

export interface PlantDetail {
  plant: Plant;
  buyLinks: BuyLink[];
}

export interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  openNow?: boolean;
  url?: string;
  distanceMiles?: number;
}

export interface StoresResponse {
  stores: Store[];
  buyLinks: BuyLink[];
}
