<script setup lang="ts">
import * as bootstrap from 'bootstrap';
import { nextTick, ref } from 'vue';
import { DiffArchive } from './Differ';
import DifferViewer from './components/DifferViewer.vue';
import ZipFileViewerDialog from './components/ZipFileViewerDialog.vue';
import ZipLoader from './components/ZipLoader.vue';

const zipLoader = ref<typeof ZipLoader>();
const viewingDiff = ref<DiffArchive|null>(null);
const viewingDiffModal = ref<HTMLDivElement>();

function diffReady(diffArchive: DiffArchive): void
{
  viewingDiff.value = diffArchive;
  nextTick(() => {
    if (!viewingDiff.value) {
      return;
    }
    const el = viewingDiffModal.value;
    if (!el) {
      return;
    }
    let modal = bootstrap.Modal.getInstance(el);
    if (!modal) {
      modal = new bootstrap.Modal(el);
      el.addEventListener('hidden.bs.modal', () => {
        viewingDiff.value = null;
      });
    }
    modal.show();
  });
}

</script>

<template>
  <header>
    <h1>Zip Differ</h1>
    <div v-if="zipLoader">
      <button class="btn btn-info me-2" @click="zipLoader.swap()" :disabled="!zipLoader.canSwap">Swap</button>
      <button class="btn btn-primary" @click="zipLoader.compare()" :disabled="!zipLoader.canCompare">Compare</button>
    </div>
  </header>
  <ZipLoader ref="zipLoader" @diffReady="diffReady" />
  <div class="modals-container">
    <ZipFileViewerDialog  />
    <div ref="viewingDiffModal" class="modal">
      <div class="modal-dialog modal-fullscreen modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Differences detected</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <DifferViewer v-if="viewingDiff" :diffArchive="viewingDiff" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

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
