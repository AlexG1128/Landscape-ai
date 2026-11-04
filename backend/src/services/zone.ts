/**
 * Very rough USDA hardiness zone estimate from latitude.
 *
 * This is intentionally simple for the MVP: real zone lookup should use a
 * proper dataset (e.g. the USDA zip-code API or a GIS layer). It gives a
 * reasonable zone for the continental US so plant filtering behaves sensibly.
 */
export function estimateZoneFromLat(lat?: number): number {
  if (lat === undefined || Number.isNaN(lat)) return 7; // sensible default
  const abs = Math.abs(lat);
  // Closer to the equator => warmer => higher zone number.
  if (abs < 26) return 10;
  if (abs < 29) return 9;
  if (abs < 32) return 8;
  if (abs < 36) return 7;
  if (abs < 40) return 6;
  if (abs < 44) return 5;
  if (abs < 47) return 4;
  return 3;
}

export function zoneInRange(zone: number, range: [number, number]): boolean {
  return zone >= range[0] && zone <= range[1];
}
