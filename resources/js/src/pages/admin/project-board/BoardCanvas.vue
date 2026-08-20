<script setup lang='ts'>
import {
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from 'vue';

interface CanvasPoint {
    x: number;
    y: number;
}

interface LocalDrawingStroke {
    color: string;
    points: CanvasPoint[];
    width: number;
}

const props = withDefaults(
    defineProps<{
        isDrawingEnabled: boolean;
        strokeColor?: string;
        strokeWidth?: number;
    }>(),
    {
        strokeColor: '#2563eb',
        strokeWidth: 3,
    },
);

const GRID_SIZE = 24;
const GRID_COLOR = 'rgb(203 213 225)';
const GRID_POINT_RADIUS = 1;

const canvas = ref<HTMLCanvasElement | null>(null);
const localStrokes = ref<LocalDrawingStroke[]>([]);
const activePointerId = ref<number | null>(null);

let resizeObserver: ResizeObserver | null = null;
let cssWidth = 0;
let cssHeight = 0;
let pixelRatio = 1;

function drawGrid(
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    ratio: number,
): void {
    context.save();

    context.fillStyle = GRID_COLOR;

    for (let x = 0; x <= width; x += GRID_SIZE) {
        for (let y = 0; y <= height; y += GRID_SIZE) {
            const crispX = (Math.round(x * ratio) + 0.5) / ratio;
            const crispY = (Math.round(y * ratio) + 0.5) / ratio;
            const radius = GRID_POINT_RADIUS / ratio;

            context.beginPath();
            context.arc(crispX, crispY, radius, 0, Math.PI * 2);
            context.fill();
        }
    }

    context.restore();
}

function drawStroke(
    context: CanvasRenderingContext2D,
    stroke: LocalDrawingStroke,
): void {
    const [firstPoint] = stroke.points;

    if (!firstPoint) {
        return;
    }

    context.save();

    context.strokeStyle = stroke.color;
    context.fillStyle = stroke.color;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = stroke.width;

    if (stroke.points.length === 1) {
        context.beginPath();
        context.arc(
            firstPoint.x,
            firstPoint.y,
            Math.max(stroke.width / 2, 1),
            0,
            Math.PI * 2,
        );
        context.fill();
        context.restore();

        return;
    }

    context.beginPath();
    context.moveTo(firstPoint.x, firstPoint.y);

    stroke.points.slice(1).forEach((point) => {
        context.lineTo(point.x, point.y);
    });

    context.stroke();
    context.restore();
}

function redrawCanvas(): void {
    const canvasElement = canvas.value;

    if (!canvasElement || cssWidth === 0 || cssHeight === 0) {
        return;
    }

    const context = canvasElement.getContext('2d');

    if (!context) {
        return;
    }

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, cssWidth, cssHeight);

    drawGrid(context, cssWidth, cssHeight, pixelRatio);

    localStrokes.value.forEach((stroke) => {
        drawStroke(context, stroke);
    });
}

function syncCanvasSize(): void {
    const canvasElement = canvas.value;

    if (!canvasElement || !canvasElement.parentElement) {
        return;
    }

    const bounds = canvasElement.parentElement.getBoundingClientRect();

    cssWidth = Math.max(1, Math.floor(bounds.width));
    cssHeight = Math.max(1, Math.floor(bounds.height));
    pixelRatio = Math.max(1, window.devicePixelRatio || 1);

    canvasElement.width = Math.floor(cssWidth * pixelRatio);
    canvasElement.height = Math.floor(cssHeight * pixelRatio);

    redrawCanvas();
}

function getCanvasPoint(event: PointerEvent): CanvasPoint | null {
    const canvasElement = canvas.value;

    if (!canvasElement) {
        return null;
    }

    const bounds = canvasElement.getBoundingClientRect();

    return {
        x: Math.max(0, Math.min(cssWidth, event.clientX - bounds.left)),
        y: Math.max(0, Math.min(cssHeight, event.clientY - bounds.top)),
    };
}

function startDrawing(event: PointerEvent): void {
    if (
        !props.isDrawingEnabled ||
        event.button !== 0 ||
        activePointerId.value !== null
    ) {
        return;
    }

    const canvasElement = canvas.value;
    const point = getCanvasPoint(event);

    if (!canvasElement || !point) {
        return;
    }

    event.preventDefault();

    activePointerId.value = event.pointerId;

    canvasElement.setPointerCapture(event.pointerId);

    localStrokes.value = [
        ...localStrokes.value,
        {
            color: props.strokeColor,
            points: [point],
            width: props.strokeWidth,
        },
    ];

    redrawCanvas();
}

function continueDrawing(event: PointerEvent): void {
    if (
        !props.isDrawingEnabled ||
        activePointerId.value !== event.pointerId
    ) {
        return;
    }

    const point = getCanvasPoint(event);
    const currentStroke = localStrokes.value.at(-1);

    if (!point || !currentStroke) {
        return;
    }

    const previousPoint = currentStroke.points.at(-1);

    if (
        previousPoint &&
        Math.abs(point.x - previousPoint.x) < 1 &&
        Math.abs(point.y - previousPoint.y) < 1
    ) {
        return;
    }

    currentStroke.points.push(point);

    redrawCanvas();
}

function releasePointerCapture(pointerId: number): void {
    const canvasElement = canvas.value;

    if (canvasElement?.hasPointerCapture(pointerId)) {
        canvasElement.releasePointerCapture(pointerId);
    }
}

function stopDrawing(event: PointerEvent): void {
    if (activePointerId.value !== event.pointerId) {
        return;
    }

    releasePointerCapture(event.pointerId);

    activePointerId.value = null;
}

function handleLostPointerCapture(event: PointerEvent): void {
    if (activePointerId.value === event.pointerId) {
        activePointerId.value = null;
    }
}

function cleanupDrawingInteraction(): void {
    if (activePointerId.value !== null) {
        releasePointerCapture(activePointerId.value);
    }

    activePointerId.value = null;
}

watch(
    () => props.isDrawingEnabled,
    (isDrawingEnabled) => {
        if (!isDrawingEnabled) {
            cleanupDrawingInteraction();
        }
    },
);

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
    cleanupDrawingInteraction();

    resizeObserver?.disconnect();
    resizeObserver = null;
});
</script>

<template>
    <canvas
        ref='canvas'
        class='absolute inset-0 z-0 size-full'
        :class='
            isDrawingEnabled
                ? "pointer-events-auto touch-none cursor-crosshair"
                : "pointer-events-none"
        '
        :aria-hidden='!isDrawingEnabled'
        @pointerdown.stop='startDrawing'
        @pointermove='continueDrawing'
        @pointerup='stopDrawing'
        @pointercancel='stopDrawing'
        @lostpointercapture='handleLostPointerCapture'
    ></canvas>
</template>
