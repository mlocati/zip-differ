<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { FileFormat } from '../FileInfo';
import { getFileFormatsFromFilename } from '../FileInfo';
import type { DiffFile } from '../Differ';
import Info from './DiffFileViewer/Info.vue';

const props = defineProps<{
    diffFile: DiffFile,
}>();

enum Tabs {
    UnifiedDiff,
    Info,
}

const fileFormats = computed<FileFormat[]>(() => getFileFormatsFromFilename(props.diffFile.name));

const availableTabs = computed<Tabs[]>(() => {
    const tabs = [];
    if (fileFormats.value.includes(FileFormat.Text)) {
        tabs.push(Tabs.UnifiedDiff);
    }
    tabs.push(Tabs.Info);
    return tabs;
});

const currentTab = ref<Tabs>(availableTabs.value[0]);

watch(availableTabs, (newTabs) => {
    currentTab.value = newTabs[0];
});

onMounted(() => {
    currentTab.value = availableTabs.value[0];
});

</script>
<template>
    <ul class="nav nav-tabs mb-2" v-if="availableTabs.length > 0">
        <li class="nav-item" v-if="availableTabs.includes(Tabs.UnifiedDiff)">
            <a class="nav-link" :class="{active: currentTab === Tabs.UnifiedDiff}" href="#" @click.prevent="currentTab = Tabs.UnifiedDiff">Unified Diff</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" :class="{active: currentTab === Tabs.Info}" href="#" @click.prevent="currentTab = Tabs.Info">Info</a>
        </li>
    </ul>
    <div>
        <div v-if="currentTab === Tabs.UnifiedDiff">@todo</div>
        <Info v-else-if="currentTab === Tabs.Info" :diffFile="diffFile" />
    </div>
</template>
