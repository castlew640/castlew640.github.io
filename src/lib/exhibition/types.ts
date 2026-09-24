export type ViewMode = 'still' | 'moving';

export interface Stop {
  id: string;
  z: number;
}

export interface StopTable {
  stops: Stop[];
}

/**
 * Something the visitor pointed at in the scene. Exhibits and landmarks
 * belong to a stop: tapping them from afar walks there, tapping on arrival
 * performs `action`. Toys only react.
 */
export interface Pick {
  id: string;
  kind: 'exhibit' | 'landmark' | 'toy' | 'arrow';
  name: string;
  action: string;
  stopIndex?: number;
  slug?: string;
}
