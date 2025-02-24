import {type DownloadOptions} from './Downloader';

const ALLOWREDIRECT_SUFFIX = 'redirect';
const CREDENTIALS_SUFFIX = 'credentials';

export function setDownloadUrl(
  prefix: string,
  downloadOptions: DownloadOptions | null,
): void {
  const params = new URLSearchParams(document.location.search);
  const newParams: {[key: string]: string} = {};
  const myPrefix =
    window.location.origin + window.location.pathname.replace(/\/[^\/]+$/, '/');
  newParams[prefix] = downloadOptions
    ? downloadOptions.url.href.startsWith(myPrefix)
      ? downloadOptions.url.href.substring(myPrefix.length)
      : downloadOptions.url.href
    : '';
  newParams[prefix + '.' + ALLOWREDIRECT_SUFFIX] =
    downloadOptions?.redirect === false ? 'no' : '';
  newParams[prefix + '.' + CREDENTIALS_SUFFIX] =
    (downloadOptions?.credentials ?? 'same-origin') === 'same-origin'
      ? ''
      : downloadOptions!.credentials!;
  params.forEach((_, key) => {
    if (!newParams.hasOwnProperty(key)) {
      return;
    }
    if (newParams[key] === '') {
      params.delete(key);
    } else {
      params.set(key, newParams[key]);
    }
    delete newParams[key];
  });
  for (const key in newParams) {
    if (newParams[key] !== '') {
      params.set(key, newParams[key]);
    }
  }
  window.history.replaceState(
    {},
    '',
    `${document.location.pathname}?${params}`,
  );
}

export function getDownloadUrl(prefix: string): DownloadOptions | null {
  const params = new URLSearchParams(document.location.search);
  let url: URL | null = null;
  try {
    const rawUrl = params.get(prefix);
    if (rawUrl) {
      url = new URL(rawUrl, window.location.href);
    }
  } catch (e) {
    console.error(e);
  }
  if (!url) {
    setDownloadUrl(prefix, null);
    return null;
  }
  const rawCredentials: string =
    params.get(prefix + '.' + CREDENTIALS_SUFFIX) ?? '';
  return {
    url,
    redirect:
      params.get(prefix + '.' + ALLOWREDIRECT_SUFFIX) === 'no' ? false : true,
    credentials: ['include', 'omit', 'same-origin'].includes(rawCredentials)
      ? <RequestCredentials>rawCredentials
      : 'same-origin',
    fileExtension: 'zip',
  };
}
