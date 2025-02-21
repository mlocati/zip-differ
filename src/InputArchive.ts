import JSZip from 'jszip'
import { formatSize } from './Size';

export enum Origins
{
    LocalComputer,
}

export type Origin = URL | Origins;

function download(filename: string, data: ArrayBuffer): void
{
    const blob = new Blob([data], {type: 'application/octet-stream'});
    const url = URL.createObjectURL(blob);

    try {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        try {
            a.click();
        } finally {
            document.body.removeChild(a);
        }
    } finally {
        URL.revokeObjectURL(url);
    }
}

export abstract class InputItem
{
    readonly name: string;
    readonly parent: InputDirectory|null;
    readonly tags: {[key: string]: any} = {};
    get inputArchive(): InputArchive
    {
        if (this instanceof InputArchive) {
            return <InputArchive>this;
        }
        return this.parent!.inputArchive;
    }
    get path(): string
    {
        return (this.parent?.path.replace(/\/$/, '') || '') + '/' + this.name;
    }
    constructor(name: string, parent: InputDirectory|null)
    {
        this.name = name;
        this.parent = parent;
    }
}

export class InputFile extends InputItem
{    
    readonly data: Uint8Array;
    get size(): number
    {
        return this.data.byteLength;
    }
    get sizeFormatted(): string
    {
        return formatSize(this.size);
    }
    constructor(name: string, parent: InputDirectory, data: Uint8Array)
    {
        super(name, parent);
        this.data = data;
    }
    download(): void
    {
        download(this.name, this.data);
    }
}

export class InputDirectory extends InputItem
{
    readonly subdirs: InputDirectory[];
    readonly files: InputFile[];

    constructor(name: string, parent: InputDirectory|null)
    {
        super(name, parent);
        this.subdirs = [];
        this.files = [];
    }

    get totalSubdirs(): number
    {
        return this.subdirs.reduce(
            (accumulator: number, subdir: InputDirectory): number => accumulator + subdir.totalSubdirs,
            this.subdirs.length
        );
    }

    get totalFiles(): number
    {
        return this.subdirs.reduce(
            (accumulator: number, subdir: InputDirectory): number => accumulator + subdir.totalFiles,
            this.files.length
        );
    }

    get totalSize(): number
    {
        return this.subdirs.reduce(
            (accumulator: number, subdir: InputDirectory): number => accumulator + subdir.totalSize,
            this.files.reduce(
                (accumulator: number, file: InputFile): number => accumulator + file.data.byteLength,
                0
            )
        );
    }

    get totalSizeFormatted(): string
    {
        return formatSize(this.totalSize);
    }

    getDirectoryByPath(path: string, caseSensitive: boolean = false, createIfNotFound: boolean = false): InputDirectory|null
    {
        path = path.replace(/^\/+|\/+$/, '');
        if (path === '') {
            return this;
        }
        const chunks = path.split('/');
        const name = chunks[0];
        let subdir = this.subdirs.find((d) => d.name === name);
        if (subdir === undefined && !caseSensitive) {
            const nameLC = name.toLowerCase();
            subdir = this.subdirs.find((d) => d.name.toLowerCase() === nameLC);
        }
        if (subdir === undefined) {
            if (!createIfNotFound) {
                return null;
            }
            subdir = new InputDirectory(name, this);
            this.subdirs.push(subdir);
        }
        return subdir.getDirectoryByPath(chunks.slice(1).join('/'), caseSensitive, createIfNotFound);
    }

    getFileByPath(path: string, caseSensitive: boolean = false): InputFile|null
    {
        path = path.replace(/^\/+|\/+$/, '');
        if (path === '') {
            return null;
        }
        const chunks = path.split('/');
        const name = chunks[chunks.length - 1];
        const dir = this.getDirectoryByPath(chunks.slice(0, -1).join('/'), caseSensitive, false);
        if (dir === null) {
            return null;
        }
        let file = dir.files.find((f) => f.name === name) || null;
        if (file === null && !caseSensitive) {
            const nameLC = name.toLowerCase();
            file = dir.files.find((f) => f.name.toLowerCase() === nameLC) || null;
        }
        return file;
    }
}

export class InputArchive extends InputDirectory
{
    readonly archiveFilename: string;
    readonly compressedData: ArrayBuffer;
    get compressedSize(): number {
        return this.compressedData.byteLength;
    }
    readonly origin: Origin;
    get compressedSizeFormatted(): string
    {
        return formatSize(this.compressedSize);
    }

    constructor(archiveFilename: string, compressedData: ArrayBuffer, origin: Origin)
    {
        super('', null);
        this.archiveFilename = archiveFilename;
        this.compressedData = compressedData;
        this.origin = origin;
    }

    download(): void
    {
        download(this.archiveFilename, this.compressedData);
    }
}

const COLLATE = new Intl.Collator('en-US', {numeric: true, sensitivity: 'base'});

function sort(dir: InputDirectory): void
{
    dir.subdirs.sort((a, b) => COLLATE.compare(a.name, b.name));
    dir.files.sort((a, b) => COLLATE.compare(a.name, b.name));
    dir.subdirs.forEach((subdir) => sort(subdir));
}

async function processZipEntry(entry: JSZip.JSZipObject, result: InputArchive): Promise<void>
{
    const entryPath = entry.name.replace(/^\/+|\/+$/, '');
    if (entryPath === '') {
        if (!entry.dir) {
            throw new Error('The root of the ZIP file contains a file');
        }
        return;
    }
    if (entry.dir) {
        result.getDirectoryByPath(entryPath, false, true);
        return;
    }
    const chunks = entryPath.split('/');
    const dir = <InputDirectory>result.getDirectoryByPath(chunks.slice(0, -1).join('/'), false, true);
    dir.files.push(new InputFile(chunks[chunks.length - 1], dir, await entry.async('uint8array')));
}

async function parseZipContents(archiveFilename: string, compressedData: ArrayBuffer, contents: JSZip, origin: Origin): Promise<InputArchive>
{
    const result = new InputArchive(archiveFilename, compressedData, origin);
    for (const [_, entry] of Object.entries(contents.files)) {
        await processZipEntry(entry, result);
    }
    sort(result);
    return result;
}

export async function readArrayBuffer(archiveFilename: string, buffer: ArrayBuffer, origin: Origin): Promise<InputArchive>
{
    const jszip = new JSZip();
    const contents = await jszip.loadAsync(buffer, {createFolders: true});
    return await parseZipContents(archiveFilename, buffer, contents, origin);
}

export async function readFile(file: File): Promise<InputArchive>
{
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                resolve(await readArrayBuffer(file.name, <ArrayBuffer>reader.result, Origins.LocalComputer));
            } catch (e) {
                reject(e);
            }
        }
        reader.onerror = (e) => {
            reject(e);
        };
        reader.readAsArrayBuffer(file)
    }); 
}
