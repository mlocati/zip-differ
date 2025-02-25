<script setup lang="ts">
import {computed} from 'vue';

export type ViewOptions = {
  zoomLevel?: number;
  checkerboardBackground?: boolean;
};

const props = defineProps<{
  modelValue: ViewOptions;
  zoomLevels?: number[];
}>();

const zoomLevel = computed<number | undefined>(() => {
  return typeof props.modelValue.zoomLevel === 'number' &&
    props.modelValue.zoomLevel > 0
    ? props.modelValue.zoomLevel
    : undefined;
});

const checkerboardBackground = computed<boolean | undefined>(() => {
  return typeof props.modelValue.checkerboardBackground === 'boolean'
    ? props.modelValue.checkerboardBackground
    : undefined;
});

const emit = defineEmits<{
  (e: 'update:modelValue', viewOptions: ViewOptions): void;
}>();

const currentZoomLevels = computed<number[]>(() => {
  const result: number[] = [1];
  if (props.zoomLevels?.length) {
    result.push(...props.zoomLevels);
  }

  if (result.length < 2) {
    const mul = [2, 5, 10, 20, 50, 100, 200, 500, 1000];
    for (let i = 0; i < mul.length; i++) {
      result.push(mul[i]);
      result.push(1 / mul[i]);
    }
  }
  if (zoomLevel.value !== undefined && !result.includes(zoomLevel.value)) {
    result.push(zoomLevel.value);
  }
  result.sort((a, b) => a - b);

  return result.filter((value, index, arr) => arr.indexOf(value) === index);
});

function triggerEmit(key: string, value: any) {
  const arg: ViewOptions = {};
  if (zoomLevel.value !== undefined) {
    arg.zoomLevel = zoomLevel.value;
  }
  if (checkerboardBackground.value !== undefined) {
    arg.checkerboardBackground = checkerboardBackground.value;
  }
  switch (key) {
    case 'zoomLevel':
      let i = parseFloat(value);
      if (!isNaN(i) && i > 0) {
        arg.zoomLevel = i;
        emit('update:modelValue', arg);
      }

      return;
    case 'zoomLevelIndex':
      let j = parseInt(value);
      if (!isNaN(j) && j >= 0 && j < currentZoomLevels.value.length) {
        arg.zoomLevel = currentZoomLevels.value[j];
        emit('update:modelValue', arg);
      }
      return;
    case 'checkerboardBackground':
      arg.checkerboardBackground = !!value;
      emit('update:modelValue', arg);
      return;
  }
}
</script>

<template>
  <div class="input-group input-group-sm">
    <template v-if="zoomLevel !== undefined">
      <span class="input-group-text">Zoom</span>
      <input
        type="range"
        class="form-control"
        :min="0"
        :max="currentZoomLevels.length - 1"
        :step="1"
        :value="currentZoomLevels.indexOf(zoomLevel)"
        @input="
          triggerEmit(
            'zoomLevelIndex',
            (<HTMLInputElement>$event?.target).value,
          )
        "
      />
      <button
        class="btn btn-outline-secondary"
        v-bootstrap-tooltip
        title="Reset Zoom"
        @click.prevent="triggerEmit('zoomLevel', 1)"
        style="min-width: 4rem"
      >
        {{ zoomLevel }}x
      </button>
    </template>
    <template v-if="checkerboardBackground !== undefined">
      <button
        v-bootstrap-tooltip
        title="Checkerboard Background"
        class="btn zipdiffer-checkerboard"
        @click.prevent="
          triggerEmit('checkerboardBackground', !checkerboardBackground)
        "
        style="min-width: 2rem; border-width: 3px"
        :class="
          checkerboardBackground
            ? 'btn-outline-success'
            : 'btn-outline-secondary'
        "
      >
        &nbsp;
      </button>
    </template>
  </div>
</template>
