<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { ZipFile } from '../../ZipArchive';
import { getBeautifierFromFilename, type Beautifier } from '../../Beautifier';
import { beautifierApplied, beautifierExists } from "./Data";
import { getHighlightJsLanguageFromFilename } from '../../FileFormat';

const props = defineProps<{
    zipFile: ZipFile,
}>();

const text = computed<string>(() => {
    return new TextDecoder().decode(props.zipFile.data);
});

const beautifier = computed<Beautifier|null>(() => {
    return getBeautifierFromFilename(props.zipFile.name);
}); 

const displayText = computed<string>(() => {
    return beautifier.value !== null && beautifierApplied.value ? beautifier.value(text.value) : text.value;
});

const highlightJsLanguage = computed<string>(() => {
    return getHighlightJsLanguageFromFilename(props.zipFile.name);
});

watch(beautifier, (newBeautifier) => {
    beautifierExists.value = newBeautifier !== null;
});

onMounted(() => {
    beautifierExists.value = beautifier.value !== null;
});
</script>

<template>
    <highlightjs :autodetect="highlightJsLanguage === ''" :language="highlightJsLanguage" :code="displayText" />
</template>
