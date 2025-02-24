<script setup lang="ts">
import type {DiffFile} from '../../Differ';
import Image from '../InputFileViewer/Image.vue';

defineProps<{
  diffFile: DiffFile;
}>();
</script>

<template>
  <div class="row">
    <div class="col-6">
      <Image :inputFile="diffFile.left!" />
    </div>
    <div class="col-6">
      <Image :inputFile="diffFile.right!" />
    </div>
  </div>
</template>
