<script setup lang="ts">
import type { DiffFile } from '../../Differ';
import Text from '../InputFileViewer/Text.vue';

defineProps<{
    diffFile: DiffFile,
}>();
</script>

<template>
    <div class="row">
        <div class="col-6">
            <Text :inputFile="diffFile.left!" />
        </div>
        <div class="col-6">
            <Text :inputFile="diffFile.right!" />
        </div>
    </div>
</template>
