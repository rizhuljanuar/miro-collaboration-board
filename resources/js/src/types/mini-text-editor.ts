import type { BoardPosition, BoardSize } from '@/types/sticky-note';

export interface MiniTextEditor {
    id: string;
    contentHtml: string;
    position: BoardPosition;
    size: BoardSize;
    createdAt: string;
    updatedAt: string;
}

export const MINI_TEXT_EDITOR_DEFAULT_SIZE: BoardSize = {
    width: 380,
    height: 260,
};

export const MINI_TEXT_EDITOR_MIN_SIZE: BoardSize = {
    width: 280,
    height: 180,
};
