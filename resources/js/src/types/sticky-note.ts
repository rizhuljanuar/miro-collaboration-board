import type { StickyNoteColor } from '@/types/board';

export interface BoardPosition {
  x: number;
  y: number;
}

export interface BoardSize {
  width: number;
  height: number;
}

export interface StickyNote {
  id: string;
  body: string;
  color: StickyNoteColor;
  position: BoardPosition;
  size: BoardSize;
  createdAt: string;
  updatedAt: string;
}

export const STICKY_NOTE_DEFAULT_SIZE: BoardSize = {
  width: 240,
  height: 180,
};

export const STICKY_NOTE_MIN_SIZE: BoardSize = {
  width: 160,
  height: 120,
};
