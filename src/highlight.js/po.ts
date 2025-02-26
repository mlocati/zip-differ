import type {HLJSApi, Language} from 'highlight.js';

function po(hljs: HLJSApi): Language {
  return {
    name: 'gettext PO and POT',
    aliases: ['pot'],
    case_insensitive: false,
    keywords: {
      $pattern: <any>/\w+(\[\d+\])?/,
      keyword: [
        'msgctxt',
        'msgid',
        'msgid_plural',
        'msgstr',
        'msgstr[0]',
        'msgstr[1]',
        'msgstr[2]',
        'msgstr[3]',
        'msgstr[4]',
      ],
    },
    contains: [hljs.COMMENT(/^[ \t]*#/, /$/), hljs.QUOTE_STRING_MODE],
  };
}

export default po;
