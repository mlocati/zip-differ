<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { InputDirectory, InputArchive, InputFile } from '../../../InputArchive';
import EventBus from '../../../EventBus';

const props = defineProps<{
    inputItem: InputDirectory|InputFile;
}>();

const isOpen = ref<Boolean>(false);
const isFolder = computed<Boolean>(() => props.inputItem instanceof InputDirectory);

onMounted(() => {
    if (props.inputItem instanceof InputDirectory) {
        isOpen.value = props.inputItem.parent === null || props.inputItem.parent.parent === null;
    }
    
});

function click()
{
    if (props.inputItem instanceof InputDirectory) {
        isOpen.value = !isOpen.value;
    } else if (props.inputItem instanceof InputFile) {
        EventBus.emit('viewInputFile', props.inputItem);
    }
}
</script>

<template>
    <li :class="isFolder ? (isOpen ? 'folder-open' : 'folder-closed') : 'file'">
        <a href="#" @click.prevent="click()" :title="inputItem instanceof InputFile ? inputItem.sizeFormatted : ''" :class="{'fw-bold': inputItem instanceof InputArchive}">
            {{ inputItem instanceof InputArchive ? inputItem.archiveFilename : inputItem.name }}
        </a>
        <ul v-if="isFolder" v-show="isOpen">
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