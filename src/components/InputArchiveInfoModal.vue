<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { InputArchive } from '../InputArchive';
import EventBus from '../EventBus';
import * as bootstrap from 'bootstrap';
import OriginViewer from './OriginViewer.vue';

const inputArchive = ref<InputArchive|null>(null);
const modal = ref<HTMLElement>();

function viewInputArchive(archive: InputArchive)
{
  inputArchive.value = archive;
  nextTick(() => {
    const el = modal.value;
    if (!el) {
      return;
    }
    let bsModal = bootstrap.Modal.getInstance(el);
    if (!bsModal) {
      bsModal = new bootstrap.Modal(el);
      el.addEventListener('hidden.bs.modal', () => {
        inputArchive.value = null;
      });
    }
    bsModal.show();
  });
}

onMounted(() => {
  EventBus.on('viewInputArchive', viewInputArchive);
});

onUnmounted(() => {
  EventBus.off('viewInputArchive', viewInputArchive);
});
</script>

<template>
    <div ref="modal" class="modal" tabindex="-1">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ inputArchive?.archiveFilename }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="inputArchive">
            <table class="table table-hover table-borderless m-auto w-auto">
              <tbody>
                <tr>
                  <th>Origin</th>
                  <td><OriginViewer :origin="inputArchive.origin" /></td>
                </tr>
                <tr>
                  <th>Name</th>
                  <td><code>{{  inputArchive.archiveFilename }}</code></td>
                </tr>
                <tr>
                  <th>Total files</th>
                  <td>{{ inputArchive.totalFiles.toLocaleString('en-US') }}</td>
                </tr>
                <tr>
                  <th>Total directories</th>
                  <td>{{ inputArchive.totalSubdirs.toLocaleString('en-US') }}</td>
                </tr>
                <tr>
                  <th>Compressed size</th>
                  <td>{{  inputArchive.compressedSizeFormatted }}</td>
                </tr>
                <tr>
                  <th>Uncompressed size</th>
                  <td>{{  inputArchive.totalSizeFormatted }}</td>
                </tr>
                <tr>
                  <th>Compressed size (in bytes)</th>
                  <td>{{  inputArchive.compressedSize.toLocaleString('en-US') }}</td>
                </tr>
                <tr>
                  <th>Uncompressed size (in bytes)</th>
                  <td>{{  inputArchive.totalSize.toLocaleString('en-US') }}</td>
                </tr>
              </tbody>
            </table>
            <div class="text-center">
              <button class="btn btn-info" @click.prevent="inputArchive.download()">&#x2BAF; Download</button>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
</template>

<style lang="css" scoped>
th {
  white-space: nowrap;
  width: 1px;
}
</style>