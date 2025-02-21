<script setup lang="ts">
import { onMounted, onUnmounted, ref, useId, watch } from 'vue';
import { InputFile } from '../../InputArchive';
import { buildImageUrlFromData } from '../../FileInfo';

const uniqueID = useId();

const props = defineProps<{
    inputFile: InputFile,
}>();

const checkerboardBackground = ref<boolean>(true);

const imageSrc = ref<string>('');
const loadError = ref<string>('');

watch(props.inputFile, () => loadImage());

watch(imageSrc, (newImageSrc: string, oldImageSrc: string) => {
    if (oldImageSrc && oldImageSrc !== newImageSrc) {
        URL.revokeObjectURL(oldImageSrc);
    }
});

async function loadImage(): Promise<void>
{
    debugger;
    try {
        loadError.value = '';
        imageSrc.value = await buildImageUrlFromData(props.inputFile.data, {filename: props.inputFile.name});
    } catch (e: Error|any) {
        imageSrc.value = '';
        loadError.value = e?.message || e?.toString() || 'Unknown error';
    }
}

onMounted(() => {
    loadImage();
});
onUnmounted(() => {
    imageSrc.value = '';
});
</script>
<template>
    <div v-if="loadError">
        <p class="alert alert-danger">Failed to load file: {{ loadError }}</p>
    </div>
    <div v-else-if="imageSrc">
        <div class="text-end">
            <div class="form-check form-check-inline form-switch">
                <input class="form-check-input" type="checkbox" role="switch" :id="`zd-td-checkerboard-background-${uniqueID}`" v-model="checkerboardBackground" />
                <label class="form-check-label" :for="`zd-td-checkerboard-background-${uniqueID}`">Checkerboard background</label>
            </div>
        </div>
        <div class="img" :class="checkerboardBackground ? 'zipdiffer-checkerboard' : ''">
            <img :src="imageSrc"/>
        </div>
    </div>
</template>

<style lang="css" scoped>
.img
{
    border: 0.0625rem solid #3d444d;
    border-radius: 0.375rem !important;
    overflow: hidden;
}
</style>