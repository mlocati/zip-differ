<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { DiffFile } from '../Differ';
import EventBus from '../EventBus';
import { Modal } from 'bootstrap';
import DiffFileViewer from './DiffFileViewer.vue';
import FullScreenToggle from './Modal/FullScreenToggle.vue';

const diffFile = ref<DiffFile|null>(null);
const modal = ref<HTMLDivElement>();

function open(file: DiffFile): void
{
  diffFile.value = file;
  nextTick(() => {
    if (!diffFile.value) {
      return;
    }
    const el = modal.value;
    if (!el) {
      return;
    }
    let bsModal = Modal.getInstance(el);
    if (!bsModal) {
      bsModal = new Modal(el);
      el.addEventListener('hidden.bs.modal', () => {
        diffFile.value = null;
      });
    }
    bsModal.show();
  });
}

onMounted(() => {
    EventBus.on('viewDiffFile', open);
});
onUnmounted(() => {
    EventBus.off('viewDiffFile', open);
});
</script>

<template>
    <div ref="modal" class="modal" tabindex="-1">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ diffFile?.name }}</h5>
            <FullScreenToggle />
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <DiffFileViewer v-if="diffFile" :diffFile="diffFile" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
</template>
