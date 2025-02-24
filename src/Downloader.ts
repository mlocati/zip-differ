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

export async function download(
  options: DownloadOptions,
): Promise<DownloadResponse> {
  const requestInit: RequestInit = {
    method: 'GET',
    redirect: options.redirect ? 'follow' : 'error',
    credentials: options.credentials ?? 'same-origin',
  };
  const fileExtension: string =
    options.fileExtension.replace(/^\.+|\.+$/g, '') ?? '';
  const response = await fetch(options.url, requestInit);
  if (!response.ok) {
    throw new Error(
      `Failed to download file: ${response.status} (${response.statusText})`,
    );
  }
  const data = await response.arrayBuffer();
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
