export enum Key {
  Diff_ignoreCase = 'diff.ignoreCase',
  Diff_ignoreWhitespace = 'diff.ignoreWhitespace',
  Diff_normalizeEOL = 'diff.normalizeEOL',
  Diff_applyFormatter = 'diff.applyFormatter',
}

function getBooleanDefaultValue(key: Key): boolean {
  switch (key) {
    default:
      return false;
  }
}

function getActualStorageKey(key: Key): string {
  return `zip-differ.${key}`;
}

export function loadBoolean(key: Key): boolean {
  switch (
    window.localStorage.getItem(getActualStorageKey(key))?.toLocaleLowerCase()
  ) {
    case '1':
    case 'true':
    case 'on':
    case 'yes':
      return true;
    case '0':
    case 'false':
    case 'off':
    case 'no':
      return false;
    default:
      return getBooleanDefaultValue(key);
  }
}

export function saveBoolean(key: Key, value: boolean): void {
  if (value === getBooleanDefaultValue(key)) {
    window.localStorage.removeItem(getActualStorageKey(key));
  } else {
    window.localStorage.setItem(
      getActualStorageKey(key),
      value ? 'true' : 'false',
    );
  }
}
