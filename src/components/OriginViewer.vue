<script setup lang="ts">
import {computed} from 'vue';
import {Origins, type Origin} from '../InputArchive';

const props = defineProps<{
  origin: Origin;
}>();

const isUrl = computed<boolean>(() => (<any>props.origin).url instanceof URL);
</script>

<template>
  <template v-if="isUrl">
    <a
      :href="(<any>origin).url.href"
      v-bootstrap-tooltip
      :title="(<any>origin).url.href"
      target="_blank"
      >URL</a
    >
  </template>
  <span v-else-if="origin === Origins.LocalComputer"> your computer </span>
</template>
