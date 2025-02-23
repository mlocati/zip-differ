export interface Options extends RequestInit
{
    /**
     * The file extension to use when the filename cannot be extracted from the Content-Disposition response header:
     * This is extracted from the URL
     */
    fileExtension?: string;
}

export interface DownloadResponse
{
    data: ArrayBuffer;
    /**
     * The filename of the downloaded file extracted from the Content-Disposition response header, if available
    */
    filename?: string;
}

export interface Args
{
    url: string;
    options?: Options;
}

export async function download(url: URL, options?: Options): Promise<DownloadResponse>
{
    if (!options) {
        options = {};
    }
    if (!options.redirect) {
        options.redirect = 'follow';
    }

    const fileExtension: string = options.fileExtension?.replace(/^\.+|\.+$/g, '') ?? '';
    delete options.fileExtension;
    const response = await fetch(url.href, options);
    if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} (${response.statusText})`);
    }
    const data = await response.arrayBuffer();
    const match = response.headers.get('Content-Disposition')?.match(/^(.*?;)?\s*filename\s*=\s*"([^"]+)"/i);
    let filename: string | undefined = match ? match[2] : undefined;
    if (!filename && fileExtension !== '') {
        filename = url.pathname.split('/').pop() || 'file';
        if (!filename.toLowerCase().endsWith(`.${fileExtension.toLowerCase()}`)) {
            filename += '.' + fileExtension;
        }
    }

    return { data, filename };
}
