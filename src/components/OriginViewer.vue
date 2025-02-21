<script setup lang="ts">
import { computed } from "vue";
import { Origins, type Origin } from "../InputArchive";

const props = defineProps<{
    origin: Origin;
}>();

const isUrl = computed<boolean>(() => props.origin instanceof URL);

</script>

<template>
    <template v-if="isUrl">
        <a :href="(<any>origin).href" :title="(<any>origin).href" target="_blank">web</a>
    </template>
    <span v-else-if="origin === Origins.LocalComputer">
        your computer
    </span>
</template>