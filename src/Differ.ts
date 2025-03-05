import {FileFormat, getFileFormatsFromFilename} from './FileInfo';
import {
  InputArchive,
  type InputDirectory,
  type InputItem,
  type InputFile,
} from './InputArchive';

export enum DifferenceType {
  None = 0,
  WhitespacesOnly = 1,
  Different = 2,
}

export abstract class DiffEntry {
  abstract get name(): string;
  abstract get left(): InputItem | null;
  abstract get right(): InputItem | null;
  abstract get parent(): DiffDirectory | null;
  abstract get notes(): string;
  abstract get differenceType(): DifferenceType;
  get path(): string {
    return (this.parent?.path.replace(/\/$/, '') || '') + '/' + this.name;
  }
  constructor() {}
}

export class DiffFile extends DiffEntry {
  readonly name: string;
  readonly left: InputFile | null;
  readonly right: InputFile | null;
  readonly parent: DiffDirectory;
  readonly differenceType: DifferenceType;
  readonly notes: string;
  constructor(
    left: InputFile | null,
    right: InputFile | null,
    parent: DiffDirectory,
  ) {
    super();
    this.name = left?.name ?? right?.name ?? '?';
    this.left = left;
    this.right = right;
    this.parent = parent;
    this.notes = '';
    if (left === null && right === null) {
      this.differenceType = DifferenceType.Different;
      this.notes = 'File missing in both archives';
    } else if (left === null) {
      this.differenceType = DifferenceType.Different;
      this.notes = 'File missing in left archive';
    } else if (right === null) {
      this.differenceType = DifferenceType.Different;
      this.notes = 'File missing in right archive';
    } else {
      if (left.name !== right.name) {
        this.notes = `File name changed from "${left.name}" to "${right.name}"`;
      }
      if (
        left.size === right.size &&
        indexedDB.cmp(left.data, right.data) === 0
      ) {
        this.differenceType = DifferenceType.None;
      } else {
        this.differenceType = DifferenceType.Different;
        if (getFileFormatsFromFilename(left.name).includes(FileFormat.Text)) {
          try {
            const leftText: string = new TextDecoder().decode(left.data);
            const rightText: string = new TextDecoder().decode(right.data);
            if (
              leftText.replace(/[\s\r\n]/g, '') ===
              rightText.replace(/[\s\r\n]/g, '')
            ) {
              this.differenceType = DifferenceType.WhitespacesOnly;
              this.notes = 'Only whitespace differences';
            }
          } catch (_) {}
        }
      }
    }
  }
}

export class DiffDirectory extends DiffEntry {
  readonly name: string;
  readonly left: InputDirectory | null;
  readonly right: InputDirectory | null;
  readonly parent: DiffDirectory | null;
  readonly subdirs: DiffDirectory[];
  readonly files: DiffFile[];
  readonly notes: string;
  get differenceType(): DifferenceType {
    if (this.left === null || this.right === null) {
      return DifferenceType.Different;
    }
    let result = DifferenceType.None;
    this.files.forEach((file: DiffFile): void => {
      result = <DifferenceType>(
        Math.max(<number>result, <number>file.differenceType)
      );
    });
    if (result < DifferenceType.Different) {
      this.subdirs.forEach((subdir: DiffDirectory): void => {
        result = <DifferenceType>(
          Math.max(<number>result, <number>subdir.differenceType)
        );
      });
    }
    return result;
  }

  constructor(
    left: InputDirectory | null,
    right: InputDirectory | null,
    parent: DiffDirectory | null,
  ) {
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
      const one: InputDirectory | null = left ?? right;
      if (one !== null) {
        for (const subdir of one.subdirs) {
          this.subdirs.push(
            new DiffDirectory(left ? subdir : null, left ? null : subdir, this),
          );
        }
        for (const file of one.files) {
          this.files.push(
            new DiffFile(left ? file : null, left ? null : file, this),
          );
        }
      }
    } else {
      if (
        left instanceof InputArchive &&
        right instanceof InputArchive &&
        left.files.length === 0 &&
        right.files.length === 0 &&
        left.subdirs.length === 1 &&
        right.subdirs.length === 1
      ) {
        this.subdirs.push(
          new DiffDirectory(left.subdirs[0], right.subdirs[0], this),
        );
      } else {
        const rightDirs: InputDirectory[] = [];
        left.subdirs.forEach((leftSubdir: InputDirectory): void => {
          const rightSubdir = right.getDirectoryByPath(leftSubdir.name);
          if (rightSubdir === null) {
            this.subdirs.push(new DiffDirectory(leftSubdir, null, this));
            return;
          }
          rightDirs.push(rightSubdir);
          this.subdirs.push(new DiffDirectory(leftSubdir, rightSubdir, this));
        });
        right.subdirs
          .filter(
            (rightSubdir: InputDirectory) => !rightDirs.includes(rightSubdir),
          )
          .forEach((rightSubdir: InputDirectory) =>
            this.subdirs.push(new DiffDirectory(null, rightSubdir, this)),
          );
        const rightFiles: InputFile[] = [];
        left.files.forEach((leftFile: InputFile): void => {
          const rightFile = right.getFileByPath(leftFile.name);
          if (rightFile === null) {
            this.files.push(new DiffFile(leftFile, null, this));
            return;
          }
          rightFiles.push(rightFile);
          this.files.push(new DiffFile(leftFile, rightFile, this));
        });
        right.files
          .filter((rightFile: InputFile) => !rightFiles.includes(rightFile))
          .forEach((rightFile: InputFile) =>
            this.files.push(new DiffFile(null, rightFile, this)),
          );
      }
    }
    this.notes = notes;
  }
}

export class DiffArchive extends DiffDirectory {
  readonly left: InputArchive;
  readonly right: InputArchive;

  constructor(left: InputArchive, right: InputArchive) {
    super(left, right, null);
    this.left = left;
    this.right = right;
  }
}
