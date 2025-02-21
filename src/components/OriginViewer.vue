<script setup lang="ts">
import { computed } from "vue";
import { Origins, type Origin } from "../InputArchive";
import { Tooltip } from 'bootstrap';

const props = defineProps<{
    origin: Origin;
}>();

const isUrl = computed<boolean>(() => props.origin instanceof URL);

const vBootstrapTooltip = {
    mounted: (el: HTMLElement) => new Tooltip(el)
};

</script>

<template>
    <template v-if="isUrl">
        <a :href="(<any>origin).href" v-bootstrap-tooltip :title="(<any>origin).href" target="_blank">web</a>
    </template>
    <span v-else-if="origin === Origins.LocalComputer">
        your computer
    </span>
</template>