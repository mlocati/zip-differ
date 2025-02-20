import beautify from 'js-beautify';

export enum FileFormat {
    Text,
    Image,
}

export type Formatter = (text: string) => string;

// Remmeber to register the languages in main.to too
enum HighlightjsLanguages {
    AsciiDoc = 'asciidoc',
    Bash = 'bash',
    C = 'c',
    CPP = 'cpp',
    CSharp= 'csharp',
    CSS = 'css',
    Diff = 'diff',
    DOS = 'dos',
    JavaScript = 'javascript',
    JSON = 'json',
    Less = 'less',
    Markdown = 'markdown',
    Perl = 'perl',
    PHP = 'php',
    PowerShell = 'powershell',
    Python = 'python',
    Ruby = 'ruby',
    Rust = 'rust',
    TypeScript = 'typescript',
    XML = 'xml',
    SCSS = 'scss',
    SQL = 'sql',
    Twig = 'twig',
    PlainText = 'plaintext',
    VBNet = 'vbnet',
    VBScript = 'vbscript',
    Yaml = 'yaml',
}

function formatJavascript(code: string): string
{
    return beautify.js(code);
}

function formatCSS(code: string): string
{
    return beautify.css(code);
}

function formatXML(code: string): string
{
    return beautify.html(code);
}

function formatHtml(code: string): string
{
    return beautify.html(code);
}

interface ImageFile {
    mimeType: string,
}

interface TextFile {
    highlightjsLanguage: HighlightjsLanguages,
    formatter?: Formatter,
}

interface ExtensionInfo {
    image?: ImageFile,
    text?: TextFile,
}

const EXTENSIONS: Record<string, ExtensionInfo> = {
    adoc: {
        text: {highlightjsLanguage: HighlightjsLanguages.AsciiDoc},
    },
    apng: {
        image: {mimeType: 'image/apng'},
    },
    asciidoc: {
        text: {highlightjsLanguage: HighlightjsLanguages.AsciiDoc},
    },
    atom: {
        text: {highlightjsLanguage: HighlightjsLanguages.XML, formatter: formatXML},
    },
    avif: {
        image: {mimeType: 'image/avif'},
    },
    bash: {
        text: {highlightjsLanguage: HighlightjsLanguages.Bash},
    },
    bat: {
        text: {highlightjsLanguage: HighlightjsLanguages.DOS},
    },
    bmp: {
        image: {mimeType: 'image/bmp'},
    },
    c: {
        text: {highlightjsLanguage: HighlightjsLanguages.C},
    },
    cmd: {
        text: {highlightjsLanguage: HighlightjsLanguages.DOS},
    },
    cpp: {
        text: {highlightjsLanguage: HighlightjsLanguages.CPP},
    },
    cs: {
        text: {highlightjsLanguage: HighlightjsLanguages.CSharp},
    },
    css: {
        text: {highlightjsLanguage: HighlightjsLanguages.CSS, formatter: formatCSS},
    },
    cjs: {
        text: {highlightjsLanguage: HighlightjsLanguages.JavaScript, formatter: formatJavascript},
    },
    cts: {
        text: {highlightjsLanguage: HighlightjsLanguages.TypeScript},
    },
    cur: {
        image: {mimeType: 'image/x-icon'},
    },
    diff: {
        text: {highlightjsLanguage: HighlightjsLanguages.Diff},
    },
    gif: {
        image: {mimeType: 'image/gif'},
    },
    gyp: {
        text: {highlightjsLanguage: HighlightjsLanguages.Python},
    },
    h: {
        text: {highlightjsLanguage: HighlightjsLanguages.C},
    },
    heic: {
        // UNSUPPORTED BY BROWSERS image: {mimeType: 'image/heic'},
    },
    heif: {
        // UNSUPPORTED BY BROWSERS image: {mimeType: 'image/heif'},
    },
    htm: {
        text: {highlightjsLanguage: HighlightjsLanguages.XML, formatter: formatHtml},
    },
    html: {
        text: {highlightjsLanguage: HighlightjsLanguages.XML, formatter: formatHtml},
    },
    ico: {
        image: {mimeType: 'image/x-icon'},
    },
    jfif: {
        image: {mimeType: 'image/jpeg'},
    },
    jpeg: {
        image: {mimeType: 'image/jpeg'},
    },
    jpg: {
        image: {mimeType: 'image/jpeg'},
    },
    js: {
        text: {highlightjsLanguage: HighlightjsLanguages.JavaScript, formatter: formatJavascript},
    },
    json: {
        text: {highlightjsLanguage: HighlightjsLanguages.JSON},
    },
    jsonc: {
        text: {highlightjsLanguage: HighlightjsLanguages.JSON},
    },
    less: {
        text: {highlightjsLanguage: HighlightjsLanguages.Less},
    },
    markdown: {
        text: {highlightjsLanguage: HighlightjsLanguages.Markdown},
    },
    md: {
        text: {highlightjsLanguage: HighlightjsLanguages.Markdown},
    },
    mjs: {
        text: {highlightjsLanguage: HighlightjsLanguages.JavaScript, formatter: formatJavascript},
    },
    mkd: {
        text: {highlightjsLanguage: HighlightjsLanguages.Markdown},
    },
    mkdown: {
        text: {highlightjsLanguage: HighlightjsLanguages.Markdown},
    },
    mts: {
        text: {highlightjsLanguage: HighlightjsLanguages.TypeScript},
    },
    patch: {
        text: {highlightjsLanguage: HighlightjsLanguages.Diff},
    },
    perl: {
        text: {highlightjsLanguage: HighlightjsLanguages.Perl},
    },
    php: {
        text: {highlightjsLanguage: HighlightjsLanguages.PHP},
    },
    pjp: {
        image: {mimeType: 'image/jpeg'},
    },
    pjpeg: {
        image: {mimeType: 'image/jpeg'},
    },
    pl: {
        text: {highlightjsLanguage: HighlightjsLanguages.Perl},
    },
    pm: {
        text: {highlightjsLanguage: HighlightjsLanguages.Perl},
    },
    png: {
        image: {mimeType: 'image/png'},
    },
    ps: {
        text: {highlightjsLanguage: HighlightjsLanguages.PowerShell},
    },
    ps1: {
        text: {highlightjsLanguage: HighlightjsLanguages.PowerShell},
    },
    py: {
        text: {highlightjsLanguage: HighlightjsLanguages.Python},
    },
    python: {
        text: {highlightjsLanguage: HighlightjsLanguages.Python},
    },
    rb: {
        text: {highlightjsLanguage: HighlightjsLanguages.Ruby},
    },
    rs: {
        text: {highlightjsLanguage: HighlightjsLanguages.Rust},
    },
    rss: {
        text: {highlightjsLanguage: HighlightjsLanguages.XML, formatter: formatXML},
    },
    ruby: {
        text: {highlightjsLanguage: HighlightjsLanguages.Ruby},
    },
    rust: {
        text: {highlightjsLanguage: HighlightjsLanguages.Rust},
    },
    sass: {
        text: {highlightjsLanguage: HighlightjsLanguages.SCSS},
    },
    scss: {
        text: {highlightjsLanguage: HighlightjsLanguages.SCSS},
    },
    sh: {
        text: {highlightjsLanguage: HighlightjsLanguages.Bash},
    },
    sql: {
        text: {highlightjsLanguage: HighlightjsLanguages.SQL},
    },
    svg: {
        image: {mimeType: 'image/svg+xml'},
        text: {highlightjsLanguage: HighlightjsLanguages.XML, formatter: formatXML},
    },
    tif: {
        // UNSUPPORTED BY BROWSERS image: {mimeType: 'image/tiff'},
    },
    tiff: {
        // UNSUPPORTED BY BROWSERS image: {mimeType: 'image/tiff'},
    },
    ts: {
        text: {highlightjsLanguage: HighlightjsLanguages.TypeScript},
    },
    tsx: {
        text: {highlightjsLanguage: HighlightjsLanguages.TypeScript},
    },
    twig: {
        text: {highlightjsLanguage: HighlightjsLanguages.Twig},
    },
    txt: {
        text: {highlightjsLanguage: HighlightjsLanguages.PlainText},
    },
    vb: {
        text: {highlightjsLanguage: HighlightjsLanguages.VBNet},
    },
    vba: {
        text: {highlightjsLanguage: HighlightjsLanguages.VBScript},
    },
    vbs: {
        text: {highlightjsLanguage: HighlightjsLanguages.VBScript},
    },
    vbscript: {
        text: {highlightjsLanguage: HighlightjsLanguages.VBScript},
    },
    webp: {
        image: {mimeType: 'image/webp'},
    },
    xhtml: {
        text: {highlightjsLanguage: HighlightjsLanguages.XML, formatter: formatHtml},
    },
    xml: {
        text: {highlightjsLanguage: HighlightjsLanguages.XML, formatter: formatXML},
    },
    xsd: {
        text: {highlightjsLanguage: HighlightjsLanguages.XML, formatter: formatXML},
    },
    xsl: {
        text: {highlightjsLanguage: HighlightjsLanguages.XML, formatter: formatXML},
    },
    yaml: {
        text: {highlightjsLanguage: HighlightjsLanguages.Yaml},
    },
    yml: {
        text: {highlightjsLanguage: HighlightjsLanguages.Yaml},
    },
    zsh: {
        text: {highlightjsLanguage: HighlightjsLanguages.Bash},
    },
};

function getExtensionInfoFromExtension(extension: string): ExtensionInfo|null
{
    return EXTENSIONS[extension.toLowerCase()] ?? null;
}

function extractExtensionFromFilename(filename: string): string
{
    return filename.split('.').pop() || '';
}

export function getMimeTypeFromExtension(extension: string): string
{
    return getExtensionInfoFromExtension(extension)?.image?.mimeType ?? '';
}
export function getMimeTypeFromFilename(filename: string): string
{
    return getMimeTypeFromExtension(extractExtensionFromFilename(filename));
}

export function getHighlightJsLanguageFromExtension(extension: string): string
{
    return getExtensionInfoFromExtension(extension)?.text?.highlightjsLanguage ?? '';
}

export function getHighlightJsLanguageFromFilename(filename: string): string
{
    return getHighlightJsLanguageFromExtension(extractExtensionFromFilename(filename));
}

export function getFileFormatsFromExtension(extension: string): FileFormat[]
{
    const result: FileFormat[] = [];
    const info = getExtensionInfoFromExtension(extension);
    if (info?.image) {
        result.push(FileFormat.Image);
    }
    if (info?.text) {
        result.push(FileFormat.Text);
    }
    return result;
}

export function getFileFormatsFromFilename(filename: string): FileFormat[]
{
    return getFileFormatsFromExtension(extractExtensionFromFilename(filename));
}

export function getFormatterFromExtension(extension: string): Formatter|null
{
    return getExtensionInfoFromExtension(extension)?.text?.formatter ?? null;
}

export function getFormatterFromFilename(filename: string): Formatter|null
{
    return getFormatterFromExtension(extractExtensionFromFilename(filename));
}
