<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {FileFormat} from '../FileInfo';
import {getFileFormatsFromFilename} from '../FileInfo';
import type {DiffFile} from '../Differ';
import Info from './DiffFileViewer/Info.vue';
import TextDiff from './DiffFileViewer/TextDiff.vue';
import TextSideBySide from './DiffFileViewer/TextSideBySide.vue';
import ImageSideBySide from './DiffFileViewer/ImageSideBySide.vue';
import ImageSlider from './DiffFileViewer/ImageSlider.vue';

const props = defineProps<{
  diffFile: DiffFile;
}>();

enum Tabs {
  TextDiff,
  TextSideBySide,
  ImageSideBySide,
  ImageSlider,
  Info,
}

const fileFormats = computed<FileFormat[]>(() =>
  getFileFormatsFromFilename(props.diffFile.name),
);

const availableTabs = computed<Tabs[]>(() => {
  const tabs = [];
  if (fileFormats.value.includes(FileFormat.Text)) {
    tabs.push(Tabs.TextDiff);
    tabs.push(Tabs.TextSideBySide);
  }
  if (fileFormats.value.includes(FileFormat.Image)) {
    tabs.push(Tabs.ImageSideBySide);
    tabs.push(Tabs.ImageSlider);
  }
  tabs.push(Tabs.Info);
  return tabs;
});

const currentTab = ref<Tabs>(availableTabs.value[0]!);

watch(availableTabs, (newTabs) => {
  currentTab.value = newTabs[0]!;
});

onMounted(() => {
  currentTab.value = availableTabs.value[0]!;
});
</script>
<template>
  <ul class="nav nav-tabs mb-2" v-if="availableTabs.length > 0">
    <li class="nav-item" v-if="availableTabs.includes(Tabs.TextDiff)">
      <a
        class="nav-link"
        :class="{active: currentTab === Tabs.TextDiff}"
        href="#"
        @click.prevent="currentTab = Tabs.TextDiff"
      >
        <template v-if="fileFormats.includes(FileFormat.Image)"
          >Text Changes</template
        >
        <template v-else>Changes</template>
      </a>
    </li>
    <li class="nav-item" v-if="availableTabs.includes(Tabs.TextSideBySide)">
      <a
        class="nav-link"
        :class="{active: currentTab === Tabs.TextSideBySide}"
        href="#"
        @click.prevent="currentTab = Tabs.TextSideBySide"
      >
        <template v-if="fileFormats.includes(FileFormat.Image)"
          >Text Side by Side</template
        >
        <template v-else>Side by Side</template>
      </a>
    </li>
    <li class="nav-item" v-if="availableTabs.includes(Tabs.ImageSideBySide)">
      <a
        class="nav-link"
        :class="{active: currentTab === Tabs.ImageSideBySide}"
        href="#"
        @click.prevent="currentTab = Tabs.ImageSideBySide"
      >
        <template v-if="fileFormats.includes(FileFormat.Text)"
          >Image Side by Side</template
        >
        <template v-else>Side by Side</template>
      </a>
    </li>
    <li class="nav-item" v-if="availableTabs.includes(Tabs.ImageSlider)">
      <a
        class="nav-link"
        :class="{active: currentTab === Tabs.ImageSlider}"
        href="#"
        @click.prevent="currentTab = Tabs.ImageSlider"
      >
        Slider
      </a>
    </li>
    <li class="nav-item">
      <a
        class="nav-link"
        :class="{active: currentTab === Tabs.Info}"
        href="#"
        @click.prevent="currentTab = Tabs.Info"
        >Info</a
      >
    </li>
  </ul>
  <div class="container-fluid">
    <TextDiff v-if="currentTab === Tabs.TextDiff" :diffFile="diffFile" />
    <TextSideBySide
      v-else-if="currentTab === Tabs.TextSideBySide"
      :diffFile="diffFile"
    />
    <ImageSideBySide
      v-else-if="currentTab === Tabs.ImageSideBySide"
      :diffFile="diffFile"
    />
    <ImageSlider
      v-else-if="currentTab === Tabs.ImageSlider"
      :diffFile="diffFile"
    />
    <Info v-else-if="currentTab === Tabs.Info" :diffFile="diffFile" />
  </div>
</template>
