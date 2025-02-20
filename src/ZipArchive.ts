import JSZip from 'jszip'
import { formatSize } from './Size';

export abstract class ZipEntry
{
    readonly name: string;
    readonly parent: ZipDirectory|null;
    get zipArchive(): ZipArchive
    {
        if (this instanceof ZipArchive) {
            return <ZipArchive>this;
        }
        return this.parent!.zipArchive;
    }
    get path(): string
    {
        return (this.parent?.path.replace(/\/$/, '') || '') + '/' + this.name;
    }
    constructor(name: string, parent: ZipDirectory|null)
    {
        this.name = name;
        this.parent = parent;
    }
}

export class ZipFile extends ZipEntry
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
    constructor(name: string, parent: ZipDirectory, data: Uint8Array)
    {
        super(name, parent);
        this.data = data;
    }
    download(): void
    {
        const blob = new Blob([this.data], {type: 'application/octet-stream'});
        const url = URL.createObjectURL(blob);
        try {
            const a = document.createElement('a');
            a.href = url;
            a.download = this.name;
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
}

export class ZipDirectory extends ZipEntry
{
    readonly subdirs: ZipDirectory[];
    readonly files: ZipFile[];

    constructor(name: string, parent: ZipDirectory|null)
    {
        super(name, parent);
        this.subdirs = [];
        this.files = [];
    }

    get totalSubdirs(): number
    {
        return this.subdirs.reduce(
            (accumulator: number, subdir: ZipDirectory): number => accumulator + subdir.totalSubdirs,
            this.subdirs.length
        );
    }

    get totalFiles(): number
    {
        return this.subdirs.reduce(
            (accumulator: number, subdir: ZipDirectory): number => accumulator + subdir.totalFiles,
            this.files.length
        );
    }

    get totalSize(): number
    {
        return this.subdirs.reduce(
            (accumulator: number, subdir: ZipDirectory): number => accumulator + subdir.totalSize,
            this.files.reduce(
                (accumulator: number, file: ZipFile): number => accumulator + file.data.byteLength,
                0
            )
        );
    }

    get totalSizeFormatted(): string
    {
        return formatSize(this.totalSize);
    }

    getDirectoryByPath(path: string, caseSensitive: boolean = false, createIfNotFound: boolean = false): ZipDirectory|null
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
            subdir = new ZipDirectory(name, this);
            this.subdirs.push(subdir);
        }
        return subdir.getDirectoryByPath(chunks.slice(1).join('/'), caseSensitive, createIfNotFound);
    }

    getFileByPath(path: string, caseSensitive: boolean = false): ZipFile|null
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

export class ZipArchive extends ZipDirectory
{
    readonly zipFilename: string;
    readonly compressedSize: number;
    get compressedSizeFormatted(): string
    {
        return formatSize(this.compressedSize);
    }

    constructor(zipFilename: string, compressedSize: number)
    {
        super('', null);
        this.zipFilename = zipFilename;
        this.compressedSize = compressedSize;
    }
}

const COLLATE = new Intl.Collator('en-US', {numeric: true, sensitivity: 'base'});

function sort(dir: ZipDirectory): void
{
    dir.subdirs.sort((a, b) => COLLATE.compare(a.name, b.name));
    dir.files.sort((a, b) => COLLATE.compare(a.name, b.name));
    dir.subdirs.forEach((subdir) => sort(subdir));
}

async function processZipEntry(result: ZipArchive, entry: JSZip.JSZipObject): Promise<void>
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
    const dir = <ZipDirectory>result.getDirectoryByPath(chunks.slice(0, -1).join('/'), false, true);
    dir.files.push(new ZipFile(chunks[chunks.length - 1], dir, await entry.async('uint8array')));
}

async function parseZipContents(zipFilename: string, zipCompressedSize: number, contents: JSZip): Promise<ZipArchive>
{
    const result = new ZipArchive(zipFilename, zipCompressedSize);
    for (const [_, entry] of Object.entries(contents.files)) {
        await processZipEntry(result, entry);
    }
    sort(result);
    return result;
}

export async function readArrayByffer(zipFilename: string, buffer: ArrayBuffer): Promise<ZipArchive>
{
    const jszip = new JSZip();
    const contents = await jszip.loadAsync(buffer, {createFolders: true});
    return await parseZipContents(zipFilename, buffer.byteLength, contents);
}

export async function readFile(file: File): Promise<ZipArchive>
{
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                resolve(await readArrayByffer(file.name, <ArrayBuffer>reader.result))
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
