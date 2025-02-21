<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const button = ref<HTMLButtonElement>();
const isModalFullscreen = ref<boolean>(false);
const modalDialog = computed<HTMLElement|null>(() => button.value?.closest('.modal-dialog') ?? null);
const modal = computed<HTMLElement|null>(() => modalDialog.value?.closest('.modal') ?? null);
let initialFullscreenElement: Element|null = null;

watch(isModalFullscreen, (newIsFullScreen) => {
    if (!modalDialog.value) {
        return;
    }
    if (newIsFullScreen) {
        modalDialog.value.classList.add('modal-fullscreen');
        if (document.fullscreenEnabled) {
            modalDialog.value.requestFullscreen();
        }
    } else {
        modalDialog.value.classList.remove('modal-fullscreen');
        if (document.fullscreenElement == modalDialog.value) {
            document.exitFullscreen();
        }
    }
});

function toggle(): void
{
    if (modalDialog.value) {
        isModalFullscreen.value = !isModalFullscreen.value;
    }
}

function listenModalShow(): void
{
    initialFullscreenElement = document.fullscreenElement;
}

function listenModalHide(): void
{
    if (isModalFullscreen.value) {
        isModalFullscreen.value = false;
    }
    if (initialFullscreenElement && initialFullscreenElement !== document.fullscreenElement) {
        initialFullscreenElement.requestFullscreen();
    }
}

onMounted(() => {
    const title = modalDialog.value?.querySelector(':scope .modal-title') as HTMLElement;
    if (title) {
        title.style.flex = "1";
    }
    modal.value?.addEventListener('show.bs.modal', listenModalShow);
    modal.value?.addEventListener('hide.bs.modal', listenModalHide);
});
onUnmounted(() => {
    modal.value?.removeEventListener('show.bs.modal', listenModalShow);
    modal.value?.removeEventListener('hide.bs.modal', listenModalHide);
});
</script>

<template>
    <button ref="button" class="btn btn-sm" :class="isModalFullscreen ? 'btn-success' : 'btn-light'" @click.prevent="toggle">
        &#x26F6;
    </button>
</template>