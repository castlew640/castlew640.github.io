export type ViewMode = 'still' | 'moving';

export interface Stop {
  id: string;
  z: number;
}

export interface StopTable {
  stops: Stop[];
  thresholdArchZ: number;
  portalZ: (index: number) => number;
  landingArchZ: number;
}
