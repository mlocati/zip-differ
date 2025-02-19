export enum FileFormat {
    Text,
    Image,
};

const IMAGE_MIME_FORMATS_BY_FILEEXTENSION: {[fileExtension: string]: string} = {
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

const HIGHLIGHTJS_LANGUAGES_BY_FILEEXTENSION: {[fileExtension: string]: string} = {
    // Remmeber to register the languages in main.to too
    adoc: 'asciidoc',
    asciidoc: 'asciidoc',
    atom: 'xml',
    bash: 'bash',
    bat: 'dos',
    c: 'c',
    cmd: 'dos',
    cpp: 'cpp',
    cs: 'csharp',
    css: 'css',
    cts: 'typescript',
    diff: 'diff',
    gyp: 'python',
    h: 'c',
    htm: 'xml',
    html: 'xml',
    js: 'javascript',
    json: 'json',
    jsonc: 'json',
    less: 'less',
    markdown: 'markdown',
    md: 'markdown',
    mkd: 'markdown',
    mkdown: 'markdown',
    mts: 'typescript',
    patch: 'diff',
    perl: 'perl',
    php: 'php',
    pl: 'perl',
    pm: 'perl',
    ps: 'powershell',
    ps1: 'powershell',
    py: 'python',
    python: 'python',
    rb: 'ruby',
    rs: 'rust',
    rss: 'xml',
    ruby: 'ruby',
    rust: 'rust',
    sass: 'scss',
    scss: 'scss',
    sh: 'bash',
    sql: 'sql',
    svg: 'xml',
    ts: 'typescript',
    tsx: 'typescript',
    twig: 'twig',
    txt: 'plaintext',
    vb: 'vbnet',
    vba: 'vbscript',
    vbs: 'vbscript',
    vbscript: 'vbscript',
    xhtml: 'xml',
    xml: 'xml',
    xsd: 'xml',
    xsl: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    zsh: 'bash',
};

export function getMimeTypeFromExtension(extension: string): string
{
    extension = extension.toLowerCase();
    return IMAGE_MIME_FORMATS_BY_FILEEXTENSION[extension] || '';
}

export function getMimeTypeFromFilename(filename: string): string
{
    return getMimeTypeFromExtension(filename.split('.').pop() || '');
}

export function getHighlightJsLanguageFromExtension(extension: string): string
{
    extension = extension.toLowerCase();
    return HIGHLIGHTJS_LANGUAGES_BY_FILEEXTENSION[extension] || '';
}

export function getHighlightJsLanguageFromFilename(filename: string): string
{
    return getHighlightJsLanguageFromExtension(filename.split('.').pop() || '');
}

export function getFileFormatsFromExtension(extension: string): FileFormat[]
{
    extension = extension.toLowerCase();
    const result: FileFormat[] = [];
    if (extension in IMAGE_MIME_FORMATS_BY_FILEEXTENSION) {
        result.push(FileFormat.Image);
    }
    if (extension in HIGHLIGHTJS_LANGUAGES_BY_FILEEXTENSION) {
        result.push(FileFormat.Text);
    }
    return result;
}
export function getFileFormatsFromFilename(filename: string): FileFormat[]
{
    return getFileFormatsFromExtension(filename.split('.').pop() || '');
}
