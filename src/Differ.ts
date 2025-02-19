import type { ZipArchive, ZipDirectory, ZipEntry, ZipFile } from "./ZipArchive";

export abstract class DiffEntry
{
    abstract get name(): string;
    abstract get left(): ZipEntry|null;
    abstract get right(): ZipEntry|null;
    abstract get parent(): DiffDirectory|null;
    abstract get notes(): string;
    abstract get isDifferent(): boolean;
    get path(): string
    {
        return (this.parent?.path.replace(/\/$/, '') || '') + '/' + this.name;
    }
    constructor()
    {
    }
}

export class DiffFile extends DiffEntry
{
    readonly name: string;
    readonly left: ZipFile|null;
    readonly right: ZipFile|null;
    readonly parent: DiffDirectory;
    readonly isDifferent: boolean;
    readonly notes: string;
    constructor(left: ZipFile|null, right: ZipFile|null, parent: DiffDirectory)
    {
        super();
        this.name = left?.name ?? right?.name ?? '?';
        this.left = left;
        this.right = right;
        this.parent = parent;
        let notes: string = '';
        if (left === null && right === null) {
            this.isDifferent = true;
            notes = 'File missing in both archives';
        } else if (left === null) {
            this.isDifferent = true;
            notes = 'File missing in left archive';
        } else if (right === null) {
            this.isDifferent = true;
            notes = 'File missing in right archive';
        } else {
            if (left.name !== right.name) {
                notes = `File name changed from "${left.name}" to "${right.name}"`;
            }
            this.isDifferent = left.size !== right.size || indexedDB.cmp(left.data, right.data) !== 0;
        }
        this.notes = notes;
    }
}

export class DiffDirectory extends DiffEntry
{
    readonly name: string;
    readonly left: ZipDirectory|null;
    readonly right: ZipDirectory|null;
    readonly parent: DiffDirectory|null;
    readonly subdirs: DiffDirectory[]
    readonly files: DiffFile[];
    readonly notes: string;
    get isDifferent(): boolean {
        if (this.left === null || this.right === null) {
            return true;
        }
        if (this.files.some((file: DiffFile): boolean => file.isDifferent)) {
            return true;
        }
        if (this.subdirs.some((subdir: DiffDirectory): boolean => subdir.isDifferent)) {
            return true;
        }
        return false;
    }

    constructor(left: ZipDirectory|null, right: ZipDirectory|null, parent: DiffDirectory|null)
    {
        super();
        this.name = left?.name ?? right?.name ?? '?';
        this.left = left;
        this.right = right;
        this.parent = parent;
        this.subdirs = [];
        this.files = [];
        let notes: string = '';
        if (left === null && right === null) {
            notes = 'Directory missing in both archives';
        } else if (left === null) {
            notes = 'Directory missing in left archive';
        } else if (right === null) {
            notes = 'Directory missing in right archive';
        } else {
            if (left.name !== right.name) {
                notes = `Directory name changed from "${left.name}" to "${right.name}"`;
            }
        }
        if (left === null || right === null) {
            const one: ZipDirectory|null = left ?? right;
            if (one !== null) {
                for (const subdir of one.subdirs) {
                    this.subdirs.push(new DiffDirectory(left ? subdir : null, left ? null : subdir, this));
                }
                for (const file of one.files) {
                    this.files.push(new DiffFile(left ? file : null, left ? null : file, this));
                }
            }
        } else {
            const rightDirs: ZipDirectory[] = [];
            left.subdirs.forEach((leftSubdir: ZipDirectory): void => {
                const rightSubdir = right.getDirectoryByPath(leftSubdir.name);
                if (rightSubdir === null) {
                    this.subdirs.push(new DiffDirectory(leftSubdir, null, this));
                    return;
                }
                rightDirs.push(rightSubdir);
                this.subdirs.push(new DiffDirectory(leftSubdir, rightSubdir, this));
            });
            right.subdirs
                .filter((rightSubdir: ZipDirectory) => !rightDirs.includes(rightSubdir))
                .forEach((rightSubdir: ZipDirectory) => this.subdirs.push(new DiffDirectory(null, rightSubdir, this)))
            ;
            const rightFiles: ZipFile[] = [];
            left.files.forEach((leftFile: ZipFile): void => {
                const rightFile = right.getFileByPath(leftFile.name);
                if (rightFile === null) {
                    this.files.push(new DiffFile(leftFile, null, this));
                    return;
                }
                rightFiles.push(rightFile);
                this.files.push(new DiffFile(leftFile, rightFile, this));
            });
            right.files
                .filter((rightFile: ZipFile) => !rightFiles.includes(rightFile))
                .forEach((rightFile: ZipFile) => this.files.push(new DiffFile(null, rightFile, this)))
            ;
        }
        this.notes = notes;
    }
}

export class DiffArchive extends DiffDirectory
{
    readonly left: ZipArchive;
    readonly right: ZipArchive;

    constructor(left: ZipArchive, right: ZipArchive)
    {
        super(left, right, null);
        this.left = left;
        this.right = right;
    }
}
