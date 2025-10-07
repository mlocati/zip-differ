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

const [setItem, getItem, removeItem] = (function () {
  function getActualStorageKey(key: string): string {
    return `zip-differ.${key}`;
  }
  return [
    (key: string, value: string) =>
      window.localStorage.setItem(getActualStorageKey(key), value),
    (key: string) => window.localStorage.getItem(getActualStorageKey(key)),
    (key: string) => window.localStorage.removeItem(getActualStorageKey(key)),
  ];
})();

export function loadString(key: string): string | null {
  return getItem(key);
}

export function saveString(key: string, value: string | null): void {
  if (value === null) {
    removeItem(key);
  } else {
    setItem(key, value);
  }
}

export function loadBoolean(key: Key): boolean {
  switch (loadString(key)?.toLocaleLowerCase()) {
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
    removeItem(key);
  } else {
    saveString(key, value ? 'true' : 'false');
  }
}

export function saveEnumValue<T extends object>(
  key: string,
  enumObject: T,
  enumValue: T[keyof T],
): void {
  if (typeof enumValue === 'number') {
    saveString(key, (enumObject as any)[enumValue]);
  } else {
    saveString(key, enumValue as string);
  }
}

export function loadEnumValue<T extends object>(
  key: string,
  enumObject: T,
): T[keyof T] | null {
  const serialized = loadString(key);
  if (serialized === null) {
    return null;
  }
  const values = Object.values(enumObject);
  if (values.includes(serialized as any)) {
    return serialized as T[keyof T];
  }
  if (typeof (enumObject as any)[serialized] === 'number') {
    return (enumObject as any)[serialized] as T[keyof T];
  }
  return null;
}
