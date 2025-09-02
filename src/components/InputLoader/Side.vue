<script setup lang="ts">
import {computed, nextTick, onMounted, ref, watch} from 'vue';
import {readFile, readArrayBuffer, InputArchive} from '../../InputArchive';
import Entry from './Side/Entry.vue';
import {
  download,
  type DownloadOptions,
  type DownloadProgress,
} from '../../Downloader';
import AskUrlModal from './Side/AskUrlModal.vue';
import * as UrlService from '../../UrlService';
import {formatSize} from '../../Size';

const dropArea = ref<HTMLElement>();
const fileInput = ref<HTMLInputElement>();
const busyMessage = ref<string>('');
const loadError = ref<string>('');
const busy = computed<boolean>(() => busyMessage.value.length !== 0);
const inputArchive = ref<InputArchive | null>(null);
const askUrlModal = ref<InstanceType<typeof AskUrlModal>>();
const downloadProgress = ref<DownloadProgress | null>(null);
const downloadProgressText = computed<string>(() => {
  if (downloadProgress.value === null) {
    return '';
  }
  if (downloadProgress.value.total === null) {
    return `${formatSize(downloadProgress.value.downloaded)} downloaded`;
  }
  const perc = (
    (100 * downloadProgress.value.downloaded) /
    downloadProgress.value.total
  ).toFixed(1);
  return `${perc}% (${formatSize(downloadProgress.value.downloaded)} / ${formatSize(downloadProgress.value.total)})`;
});
let abortDownloadController: AbortController | null = null;
const abortDownloadRequested = ref<boolean | null>(null);

const props = defineProps({
  queryStringParam: {
    type: String,
    required: false,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'inputArchiveLoaded', inputArchive: InputArchive | null): void;
  (e: 'ready'): void;
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

async function loadUrl(options: DownloadOptions): Promise<void> {
  loadError.value = '';
  abortDownloadController = new AbortController();
  abortDownloadRequested.value = false;
  try {
    busyMessage.value = `Downloading ${options.url}...`;
    const {data, filename} = await download(
      options,
      abortDownloadController.signal,
      (progress: DownloadProgress) => {
        downloadProgress.value = progress;
      },
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
    downloadProgress.value = null;
    abortDownloadRequested.value = null;
    busyMessage.value = `Decompressing ${filename}...`;
    await new Promise((resolve) => setTimeout(resolve, 100));
    inputArchive.value = await readArrayBuffer(filename!, data, options);
  } catch (e: Error | any) {
    if (e?.name === 'AbortError' && abortDownloadController.signal.aborted) {
      loadError.value = '';
    } else {
      loadError.value = e?.message || e?.toString() || 'Unknown error';
    }
  } finally {
    downloadProgress.value = null;
    abortDownloadController = null;
    abortDownloadRequested.value = null;
    busyMessage.value = '';
  }
}

function abortDownload(): void {
  abortDownloadRequested.value = true;
  abortDownloadController?.abort('Download aborted');
}

function setInputArchive(zip: InputArchive | null) {
  inputArchive.value = zip;
}

defineExpose({
  setInputArchive,
});

onMounted(async () => {
  dropArea.value?.addEventListener('dragover', (e) => {
    e.preventDefault();
    const nItems = e.dataTransfer?.items?.length || 0;
    if (nItems === 1) {
      for (let i = 0; i < nItems; i++) {
        if (e.dataTransfer!.items[i]!.kind === 'file') {
          e.dataTransfer!.dropEffect = 'copy';
          dropArea.value?.classList.add('dragover');
          return;
        }
      }
    }
    e.dataTransfer!.dropEffect = 'none';
  });
  dropArea.value?.addEventListener('dragleave', () => {
    dropArea.value?.classList.remove('dragover');
  });
  dropArea.value?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.value?.classList.remove('dragover');
    if (e.dataTransfer?.files?.length === 1) {
      loadFile(e.dataTransfer.files[0]!);
    }
  });
  fileInput.value?.addEventListener('change', () => {
    const files: FileList | null | undefined = fileInput.value?.files;
    if (!files?.length) {
      return;
    }
    loadError.value = '';
    if (files.length !== 1) {
      loadError.value = 'Please select only one file';
      fileInput.value!.value = '';
      return;
    }
    loadFile(files[0]!);
    setTimeout(() => {
      fileInput.value!.value = '';
    }, 500);
  });
  if (props.queryStringParam) {
    const options = UrlService.getDownloadUrl(props.queryStringParam);
    if (options) {
      await loadUrl(options);
    }
  }
  nextTick(() => {
    emit('ready');
  });
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
                ><span
                  :class="
                    busy || inputArchive === null
                      ? 'text-secondary'
                      : 'text-danger'
                  "
                  >&#x1F5D9;</span
                >
                Close</a
              >
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <main v-if="busy" class="message">
      {{ busyMessage }}
      <template v-if="downloadProgress !== null">
        <div
          v-if="downloadProgress.total !== null"
          class="progress mt-2"
          role="progressbar"
          :title="downloadProgressText"
        >
          <div
            class="progress-bar"
            :style="`width: ${(100 * downloadProgress.downloaded) / downloadProgress.total}%`"
          >
            {{ downloadProgressText }}
          </div>
        </div>
        <div v-else class="mt-2">{{ downloadProgressText }}</div>
      </template>
      <div v-if="abortDownloadRequested !== null">
        <button
          class="btn btn-danger mt-2"
          :disabled="abortDownloadRequested === true"
          @click.prevent="abortDownload()"
        >
          Abort
        </button>
      </div>
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
  flex-direction: column;
}
aside > main.message > .progress {
  width: 100%;
  max-width: 300px;
}
aside > footer {
  padding: 0.5em;
  background-color: var(--bs-tertiary-bg);
}
</style>
