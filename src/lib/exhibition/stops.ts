interface StopTable {
  stops: { id: string; z: number }[];
  thresholdArchZ: number;
  portalZ: (index: number) => number;
  landingArchZ: number;
}

export function buildStopTable(slugs: string[]): StopTable {
  const stops = [
    { id: 'entrance', z: 0 },
    ...slugs.map((slug, index) => ({ id: `exhibit-${slug}`, z: -18 - 18 * index })),
  ];
  const lastExhibitZ = stops[stops.length - 1].z;
  stops.push(
    { id: 'about', z: lastExhibitZ - 18 },
    { id: 'landing', z: lastExhibitZ - 28 },
  );

  return {
    stops,
    thresholdArchZ: -12,
    portalZ: (index: number): number => stops[index].z - 12,
    landingArchZ: stops[stops.length - 1].z - 18,
  };
}
