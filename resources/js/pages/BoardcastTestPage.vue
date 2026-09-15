<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const message = ref("Belum ada event");

let channel: ReturnType<typeof window.Echo.channel> | undefined;

onMounted(() => {
  channel = window.Echo.channel("board-test").listen(
    ".board.message",
    (event: { message: string }) => {
      message.value = event.message;
    },
  );
});

onUnmounted(() => {
  window.Echo.leave("board-test");
});
</script>

<template>
  <section class="p-6">
    <h1 class="text-xl font-semibold">Broadcast Test</h1>
    <p class="mt-4">{{ message }}</p>
  </section>
</template>
