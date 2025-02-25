<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch} from 'vue';
import {InputFile} from '../../InputArchive';
import {inspectImageData, type ImageInfo} from '../../FileInfo';
import type {ViewOptions} from '../ImageViewerOptions.vue';
import ImageViewerOptions from '../ImageViewerOptions.vue';

const props = defineProps<{
  inputFile: InputFile;
}>();

const viewOptions = ref<ViewOptions>({
  zoomLevel: 1,
  checkerboardBackground: true,
});

const imageInfo = ref<ImageInfo | null>(null);
const loadError = ref<string>('');

watch(props.inputFile, () => loadImage());

watch(
  imageInfo,
  (newImageInfo: ImageInfo | null, oldImageInfo: ImageInfo | null) => {
    if (oldImageInfo?.url && oldImageInfo.url !== newImageInfo?.url) {
      URL.revokeObjectURL(oldImageInfo.url);
    }
  },
  {deep: true},
);

async function loadImage(): Promise<void> {
  try {
    loadError.value = '';
    imageInfo.value = await inspectImageData(props.inputFile.data, {
      filename: props.inputFile.name,
    });
  } catch (e: Error | any) {
    imageInfo.value = null;
    loadError.value = e?.message || e?.toString() || 'Unknown error';
  }
}

const imageStyle = computed<string>(() => {
  if (!imageInfo.value) {
    return '';
  }
  return `width: ${imageInfo.value.width * viewOptions.value.zoomLevel!}px; height: ${imageInfo.value.height * viewOptions.value.zoomLevel!}px`;
});
onMounted(() => {
  loadImage();
});
onUnmounted(() => {
  imageInfo.value = null;
});
</script>
<template>
  <div v-if="loadError">
    <p class="alert alert-danger">Failed to load file: {{ loadError }}</p>
  </div>
  <div v-else-if="imageInfo !== null">
    <div class="row mb-3 justify-content-center">
      <div class="col-6 align-self-end">
        <ImageViewerOptions v-model="viewOptions" />
      </div>
    </div>
    <div
      class="img"
      :class="
        viewOptions.checkerboardBackground ? 'zipdiffer-checkerboard' : ''
      "
    >
      <img :src="imageInfo.url" :style="imageStyle" />
    </div>
  </div>
</template>

<style lang="css" scoped>
.img {
  border: 0.0625rem solid #3d444d;
  border-radius: 0.375rem !important;
  overflow: hidden;
  text-align: center;
}
</style>
