export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingPath {
  id: string;
  color: string;
  width: number;
  points: readonly DrawingPoint[];
  createdAt: string;
}

export interface CreateDrawingPathInput {
  color: string;
  width: number;
  points: DrawingPoint[];
}
