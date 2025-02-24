<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {readFile, readArrayBuffer, InputArchive} from '../../InputArchive';
import Entry from './Side/Entry.vue';
import {download, type DownloadOptions} from '../../Downloader';
import AskUrlModal from './Side/AskUrlModal.vue';
import * as UrlService from '../../UrlService';

const dropArea = ref<HTMLElement>();
const fileInput = ref<HTMLInputElement>();
const busyMessage = ref<string>('');
const loadError = ref<string>('');
const busy = computed<boolean>(() => busyMessage.value.length !== 0);
const inputArchive = ref<InputArchive | null>(null);
const askUrlModal = ref<InstanceType<typeof AskUrlModal>>();

const props = defineProps({
  queryStringParam: {
    type: String,
    required: false,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'inputArchiveLoaded', inputArchive: InputArchive | null): void;
}>();

watch(inputArchive, (archive) => {
  if (props.queryStringParam) {
    UrlService.setDownloadUrl(
      props.queryStringParam,
      'url' in {...archive?.origin} ? <DownloadOptions>archive!.origin : null,
    );
  }
  emit('inputArchiveLoaded', archive);
});

function clear() {
  inputArchive.value = null;
  loadError.value = '';
}

async function loadFile(file: File) {
  loadError.value = '';
  if (!/\.zip$/i.test(file.name)) {
    if (
      !window.confirm(
        "That doesn't seem to be a ZIP file. Are you sure you want to proceed?",
      )
    ) {
      return;
    }
  }
  if (!file.size) {
    loadError.value = 'The file is empty';
    return;
  }
  busyMessage.value = 'Decompressing...';
  try {
    inputArchive.value = await readFile(file);
  } catch (e: Error | any) {
    loadError.value = e?.message || e?.toString() || 'Unknown error';
    return;
  } finally {
    busyMessage.value = '';
  }
}

async function askUrl() {
  if (busy.value) {
    return;
  }
  askUrlModal.value?.open(
    'url' in {...inputArchive.value?.origin}
      ? <DownloadOptions>inputArchive.value?.origin
      : null,
  );
}

async function loadUrl(options: DownloadOptions): Promise<boolean> {
  loadError.value = '';
  try {
    busyMessage.value = `Downloading ${options.url}...`;
    const {data, filename} = await download(options);
    busyMessage.value = `Decompressing ${filename}...`;
    inputArchive.value = await readArrayBuffer(filename!, data, options);
    return true;
  } catch (e: Error | any) {
    loadError.value = e?.message || e?.toString() || 'Unknown error';
    return false;
  } finally {
    busyMessage.value = '';
  }
}

function setInputArchive(zip: InputArchive | null) {
  inputArchive.value = zip;
}

defineExpose({
  setInputArchive,
});

onMounted(() => {
  dropArea.value?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.value?.classList.add('dragover');
  });
  dropArea.value?.addEventListener('dragleave', () => {
    dropArea.value?.classList.remove('dragover');
  });
  dropArea.value?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.value?.classList.remove('dragover');
    if (e.dataTransfer?.files?.length === 1) {
      loadFile(e.dataTransfer.files[0]);
    }
  });
  fileInput.value?.addEventListener('change', () => {
    const files: FileList | null | undefined = fileInput.value?.files;
    if (!files?.length) {
      return;
    }
    loadError.value = '';
    fileInput.value!.value = '';
    if (files.length !== 1) {
      loadError.value = 'Please select only one file';
    }
    loadFile(files[0]);
  });
  if (props.queryStringParam) {
    const options = UrlService.getDownloadUrl(props.queryStringParam);
    if (options) {
      loadUrl(options);
    }
  }
});
</script>

<template>
  <aside ref="dropArea" :class="{busy, loaded: inputArchive !== null}">
    <nav class="navbar navbar-expand-sm bg-body-tertiary">
      <div class="container-fluid">
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a
                class="nav-link"
                href="#"
                :class="{disabled: busy}"
                @click.prevent.stop="fileInput?.click()"
                >&#128194; Open File</a
              >
              <input type="file" ref="fileInput" accept=".zip, */*" hidden />
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                href="#"
                :class="{disabled: busy}"
                @click.prevent.stop="askUrl()"
                >&#127760; Open URL</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                href="#"
                :class="{disabled: busy || inputArchive === null}"
                @click.prevent.stop="clear()"
                ><span class="text-danger">&#128473;</span> Clear</a
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <main v-if="busy" class="message">
      {{ busyMessage }}
    </main>
    <main
      v-else-if="inputArchive === null"
      class="message"
      style="flex-direction: column"
    >
      Open a file, or drop it here.
      <div
        v-if="loadError"
        class="alert alert-danger mt-2"
        style="white-space: pre-wrap"
      >
        {{ loadError }}
      </div>
    </main>
    <main v-else class="contents">
      <ul>
        <Entry :inputItem="inputArchive" />
      </ul>
    </main>
  </aside>
  <AskUrlModal ref="askUrlModal" @ready="loadUrl($event)" />
</template>

<style lang="css" scoped>
aside {
  display: flex;
  flex: 1;
  flex-direction: column;
  border: 1px solid black;
}
aside.busy {
  cursor: wait;
}
aside.dragover {
  background-color: #f0f0f0;
}
aside > main {
  flex: 1;
  display: flex;
  overflow: auto;
  max-height: calc(100vh - 120px);
}
aside > main.message {
  justify-content: center;
  align-items: center;
}
aside > footer {
  padding: 0.5em;
  background-color: var(--bs-tertiary-bg);
}
</style>
