<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { ZipDirectory, ZipArchive, ZipFile } from '../ZipArchive';

const props = defineProps<{
    zipEntry: ZipDirectory|ZipFile;
}>();

const isOpen = ref<Boolean>(false);
const isFolder = computed<Boolean>(() => props.zipEntry instanceof ZipDirectory);

onMounted(() => {
    if (props.zipEntry instanceof ZipDirectory) {
        isOpen.value = props.zipEntry.parent === null || props.zipEntry.parent.parent === null;
    }
    
});

function toggle()
{
    if (isFolder.value) {
        isOpen.value = !isOpen.value;
    }
}
</script>

<template>
    <li :class="isFolder ? (isOpen ? 'folder-open' : 'folder-closed') : 'file'">
        <span @click.prevent="toggle()" :title="props.zipEntry instanceof ZipFile ? props.zipEntry.sizeFormatted : ''">
            {{ props.zipEntry instanceof ZipArchive ? props.zipEntry.zipFilename : props.zipEntry.name }}
        </span>
        <ul v-if="isFolder" v-show="isOpen">
            <ZipViewer v-for="subdir in (<ZipDirectory>props.zipEntry).subdirs" :key="subdir.name" :zipEntry="subdir" />
            <ZipViewer v-for="file in (<ZipDirectory>props.zipEntry).files" :key="file.name" :zipEntry="file" />
        </ul>
    </li>
</template>

<style scoped>
li {
    list-style: none;
    margin-left: -0.5rem;
}
li span.bold {
    font-weight: bold;
}
li.folder-open, li.folder-closed {
    cursor: pointer;
}
li::before {
    margin-right: 5px;
}
li.folder-open::before {
    content: '\229f';
}
li.folder-closed::before {
    content: '\229e';
}
li.file::before {
    content: '\00bb';
}
</style>