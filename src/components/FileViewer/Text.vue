<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
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

onBeforeUnmount(() => {
    beautifierApplied.value = false;
    beautifierExists.value = false;
});
</script>

<template>
    <div class="zip-differ">
        <highlightjs :autodetect="highlightJsLanguage === ''" :language="highlightJsLanguage" :code="displayText" />
    </div>
</template>
<style lang="css" scoped>
.zip-differ
{
 	border: 0.0625rem solid #3d444d;
	border-radius: 0.375rem !important;
}
.zip-differ > pre
{
    margin: 0;
}
</style>