<script setup lang="ts">
import { computed, ref } from 'vue';
import Side from './ZipLoader/Side.vue';
import { ZipArchive } from '../ZipArchive';
import { DiffArchive } from '../Differ';

enum Sides {
  Left,
  Right,
}

const emit = defineEmits<{
  (e: 'diffReady', diffArchive: DiffArchive): void,
}>()

const leftZipLoader = ref<typeof Side>();
const leftZip = ref<ZipArchive|null>(null);
const rightZipLoader = ref<typeof Side>();
const rightZip = ref<ZipArchive|null>(null);

function zipLoaded(zip: ZipArchive|null, side: Sides): void
{
  switch (side) {
    case Sides.Left:
      leftZip.value = zip;
      break;
    case Sides.Right:
      rightZip.value = zip;
      break;
  }
}

const canSwap = computed<boolean>(() => !!leftZipLoader.value && !!rightZipLoader.value && (leftZip.value !== null || rightZip.value !== null));

function swap(): void
{
  const left = leftZip.value;
  const right = rightZip.value;
  leftZipLoader.value?.setZipArchive(right);
  rightZipLoader.value?.setZipArchive(left);
}

const canCompare = computed<boolean>(() => leftZip.value !== null && rightZip.value !== null);

function compare(): void
{
  if (!canCompare.value) {
    return;
  }
  const diff = new DiffArchive(leftZip.value!, rightZip.value!);
  if (!diff.isDifferent) {
    window.alert('The archives are identical.');
    return;
  }
  emit('diffReady', diff);
}

defineExpose({
    canSwap,
    swap,
    canCompare,
    compare,
});

</script>

<template>
    <section class="container-fluid">
        <Side ref="leftZipLoader" queryStringParam="left" @zipPicked="zipLoaded($event, Sides.Left)" />
        <Side ref="rightZipLoader" queryStringParam="right" @zipPicked="zipLoaded($event, Sides.Right)" />
  </section>
</template>
<style lang="css" scoped>
section {
  display: flex;
  flex: 1;
}
.sides>* {
  flex: 1;
}
</style>
