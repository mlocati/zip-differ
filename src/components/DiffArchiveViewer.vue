<script setup lang="ts">
import { computed, ref } from 'vue';
import { DiffDirectory, DiffFile, type DiffArchive, type DiffEntry } from '../Differ';
import { InputFile } from '../InputArchive';
import { Tooltip } from 'bootstrap';
import EventBus from '../EventBus';

const props = defineProps<{
    diffArchive: DiffArchive,
}>();

const showUnchanged = ref<boolean>(false);
const clickedDirs = ref<DiffDirectory[]>([]);

class FlatEntry
{
    readonly entry: DiffEntry;
    readonly depth: number;
    readonly parent: FlatEntry|null;
    public constructor(entry: DiffEntry, depth: number, parent: FlatEntry|null)
    {
        this.entry = entry;
        this.depth = depth;
        this.parent = parent;
    }
    public click(): void
    {
        if (this.entry instanceof DiffDirectory) {
            const index = clickedDirs.value.indexOf(this.entry);
            if (index !== -1) {
                clickedDirs.value.splice(index, 1);
            } else {
                clickedDirs.value.push(this.entry);
            }
        }
    }
}

function flatten(result: FlatEntry[], dir: DiffDirectory, parent: FlatEntry|null)
{
    if (clickedDirs.value.includes(dir)) {
        return;
    }
    const depth = parent ? parent.depth + 1 : 0;
    dir.subdirs.forEach((subdir) => {
        if (!showUnchanged.value && !subdir.isDifferent && subdir.notes === '') {
            return;
        }
        const subdirFlat = new FlatEntry(subdir, depth, parent);
        result.push(subdirFlat);
        flatten(result, subdir, subdirFlat);
    });
    dir.files.forEach((file) => {
        if (!showUnchanged.value && !file.isDifferent && file.notes === '') {
            return;
        }
        result.push(new FlatEntry(file, depth, parent));
    });
};

const flatEntries = computed<FlatEntry[]>(() => {
    const result: FlatEntry[] = [];
    flatten(result, props.diffArchive, null);
    return result;
});
function getEntryClasses(entry: DiffEntry): string
{
    const result = [];
    result.push(entry.isDifferent ? 'diff-different' : 'diff-same');
    result.push(entry instanceof DiffFile ? 'diff-file' : 'diff-directory');
    return result.join(' ');
}

const vBootstrapTooltip = {
    mounted: (el: HTMLElement) => new Tooltip(el)
};

function viewDiffFile(diffFile: DiffFile): void
{
    EventBus.emit('viewDiffFile', diffFile);
}
</script>

<template>
    <section class="container-fluid">
        <div class="text-end">
            <label>
                <input type="checkbox" v-model="showUnchanged">
                Show unchanged
            </label>
        </div>
        <table class="table table-sm table-hover">
            <colgroup>
                <col width="30">
                <col width="30">
                <col width="30">
            </colgroup>
            <tbody>
                <template v-for="entry in flatEntries">
                    <tr :class="getEntryClasses(entry.entry)">
                        <td class="action">
                            <template v-if="entry.entry.left instanceof InputFile">
                                <a class="btn btn-sm btn-info p-0" href="#" @click.prevent="EventBus.emit('viewInputFile', <InputFile>entry.entry.left)" v-bootstrap-tooltip title="View left file">
                                    &#x1F441;
                                </a>
                            </template>
                        </td>
                        <td class="action">
                            <template v-if="entry.entry.right instanceof InputFile">
                                <a class="btn btn-sm btn-info p-0" href="#" @click.prevent="EventBus.emit('viewInputFile', <InputFile>entry.entry.right)" v-bootstrap-tooltip title="View right file">
                                    &#x1F441;
                                </a>
                            </template>
                        </td>
                        <td class="action">
                            <template v-if="entry.entry instanceof DiffFile && entry.entry.left !== null && entry.entry.right !== null && entry.entry.isDifferent">
                                <a class="btn btn-sm btn-warning p-0" href="#" v-bootstrap-tooltip title="View diff" @click.prevent="viewDiffFile(entry.entry)">
                                    &#x1F441;
                                </a>
                            </template>
                        </td>
                        <td :style="{'padding-left': `${entry.depth * 20}px`}">
                            <span v-if="entry.entry instanceof DiffFile">
                                &#x00bb;
                                {{ entry.entry.name }}
                            </span>
                            <a v-else-if="entry.entry instanceof DiffDirectory" href="#" @click.prevent="entry.click()">
                                <span v-if="clickedDirs.includes(<any>entry.entry)">
                                    &#x229e;
                                </span>
                                <span v-else>
                                    &#x229f;
                                </span>
                                {{ entry.entry.name }}
                            </a>
                        </td>
                        <td style="white-space: pre-wrap;">{{ entry.entry.notes }}</td>
                    </tr>
                </template>
            </tbody>
        </table>
    </section>
</template>

<style lang="css" scoped>
tr>.action {
    text-align: center;
    width: 30px;
    background-color: #fff!important;
}
tr, tr>* {
    border-width: 0;
}
tr a {
    color: inherit;
    text-decoration: none;
}
tr.diff-same>* {
    background-color: rgba(var(--bs-success-rgb), 0.3);
}
tr.diff-different>* {
    background-color: rgba(var(--bs-danger-rgb), 0.3);
}
tr.diff-different.diff-directory>* {
    background-color: rgba(var(--bs-warning-rgb), 0.3);
}
</style>
