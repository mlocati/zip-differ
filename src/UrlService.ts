import { DefaultOptions, type Args, type Options } from "./Downloader";

const ALLOWREDIRECT_SUFFIX = 'redirect';
const CREDENTIALS_SUFFIX = 'credentials';

export function setDownloadUrl(prefix: string, args: Args|null): void
{
    const params = new URLSearchParams(document.location.search);
    const newParams: {[key: string]: string} = {};
    const myPrefix = window.location.origin + window.location.pathname;
    newParams[prefix] = args ? (args.url.href.startsWith(myPrefix) ? args.url.href.substring(myPrefix.length) : args.url.href) : '';
    newParams[prefix + '.' + ALLOWREDIRECT_SUFFIX] = args?.options?.redirect === 'error' ? 'no' : '';
    newParams[prefix + '.' + CREDENTIALS_SUFFIX] = !args?.options?.credentials || args.options.credentials === DefaultOptions.credentials ? '' : args.options.credentials;
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
    })
    for (const key in newParams) {
        if (newParams[key] !== '') {
            params.set(key, newParams[key]);
        }
    }
    window.history.replaceState({}, '', `${document.location.pathname}?${params}`);
}

export function getDownloadUrl(prefix: string): Args|null
{
    const params = new URLSearchParams(document.location.search);
    let url: URL|null = null;
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
    const rawCredentials: string = params.get(prefix + '.' + CREDENTIALS_SUFFIX) ?? '';
    const options: Options = {
        redirect: params.get(prefix + '.' + ALLOWREDIRECT_SUFFIX) === 'no' ? 'error' : 'follow',
        credentials: ['include', 'omit', 'same-origin'].includes(rawCredentials) ? <RequestCredentials>rawCredentials : DefaultOptions.credentials!,
    };
    return {
        url,
        options,
    };
}
