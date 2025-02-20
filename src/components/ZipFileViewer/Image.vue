<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ZipFile } from '../../ZipArchive';
import { getMimeTypeFromFilename } from '../../FileInfo';

const props = defineProps<{
    zipFile: ZipFile,
}>();

const img = ref<HTMLImageElement>();

const loadError = ref<string>('');


async function loadImage(): Promise<void>
{
    return new Promise<void>((resolve, reject) => {
        loadError.value = '';
        const mimeType = getMimeTypeFromFilename(props.zipFile.name);
        if (mimeType === '') {
            reject('Unknown image file type');
            return;
        }
        try {
            if (!img.value) {
                throw new Error('Image element not found');
            }
            const blob = new Blob([props.zipFile.data], {type: mimeType});
            const imageUrl = URL.createObjectURL(blob);
            const memoryImage = document.createElement('img');
            memoryImage.onload = () => {
                document.body.removeChild(memoryImage);
                if (!img.value) {
                    reject('Image element not found');
                    return;
                }
                img.value.src = imageUrl;
                URL.revokeObjectURL(imageUrl);
                resolve();
            };
            memoryImage.onerror = () => {
                document.body.removeChild(memoryImage);
                reject('Failed to load image');
            };
            document.body.appendChild(memoryImage);
            memoryImage.src = imageUrl;
        } catch (error: Error|any) {
            reject(error);
        }
    });
}

onMounted(() => {
    loadImage();
});
</script>
<template>
    <div v-if="loadError">
        <p class="alert alert-danger">Failed to load file: {{ loadError }}</p>
    </div>
    <img v-show="!loadError" ref="img" />
</template>
