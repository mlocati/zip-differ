<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { ZipDirectory, ZipArchive, ZipFile } from '../../ZipArchive';
import EventBus from '../../EventBus';

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

function click()
{
    if (props.zipEntry instanceof ZipDirectory) {
        isOpen.value = !isOpen.value;
    } else if (props.zipEntry instanceof ZipFile) {
        EventBus.emit('viewZipFile', props.zipEntry);
    }
}
</script>

<template>
    <li :class="isFolder ? (isOpen ? 'folder-open' : 'folder-closed') : 'file'">
        <a href="#" @click.prevent="click()" :title="props.zipEntry instanceof ZipFile ? props.zipEntry.sizeFormatted : ''">
            {{ props.zipEntry instanceof ZipArchive ? props.zipEntry.zipFilename : props.zipEntry.name }}
        </a>
        <ul v-if="isFolder" v-show="isOpen">
            <Entry v-for="subdir in (<ZipDirectory>props.zipEntry).subdirs" :key="subdir.name" :zipEntry="subdir" />
            <Entry v-for="file in (<ZipDirectory>props.zipEntry).files" :key="file.name" :zipEntry="file" />
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
li.folder-open>a::before {
    content: '\229f\a0';
}
li.folder-closed>a::before {
    content: '\229e\a0';
}
li.file>a::before {
    content: '\00bb\a0';
}
</style>