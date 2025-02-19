<script setup lang="ts">
import * as bootstrap from 'bootstrap';
import { computed, nextTick, ref } from 'vue';
import ZipLoader from './components/ZipLoader.vue'
import { ZipArchive, ZipFile } from './ZipArchive';
import FileViewer from './components/FileViewer.vue';
import FileViewerActions from './components/FileViewer/Actions.vue';
import { DiffArchive } from './Differ';
import DifferViewer from './components/DifferViewer.vue';

enum Side {
  Left,
  Right,
}

const viewingZipFile = ref<ZipFile|null>(null);
const viewingZipFileModal = ref<HTMLDivElement>();
const viewingZipFileModalClose = ref<HTMLButtonElement>();
const leftZipLoader = ref<typeof ZipLoader>();
const rightZipLoader = ref<typeof ZipLoader>();

const viewingDiff = ref<DiffArchive|null>(null);
const viewingDiffModal = ref<HTMLDivElement>();

const leftZip = ref<ZipArchive|null>(null);
const rightZip = ref<ZipArchive|null>(null);

const canSwap = computed<boolean>(() => !!leftZipLoader.value && !!rightZipLoader.value && (leftZip.value !== null || rightZip.value !== null));
const canCompare = computed<boolean>(() => leftZip.value !== null && rightZip.value !== null);

function zipLoaded(zip: ZipArchive|null, side: Side): void
{
  switch (side) {
    case Side.Left:
      leftZip.value = zip;
      break;
    case Side.Right:
      rightZip.value = zip;
      break;
  }
}


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
      el.addEventListener('shown.bs.modal', () => {
        nextTick(() => viewingZipFileModalClose.value?.focus());
      });
    }
    modal.show();
  });
}

function swap(): void
{
  const left = leftZip.value;
  const right = rightZip.value;
  leftZipLoader.value?.setZipArchive(right);
  rightZipLoader.value?.setZipArchive(left);
}

function compare(): void
{
  if (!canCompare.value) {
    return;
  }
  const diff = new DiffArchive(leftZip.value!, rightZip.value!);
  if (!diff.isDifferent) {
    window.alert('The archives are identical.');
    return;
  }
  viewingDiff.value = diff;
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
    <div>
      <button class="btn btn-info me-2" @click="swap()" :disabled="!canSwap">Swap</button>
      <button class="btn btn-primary" @click="compare()" :disabled="!canCompare">Compare</button>
    </div>
  </header>
  <div class="input-files">
    <ZipLoader ref="leftZipLoader" queryStringParam="left" @zipPicked="zipLoaded($event, Side.Left)" @zipFileClicked="viewZipFile($event)" />
    <ZipLoader ref="rightZipLoader" queryStringParam="right" @zipPicked="zipLoaded($event, Side.Right)" @zipFileClicked="viewZipFile($event)"  />
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
            <FileViewerActions />
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" ref="viewingZipFileModalClose">Close</button>
          </div>
        </div>
      </div>
    </div>

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
.input-files {
  flex: 1;
  display: flex;
}
.input-files > * {
  flex: 1;
}
</style>
