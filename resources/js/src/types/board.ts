export type BoardTool = 'cursor' | 'sticky-note' | 'text' | 'draw';

export const STICKY_NOTE_COLOR_OPTIONS = [
  {
    value: 'yellow',
    label: 'Yellow',
    swatchClass: 'bg-yellow-300',
  },
  {
    value: 'amber',
    label: 'Amber',
    swatchClass: 'bg-amber-300',
  },
  {
    value: 'rose',
    label: 'Rose',
    swatchClass: 'bg-rose-300',
  },
  {
    value: 'indigo',
    label: 'Indigo',
    swatchClass: 'bg-indigo-300',
  },
  {
    value: 'cyan',
    label: 'Cyan',
    swatchClass: 'bg-cyan-300',
  },
  {
    value: 'emerald',
    label: 'Emerald',
    swatchClass: 'bg-emerald-300',
  },
] as const;

export type StickyNoteColor = (typeof STICKY_NOTE_COLOR_OPTIONS)[number]['value'];
