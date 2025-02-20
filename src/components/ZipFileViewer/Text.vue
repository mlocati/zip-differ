<script setup lang="ts">
import { computed, ref } from 'vue';
import { ZipFile } from '../../ZipArchive';
import { getFormatterFromFilename, type Formatter } from '../../FileInfo';
import { getHighlightJsLanguageFromFilename } from '../../FileInfo';

const props = defineProps<{
    zipFile: ZipFile,
}>();

const text = computed<string>(() => {
    return new TextDecoder().decode(props.zipFile.data);
});

const formatter = computed<Formatter|null>(() => {
    return getFormatterFromFilename(props.zipFile.name);
}); 

const applyFormatter = ref<Boolean>(false);

const displayText = computed<string>(() => {
    return formatter.value !== null && applyFormatter.value ? formatter.value(text.value) : text.value;
});

const highlightJsLanguage = computed<string>(() => {
    return getHighlightJsLanguageFromFilename(props.zipFile.name);
});


</script>

<template>
    <div v-if="formatter !== null" class="text-end">
        <label>
            <input type="checkbox" v-model="applyFormatter" />
            Reformat
        </label>
    </div>
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