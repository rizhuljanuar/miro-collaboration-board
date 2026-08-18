<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import { useProject } from '@/composables/useProject';
import { STICKY_NOTE_COLOR_OPTIONS, type BoardTool, type StickyNoteColor } from '@/types/board';

import ActiveUserMenu from '@/components/ActiveUserMenu.vue';
import ShareBoardButton from '@/components/ShareBoardButton.vue';

import BoardToolbar from '@/pages/admin/project-board/BoardToolbar.vue';
import BoardColorPalette from '@/pages/admin/project-board/BoardColorPalette.vue';

const route = useRoute();
const selectedTool = ref<BoardTool>('cursor');
const selectedStickyNoteColor = ref<StickyNoteColor>('yellow');
const canUndo = ref(false);
const canRedo = ref(false);

function handleUndo(): void {
  // History action akan diimplementasikan saat sticky note dan canvas drawing tersedia.
}

function handleRedo(): void {
  // History action akan diimplementasikan saat sticky note dan canvas drawing tersedia.
}

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

onBeforeUnmount(() => {
  dispose();
});
</script>

<template>
  <main class="flex min-h-screen flex-col bg-slate-100">
    <header
      class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4"
    >
      <div class="flex min-w-0 items-center gap-4">
        <RouterLink
          :to="{ name: 'projects' }"
          class="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          ← Projects
        </RouterLink>

        <div class="h-8 w-px shrink-0 bg-slate-200"></div>

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
        class="hidden w-16 shrink-0 flex-col items-center border-r border-slate-200 bg-white py-4 md:flex"
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
          :can-undo="canUndo"
          :can-redo="canRedo"
          @undo="handleUndo"
          @redo="handleRedo"
        />

        <div class="relative min-h-0 flex-1 overflow-auto bg-slate-100 p-4 md:p-6">
          <div
            class="relative min-h-[620px] min-w-[760px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            :class="workspaceCursorClass"
            style="
              background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
              background-size: 24px 24px;
            "
            :data-board-tool="selectedTool"
          >
            <BoardColorPalette
              v-if="selectedTool === 'sticky-note' && canEditBoard"
              v-model="selectedStickyNoteColor"
              class="absolute bottom-6 left-6 z-10"
            />

            <div
              class="absolute left-6 top-6 max-w-sm rounded-2xl border border-blue-100 bg-white/95 p-5 shadow-lg shadow-blue-950/5 backdrop-blur"
            >
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                {{ project.role ?? 'member' }} workspace
              </p>

              <h2 class="mt-2 text-xl font-bold text-slate-950">
                {{ project.name }}
              </h2>

              <p class="mt-2 text-sm leading-6 text-slate-600">
                {{
                  project.description ||
                  'Mulai tambahkan sticky note, text editor, atau drawing ke board ini.'
                }}
              </p>
            </div>

            <div
              class="absolute inset-0 grid place-items-center px-6 pt-36 text-center"
              aria-label="Board workspace placeholder"
            >
              <div class="max-w-md">
                <div
                  class="mx-auto grid size-16 place-items-center rounded-2xl bg-blue-100 text-3xl font-bold text-blue-700"
                >
                  +
                </div>

                <h2 class="mt-5 text-2xl font-bold tracking-tight text-slate-950">
                  Your board workspace is ready
                </h2>

                <p class="mt-3 leading-7 text-slate-600">
                  {{ workspaceToolMessage }}
                </p>

                <p class="mt-3 text-sm leading-6 text-slate-500">
                  Interaksi pembuatan item akan ditambahkan bertahap pada fase sticky notes, mini
                  text editor, dan canvas drawing.
                </p>
              </div>
              <span
                class="mt-5 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold capitalize text-slate-700"
                aria-live="polite"
              >
                Active tool: {{ selectedTool.replace('-', ' ') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
