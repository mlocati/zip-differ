<script setup lang="ts">
import type { DiffFile } from '../../Differ';
import {ref, nextTick, onMounted, onUnmounted, useId, watch} from 'vue';
import { buildImageUrlFromData } from '../../FileInfo';
import ImageCompare from 'image-compare-viewer';

const uniqueID = useId();

const counter = ref<number>(0);

const props = defineProps<{
    diffFile: DiffFile,
}>();

const leftSrc = ref<string>('');
const rightSrc = ref<string>('');
const loadError = ref<string>('');
const images = ref<HTMLElement|null>(null);

watch(props.diffFile, () => loadImages());

watch(leftSrc, (newSrc: string, oldSrc: string) => {
    if (oldSrc && oldSrc !== newSrc) {
        URL.revokeObjectURL(oldSrc);
    }
});

watch(rightSrc, (newSrc: string, oldSrc: string) => {
    if (oldSrc && oldSrc !== newSrc) {
        URL.revokeObjectURL(oldSrc);
    }
});

async function loadImages(): Promise<void>
{
    try {
        loadError.value = '';
        leftSrc.value = await buildImageUrlFromData(props.diffFile.left!.data, {filename: props.diffFile.left!.name});
        rightSrc.value = await buildImageUrlFromData(props.diffFile.right!.data, {filename: props.diffFile.right!.name});
    } catch (e: Error|any) {
        leftSrc.value = '';
        rightSrc.value = '';
        loadError.value = e?.message || e?.toString() || 'Unknown error';
        return;
    }
    counter.value++;
    nextTick(() => {
        createSlider();
    });
}

function createSlider(): void
{
    if (!images.value) {
        return;
    }
    new ImageCompare(images.value, {
        controlColor: 'red',
        addCircle: true,
        addCircleBlur: false,
        showLabels: false,
        smoothing: false,
        hoverStart: true,
    }).mount();
}

onMounted(() => {
    loadImages();
});
onUnmounted(() => {
    leftSrc.value = '';
    rightSrc.value = '';
});
</script>

<template>
    <div v-if="loadError" class="alert alert-danger">
        Failed to load files: {{ loadError }}
    </div>
    <div v-else-if="leftSrc && rightSrc">
        <div ref="images" :key="`${uniqueID}-${counter}`">
            <img :src="leftSrc" />
            <img :src="rightSrc" />
        </div>
    </div>
</template>
