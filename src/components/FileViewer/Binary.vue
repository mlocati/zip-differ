<script setup lang="ts">
import { computed } from 'vue';
import { ZipFile } from '../../ZipArchive';
import { formatSize } from '../../Size';

const props = defineProps<{
    zipFile: ZipFile,
}>();

const size = computed<number>(() => {
    return props.zipFile.data.byteLength;
});

const displaySize = computed<string>(() => formatSize(size.value));

</script>

<template>
    <table class="table table-bordered">
        <tbody>
            <tr>
                <th>Name</th>
                <td>{{ props.zipFile.name }}</td>
            </tr>
            <tr>
                <th>Full Path</th>
                <td>{{ props.zipFile.path }}</td>
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
