import beautify from 'js-beautify';

export type Beautifier = (text: string) => string;

export function beautifyJavascript(code: string): string
{
    return beautify.js(code);
}

export function beautifyCSS(code: string): string
{
    return beautify.css(code);
}

export function getBeautifierFromFilename(filename: string): Beautifier|null
{
    return getBeautifierFromExtension(filename.split('.').pop() || '');
}

export function getBeautifierFromExtension(extension: string): Beautifier|null
{
    switch (extension.toLowerCase()) {
        case 'js':
        case 'mjs':
        case 'cjs':
            return beautifyJavascript;
        case 'css':
            return beautifyCSS;
        default:
            return null;
    }
}
