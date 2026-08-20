<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const canvas = ref<HTMLCanvasElement | null>(null);

let resizeObserver: ResizeObserver | null = null;

function syncCanvasSize(): void {
  const canvasElement = canvas.value;

  if (!canvasElement || !canvasElement.parentElement) {
    return;
  }

  const bounds = canvasElement.parentElement.getBoundingClientRect();

  const cssWidth = Math.max(1, Math.floor(bounds.width));
  const cssHeight = Math.max(1, Math.floor(bounds.height));
  const pixelRatio = Math.max(1, window.devicePixelRatio || 1);

  canvasElement.width = Math.floor(cssWidth * pixelRatio);
  canvasElement.height = Math.floor(cssHeight * pixelRatio);

  const context = canvasElement.getContext('2d');

  if (!context) {
    return;
  }

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, cssWidth, cssHeight);
}

onMounted(async () => {
  await nextTick();

  if (!canvas.value?.parentElement) {
    return;
  }

  resizeObserver = new ResizeObserver(() => {
    syncCanvasSize();
  });

  resizeObserver.observe(canvas.value.parentElement);

  syncCanvasSize();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});
</script>

<template>
  <canvas
    ref="canvas"
    class="pointer-events-none absolute inset-0 z-0 size-full"
    aria-hidden="true"
  ></canvas>
</template>
