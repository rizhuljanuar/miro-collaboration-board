<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import * as Y from 'yjs';

import { useYjsDocumentStore } from '@/stores/yjs-document.store';

interface SharedStickyNotePreview {
  id: string;
  body: string;
  color: string;
}

const PLAYGROUND_ROOM_ID = 'yjs-playground';

const yjsDocumentStore = useYjsDocumentStore();

const { activeRoomId, connectionStatus, isSynced, localPersistenceStatus } =
  storeToRefs(yjsDocumentStore);

const boardTitle = ref('');
const stickyNotes = ref<SharedStickyNotePreview[]>([]);
const changeLog = ref<string[]>([]);

let yBoardSettings: Y.Map<string> | null = null;
let yStickyNotes: Y.Array<SharedStickyNotePreview> | null = null;

function createNoteId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function addLog(message: string): void {
  changeLog.value = [
    `${new Date().toLocaleTimeString('id-ID')} — ${message}`,
    ...changeLog.value,
  ].slice(0, 8);
}

function syncBoardTitle(): void {
  boardTitle.value = yBoardSettings?.get('title') ?? '';
}

function syncStickyNotes(): void {
  stickyNotes.value = yStickyNotes?.toArray() ?? [];
}

function updateBoardTitle(): void {
  if (!yBoardSettings) {
    return;
  }

  const nextTitle =
    boardTitle.value === 'Product Discovery' ? 'Realtime Collaboration Board' : 'Product Discovery';

  yBoardSettings.set('title', nextTitle);
}

function addSharedStickyNote(): void {
  if (!yStickyNotes) {
    return;
  }

  const noteNumber = yStickyNotes.length + 1;

  yStickyNotes.push([
    {
      id: createNoteId(),
      body: `Shared sticky note #${noteNumber}`,
      color: noteNumber % 2 === 0 ? 'indigo' : 'yellow',
    },
  ]);
}

function removeLastStickyNote(): void {
  if (!yStickyNotes || yStickyNotes.length === 0) {
    return;
  }

  yStickyNotes.delete(yStickyNotes.length - 1, 1);
}

onMounted(() => {
  const yDocument = yjsDocumentStore.initializeDocument(PLAYGROUND_ROOM_ID);

  yBoardSettings = yDocument.getMap<string>('board-settings');
  yStickyNotes = yDocument.getArray<SharedStickyNotePreview>('sticky-notes');

  if (!yBoardSettings.has('title')) {
    yBoardSettings.set('title', 'Product Discovery');
  }

  yBoardSettings.observe(() => {
    syncBoardTitle();
    addLog('Y.Map board-settings berubah.');
  });

  yStickyNotes.observe(() => {
    syncStickyNotes();
    addLog('Y.Array sticky-notes berubah.');
  });

  syncBoardTitle();
  syncStickyNotes();

  addLog(`Singleton Y.Doc aktif untuk room ${PLAYGROUND_ROOM_ID}.`);
});

onBeforeUnmount(() => {
  if (yjsDocumentStore.isActiveRoom(PLAYGROUND_ROOM_ID)) {
    yjsDocumentStore.destroyDocument();
  }

  yBoardSettings = null;
  yStickyNotes = null;
});
</script>

<template>
  <main class="min-h-screen bg-slate-100 px-6 py-8 md:px-10">
    <div class="mx-auto max-w-4xl">
      <header>
        <p class="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Yjs playground</p>

        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Y.Doc, Y.Map, dan Y.Array
        </h1>

        <p class="mt-3 max-w-2xl leading-7 text-slate-600">
          Playground lokal untuk memahami shared data structure Yjs sebelum state board disinkronkan
          melalui WebSocket.
        </p>

        <div class="mt-5 flex flex-wrap items-center gap-2">
          <span
            class="rounded-full px-3 py-1.5 text-xs font-bold capitalize"
            :class="
              connectionStatus === 'connected'
                ? 'bg-emerald-100 text-emerald-800'
                : connectionStatus === 'connecting'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
            "
          >
            WebSocket: {{ connectionStatus }}
          </span>

          <span
            class="rounded-full px-3 py-1.5 text-xs font-bold"
            :class="isSynced ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-200 text-slate-700'"
          >
            {{ isSynced ? 'Yjs synced' : 'Waiting for sync' }}
          </span>

          <span
            class="rounded-full px-3 py-1.5 text-xs font-bold capitalize"
            :class="
              localPersistenceStatus === 'ready'
                ? 'bg-violet-100 text-violet-800'
                : localPersistenceStatus === 'loading'
                  ? 'bg-amber-100 text-amber-800'
                  : localPersistenceStatus === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-slate-200 text-slate-700'
            "
          >
            Local cache: {{ localPersistenceStatus }}
          </span>

          <span class="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
            Room: {{ activeRoomId ?? 'none' }}
          </span>
        </div>
      </header>

      <section class="mt-8 grid gap-6 lg:grid-cols-2">
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-sm font-bold uppercase tracking-[0.16em] text-violet-600">Y.Map</p>

          <h2 class="mt-2 text-xl font-bold text-slate-950">Shared board settings</h2>

          <dl class="mt-5 rounded-xl bg-slate-50 p-4">
            <div class="flex items-center justify-between gap-4">
              <dt class="text-sm text-slate-500">title</dt>

              <dd class="font-semibold text-slate-950">
                {{ boardTitle }}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            class="mt-5 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200"
            @click="updateBoardTitle"
          >
            Toggle board title
          </button>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-sm font-bold uppercase tracking-[0.16em] text-amber-600">Y.Array</p>

          <h2 class="mt-2 text-xl font-bold text-slate-950">Shared sticky note list</h2>

          <div class="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              class="rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-amber-950 transition hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200"
              @click="addSharedStickyNote"
            >
              Add shared sticky note
            </button>

            <button
              type="button"
              class="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="stickyNotes.length === 0"
              @click="removeLastStickyNote"
            >
              Remove last note
            </button>
          </div>

          <ul v-if="stickyNotes.length > 0" class="mt-5 grid gap-3">
            <li
              v-for="stickyNote in stickyNotes"
              :key="stickyNote.id"
              class="rounded-xl border border-slate-200 p-4"
              :class="stickyNote.color === 'indigo' ? 'bg-indigo-100' : 'bg-yellow-100'"
            >
              <p class="font-semibold text-slate-950">
                {{ stickyNote.body }}
              </p>

              <p class="mt-1 text-xs text-slate-500">
                {{ stickyNote.id }}
              </p>
            </li>
          </ul>

          <p v-else class="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            Y.Array masih kosong.
          </p>
        </article>
      </section>

      <section
        class="mt-6 rounded-2xl border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-sm"
      >
        <p class="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">Observe log</p>

        <ul class="mt-4 space-y-2 font-mono text-xs leading-6 text-slate-300">
          <li v-for="log in changeLog" :key="log">
            {{ log }}
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>
