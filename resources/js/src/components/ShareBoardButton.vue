<script setup lang='ts'>
import { computed, ref } from 'vue';

import { useClipboard } from '@/composables/useClipboard';

const props = defineProps<{
  projectId: number;
  projectName: string;
}>();

const { copyText } = useClipboard();

const isCopying = ref(false);
const feedbackMessage = ref<string | null>(null);
const hasCopyError = ref(false);

const boardUrl = computed(() => {
  return `${window.location.origin}/app/projects/${props.projectId}`;
});

async function copyBoardLink(): Promise<void> {
  if (isCopying.value) {
    return;
  }

  isCopying.value = true;
  feedbackMessage.value = null;
  hasCopyError.value = false;

  try {
    await copyText(boardUrl.value);

    feedbackMessage.value = 'Board link copied.';
  } catch (error) {
    hasCopyError.value = true;

    feedbackMessage.value =
      error instanceof Error
        ? error.message
        : 'Link board tidak dapat disalin. Silakan coba lagi.';
  } finally {
      isCopying.value = false;

      window.setTimeout(() => {
        feedbackMessage.value = null;
      }, 3000);
  }
}
</script>

<template>
  <div class='relative'>
    <button
      type='button'
      class='rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60'
      :disabled='isCopying'
      :aria-label='`Copy share link for ${projectName}`'
      @click='copyBoardLink'
    >
      {{ isCopying ? 'Copying...' : 'Share board' }}
    </button>

    <p
      v-if='feedbackMessage'
      class='absolute right-0 top-full z-10 mt-2 w-max max-w-72 rounded-lg border px-3 py-2 text-sm shadow-lg'
      :class='
        hasCopyError
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      '
      role='status'
    >
      {{ feedbackMessage }}
    </p>
  </div>
</template>
