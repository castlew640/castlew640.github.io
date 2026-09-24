import type { StopTable } from './types';

// Stations are metres along the walk. Each value depends only on the stops
// before it, so appending a project never moves an earlier exhibit (GROW-04).
export const FIRST_EXHIBIT_STATION = 34;
export const EXHIBIT_SPACING = 30;
export const ABOUT_GAP = 32;
export const LANDING_GAP = 30;

export function buildStopTable(slugs: string[]): StopTable {
  const stops = [
    { id: 'entrance', z: 0 },
    ...slugs.map((slug, index) => ({ id: `exhibit-${slug}`, z: -(FIRST_EXHIBIT_STATION + EXHIBIT_SPACING * index) })),
  ];
  const lastExhibit = slugs.length > 0 ? -stops[stops.length - 1].z : FIRST_EXHIBIT_STATION - ABOUT_GAP;
  const about = lastExhibit + ABOUT_GAP;
  stops.push({ id: 'about', z: -about }, { id: 'landing', z: -(about + LANDING_GAP) });
  return { stops };
}
