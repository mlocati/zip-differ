<script setup lang="ts">
import { InputFile } from '../../InputArchive';
import { formatSize } from '../../Size';

defineProps<{
    inputFile: InputFile,
}>();

</script>

<template>
    <table class="table table-bordered w-auto">
        <tbody>
            <tr>
                <th>Archive</th>
                <td><code>{{ inputFile.inputArchive.archiveFilename }}</code></td>
            </tr>
            <tr>
                <th>Name</th>
                <td><code>{{ inputFile.name }}</code></td>
            </tr>
            <tr>
                <th>Full Path</th>
                <td><code>{{ inputFile.path }}</code></td>
            </tr>
            <tr>
                <th>Size</th>
                <td>{{ formatSize(inputFile.size) }}</td>
            </tr>
            <tr>
                <th>Size (in bytes)</th>
                <td>{{ inputFile.size.toLocaleString('en-US') }}</td>
            </tr>
            <tr>
                <th></th>
                <td><button class="btn btn-info" @click.prevent="inputFile.download()">&#x2BAF; Download</button></td>
            </tr>
        </tbody>
    </table>
</template>
