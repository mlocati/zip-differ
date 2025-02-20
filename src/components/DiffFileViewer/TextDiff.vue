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

const applyFormatter = ref<Boolean>(false);

const leftText = computed<string>(() => new TextDecoder().decode(props.diffFile.left!.data));
const leftDisplayText = computed<string>(() => applyFormatter.value && formatter.value !== null ? formatter.value.apply(leftText.value) : leftText.value);

const rightText = computed<string>(() => new TextDecoder().decode(props.diffFile.right!.data));
const rightDisplayText = computed<string>(() => applyFormatter.value && formatter.value !== null ? formatter.value.apply(rightText.value) : rightText.value);

const differs = computed<Differ[]>(() => getDiffersFromFilename(props.diffFile.name)!);

const differ = ref<Differ>(differs.value[0]);

const differencesDetected = computed<boolean>(() => {
    const changes = differ.value.apply(leftDisplayText.value, rightDisplayText.value);
    for (const change of changes) {
        if (change.added || change.removed) {
            return true;
        }
    }
    return false;
});

const diffHtml = computed<string>(() => {
    const changes = differ.value.apply(leftDisplayText.value, rightDisplayText.value);
    const chunks: string[] = [];
    changes.forEach((change) => {
        const html = change.value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
        ;
        if (change.added) {
            chunks.push(`<ins class="diff">${html}</ins>`);
        } else if (change.removed) {
            chunks.push(`<del class="diff">${html}</del>`);
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
            <div v-if="formatter !== null" class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" :id="`zd-td-apply-formatter-${uniqueID}`" v-model="applyFormatter" />
                <label class="form-check-label" :for="`zd-td-apply-formatter-${uniqueID}`">{{ formatter.actionName }}</label>
            </div>
        </div>
    </div>
    <div v-if="!differencesDetected" class="alert alert-success">No differences detected</div>
    <div v-else class="diff text-muted" v-html="diffHtml"></div>
</template>

<style lang="css">
div.diff
{
    font-family: var(--bs-font-monospace);
    color: inherit;
    white-space: pre;
    border: 0.0625rem solid #3d444d;
    border-radius: 0.375rem !important;
    padding: 0.5rem;
    margin-top: 0.5rem;
}
del.diff {
    color: var(--bs-body-color);
    background-color: rgba(var(--bs-danger-rgb), 0.5) !important;
    text-decoration: none;
}
ins.diff {
    color: var(--bs-body-color);
    background-color: rgba(var(--bs-success-rgb), 0.5) !important;
    text-decoration: none;
}
</style>