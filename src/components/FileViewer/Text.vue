<script setup lang="ts">
import { computed, ref } from 'vue';
import { ZipFile } from '../../ZipArchive';
import { getBeautifierFromFilename, type Beautifier } from '../../Beautifier';

const props = defineProps<{
    zipFile: ZipFile,
}>();

const text = computed<string>(() => {
    return new TextDecoder().decode(props.zipFile.data);
});

const beautifier = computed<Beautifier|null>(() => {
    return getBeautifierFromFilename(props.zipFile.name);
}); 

const beautify = ref<boolean>(false);

const displayText = computed<string>(() => {
    return beautifier.value && beautify.value ? beautifier.value(text.value) : text.value;
});

</script>

<template>
    <div>{{ displayText }}</div>
    <label class="form-check" v-if="beautifier !== null">
        <input type="checkbox" class="form-check-input" v-model="beautify" />
        <span class="form-check">format</span>
    </label>
</template>

<style lang="css" scoped>
div {
    white-space: pre-wrap;
}
</style>
