import type { BoardPosition, BoardSize } from '@/types/sticky-note';

export const INLINE_TEXT_FORMATS = ['bold', 'italic', 'underline'] as const;

export type InlineTextFormat = (typeof INLINE_TEXT_FORMATS)[number];

export const TEXT_EDITOR_HEADING_TAGS = ['H1', 'H2', 'H3'] as const;

export type TextEditorHeadingTag = (typeof TEXT_EDITOR_HEADING_TAGS)[number];

export const TEXT_EDITOR_ALIGNMENTS = ['left', 'center', 'right'] as const;

export type TextEditorAlignment = (typeof TEXT_EDITOR_ALIGNMENTS)[number];

export const TEXT_EDITOR_LIST_TYPES = ['unordered'] as const;

export type TextEditorListType = (typeof TEXT_EDITOR_LIST_TYPES)[number];

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
