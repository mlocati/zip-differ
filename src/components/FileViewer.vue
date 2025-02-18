<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import { ZipFile } from '../ZipArchive';
import { FileFormat } from '../FileFormat';
import { getFileFormatsFromFilename } from '../FileFormat';
import Image from './FileViewer/Image.vue';
import Text from './FileViewer/Text.vue';
import Binary from './FileViewer/Binary.vue';

const props = defineProps<{
    zipFile: ZipFile,
}>();

const fileFormats = computed<FileFormat[]>(() => getFileFormatsFromFilename(props.zipFile.name));

const currentFormat = ref<FileFormat|null>(null);

watch(fileFormats, (newFormats) => {
    currentFormat.value = newFormats[0] ?? null;
});

onMounted(() => {
    currentFormat.value = fileFormats.value[0] ?? null;
});

</script>
<template>
    <div class="btn-group">
        <a v-if="fileFormats.includes(FileFormat.Image)" href="#" class="btn btn-primary" @click.prevent="currentFormat = FileFormat.Image" :class="{active: currentFormat === FileFormat.Image}">Image</a>
        <a v-if="fileFormats.includes(FileFormat.Text)" href="#" class="btn btn-primary" @click.prevent="currentFormat = FileFormat.Text" :class="{active: currentFormat === FileFormat.Text}">Text</a>
        <a href="#" class="btn btn-primary" @click.prevent="currentFormat = null"  :class="{active: currentFormat === null}">Info</a>
    </div>
    <div class="mt-3">
        <Image v-if="currentFormat === FileFormat.Image" :zipFile="props.zipFile" />
        <Text v-else-if="currentFormat === FileFormat.Text" :zipFile="props.zipFile" />
        <Binary v-else :zipFile="props.zipFile" />
    </div>
</template>
