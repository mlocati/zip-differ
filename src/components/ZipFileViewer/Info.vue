<script setup lang="ts">
import { ZipFile } from '../../ZipArchive';
import { formatSize } from '../../Size';

defineProps<{
    zipFile: ZipFile,
}>();

</script>

<template>
    <table class="table table-bordered w-auto">
        <tbody>
            <tr>
                <th>Archive</th>
                <td><code>{{ zipFile.zipArchive.zipFilename }}</code></td>
            </tr>
            <tr>
                <th>Name</th>
                <td><code>{{ zipFile.name }}</code></td>
            </tr>
            <tr>
                <th>Full Path</th>
                <td><code>{{ zipFile.path }}</code></td>
            </tr>
            <tr>
                <th>Size</th>
                <td>{{ formatSize(zipFile.size) }}</td>
            </tr>
            <tr>
                <th>Size (in bytes)</th>
                <td>{{ zipFile.size.toLocaleString('en-US') }}</td>
            </tr>
        </tbody>
    </table>
</template>
