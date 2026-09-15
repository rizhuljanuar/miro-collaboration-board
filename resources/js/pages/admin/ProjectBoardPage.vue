<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const projectId = route.params.projectId;
</script>

<template>
  <div class="flex min-h-screen overflow-hidden bg-slate-200">
    <aside class="w-14 shrink-0 bg-slate-300 p-2">
      <button
        class="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow hover:bg-slate-100"
        aria-label="Add sticky note"
      >
        +
      </button>
    </aside>

    <main class="relative min-w-0 flex-1 overflow-auto p-4">
      <header class="mb-4 flex items-center justify-between rounded-lg bg-white p-3 shadow">
        <h1 class="font-semibold text-slate-800">
          Task Management
        </h1>

        <button class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Share
        </button>
      </header>
    </main>
  </div>
</template>
