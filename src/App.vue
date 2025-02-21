<script setup lang="ts">
import { ref } from 'vue';
import { DiffArchive } from './Differ';
import DiffArchiveViewer from './components/DiffArchiveViewer.vue';
import InputFileViewerModal from './components/InputFileViewerModal.vue';
import InputLoader from './components/InputLoader.vue';
import DiffFileViewerModal from './components/DiffFileViewerModal.vue';

const inputLoader = ref<typeof InputLoader>();

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
    <div v-else-if="inputLoader">
      <button class="btn btn-info me-2" @click.prevent="inputLoader.swap()" :disabled="!inputLoader.canSwap">Swap</button>
      <button class="btn btn-primary" @click.prevent="inputLoader.compare()" :disabled="!inputLoader.canCompare">Compare</button>
    </div>
  </header>
  <InputLoader v-show="viewingDiff === null" ref="inputLoader" @diffReady="diffReady" />
  <DiffArchiveViewer v-if="viewingDiff !== null" :diffArchive="viewingDiff" />
  <div class="modals-container">
    <InputFileViewerModal  />
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
