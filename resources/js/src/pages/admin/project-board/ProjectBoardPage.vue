<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink, useRoute } from 'vue-router';

import { useProject } from '@/composables/useProject';
import { useYjsStickyNotes } from '@/composables/useYjsStickyNotes';
import { useYjsDocumentStore } from '@/stores/yjs-document.store';
import { useYjsMiniTextEditors } from '@/composables/useYjsMiniTextEditors';
import { useYjsDrawingPaths } from '@/composables/useYjsDrawingPaths';

import { STICKY_NOTE_COLOR_OPTIONS, type BoardTool, type StickyNoteColor } from '@/types/board';
import { STICKY_NOTE_DEFAULT_SIZE } from '@/types/sticky-note';
import type { BoardPosition, BoardSize } from '@/types/sticky-note';
import { MINI_TEXT_EDITOR_DEFAULT_SIZE } from '@/types/mini-text-editor';
import type { CreateDrawingPathInput } from '@/types/drawing';

import { getProjectBoardYjsRoomId, isProjectBoardYjsRoom } from '@/helpers/yjs-room';

import ActiveUserMenu from '@/components/ActiveUserMenu.vue';
import ShareBoardButton from '@/components/ShareBoardButton.vue';

import BoardToolbar from '@/pages/admin/project-board/BoardToolbar.vue';
import BoardColorPalette from '@/pages/admin/project-board/BoardColorPalette.vue';
import BoardWorkspace from '@/pages/admin/project-board/BoardWorkspace.vue';
import StickyNoteCard from '@/pages/admin/project-board/StickyNoteCard.vue';
import MiniTextEditorCard from '@/pages/admin/project-board/MiniTextEditorCard.vue';
import BoardCanvas from '@/pages/admin/project-board/BoardCanvas.vue';

const route = useRoute();
const yjsDocumentStore = useYjsDocumentStore();
const { document: yDocument } = storeToRefs(yjsDocumentStore);
const activeBoardRoomId = ref<string | null>(null);
const selectedTool = ref<BoardTool>('cursor');
const selectedStickyNoteColor = ref<StickyNoteColor>('yellow');
const selectedStickyNoteId = ref<string | null>(null);

const selectedStickyNote = computed(() => {
  return (
    stickyNotes.value.find((stickyNote) => {
      return stickyNote.id === selectedStickyNoteId.value;
    }) ?? null
  );
});

const isStickyNotePaletteVisible = computed(() => {
  return (
    canEditBoard.value &&
    (selectedTool.value === 'sticky-note' || selectedStickyNote.value !== null)
  );
});

const paletteColor = computed<StickyNoteColor>({
  get(): StickyNoteColor {
    if (selectedTool.value === 'sticky-note') {
      return selectedStickyNoteColor.value;
    }

    return selectedStickyNote.value?.color ?? selectedStickyNoteColor.value;
  },

  set(color: StickyNoteColor): void {
    if (selectedTool.value === 'sticky-note') {
      selectedStickyNoteColor.value = color;

      return;
    }

    if (!selectedStickyNote.value) {
      selectedStickyNoteColor.value = color;

      return;
    }

    updateStickyNoteColor(selectedStickyNote.value.id, color);
  },
});

const {
  stickyNotes,
  createStickyNote,
  moveStickyNote,
  resizeStickyNote,
  updateStickyNoteBody,
  updateStickyNoteColor,
  deleteStickyNote,
} = useYjsStickyNotes(yDocument);

const {
  miniTextEditors,
  createMiniTextEditor,
  moveMiniTextEditor,
  resizeMiniTextEditor,
  updateMiniTextEditorContent,
  deleteMiniTextEditor,
} = useYjsMiniTextEditors(yDocument);

const { drawingPaths, canUndo, canRedo, addDrawingPath, undoDrawingPath, redoDrawingPath } =
  useYjsDrawingPaths(yDocument);

const projectId = computed<number | null>(() => {
  const value = Number(route.params.projectId);

  return Number.isInteger(value) && value > 0 ? value : null;
});

const canEditBoard = computed(() => {
  return project.value?.role === 'owner' || project.value?.role === 'editor';
});

const selectedStickyNoteColorLabel = computed(() => {
  return (
    STICKY_NOTE_COLOR_OPTIONS.find((color) => color.value === selectedStickyNoteColor.value)
      ?.label ?? 'Yellow'
  );
});

const workspaceCursorClass = computed(() => {
  const cursors: Record<BoardTool, string> = {
    cursor: 'cursor-default',
    'sticky-note': 'cursor-crosshair',
    text: 'cursor-text',
    draw: 'cursor-crosshair',
  };

  return cursors[selectedTool.value];
});

const workspaceToolMessage = computed(() => {
  const messages: Record<Exclude<BoardTool, 'sticky-note'>, string> = {
    cursor: 'Cursor mode aktif. Pilih atau pindahkan item board nanti.',
    text: 'Text editor mode aktif. Klik workspace untuk menambahkan text editor.',
    draw: 'Draw mode aktif. Drag pada workspace untuk menggambar.',
  };

  if (selectedTool.value === 'sticky-note') {
    return `Sticky note mode aktif dengan warna ${selectedStickyNoteColorLabel.value}. Klik workspace untuk menambahkan sticky note.`;
  }

  return messages[selectedTool.value];
});

const { project, isLoading, errorMessage, isNotFound, reloadProject, dispose } =
  useProject(projectId);

watch(
  project,
  (currentProject) => {
    if (!currentProject) {
      if (activeBoardRoomId.value && yjsDocumentStore.isActiveRoom(activeBoardRoomId.value)) {
        yjsDocumentStore.destroyDocument();
      }

      activeBoardRoomId.value = null;

      return;
    }

    const roomId = getProjectBoardYjsRoomId(currentProject.id);

    yjsDocumentStore.initializeDocument(roomId);

    activeBoardRoomId.value = roomId;
  },
  {
    immediate: true,
  },
);

function handleCreateStickyNote(position: BoardPosition): void {
  if (!canEditBoard.value || selectedTool.value !== 'sticky-note') {
    return;
  }

  const stickyNote = createStickyNote({
    color: selectedStickyNoteColor.value,
    position: {
      x: Math.max(0, position.x - STICKY_NOTE_DEFAULT_SIZE.width / 2),
      y: Math.max(0, position.y - 24),
    },
  });

  if (!stickyNote) {
    return;
  }

  selectedStickyNoteId.value = stickyNote.id;
  selectedTool.value = 'cursor';
}

function handleResizeStickyNote(payload: { id: string; size: BoardSize }): void {
  resizeStickyNote(payload.id, payload.size);
}

function handleUpdateStickyNoteBody(payload: { id: string; body: string }): void {
  if (!canEditBoard.value) {
    return;
  }

  updateStickyNoteBody(payload.id, payload.body);
}

function handleSelectStickyNote(stickyNoteId: string): void {
  selectedStickyNoteId.value = stickyNoteId;
}

function handleMoveStickyNote(payload: { id: string; position: BoardPosition }): void {
  moveStickyNote(payload.id, payload.position);
}

function handleDeleteStickyNote(stickyNoteId: string): void {
  const deleted = deleteStickyNote(stickyNoteId);

  if (deleted && selectedStickyNoteId.value === stickyNoteId) {
    selectedStickyNoteId.value = null;
  }
}

function handleCreateTextEditor(position: BoardPosition): void {
  if (!canEditBoard.value || selectedTool.value !== 'text') {
    return;
  }

  const editor = createMiniTextEditor({
    x: Math.max(0, position.x - MINI_TEXT_EDITOR_DEFAULT_SIZE.width / 2),
    y: Math.max(0, position.y - 24),
  });

  if (!editor) {
    return;
  }

  selectedTool.value = 'cursor';
}

function handleMoveMiniTextEditor(payload: { id: string; position: BoardPosition }): void {
  moveMiniTextEditor(payload.id, payload.position);
}

function handleResizeMiniTextEditor(payload: { id: string; height: number }): void {
  resizeMiniTextEditor(payload.id, payload.height);
}

function handleUpdateMiniTextEditorContent(payload: { id: string; contentHtml: string }): void {
  if (!canEditBoard.value) {
    return;
  }

  updateMiniTextEditorContent(payload.id, payload.contentHtml);
}

function handleDeleteMiniTextEditor(editorId: string): void {
  deleteMiniTextEditor(editorId);
}

function handleUndo(): void {
  if (!canEditBoard.value) {
    return;
  }

  undoDrawingPath();
}

function handleRedo(): void {
  if (!canEditBoard.value) {
    return;
  }

  redoDrawingPath();
}

function handleDrawingStrokeComplete(drawingPath: CreateDrawingPathInput): void {
  if (!canEditBoard.value || selectedTool.value !== 'draw') {
    return;
  }

  addDrawingPath(drawingPath);
}

onBeforeUnmount(() => {
  dispose();

  if (activeBoardRoomId.value && yjsDocumentStore.isActiveRoom(activeBoardRoomId.value)) {
    yjsDocumentStore.destroyDocument();
  }

  activeBoardRoomId.value = null;
});
</script>

<template>
  <main class="flex min-h-screen flex-col bg-slate-100">
    <header
      class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:gap-4 sm:px-6 sm:py-4"
    >
      <div class="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <RouterLink
          :to="{ name: 'projects' }"
          class="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          ← Projects
        </RouterLink>

        <div class="hidden h-8 w-px shrink-0 bg-slate-200 sm:block"></div>

        <div class="min-w-0">
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Project board</p>

          <h1 class="mt-1 truncate text-lg font-bold text-slate-950">
            {{ project?.name ?? 'Loading project...' }}
          </h1>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <ActiveUserMenu />

        <ShareBoardButton v-if="project" :project-id="project.id" :project-name="project.name" />
      </div>
    </header>

    <section
      v-if="isLoading"
      class="grid flex-1 place-items-center p-6"
      aria-label="Loading project board"
    >
      <div
        class="w-full max-w-3xl animate-pulse rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12"
      >
        <div class="mx-auto size-16 rounded-2xl bg-slate-200"></div>

        <div class="mx-auto mt-6 h-5 w-40 rounded bg-slate-200"></div>

        <div class="mx-auto mt-4 h-9 w-2/3 rounded bg-slate-200"></div>

        <div class="mx-auto mt-5 h-5 w-4/5 rounded bg-slate-100"></div>
      </div>
    </section>

    <section v-else-if="isNotFound" class="grid flex-1 place-items-center p-6">
      <div
        class="w-full max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm"
      >
        <p class="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">
          Project unavailable
        </p>

        <h2 class="mt-3 text-2xl font-bold text-amber-950">Project tidak ditemukan</h2>

        <p class="mt-3 leading-7 text-amber-900">
          Project mungkin sudah dihapus, URL tidak valid, atau Anda belum menjadi collaborator pada
          project ini.
        </p>

        <RouterLink
          :to="{ name: 'projects' }"
          class="mt-6 inline-flex rounded-xl bg-amber-700 px-4 py-3 font-semibold text-white transition hover:bg-amber-800 focus:outline-none focus:ring-4 focus:ring-amber-200"
        >
          Back to projects
        </RouterLink>
      </div>
    </section>

    <section v-else-if="errorMessage" class="grid flex-1 place-items-center p-6">
      <div
        class="w-full max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm"
      >
        <p class="text-sm font-bold uppercase tracking-[0.18em] text-red-700">Board error</p>

        <h2 class="mt-3 text-2xl font-bold text-red-950">Board tidak dapat dimuat</h2>

        <p class="mt-3 leading-7 text-red-800">
          {{ errorMessage }}
        </p>

        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            class="rounded-xl bg-red-700 px-4 py-3 font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-200"
            @click="reloadProject"
          >
            Coba lagi
          </button>

          <RouterLink
            :to="{ name: 'projects' }"
            class="rounded-xl bg-white px-4 py-3 font-semibold text-red-800 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-200"
          >
            Back to projects
          </RouterLink>
        </div>
      </div>
    </section>

    <section v-else-if="project" class="flex min-h-0 flex-1">
      <aside
        class="hidden w-16 shrink-0 flex-col items-center border-r border-slate-200 bg-white py-4 lg:flex"
        aria-label="Board sidebar"
      >
        <button
          type="button"
          class="grid size-10 place-items-center rounded-xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/20"
          aria-label="Project board home"
          title="Project board"
        >
          M
        </button>

        <div class="my-5 h-px w-8 bg-slate-200"></div>

        <nav class="flex flex-col items-center gap-3" aria-label="Board navigation">
          <button
            type="button"
            class="grid size-10 place-items-center rounded-xl bg-blue-50 text-lg font-bold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
            aria-label="Board workspace"
            title="Board workspace"
          >
            ▦
          </button>

          <button
            type="button"
            class="grid size-10 place-items-center rounded-xl text-lg font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
            aria-label="Board activity"
            title="Activity"
          >
            ◷
          </button>

          <button
            type="button"
            class="grid size-10 place-items-center rounded-xl text-lg font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
            aria-label="Board settings"
            title="Board settings"
          >
            ⚙
          </button>
        </nav>

        <div class="mt-auto">
          <span
            class="grid size-10 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500"
            :title="`Your role: ${project.role ?? 'member'}`"
          >
            {{ (project.role ?? 'member').charAt(0).toUpperCase() }}
          </span>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <BoardToolbar
          v-model:selected-tool="selectedTool"
          :can-edit="canEditBoard"
          :collaborators-count="project.members_count ?? 1"
          :can-undo="canEditBoard && canUndo"
          :can-redo="canEditBoard && canRedo"
          @undo="handleUndo"
          @redo="handleRedo"
        />

        <BoardWorkspace
          :project="project"
          :selected-tool="selectedTool"
          :tool-message="workspaceToolMessage"
          :workspace-cursor-class="workspaceCursorClass"
          :can-edit="canEditBoard"
          @create-sticky-note="handleCreateStickyNote"
          @create-text-editor="handleCreateTextEditor"
        >
          <template #overlay>
            <BoardColorPalette
              v-if="isStickyNotePaletteVisible"
              v-model="paletteColor"
              class="absolute bottom-3 left-3 z-10 sm:bottom-6 sm:left-6"
            />
          </template>

          <BoardCanvas
            :is-drawing-enabled="selectedTool === 'draw' && canEditBoard"
            :paths="drawingPaths"
            stroke-color="#2563eb"
            :stroke-width="3"
            @stroke-complete="handleDrawingStrokeComplete"
          />
          <StickyNoteCard
            v-for="stickyNote in stickyNotes"
            :key="stickyNote.id"
            :sticky-note="stickyNote"
            :selected="stickyNote.id === selectedStickyNoteId"
            :can-edit="canEditBoard"
            @select="handleSelectStickyNote"
            @move="handleMoveStickyNote"
            @resize="handleResizeStickyNote"
            @update-body="handleUpdateStickyNoteBody"
            @delete="handleDeleteStickyNote"
          />

          <MiniTextEditorCard
            v-for="editor in miniTextEditors"
            :key="editor.id"
            :editor="editor"
            :can-edit="canEditBoard"
            @move="handleMoveMiniTextEditor"
            @resize="handleResizeMiniTextEditor"
            @update-content="handleUpdateMiniTextEditorContent"
            @delete="handleDeleteMiniTextEditor"
          />
        </BoardWorkspace>
      </div>
    </section>
  </main>
</template>
