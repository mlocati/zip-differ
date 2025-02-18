<script setup lang="ts">
import * as bootstrap from 'bootstrap';
import { computed, nextTick, ref } from 'vue';
import ZipLoader from './components/ZipLoader.vue'
import { ZipArchive, ZipFile } from './ZipArchive';
import FileViewer from './components/FileViewer.vue';

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

const viewingZipFile = ref<ZipFile|null>(null);
const viewingZipFileModal = ref<HTMLDivElement>();

function viewZipFile(zipFile: ZipFile): void
{
  viewingZipFile.value = zipFile;
  nextTick(() => {
    if (!viewingZipFile.value) {
      return;
    }
    const el: HTMLDivElement|undefined = viewingZipFileModal.value;
    if (!el) {
      return;
    }
    let modal: bootstrap.Modal|null = bootstrap.Modal.getInstance(el);
    if (!modal) {
      modal = new bootstrap.Modal(el, { keyboard: true });
      el.addEventListener('hidden.bs.modal', () => {
        viewingZipFile.value = null;
      });
    }
    modal.show();
  });
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
    <ZipLoader queryStringParam="left" @zipPicked="zipLoaded($event, Side.Left)" @zipFileClicked="viewZipFile($event)" />
    <ZipLoader queryStringParam="right" @zipPicked="zipLoaded($event, Side.Right)" @zipFileClicked="viewZipFile($event)"  />
  </div>
  <div class="modals-container">
    <div ref="viewingZipFileModal" class="modal">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ viewingZipFile?.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <FileViewer v-if="viewingZipFile" :zipFile="viewingZipFile" />
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
.input-files {
  flex: 1;
  display: flex;
}
.input-files > * {
  flex: 1;
}
</style>
