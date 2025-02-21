export enum Credentials
{
    /**
     * Only send and include credentials for same-origin requests (default)
     */
    SameOrigin = 'same-origin',
    /**
     * Never send credentials in the request or include credentials in the response
     */
    Omit = 'omit',
    /**
     * Always include credentials, even cross-origin
     */
    Include = 'include'
}

export enum Redirect
{
    /**
     * Automatically follow redirects
     */
    Follow = 'follow',
    /**
     * Error when redirecting
     */
    Error = 'error'
}

export interface DownloadOptions
{
    /**
     * The file extension to use when the filename cannot be extracted from the Content-Disposition response header:
     * This is extracted from the URL
     */
    fileExtension?: string;
    method?: 'GET',
    redirect?: Redirect,
    /**
     * Credentials are cookies, TLS client certificates, or authentication headers containing a username and password.
     */
    credentials?: Credentials;
}

export interface DownloadResponse
{
    data: ArrayBuffer;
    /**
     * The filename of the downloaded file extracted from the Content-Disposition response header, if available
    */
    filename?: string;
}

export async function download(url: URL, options?: DownloadOptions): Promise<DownloadResponse>
{
    const requestOptions = {
        method: options?.method || 'GET',
        redirect: options?.redirect || Redirect.Follow,
        credentials: options?.credentials || Credentials.SameOrigin,
    };
    const response = await fetch(url.href, requestOptions);
    if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} (${response.statusText})`);
    }
    const data = await response.arrayBuffer();
    const match = response.headers.get('Content-Disposition')?.match(/^(.*?;)?\s*filename\s*=\s*"([^"]+)"/i);
    let filename: string | undefined = match ? match[2] : undefined;
    if (!filename && options?.fileExtension) {
        const fileExtension = '.' + options.fileExtension.replace(/^\.+|\.+$/g, '');
        if (fileExtension !== '') {
            filename = (url.pathname.split('/').pop() || 'file');
            if (!filename.toLowerCase().endsWith(fileExtension.toLowerCase())) {
                filename += fileExtension;
            }
        }
    }

    return { data, filename };
}
