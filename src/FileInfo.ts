import beautify from 'js-beautify';
import * as Diff from 'diff';

type NonEmptyArray<T> = [T, ...T[]];

export enum FileFormat {
  Text,
  Image,
}

// Remmeber to register the languages in main.to too
enum HighlightjsLanguages {
  AsciiDoc = 'asciidoc',
  Bash = 'bash',
  C = 'c',
  CPP = 'cpp',
  CSharp = 'csharp',
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

export interface Formatter {
  actionName: string;
  apply: (text: string) => string;
}

const FORMATTERS: Record<'CSS' | 'Html' | 'JavaScript' | 'XML', Formatter> = {
  CSS: {
    actionName: 'Format CSS',
    apply: (code: string): string => beautify.css(code),
  },
  Html: {
    actionName: 'Format HTML',
    apply: (code: string): string => beautify.html(code),
  },
  JavaScript: {
    actionName: 'Format JavaScript',
    apply: (code: string): string => beautify.js(code),
  },
  XML: {
    actionName: 'Format XML',
    apply: (code: string): string => beautify.html(code),
  },
};

interface CaseUnawareDiffer {
  name: string;
  supportsCaseSensitivity: false;
  apply: (oldText: string, newText: string) => ReadonlyArray<Diff.Change>;
}

interface CaseAwareDiffer {
  name: string;
  supportsCaseSensitivity: true;
  apply: (
    oldText: string,
    newText: string,
    ignoreCase: boolean,
  ) => ReadonlyArray<Diff.Change>;
}

export type Differ = CaseAwareDiffer | CaseUnawareDiffer;

const DIFFERS: Record<
  'Patch' | 'Chars' | 'CSS' | 'JSON' | 'Lines' | 'Words' | 'WordsIgnoreSpaces',
  Differ
> = {
  Patch: {
    name: 'Patch',
    supportsCaseSensitivity: false,
    apply: (oldText: string, newText: string) => {
      let headerReached = false;
      return Diff.createTwoFilesPatch('left', 'right', oldText, newText)
        .split('\n')
        .filter((line: string): boolean => {
          if (line.startsWith('@@')) {
            headerReached = true;
          }
          return headerReached;
        })
        .map((line: string): Diff.Change => {
          return {
            value: line + '\n',
            added: line.startsWith('+'),
            removed: line.startsWith('-'),
          };
        });
    },
  },
  Chars: {
    name: 'Char by Char',
    supportsCaseSensitivity: true,
    apply: (oldText: string, newText: string, ignoreCase: boolean) =>
      Diff.diffChars(oldText, newText, {ignoreCase}),
  },
  Words: {
    name: 'Word by Word',
    supportsCaseSensitivity: true,
    apply: (oldText: string, newText: string, ignoreCase: boolean) =>
      Diff.diffWordsWithSpace(oldText, newText, {ignoreCase}),
  },
  WordsIgnoreSpaces: {
    name: 'Word by Word (ignoring spaces)',
    supportsCaseSensitivity: true,
    apply: (oldText: string, newText: string, ignoreCase: boolean) =>
      Diff.diffWords(oldText, newText, {ignoreCase}),
  },
  Lines: {
    name: 'Line by Line',
    supportsCaseSensitivity: false,
    apply: (oldText: string, newText: string) =>
      Diff.diffLines(oldText, newText),
  },
  CSS: {
    name: 'CSS',
    supportsCaseSensitivity: false,
    apply: (oldText: string, newText: string) => Diff.diffCss(oldText, newText),
  },
  JSON: {
    name: 'JSON',
    supportsCaseSensitivity: false,
    apply: (oldText: string, newText: string) =>
      Diff.diffJson(oldText, newText),
  },
};
const COMMON_DIFFERS: NonEmptyArray<Differ> = [
  DIFFERS.Patch,
  DIFFERS.Lines,
  DIFFERS.Words,
  DIFFERS.WordsIgnoreSpaces,
  DIFFERS.Chars,
];

interface ImageFile {
  mimeType: string;
}

interface TextFile {
  highlightjsLanguage: HighlightjsLanguages;
  formatter?: Formatter;
  differs: NonEmptyArray<Differ>;
}

interface ExtensionInfo {
  image?: ImageFile;
  text?: TextFile;
}

const EXTENSIONS: Record<string, ExtensionInfo> = {
  adoc: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.AsciiDoc,
      differs: COMMON_DIFFERS,
    },
  },
  apng: {
    image: {mimeType: 'image/apng'},
  },
  asciidoc: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.AsciiDoc,
      differs: COMMON_DIFFERS,
    },
  },
  atom: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.XML,
      formatter: FORMATTERS.XML,
      differs: COMMON_DIFFERS,
    },
  },
  avif: {
    image: {mimeType: 'image/avif'},
  },
  bash: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Bash,
      differs: COMMON_DIFFERS,
    },
  },
  bat: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.DOS,
      differs: COMMON_DIFFERS,
    },
  },
  bmp: {
    image: {mimeType: 'image/bmp'},
  },
  c: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.C,
      differs: COMMON_DIFFERS,
    },
  },
  cmd: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.DOS,
      differs: COMMON_DIFFERS,
    },
  },
  cpp: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.CPP,
      differs: COMMON_DIFFERS,
    },
  },
  cs: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.CSharp,
      differs: COMMON_DIFFERS,
    },
  },
  css: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.CSS,
      formatter: FORMATTERS.CSS,
      differs: [DIFFERS.CSS, ...COMMON_DIFFERS],
    },
  },
  cjs: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.JavaScript,
      formatter: FORMATTERS.JavaScript,
      differs: COMMON_DIFFERS,
    },
  },
  cts: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.TypeScript,
      differs: COMMON_DIFFERS,
    },
  },
  cur: {
    image: {mimeType: 'image/x-icon'},
  },
  diff: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Diff,
      differs: COMMON_DIFFERS,
    },
  },
  gif: {
    image: {mimeType: 'image/gif'},
  },
  gyp: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Python,
      differs: COMMON_DIFFERS,
    },
  },
  h: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.C,
      differs: COMMON_DIFFERS,
    },
  },
  heic: {
    // UNSUPPORTED BY BROWSERS image: {mimeType: 'image/heic'},
  },
  heif: {
    // UNSUPPORTED BY BROWSERS image: {mimeType: 'image/heif'},
  },
  htm: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.XML,
      formatter: FORMATTERS.Html,
      differs: COMMON_DIFFERS,
    },
  },
  html: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.XML,
      formatter: FORMATTERS.Html,
      differs: COMMON_DIFFERS,
    },
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
    text: {
      highlightjsLanguage: HighlightjsLanguages.JavaScript,
      formatter: FORMATTERS.JavaScript,
      differs: COMMON_DIFFERS,
    },
  },
  json: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.JSON,
      differs: [DIFFERS.JSON, ...COMMON_DIFFERS],
    },
  },
  jsonc: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.JSON,
      differs: [DIFFERS.JSON, ...COMMON_DIFFERS],
    },
  },
  less: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Less,
      differs: COMMON_DIFFERS,
    },
  },
  markdown: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Markdown,
      differs: COMMON_DIFFERS,
    },
  },
  md: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Markdown,
      differs: COMMON_DIFFERS,
    },
  },
  mjs: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.JavaScript,
      formatter: FORMATTERS.JavaScript,
      differs: COMMON_DIFFERS,
    },
  },
  mkd: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Markdown,
      differs: COMMON_DIFFERS,
    },
  },
  mkdown: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Markdown,
      differs: COMMON_DIFFERS,
    },
  },
  mts: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.TypeScript,
      differs: COMMON_DIFFERS,
    },
  },
  patch: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Diff,
      differs: COMMON_DIFFERS,
    },
  },
  perl: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Perl,
      differs: COMMON_DIFFERS,
    },
  },
  php: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.PHP,
      differs: COMMON_DIFFERS,
    },
  },
  pjp: {
    image: {mimeType: 'image/jpeg'},
  },
  pjpeg: {
    image: {mimeType: 'image/jpeg'},
  },
  pl: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Perl,
      differs: COMMON_DIFFERS,
    },
  },
  pm: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Perl,
      differs: COMMON_DIFFERS,
    },
  },
  png: {
    image: {mimeType: 'image/png'},
  },
  ps: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.PowerShell,
      differs: COMMON_DIFFERS,
    },
  },
  ps1: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.PowerShell,
      differs: COMMON_DIFFERS,
    },
  },
  py: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Python,
      differs: COMMON_DIFFERS,
    },
  },
  python: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Python,
      differs: COMMON_DIFFERS,
    },
  },
  rb: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Ruby,
      differs: COMMON_DIFFERS,
    },
  },
  rs: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Rust,
      differs: COMMON_DIFFERS,
    },
  },
  rss: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.XML,
      formatter: FORMATTERS.XML,
      differs: COMMON_DIFFERS,
    },
  },
  ruby: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Ruby,
      differs: COMMON_DIFFERS,
    },
  },
  rust: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Rust,
      differs: COMMON_DIFFERS,
    },
  },
  sass: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.SCSS,
      differs: [DIFFERS.CSS, ...COMMON_DIFFERS],
    },
  },
  scss: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.SCSS,
      differs: [DIFFERS.CSS, ...COMMON_DIFFERS],
    },
  },
  sh: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Bash,
      differs: COMMON_DIFFERS,
    },
  },
  sql: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.SQL,
      differs: COMMON_DIFFERS,
    },
  },
  svg: {
    image: {mimeType: 'image/svg+xml'},
    text: {
      highlightjsLanguage: HighlightjsLanguages.XML,
      formatter: FORMATTERS.XML,
      differs: COMMON_DIFFERS,
    },
  },
  tif: {
    // UNSUPPORTED BY BROWSERS image: {mimeType: 'image/tiff'},
  },
  tiff: {
    // UNSUPPORTED BY BROWSERS image: {mimeType: 'image/tiff'},
  },
  ts: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.TypeScript,
      differs: COMMON_DIFFERS,
    },
  },
  tsx: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.TypeScript,
      differs: COMMON_DIFFERS,
    },
  },
  twig: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Twig,
      differs: COMMON_DIFFERS,
    },
  },
  txt: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.PlainText,
      differs: COMMON_DIFFERS,
    },
  },
  vb: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.VBNet,
      differs: COMMON_DIFFERS,
    },
  },
  vba: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.VBScript,
      differs: COMMON_DIFFERS,
    },
  },
  vbs: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.VBScript,
      differs: COMMON_DIFFERS,
    },
  },
  vbscript: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.VBScript,
      differs: COMMON_DIFFERS,
    },
  },
  webp: {
    image: {mimeType: 'image/webp'},
  },
  xhtml: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.XML,
      formatter: FORMATTERS.Html,
      differs: COMMON_DIFFERS,
    },
  },
  xml: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.XML,
      formatter: FORMATTERS.XML,
      differs: COMMON_DIFFERS,
    },
  },
  xsd: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.XML,
      formatter: FORMATTERS.XML,
      differs: COMMON_DIFFERS,
    },
  },
  xsl: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.XML,
      formatter: FORMATTERS.XML,
      differs: COMMON_DIFFERS,
    },
  },
  yaml: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Yaml,
      differs: COMMON_DIFFERS,
    },
  },
  yml: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Yaml,
      differs: COMMON_DIFFERS,
    },
  },
  zsh: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Bash,
      differs: COMMON_DIFFERS,
    },
  },
};

function getExtensionInfoFromExtension(
  extension: string,
): ExtensionInfo | null {
  return EXTENSIONS[extension.toLowerCase()] ?? null;
}

function extractExtensionFromFilename(filename: string): string {
  return filename.split('.').pop() || '';
}

export function getMimeTypeFromExtension(extension: string): string {
  return getExtensionInfoFromExtension(extension)?.image?.mimeType ?? '';
}
export function getMimeTypeFromFilename(filename: string): string {
  return getMimeTypeFromExtension(extractExtensionFromFilename(filename));
}

export function getHighlightJsLanguageFromExtension(extension: string): string {
  return (
    getExtensionInfoFromExtension(extension)?.text?.highlightjsLanguage ?? ''
  );
}

export function getHighlightJsLanguageFromFilename(filename: string): string {
  return getHighlightJsLanguageFromExtension(
    extractExtensionFromFilename(filename),
  );
}

export function getFileFormatsFromExtension(extension: string): FileFormat[] {
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

export function getFileFormatsFromFilename(filename: string): FileFormat[] {
  return getFileFormatsFromExtension(extractExtensionFromFilename(filename));
}

export function getFormatterFromExtension(extension: string): Formatter | null {
  return getExtensionInfoFromExtension(extension)?.text?.formatter ?? null;
}

export function getFormatterFromFilename(filename: string): Formatter | null {
  return getFormatterFromExtension(extractExtensionFromFilename(filename));
}

export function getDiffersFromExtension(
  extension: string,
): NonEmptyArray<Differ> | null {
  return getExtensionInfoFromExtension(extension)?.text?.differs ?? null;
}

export function getDiffersFromFilename(
  filename: string,
): NonEmptyArray<Differ> | null {
  return getDiffersFromExtension(extractExtensionFromFilename(filename));
}

/**
 * Remember to invoke URL.revokeObjectURL(...) when the image is no longer needed
 */
export async function buildImageUrlFromData(
  data: ArrayBuffer,
  options: {filename: string} | {extension: string} | {mimetype: string},
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let mimeType: string;
    if ('mimetype' in options) {
      mimeType = options.mimetype;
    } else if ('extension' in options) {
      mimeType = getMimeTypeFromExtension(options.extension);
    } else {
      mimeType = getMimeTypeFromFilename(options.filename);
    }
    if (mimeType === '') {
      reject('Unknown image file type');
      return;
    }
    const blob = new Blob([data], {type: mimeType});
    const url = URL.createObjectURL(blob);
    const img = document.createElement('img');
    img.onload = () => {
      document.body.removeChild(img);
      resolve(url);
    };
    img.onerror = () => {
      document.body.removeChild(img);
      URL.revokeObjectURL(url);
      reject('Failed to load image');
    };
    document.body.appendChild(img);
    img.src = url;
  });
}
