<script setup lang="ts">
defineProps<{
  canUndo: boolean;
  canRedo: boolean;
}>();

const emit = defineEmits<{
  undo: [];
  redo: [];
}>();
</script>

<template>
  <div class="flex items-center gap-1" aria-label="Board history controls">
    <button
      type="button"
      class="rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-45"
      :class="
        canUndo
          ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus:ring-slate-200'
          : 'text-slate-400'
      "
      :disabled="!canUndo"
      title="Undo last action"
      aria-label="Undo last action"
      @click="emit('undo')"
    >
      ↶ Undo
    </button>

    <button
      type="button"
      class="rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-45"
      :class="
        canRedo
          ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus:ring-slate-200'
          : 'text-slate-400'
      "
      :disabled="!canRedo"
      title="Redo last action"
      aria-label="Redo last action"
      @click="emit('redo')"
    >
      ↷ Redo
    </button>
  </div>
</template>
