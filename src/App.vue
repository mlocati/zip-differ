<script setup lang="ts">
import { ref } from 'vue';
import { DiffArchive } from './Differ';
import DiffArchiveViewer from './components/DiffArchiveViewer.vue';
import ZipFileViewerModal from './components/ZipFileViewerModal.vue';
import ZipLoader from './components/ZipLoader.vue';
import DiffFileViewerModal from './components/DiffFileViewerModal.vue';

const zipLoader = ref<typeof ZipLoader>();

const viewingDiff = ref<DiffArchive|null>(null);

function diffReady(diffArchive: DiffArchive): void
{
  viewingDiff.value = diffArchive;
}

</script>

<template>
  <header>
    <h1>Zip Differ</h1>
    <div v-if="viewingDiff !== null">
      <button class="btn btn-primary" @click.prevent="viewingDiff = null">Close</button>
    </div>
    <div v-else-if="zipLoader">
      <button class="btn btn-info me-2" @click.prevent="zipLoader.swap()" :disabled="!zipLoader.canSwap">Swap</button>
      <button class="btn btn-primary" @click.prevent="zipLoader.compare()" :disabled="!zipLoader.canCompare">Compare</button>
    </div>
  </header>
  <ZipLoader v-show="viewingDiff === null" ref="zipLoader" @diffReady="diffReady" />
  <DiffArchiveViewer v-if="viewingDiff !== null" :diffArchive="viewingDiff" />
  <div class="modals-container">
    <ZipFileViewerModal  />
    <DiffFileViewerModal />
</div>
</template>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}
</style>
