<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const GRID_SIZE = 24;
const GRID_COLOR = 'rgb(203 213 225)';
const GRID_POINT_RADIUS = 1;

const canvas = ref<HTMLCanvasElement | null>(null);

let resizeObserver: ResizeObserver | null = null;

function drawGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  pixelRatio: number,
): void {
  context.save();

  context.fillStyle = GRID_COLOR;

  for (let x = 0; x <= width; x += GRID_SIZE) {
    for (let y = 0; y <= height; y += GRID_SIZE) {
      const crispX = (Math.round(x * pixelRatio) + 0.5) / pixelRatio;
      const crispY = (Math.round(y * pixelRatio) + 0.5) / pixelRatio;
      const radius = GRID_POINT_RADIUS / pixelRatio;

      context.beginPath();
      context.arc(crispX, crispY, radius, 0, Math.PI * 2);
      context.fill();
    }
  }

  context.restore();
}

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

  drawGrid(context, cssWidth, cssHeight, pixelRatio);
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
