<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import Side from './InputLoader/Side.vue';
import {InputArchive} from '../InputArchive';
import {DiffArchive} from '../Differ';

enum Sides {
  Left,
  Right,
}

const emit = defineEmits<{
  (e: 'diffReady', diffArchive: DiffArchive): void;
}>();

const leftSide = ref<typeof Side>();
const leftArchive = ref<InputArchive | null>(null);
const rightSide = ref<typeof Side>();
const rightArchive = ref<InputArchive | null>(null);
const numSidesLoaded = ref<number>(0);

watch(numSidesLoaded, (num) => {
  if (num === 2 && leftArchive.value !== null && rightArchive.value !== null) {
    const params = new URLSearchParams(document.location.search);
    if (params.get('autocompare') === 'yes') {
      compare();
    }
  }
});

function setInputArchive(zip: InputArchive | null, side: Sides): void {
  switch (side) {
    case Sides.Left:
      leftArchive.value = zip;
      break;
    case Sides.Right:
      rightArchive.value = zip;
      break;
  }
}

const canSwap = computed<boolean>(
  () =>
    !!leftSide.value &&
    !!rightSide.value &&
    (leftArchive.value !== null || rightArchive.value !== null),
);

function swap(): void {
  const left = leftArchive.value;
  const right = rightArchive.value;
  leftSide.value?.setInputArchive(right);
  rightSide.value?.setInputArchive(left);
}

const canCompare = computed<boolean>(
  () => leftArchive.value !== null && rightArchive.value !== null,
);

function compare(): void {
  if (!canCompare.value) {
    return;
  }
  const diff = new DiffArchive(leftArchive.value!, rightArchive.value!);
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
    <Side
      ref="leftSide"
      queryStringParam="left"
      @inputArchiveLoaded="setInputArchive($event, Sides.Left)"
      @ready="numSidesLoaded++"
    />
    <Side
      ref="rightSide"
      queryStringParam="right"
      @inputArchiveLoaded="setInputArchive($event, Sides.Right)"
      @ready="numSidesLoaded++"
    />
  </section>
</template>
<style lang="css" scoped>
section {
  display: flex;
  flex: 1;
}
.sides > * {
  flex: 1;
}
</style>
