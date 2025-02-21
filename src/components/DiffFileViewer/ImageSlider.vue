<script setup lang="ts">
import type { DiffFile } from '../../Differ';
import {computed, ref, nextTick, onMounted, onUnmounted, useId, watch} from 'vue';
import { buildImageUrlFromData } from '../../FileInfo';
import ImageCompare from 'image-compare-viewer';

const uniqueID = useId();

const props = defineProps<{
    diffFile: DiffFile,
}>();

const leftSrc = ref<string>('');
const rightSrc = ref<string>('');
const loadError = ref<string>('');
const images = ref<HTMLElement|null>(null);
const checkerboardBackground = ref<boolean>(true);

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
}

const imagesHtml = computed<string>(() => {
    if (!leftSrc.value || !rightSrc.value) {
        return '';
    }
    let img = document.createElement('img');
    img.src = leftSrc.value;
    const container = document.createElement('div');
    container.appendChild(img);
    img = document.createElement('img');
    img.src = rightSrc.value;
    container.appendChild(img);
    nextTick(() => createSlider());
    return container.outerHTML;
});

let currentSliderElement: HTMLElement|null = null;

function createSlider(): void
{
    const el = images.value?.firstElementChild;
    if (el instanceof HTMLElement === false || currentSliderElement === el) {
        return;
    }
    currentSliderElement = el;
    new ImageCompare(el, {
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
        <div class="text-end">
            <div class="form-check form-check-inline form-switch">
                <input class="form-check-input" type="checkbox" role="switch" :id="`zd-td-slider-checkerboard-background-${uniqueID}`" v-model="checkerboardBackground" />
                <label class="form-check-label" :for="`zd-td-slider-checkerboard-background-${uniqueID}`">Checkerboard background</label>
            </div>
        </div>
        <div ref="images" :class="checkerboardBackground ? 'zipdiffer-checkerboard' : ''" v-html="imagesHtml"></div>
    </div>
</template>
