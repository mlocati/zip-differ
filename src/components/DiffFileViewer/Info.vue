<script setup lang="ts">
import {formatSize} from '../../Size';
import type {DiffFile} from '../../Differ';
import OriginViewer from '../OriginViewer.vue';

defineProps<{
  diffFile: DiffFile;
}>();
</script>

<template>
  <table class="table table-hover table-borderless m-auto w-auto">
    <tbody>
      <tr>
        <th>Archive</th>
        <td>
          <code>{{ diffFile.left!.inputArchive.archiveFilename }}</code>
          <div class="small text-muted">
            Source:
            <OriginViewer :origin="diffFile.left!.inputArchive.origin" />
          </div>
        </td>
        <td>
          <code>{{ diffFile.right!.inputArchive.archiveFilename }}</code>
          <div class="small text-muted">
            Source:
            <OriginViewer :origin="diffFile.right!.inputArchive.origin" />
          </div>
        </td>
      </tr>
      <tr>
        <th>Name</th>
        <td>
          <code>{{ diffFile.left!.name }}</code>
        </td>
        <td>
          <code>{{ diffFile.right!.name }}</code>
        </td>
      </tr>
      <tr>
        <th>Path in archive</th>
        <td>
          <code>{{ diffFile.left!.path }}</code>
        </td>
        <td>
          <code>{{ diffFile.right!.path }}</code>
        </td>
      </tr>
      <tr>
        <th>Size</th>
        <td>{{ formatSize(diffFile.left!.size) }}</td>
        <td>{{ formatSize(diffFile.right!.size) }}</td>
      </tr>
      <tr>
        <th>Size (in bytes)</th>
        <td>{{ diffFile.left!.size.toLocaleString('en-US') }}</td>
        <td>{{ diffFile.right!.size.toLocaleString('en-US') }}</td>
      </tr>
      <tr>
        <th></th>
        <td>
          <button
            class="btn btn-info"
            @click.prevent="diffFile.left!.download()"
          >
            &#x2BAF; Download
          </button>
        </td>
        <td>
          <button
            class="btn btn-info"
            @click.prevent="diffFile.right!.download()"
          >
            &#x2BAF; Download
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
