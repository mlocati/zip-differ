<script setup lang="ts">
import type {DiffFile} from '../../Differ';
import {
  computed,
  ref,
  nextTick,
  onMounted,
  onUnmounted,
  useId,
  watch,
} from 'vue';
import {type ImageInfo, inspectImageData} from '../../FileInfo';
import ImageCompare from 'image-compare-viewer';

const uniqueID = useId();

const props = defineProps<{
  diffFile: DiffFile;
}>();

const leftInfo = ref<ImageInfo | null>(null);
const rightInfo = ref<ImageInfo | null>(null);
const loadError = ref<string>('');
const images = ref<HTMLElement | null>(null);
const checkerboardBackground = ref<boolean>(true);
const ZOOM_LEVELS = ref<number[]>([0.1, 0.25, 0.5, 1, 1.5, 2, 5, 10]);
const zoomLevel = ref<number>(1);

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
    width: leftInfo.value.width * zoomLevel.value,
    height: leftInfo.value.height * zoomLevel.value,
  };
});
const rightInfoDisplay = computed<ImageInfo | null>(() => {
  if (!rightInfo.value) {
    return null;
  }
  return {
    ...rightInfo.value,
    width: rightInfo.value.width * zoomLevel.value,
    height: rightInfo.value.height * zoomLevel.value,
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
    leftInfo.value = await inspectImageData(props.diffFile.left!.data, {
      filename: props.diffFile.left!.name,
    });
    rightInfo.value = await inspectImageData(props.diffFile.right!.data, {
      filename: props.diffFile.right!.name,
    });
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
        <div class="input-group">
          <span class="input-group-text" id="basic-addon1">Zoom</span>
          <select class="form-control" v-model="zoomLevel">
            <option v-for="zl in ZOOM_LEVELS" :value="zl">{{ zl }}x</option>
          </select>
          <div class="input-group-text">
            <div class="form-check form-check-inline form-switch">
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                :id="`zd-td-slider-checkerboard-background-${uniqueID}`"
                v-model="checkerboardBackground"
              />
              <label
                class="form-check-label"
                :for="`zd-td-slider-checkerboard-background-${uniqueID}`"
                >Checkerboard background</label
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      ref="images"
      :class="checkerboardBackground ? 'zipdiffer-checkerboard' : ''"
      style="margin: auto"
      :style="{
        width: `${leftInfoDisplay.width || 0 + rightInfoDisplay.width || 0}px`,
        height: `${Math.max(leftInfoDisplay.height, rightInfoDisplay.height)}px`,
      }"
      v-html="imagesHtml"
    ></div>
  </div>
</template>
