<script setup lang="ts">
import { beautifierApplied, beautifierExists } from "./Data";
</script>
<template>
  <button
    v-if="beautifierExists"
    class="btn btn-primary"
    :class="{
      'btn-success': beautifierApplied,
      'btn-secondary': !beautifierApplied,
    }"
    @click.prevent="beautifierApplied = !beautifierApplied"
  >
    Beautify
  </button>
</template>
