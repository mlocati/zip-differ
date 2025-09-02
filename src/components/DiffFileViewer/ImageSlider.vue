<script setup lang="ts">
import type {DiffFile} from '../../Differ';
import {computed, ref, nextTick, onMounted, onUnmounted, watch} from 'vue';
import {type ImageInfo, inspectImageData} from '../../FileInfo';
import ImageCompare from 'image-compare-viewer';
import type {ViewOptions} from '../ImageViewerOptions.vue';
import ImageViewerOptions from '../ImageViewerOptions.vue';

const props = defineProps<{
  diffFile: DiffFile;
}>();

const leftInfo = ref<ImageInfo | null>(null);
const rightInfo = ref<ImageInfo | null>(null);
const loadError = ref<string>('');
const images = ref<HTMLElement | null>(null);
const viewOptions = ref<ViewOptions>({
  zoomLevel: 1,
  checkerboardBackground: true,
});

watch(props.diffFile, () => loadImages());

watch(
  leftInfo,
  (newInfo: ImageInfo | null, oldInfo: ImageInfo | null) => {
    if (oldInfo?.url && oldInfo.url !== newInfo?.url) {
      URL.revokeObjectURL(oldInfo.url);
    }
  },
  {deep: true},
);
const leftInfoDisplay = computed<ImageInfo | null>(() => {
  if (!leftInfo.value) {
    return null;
  }
  return {
    ...leftInfo.value,
    width: leftInfo.value.width * viewOptions.value.zoomLevel!,
    height: leftInfo.value.height * viewOptions.value.zoomLevel!,
  };
});
const rightInfoDisplay = computed<ImageInfo | null>(() => {
  if (!rightInfo.value) {
    return null;
  }
  return {
    ...rightInfo.value,
    width: rightInfo.value.width * viewOptions.value.zoomLevel!,
    height: rightInfo.value.height * viewOptions.value.zoomLevel!,
  };
});

watch(
  rightInfo,
  (newInfo: ImageInfo | null, oldInfo: ImageInfo | null) => {
    if (oldInfo?.url && oldInfo.url !== newInfo?.url) {
      URL.revokeObjectURL(oldInfo.url);
    }
  },
  {deep: true},
);

async function loadImages(): Promise<void> {
  try {
    loadError.value = '';
    leftInfo.value = await inspectImageData(
      props.diffFile.left!.data.buffer as ArrayBuffer,
      {
        filename: props.diffFile.left!.name,
      },
    );
    rightInfo.value = await inspectImageData(
      props.diffFile.right!.data.buffer as ArrayBuffer,
      {
        filename: props.diffFile.right!.name,
      },
    );
  } catch (e: Error | any) {
    leftInfo.value = null;
    rightInfo.value = null;
    loadError.value = e?.message || e?.toString() || 'Unknown error';
    return;
  }
}

const imagesHtml = computed<string>(() => {
  if (!leftInfoDisplay.value || !rightInfoDisplay.value) {
    return '';
  }
  const container = document.createElement('div');
  function createImage(info: ImageInfo): void {
    const img = document.createElement('img');
    img.src = info.url;
    img.style.width = `${info.width}px`;
    img.style.height = `${info.height}px`;
    container.appendChild(img);
  }
  createImage(leftInfoDisplay.value);
  createImage(rightInfoDisplay.value);
  nextTick(() => createSlider());
  return container.outerHTML;
});

let currentSliderElement: HTMLElement | null = null;

function createSlider(): void {
  const el = images.value?.firstElementChild;
  if (el instanceof HTMLElement === false || currentSliderElement === el) {
    return;
  }
  currentSliderElement = el;
  new ImageCompare(el, {
    controlColor: 'red',
    addCircle: false,
    showLabels: false,
    smoothing: false,
    hoverStart: true,
  }).mount();
}

onMounted(() => {
  loadImages();
});
onUnmounted(() => {
  leftInfo.value = null;
  rightInfo.value = null;
});
</script>

<template>
  <div v-if="loadError" class="alert alert-danger">
    Failed to load files: {{ loadError }}
  </div>
  <div v-else-if="leftInfoDisplay && rightInfoDisplay">
    <div class="row mb-3 justify-content-center">
      <div class="col-6 align-self-end">
        <ImageViewerOptions v-model="viewOptions" />
      </div>
    </div>
    <div
      ref="images"
      :class="
        viewOptions.checkerboardBackground ? 'zipdiffer-checkerboard' : ''
      "
      style="margin: auto"
      :style="{
        width: `${leftInfoDisplay.width || 0 + rightInfoDisplay.width || 0}px`,
        height: `${Math.max(leftInfoDisplay.height, rightInfoDisplay.height)}px`,
      }"
      v-html="imagesHtml"
    ></div>
  </div>
</template>
