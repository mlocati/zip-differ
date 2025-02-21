<script setup lang="ts">
import { computed, ref } from 'vue';
import { InputFile } from '../../InputArchive';
import { getFormatterFromFilename, type Formatter } from '../../FileInfo';
import { getHighlightJsLanguageFromFilename } from '../../FileInfo';

const props = defineProps<{
    inputFile: InputFile,
}>();

const text = computed<string>(() => {
    return new TextDecoder().decode(props.inputFile.data);
});

const formatter = computed<Formatter|null>(() => {
    return getFormatterFromFilename(props.inputFile.name);
}); 

const applyFormatter = ref<Boolean>(false);

const displayText = computed<string>(() => {
    return formatter.value !== null && applyFormatter.value ? formatter.value.apply(text.value) : text.value;
});

const highlightJsLanguage = computed<string>(() => {
    return getHighlightJsLanguageFromFilename(props.inputFile.name);
});
</script>

<template>
    <div v-if="formatter !== null" class="text-end">
        <label>
            <input type="checkbox" v-model="applyFormatter" />
            {{ formatter.actionName }}
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