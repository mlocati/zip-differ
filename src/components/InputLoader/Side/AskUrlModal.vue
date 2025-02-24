<script setup lang="ts">
import { ref, useId } from 'vue';
import { type DownloadOptions } from '../../../Downloader';
import { Modal, Tooltip } from 'bootstrap';

const idPrefix = ref<string>(`zd-askurl-${useId()}`);

const modal = ref<HTMLElement>();
const form = ref<HTMLFormElement>();

const url = ref<string>('');
const allowRedirect = ref<boolean>(true);
const credentials = ref<RequestCredentials>('same-origin');

const emits = defineEmits<{
  (e: 'ready', data: DownloadOptions): void,
}>();

defineExpose({
  open,
});

function open(options: DownloadOptions|null): void
{
  url.value = options?.url.href || '';
  allowRedirect.value = options?.redirect ?? true;
  credentials.value = options?.credentials || 'same-origin';
  const el = modal.value;
  if (!el) {
    return;
  }
  Modal.getOrCreateInstance(el).show();
}

const vBootstrapTooltip = {
    mounted: (el: HTMLElement) => new Tooltip(el)
};

function accept()
{
  if (!modal.value || !form.value?.checkValidity()) {
    form.value?.reportValidity();
    return;
  }
  try {
    const options: DownloadOptions = {
      url: new URL(url.value),
      redirect: allowRedirect.value,
      credentials: credentials.value,
    };
    emits('ready', options);
    Modal.getInstance(modal.value)?.hide();
  } catch (e: Error|any) {
    window.alert(e?.message || e?.toString() || 'Unknown error');
  }
}
</script>

<template>
  <div ref="modal" class="modal" tabindex="-1">
    <div class="modal-dialog modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Open URL</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <form class="modal-body" onsubmit="return false" ref="form">
          <div class="mb-3">
            <label :for="`${idPrefix}-url`" class="form-label">URL</label>
            <input type="url" class="form-control" :id="`${idPrefix}-url`" required v-model="url" />
          </div>
          <div class="mb-3">
            <label :for="`${idPrefix}-credentials`" class="form-label">
              Credentials
              <a class="text-decoration-none" href="https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials" target="_blank" v-bootstrap-tooltip title="See MDN for more information">&#x1F6C8;</a>
            </label>
            <select class="form-select" :id="`${idPrefix}-credentials`" v-model="credentials">
              <option value="omit">omit - Never send credentials</option>
              <option value="same-origin">same-origin - Send credentials for same-origin requests</option>
              <option value="include">include - Always include credentials</option>
            </select>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" :id="`${idPrefix}-redirect`" v-model="allowRedirect" />
            <label class="form-check-label" :for="`${idPrefix}-redirect`">Allow Redirect</label>
          </div>
        </form>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" @click.prevent="accept()">Download</button>
        </div>
      </div>
    </div>
  </div>
</template>
