<script setup lang="ts">
import { computed, ref } from 'vue';
import ZipLoader from './components/ZipLoader.vue'
import { ZipArchive } from './ZipArchive';

enum Side {
  Left,
  Right,
}

const leftZip = ref<ZipArchive|null>(null);
const rightZip = ref<ZipArchive|null>(null);

const canCompare = computed<boolean>(() => leftZip.value !== null && rightZip.value !== null);

async function zipLoaded(zip: ZipArchive|null, side: Side) {
  switch (side) {
    case Side.Left:
      leftZip.value = zip;
      break;
    case Side.Right:
      rightZip.value = zip;
      break;
  }
}

function compare()
{
  if (!canCompare.value) {
    return;
  }
  window.alert('@todo');
}
</script>

<template>
  <header>
    <h1>Zip Differ</h1>
    <button class="btn btn-primary" @click="compare()" :disabled="!canCompare">Compare</button>
  </header>
  <div class="input-files">
    <ZipLoader queryStringParam="left" @zipPicked="zipLoaded($event, Side.Left)" />
    <ZipLoader queryStringParam="right" @zipPicked="zipLoaded($event, Side.Right)" />
  </div>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}
.input-files {
  flex: 1;
  display: flex;
}
.input-files > * {
  flex: 1;
}
</style>
