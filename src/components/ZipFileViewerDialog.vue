<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { ZipFile } from '../ZipArchive';
import EventBus from '../EventBus';
import * as bootstrap from 'bootstrap';
import ZipFileViewer from './ZipFileViewer.vue';

const viewingZipFile = ref<ZipFile|null>(null);
const viewingZipFileModal = ref<HTMLDivElement>();

function viewZipFile(zipFile: ZipFile): void
{
  viewingZipFile.value = zipFile;
  nextTick(() => {
    if (!viewingZipFile.value) {
      return;
    }
    const el = viewingZipFileModal.value;
    if (!el) {
      return;
    }
    let modal = bootstrap.Modal.getInstance(el);
    if (!modal) {
      modal = new bootstrap.Modal(el);
      el.addEventListener('hidden.bs.modal', () => {
        viewingZipFile.value = null;
      });
    }
    modal.show();
  });
}

onMounted(() => {
    EventBus.on('viewZipFile', viewZipFile);
});
onUnmounted(() => {
    EventBus.off('viewZipFile', viewZipFile);
});
</script>

<template>
    <div ref="viewingZipFileModal" class="modal" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ viewingZipFile?.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <ZipFileViewer v-if="viewingZipFile" :zipFile="viewingZipFile" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
</template>
