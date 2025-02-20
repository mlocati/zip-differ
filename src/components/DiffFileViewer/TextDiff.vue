<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { type Differ, getDiffersFromFilename, getFormatterFromFilename, type Formatter } from '../../FileInfo';
import type { DiffFile } from '../../Differ';

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
    <div>
        <select v-model="differ">
            <option v-for="differ in differs" :value="differ">{{ differ.name }}</option>
        </select>
        <label v-if="formatter !== null">
            <input type="checkbox" v-model="applyFormatter" />
            {{ formatter.actionName }}
        </label>
    </div>
    <div class="diff text-muted" v-html="diffHtml"></div>
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