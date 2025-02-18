export enum FileFormat {
    Text,
    Image,
};

const IMAGE_MIME_FORMATS: {[fileExtension: string]: string} = {
    apng: 'image/apng',
    bmp: 'image/bmp',
    avif: 'image/avif',
    cur: 'image/x-icon',
    gif: 'image/gif',
    // heic: 'image/heic',
    // heif: 'image/heif',
    ico: 'image/x-icon',
    jfif: 'image/jpeg',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    pjpeg: 'image/jpeg',
    pjp: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    // tif: 'image/tiff',
    // tiff: 'image/tiff',
    webp: 'image/webp',
};

export function getMimeTypeFromExtension(extension: string): string
{
    extension = extension.toLowerCase();
    return IMAGE_MIME_FORMATS[extension] || '';
}

export function getMimeTypeFromFilename(filename: string): string
{
    return getMimeTypeFromExtension(filename.split('.').pop() || '');
}

export function getFileFormatsFromExtension(extension: string): FileFormat[]
{
    extension = extension.toLowerCase();
    const result: FileFormat[] = [];
    if (extension in IMAGE_MIME_FORMATS) {
        result.push(FileFormat.Image);
    }
    switch (extension.toLowerCase()) {
        case 'bat':
        case 'cmd':
        case 'css':
        case 'htm':
        case 'html':
        case 'js':
        case 'md':
        case 'php':
        case 'sh':
        case 'txt':
        case 'xml':
        case 'svg':
            result.push(FileFormat.Text);
            break;
    }
    return result;
}
export function getFileFormatsFromFilename(filename: string): FileFormat[]
{
    return getFileFormatsFromExtension(filename.split('.').pop() || '');
}
