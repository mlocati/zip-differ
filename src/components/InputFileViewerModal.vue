<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref} from 'vue';
import {InputFile} from '../InputArchive';
import EventBus from '../EventBus';
import {Modal} from 'bootstrap';
import InputFileViewer from './InputFileViewer.vue';
import FullScreenToggle from './Modal/FullScreenToggle.vue';

const inputFile = ref<InputFile | null>(null);
const modal = ref<HTMLDivElement>();

function open(file: InputFile): void {
  inputFile.value = file;
  nextTick(() => {
    if (!inputFile.value) {
      return;
    }
    const el = modal.value;
    if (!el) {
      return;
    }
    let bsModal = Modal.getInstance(el);
    if (!bsModal) {
      bsModal = Modal.getOrCreateInstance(el);
      el.addEventListener('hidden.bs.modal', () => {
        inputFile.value = null;
      });
    }
    bsModal.show();
  });
}

onMounted(() => {
  EventBus.on('viewInputFile', open);
});
onUnmounted(() => {
  EventBus.off('viewInputFile', open);
});
</script>

<template>
  <div ref="modal" class="modal" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <code>{{ inputFile?.path }}</code>
          </h5>
          <FullScreenToggle />
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <InputFileViewer v-if="inputFile" :inputFile="inputFile" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
