<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { ZipFile } from '../ZipArchive';
import EventBus from '../EventBus';
import * as bootstrap from 'bootstrap';
import ZipFileViewer from './ZipFileViewer.vue';

const zipFile = ref<ZipFile|null>(null);
const modal = ref<HTMLDivElement>();

function open(file: ZipFile): void
{
  zipFile.value = file;
  nextTick(() => {
    if (!zipFile.value) {
      return;
    }
    const el = modal.value;
    if (!el) {
      return;
    }
    let bsModal = bootstrap.Modal.getInstance(el);
    if (!bsModal) {
      bsModal = new bootstrap.Modal(el);
      el.addEventListener('hidden.bs.modal', () => {
        zipFile.value = null;
      });
    }
    bsModal.show();
  });
}

onMounted(() => {
    EventBus.on('viewZipFile', open);
});
onUnmounted(() => {
    EventBus.off('viewZipFile', open);
});
</script>

<template>
    <div ref="modal" class="modal" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ zipFile?.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <ZipFileViewer v-if="zipFile" :zipFile="zipFile" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
</template>
