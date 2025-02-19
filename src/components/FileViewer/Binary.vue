<script setup lang="ts">
import { computed } from 'vue';
import { ZipArchive, ZipEntry, ZipFile } from '../../ZipArchive';
import { formatSize } from '../../Size';

const props = defineProps<{
    zipFile: ZipFile,
}>();

const size = computed<number>(() => {
    return props.zipFile.data.byteLength;
});

const zipArchive = computed<ZipArchive|null>(() => {
    let entry : ZipEntry = props.zipFile;
    while (entry.parent) {
        entry = entry.parent;
        if (entry instanceof ZipArchive) {
            return entry;
        }
    }
    return null;
});

const displaySize = computed<string>(() => formatSize(size.value));

</script>

<template>
    <table class="table table-bordered w-auto">
        <tbody>
            <tr v-if="zipArchive !== null">
                <th>Archive</th>
                <td><code>{{ zipArchive.zipFilename }}</code></td>
            </tr>
            <tr>
                <th>Name</th>
                <td><code>{{ props.zipFile.name }}</code></td>
            </tr>
            <tr>
                <th>Full Path</th>
                <td><code>{{ props.zipFile.path }}</code></td>
            </tr>
            <tr>
                <th>Size</th>
                <td>{{ displaySize }}</td>
            </tr>
            <tr>
                <th>Size (in bytes)</th>
                <td>{{ size.toLocaleString('en-US') }}</td>
            </tr>
        </tbody>
    </table>
</template>

<style lang="css" scoped>
div {
    white-space: pre-wrap;
}
</style>
