<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';

import {InputFile} from '../InputArchive';
import {FileFormat} from '../FileInfo';
import {getFileFormatsFromFilename} from '../FileInfo';
import Image from './InputFileViewer/Image.vue';
import Text from './InputFileViewer/Text.vue';
import Info from './InputFileViewer/Info.vue';

const props = defineProps<{
  inputFile: InputFile;
}>();

const fileFormats = computed<FileFormat[]>(() =>
  getFileFormatsFromFilename(props.inputFile.name),
);

const currentFormat = ref<FileFormat | null>(null);

watch(fileFormats, (newFormats) => {
  currentFormat.value = newFormats[0] ?? null;
});

onMounted(() => {
  currentFormat.value = fileFormats.value[0] ?? null;
});
</script>
<template>
  <ul class="nav nav-tabs mb-2" v-if="fileFormats.length > 0">
    <li class="nav-item" v-if="fileFormats.includes(FileFormat.Image)">
      <a
        class="nav-link"
        :class="{active: currentFormat === FileFormat.Image}"
        href="#"
        @click.prevent="currentFormat = FileFormat.Image"
        >Image</a
      >
    </li>
    <li class="nav-item" v-if="fileFormats.includes(FileFormat.Text)">
      <a
        class="nav-link"
        :class="{active: currentFormat === FileFormat.Text}"
        href="#"
        @click.prevent="currentFormat = FileFormat.Text"
        >Text</a
      >
    </li>
    <li class="nav-item">
      <a
        class="nav-link"
        :class="{active: currentFormat === null}"
        href="#"
        @click.prevent="currentFormat = null"
        >Info</a
      >
    </li>
  </ul>
  <div>
    <Image v-if="currentFormat === FileFormat.Image" :inputFile="inputFile" />
    <Text
      v-else-if="currentFormat === FileFormat.Text"
      :inputFile="inputFile"
    />
    <Info v-else :inputFile="inputFile" />
  </div>
</template>
