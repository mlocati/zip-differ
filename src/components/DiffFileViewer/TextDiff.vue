<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import { type Differ, getDiffersFromFilename, getFormatterFromFilename, type Formatter } from '../../FileInfo';
import type { DiffFile } from '../../Differ';

const uniqueID = useId();

const props = defineProps<{
    diffFile: DiffFile,
}>();

const formatter = computed<Formatter|null>(() => {
    return getFormatterFromFilename(props.diffFile.name);
});

const ignoreCase = ref<boolean>(false);
const applyFormatter = ref<boolean>(false);

const leftText = computed<string>(() => new TextDecoder().decode(props.diffFile.left!.data));
const leftDisplayText = computed<string>(() => applyFormatter.value && formatter.value !== null ? formatter.value.apply(leftText.value) : leftText.value);

const rightText = computed<string>(() => new TextDecoder().decode(props.diffFile.right!.data));
const rightDisplayText = computed<string>(() => applyFormatter.value && formatter.value !== null ? formatter.value.apply(rightText.value) : rightText.value);

const differs = computed<Differ[]>(() => getDiffersFromFilename(props.diffFile.name)!);

const differ = ref<Differ>(differs.value[0]);

function applyDiff(oldText: string, newText: string)
{
    if (differ.value.supportsCaseSensitivity) {
        return differ.value.apply(oldText, newText, ignoreCase.value);
    }
    return differ.value.apply(oldText, newText);
}
const differencesDetected = computed<boolean>(() => {
    const changes = applyDiff(leftDisplayText.value, rightDisplayText.value);
    for (const change of changes) {
        if (change.added || change.removed) {
            return true;
        }
    }
    return false;
});

const diffHtml = computed<string>(() => {
    const changes = applyDiff(leftDisplayText.value, rightDisplayText.value);
    const chunks: string[] = [];
    changes.forEach((change) => {
        const html = change.value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
        ;
        if (change.added) {
            chunks.push(`<span class="hljs-addition">${html}</span>`);
        } else if (change.removed) {
            chunks.push(`<span class="hljs-deletion">${html}</span>`);
        } else {
            chunks.push(html);
        }
    });
    return chunks.join('');
});
watch(differs, (newDiffers: Differ[]) => {
    differ.value = newDiffers[0];
});

</script>

<template>
    <div class="row mb-2">
        <div class="col">
            <select v-model="differ" class="form-control">
                <option v-for="differ in differs" :value="differ">{{ differ.name }}</option>
            </select>
        </div>
        <div class="col pt-1">
            <div v-if="formatter !== null" class="form-check form-check-inline form-switch">
                <input class="form-check-input" type="checkbox" role="switch" :id="`zd-td-apply-formatter-${uniqueID}`" v-model="applyFormatter" />
                <label class="form-check-label" :for="`zd-td-apply-formatter-${uniqueID}`">{{ formatter.actionName }}</label>
            </div>
            <div v-if="differ.supportsCaseSensitivity" class="form-check form-check-inline form-switch">
                <input class="form-check-input" type="checkbox" role="switch" :id="`zd-td-ignore-case-${uniqueID}`" v-model="ignoreCase" />
                <label class="form-check-label" :for="`zd-td-ignore-case-${uniqueID}`">Case Insensitive</label>
            </div>
        </div>
    </div>
    <div v-if="!differencesDetected" class="alert alert-success">No differences detected</div>
    <div v-else class="diff">
        <pre><code class="hljs" v-html="diffHtml"></code></pre>
    </div>
</template>

<style lang="css" scoped>
.diff
{
    border: 0.0625rem solid #3d444d;
    border-radius: 0.375rem !important;
}
.diff > pre
{
    margin: 0;
}
</style>
