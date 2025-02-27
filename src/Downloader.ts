export interface DownloadOptions {
  url: URL;
  redirect?: boolean;
  credentials?: RequestCredentials;
  /**
   * The file extension to use when the filename cannot be extracted from the Content-Disposition response header:
   * This is extracted from the URL
   */
  fileExtension: string;
}

export interface DownloadResponse {
  data: ArrayBuffer;
  /**
   * The filename of the downloaded file extracted from the Content-Disposition response header, if available
   */
  filename?: string;
}

export interface DownloadProgress {
  downloaded: number;
  total: number | null;
}

type ProgressCallback = (progress: DownloadProgress) => void;

async function readWithProgress(
  response: Response,
  progressCallback: ProgressCallback,
): Promise<ArrayBuffer | null> {
  if (!response.body?.getReader) {
    console.warn('ReadableStream not supported');
    return null;
  }
  const contentLength = response.headers.get('Content-Length');
  const totalExpectedBytes: number = contentLength
    ? parseInt(contentLength, 10) || 0
    : 0;
  const reader = response.body.getReader();
  let downloadedBytes: number = 0;
  const chunks: Uint8Array[] = [];
  let lastProgressReported: number | null = null;
  while (true) {
    const {done, value} = await reader.read();
    if (value?.length) {
      downloadedBytes += value.length;
      chunks.push(value);
    }
    if (done) {
      progressCallback({downloaded: downloadedBytes, total: downloadedBytes});
      break;
    }
    const now = Date.now();
    if (lastProgressReported !== null && now - lastProgressReported < 500) {
      continue;
    }
    lastProgressReported = now;
    progressCallback({
      downloaded: downloadedBytes,
      total:
        totalExpectedBytes > 0 && downloadedBytes <= totalExpectedBytes
          ? totalExpectedBytes
          : null,
    });
  }
  const buffer = new Uint8Array(downloadedBytes);
  let offset: number = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }
  return buffer.buffer;
}

export async function download(
  options: DownloadOptions,
  abortSignal?: AbortSignal,
  progressCallback?: ProgressCallback,
): Promise<DownloadResponse> {
  const requestInit: RequestInit = {
    method: 'GET',
    redirect: options.redirect ? 'follow' : 'error',
    credentials: options.credentials ?? 'same-origin',
  };
  if (abortSignal) {
    requestInit.signal = abortSignal;
  }
  const fileExtension: string =
    options.fileExtension.replace(/^\.+|\.+$/g, '') ?? '';
  const response = await fetch(options.url, requestInit);
  if (!response.ok) {
    throw new Error(
      `Failed to download file: ${response.status} (${response.statusText})`,
    );
  }
  let data: ArrayBuffer | null = null;
  if (progressCallback && response.body?.getReader) {
    data = await readWithProgress(response, progressCallback);
  }
  if (data === null) {
    data = await response.arrayBuffer();
  }
  const match = response.headers
    .get('Content-Disposition')
    ?.match(/^(.*?;)?\s*filename\s*=\s*"([^"]+)"/i);
  let filename: string | undefined = match ? match[2] : undefined;
  if (!filename && fileExtension !== '') {
    filename = options.url.pathname.split('/').pop() || 'file';
    if (!filename.toLowerCase().endsWith(`.${fileExtension.toLowerCase()}`)) {
      filename += '.' + fileExtension;
    }
  }

  return {data, filename};
}
