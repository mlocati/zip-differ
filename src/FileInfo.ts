import beautify from 'js-beautify';
import * as Diff from 'diff';

type NonEmptyArray<T> = [T, ...T[]];

export enum FileFormat {
  Text,
  Image,
}

export enum DifferFlag {
  None = 0,
  IgnoreCase = 0b1,
  IgnoreWhitespace = 0b10,
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
  PO = 'po',
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

export interface Differ {
  name: string;
  supportedFlags: DifferFlag;
  apply: (
    oldText: string,
    newText: string,
    flags: DifferFlag,
  ) => ReadonlyArray<Diff.Change>;
}

function hasFlag(flag: DifferFlag, target: DifferFlag): boolean {
  return (flag & target) !== 0;
}

const DIFFERS: Record<
  'Patch' | 'Chars' | 'CSS' | 'JSON' | 'Lines' | 'Words',
  Differ
> = {
  Patch: {
    name: 'Patch',
    supportedFlags: DifferFlag.None,
    apply: (oldText: string, newText: string, _: DifferFlag) => {
      let headerReached = false;
      return Diff.createTwoFilesPatch(
        'left',
        'right',
        oldText,
        newText,
        undefined,
        undefined,
        {},
      )
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
            count: 1,
          };
        });
    },
  },
  Chars: {
    name: 'Break at chars',
    supportedFlags: DifferFlag.IgnoreCase,
    apply: (oldText: string, newText: string, flags: DifferFlag) =>
      Diff.diffChars(oldText, newText, {
        ignoreCase: hasFlag(flags, DifferFlag.IgnoreCase),
      }),
  },
  Words: {
    name: 'Break at words',
    supportedFlags: DifferFlag.IgnoreCase | DifferFlag.IgnoreWhitespace,
    apply: (oldText: string, newText: string, flags: DifferFlag) => {
      if (hasFlag(flags, DifferFlag.IgnoreWhitespace)) {
        return Diff.diffWords(oldText, newText, {
          ignoreCase: hasFlag(flags, DifferFlag.IgnoreCase),
        });
      }
      return Diff.diffWordsWithSpace(oldText, newText, {
        ignoreCase: hasFlag(flags, DifferFlag.IgnoreCase),
      });
    },
  },
  Lines: {
    name: 'Break at lines',
    supportedFlags: DifferFlag.None,
    apply: (oldText: string, newText: string, _: DifferFlag) =>
      Diff.diffLines(oldText, newText, {}),
  },
  CSS: {
    name: 'CSS',
    supportedFlags: DifferFlag.None,
    apply: (oldText: string, newText: string, _: DifferFlag) =>
      Diff.diffCss(oldText, newText, {}),
  },
  JSON: {
    name: 'JSON',
    supportedFlags: DifferFlag.None,
    apply: (oldText: string, newText: string, _: DifferFlag) =>
      Diff.diffJson(oldText, newText, {}),
  },
};

const COMMON_DIFFERS: NonEmptyArray<Differ> = [
  DIFFERS.Patch,
  DIFFERS.Lines,
  DIFFERS.Words,
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
  apng: {
    image: {mimeType: 'image/apng'},
  },
  asciidoc: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.AsciiDoc,
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
  gif: {
    image: {mimeType: 'image/gif'},
  },
  // heic: UNSUPPORTED BY BROWSERS image: {mimeType: 'image/heic'}
  // heif: UNSUPPORTED BY BROWSERS image: {mimeType: 'image/heif'}
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
  less: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Less,
      differs: COMMON_DIFFERS,
    },
  },
  md: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Markdown,
      differs: COMMON_DIFFERS,
    },
  },
  patch: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Diff,
      differs: COMMON_DIFFERS,
    },
  },
  php: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.PHP,
      differs: COMMON_DIFFERS,
    },
  },
  pl: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Perl,
      differs: COMMON_DIFFERS,
    },
  },
  png: {
    image: {mimeType: 'image/png'},
  },
  po: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.PO,
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
  scss: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.SCSS,
      differs: [DIFFERS.CSS, ...COMMON_DIFFERS],
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
  // tiff: UNSUPPORTED BY BROWSERS image: {mimeType: 'image/tiff'}
  ts: {
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
  vbs: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.VBScript,
      differs: COMMON_DIFFERS,
    },
  },
  webp: {
    image: {mimeType: 'image/webp'},
  },
  xml: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.XML,
      formatter: FORMATTERS.XML,
      differs: COMMON_DIFFERS,
    },
  },
  yml: {
    text: {
      highlightjsLanguage: HighlightjsLanguages.Yaml,
      differs: COMMON_DIFFERS,
    },
  },
};

const EXTENSION_ALIASES: Record<string, keyof typeof EXTENSIONS> = {
  adoc: 'asciidoc',
  atom: 'xml',
  cjs: 'js',
  cmd: 'bat',
  cts: 'ts',
  cur: 'ico',
  diff: 'patch',
  gyp: 'py',
  h: 'c',
  htm: 'html',
  jfif: 'jpg',
  jpeg: 'jpg',
  jsonc: 'json',
  markdown: 'md',
  mjs: 'js',
  mkd: 'md',
  mkdown: 'md',
  mts: 'ts',
  perl: 'pl',
  pjp: 'jpg',
  pjpeg: 'jpg',
  pm: 'pl',
  pot: 'po',
  ps: 'ps1',
  python: 'py',
  rss: 'xml',
  ruby: 'rb',
  rust: 'rs',
  sass: 'scss',
  sh: 'bash',
  // tif: 'tiff',
  tsx: 'ts',
  vba: 'vbs',
  vbscript: 'vbs',
  xhtml: 'html',
  xsd: 'xml',
  xsl: 'xml',
  yaml: 'yml',
  zsh: 'bash',
};

function getExtensionInfoFromExtension(
  extension: string,
): ExtensionInfo | null {
  extension = extension.toLowerCase();
  if (EXTENSIONS.hasOwnProperty(extension)) {
    return EXTENSIONS[extension]!;
  }
  let aliasOf = EXTENSION_ALIASES[extension];
  if (aliasOf === undefined) {
    return null;
  }
  if (!EXTENSIONS.hasOwnProperty(aliasOf)) {
    throw new Error(
      `Invalid extension mapping: ${extension} is a alias of ${aliasOf}, but ${aliasOf} is not defined`,
    );
  }
  return EXTENSIONS[aliasOf]!;
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

export interface ImageInfo {
  /**
   * Remember to invoke URL.revokeObjectURL(...) when the image is no longer needed
   */
  url: string;
  width: number;
  height: number;
}

export async function inspectImageData(
  data: ArrayBuffer,
  options: {filename: string} | {extension: string} | {mimetype: string},
): Promise<ImageInfo> {
  return new Promise<ImageInfo>((resolve, reject) => {
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
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      document.body.removeChild(img);
      resolve({url, width, height});
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
