<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { InputDirectory, InputArchive, InputFile } from '../../../InputArchive';
import EventBus from '../../../EventBus';

const props = defineProps<{
    inputItem: InputDirectory|InputFile;
}>();

const isFolder = computed<Boolean>(() => props.inputItem instanceof InputDirectory);

onMounted(() => {
    if (props.inputItem instanceof InputDirectory && props.inputItem.tags.isOpen === undefined) {
        props.inputItem.tags.isOpen = props.inputItem.parent === null || props.inputItem.parent.parent === null;
    }
});

function click()
{
    if (props.inputItem instanceof InputArchive) {
        EventBus.emit('viewInputArchive', props.inputItem);
    } else if (props.inputItem instanceof InputDirectory) {
        props.inputItem.tags.isOpen = !props.inputItem.tags.isOpen;
    } else if (props.inputItem instanceof InputFile) {
        EventBus.emit('viewInputFile', props.inputItem);
    }
}
</script>

<template>
    <li :class="inputItem instanceof InputArchive ? 'archive' : isFolder ? (inputItem.tags.isOpen ? 'folder-open' : 'folder-closed') : 'file'">
        <a href="#" @click.prevent="click()" :class="{'fw-bold': inputItem instanceof InputArchive}">
            {{ inputItem instanceof InputArchive ? inputItem.archiveFilename : inputItem.name }}
        </a>
        <ul v-if="isFolder" v-show="inputItem.tags.isOpen">
            <Entry v-for="subdir in (<InputDirectory>inputItem).subdirs" :key="subdir.name" :inputItem="subdir" />
            <Entry v-for="file in (<InputDirectory>inputItem).files" :key="file.name" :inputItem="file" />
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
}
li span.bold {
    font-weight: bold;
}
li.archive>a, li.file>a {
    cursor: help;
}
li.archive>a::before {
    content: '\1f4e6\a0';
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