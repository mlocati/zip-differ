<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { ZipDirectory, ZipArchive, ZipFile } from '../ZipArchive';

const props = defineProps<{
    zipEntry: ZipDirectory|ZipFile;
}>();

const emit = defineEmits<{
  (e: 'zipFileClicked', zipFile: ZipFile): void,
}>()

const isOpen = ref<Boolean>(false);
const isFolder = computed<Boolean>(() => props.zipEntry instanceof ZipDirectory);

onMounted(() => {
    if (props.zipEntry instanceof ZipDirectory) {
        isOpen.value = props.zipEntry.parent === null || props.zipEntry.parent.parent === null;
    }
    
});

function click()
{
    if (props.zipEntry instanceof ZipDirectory) {
        isOpen.value = !isOpen.value;
    } else if (props.zipEntry instanceof ZipFile) {
        emit('zipFileClicked', props.zipEntry);
    }
}
</script>

<template>
    <li :class="isFolder ? (isOpen ? 'folder-open' : 'folder-closed') : 'file'">
        <a href="#" @click.prevent="click()" :title="props.zipEntry instanceof ZipFile ? props.zipEntry.sizeFormatted : ''">
            {{ props.zipEntry instanceof ZipArchive ? props.zipEntry.zipFilename : props.zipEntry.name }}
        </a>
        <ul v-if="isFolder" v-show="isOpen">
            <ZipViewer v-for="subdir in (<ZipDirectory>props.zipEntry).subdirs" :key="subdir.name" :zipEntry="subdir" @zipFileClicked="emit('zipFileClicked', $event)" />
            <ZipViewer v-for="file in (<ZipDirectory>props.zipEntry).files" :key="file.name" :zipEntry="file" @zipFileClicked="emit('zipFileClicked', $event)" />
        </ul>
    </li>
</template>

<style scoped>
li {
    list-style: none;
    margin-left: -0.5rem;
}
li a {
    text-decoration: none;
    color: inherit;
}
li a:hover {
    color: var(--bs-link-color);
    text-decoration: underline;
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