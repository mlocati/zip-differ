<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { readFile, readArrayBuffer, InputArchive } from '../../InputArchive';
import Entry from './Side/Entry.vue';
import { download } from '../../Downloader';

const dropArea = ref<HTMLElement>();
const fileInput = ref<HTMLInputElement>();
const busyMessage = ref<String>('');
const busy = computed<Boolean>(() => busyMessage.value.length !== 0);
const inputArchive = ref<InputArchive|null>(null);

const props = defineProps({
    queryStringParam: {
        type: String,
        required: false,
        default: false,
    }
});

const emit = defineEmits<{
  (e: 'inputArchiveLoaded', inputArchive: InputArchive|null): void,
}>()

watch(inputArchive, (archive) => {
    emit('inputArchiveLoaded', archive);
});

async function processFile(file: File) {
    if (!/\.zip$/i.test(file.name)) {
        if (!window.confirm("That doesn't seem to be a ZIP file. Are you sure you want to proceed?")) {
            return;
        }
    }
    if (!file.size) {
        window.alert('The file is empty');
        return;
    }
    busyMessage.value = 'Decompressing...';
    try {
        inputArchive.value = await readFile(file);
    } catch (e: Error|any) {
        window.alert(e?.message || e?.toString() || 'Unknown error');
        return;
    } finally {
        busyMessage.value = '';
    }
}

function clear()
{
    inputArchive.value = null;
}

async function askUrl()
{
    if (busy.value) {
        return;
    }
    let urlString : string|null = '';
    while (true) {
        urlString = window.prompt('Enter the URL of the ZIP file', urlString);
        urlString = urlString ? urlString.trim() : '';
        if (urlString === '') {
            return;
        }
        try {
            if (await loadFromURL(urlString)) {
                return;
            }
        }
        catch (e: Error|any) {
            window.alert(e?.message || e?.toString() || 'Unknown error');
        }
    }
}

async function loadFromURL(urlString: string): Promise<boolean>
{
    let archive: InputArchive;
    busyMessage.value = `Downloading ${urlString}...`;
    try {
        const url = new URL(urlString, window.location.href);
        if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error('Only HTTP and HTTPS URLs are supported');
        }
        const {data, filename} = await download(url, {fileExtension: 'zip'});
        busyMessage.value = `Decompressing ${filename}...`;
        archive = await readArrayBuffer(filename!, data, url);
    }
    catch (e: Error|any) {
        window.alert(e?.message || e?.toString() || 'Unknown error');
        return false;
    } finally {
        busyMessage.value = '';
    }
    inputArchive.value = archive;
    return true;
}

function setInputArchive(zip: InputArchive|null)
{
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
            processFile(e.dataTransfer.files[0]);
        }
    });
    fileInput.value?.addEventListener('change', () => {
        const i = fileInput.value;
        if (!i || !i.files) {
            return;
        }
        if (!i.files.length) {
            return;
        }
        if (i.files.length !== 1) {
            i.value = '';
            window.alert('Please select only one file');
            return;
        }
        const file = i.files[0];
        i.value = '';
        processFile(file);
    });
    if (props.queryStringParam) {
        const params = new URLSearchParams(document.location.search);
        const initialUrl = params.get(props.queryStringParam);
        if (initialUrl) {
            loadFromURL(initialUrl);
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
                            <a class="nav-link" href="#" :class="{disabled: busy}" @click.prevent.stop="fileInput?.click()">&#128194; Open File</a>
                            <input type="file" ref="fileInput" accept=".zip, */*" hidden />
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" :class="{disabled: busy}" @click.prevent.stop="askUrl()">&#127760; Open URL</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" :class="{disabled: busy || inputArchive === null}" @click.prevent.stop="clear()"><span class="text-danger">&#128473;</span> Clear</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        <main v-if="busy" class="message">
            {{ busyMessage }}
        </main>
        <main v-else-if="inputArchive === null" class="message">
            Open a file, or drop it here.
        </main>
        <main v-else class="contents">
            <ul>
                <Entry :inputItem="inputArchive" />
            </ul>
        </main>
    </aside>
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