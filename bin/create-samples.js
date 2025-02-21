import JSZip from 'jszip';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'url';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..').replaceAll(path.sep, '/').replace(/\/$/, '');

const RESULT = {
    Created: 'created',
    Updated: 'updated',
    Unchanged: 'unchanged',
}

/**
 * @param {string} relativeSourceDir
 * @param {string} relativeTargetFile
 * @param {string} tempDir
 *
 * @returns {Promise<void>}
 */
async function createZip(relativeSourceDir, zipName, tempDir)
{
    const relativeTargetFile = 'public/sample-data/' + zipName;
    process.stdout.write(`Creating ${relativeTargetFile} from ${relativeSourceDir} ... `);
    const result = await new Promise((resolve, reject) => {
        try {
            const absoluteSourceDir = PROJECT_ROOT + '/' + relativeSourceDir;
            const absoluteTargetFile = PROJECT_ROOT + '/' + relativeTargetFile;
            const absoluteTargetDir = path.dirname(absoluteTargetFile);
            if (!fs.existsSync(absoluteTargetDir)) {
                fs.mkdirSync(absoluteTargetDir, { recursive: true });
            }
            if (!fs.existsSync(absoluteTargetFile)) {
                const docsTargetFile = PROJECT_ROOT + '/docs/sample-data/' + zipName;
                if (fs.existsSync(docsTargetFile)) {
                    fs.copyFileSync(docsTargetFile, absoluteTargetFile);
                }
            }
            const zip = new JSZip();
            addFiles(zip, absoluteSourceDir, '');
            const tempFile = path.join(tempDir, path.basename(absoluteTargetFile));
            zip
                .generateNodeStream({type: 'nodebuffer', streamFiles: true, compression: 'DEFLATE', compressionOptions: {level: 9}})
                .pipe(fs.createWriteStream(tempFile, {flags: 'w'}))
                .on('finish', () => {
                    if (fs.existsSync(absoluteTargetFile)) {
                        zipFilesAreSame(absoluteTargetFile, tempFile).then(same => {
                            if (same) {
                                fs.unlinkSync(tempFile);
                                resolve(RESULT.Unchanged);
                            } else {
                                fs.unlinkSync(absoluteTargetFile);
                                fs.renameSync(tempFile, absoluteTargetFile);
                                resolve(RESULT.Updated);
                            }
                        });
                    } else {
                        fs.renameSync(tempFile, absoluteTargetFile);
                        resolve(RESULT.Created);
                    }
                })
                .on('error', (error) => {
                    reject(error);
                })
            ;
        } catch (error) {
            reject(error);
        }
    });
    process.stdout.write(`${result}.\n`);
}

/**
 * @param {JSZip} zip
 * @param {string} absoluteDir
 * @param {string} relativeDir
 *
 * @returns {void}
 */
function addFiles(zip, absoluteDir, relativeDir)
{
    fs.readdirSync(absoluteDir).forEach(entry => {
        if (entry === '.' || entry === '..') {
            return;
        }
        const absoluteEntry = path.join(absoluteDir, entry);
        const relativeEntry = relativeDir === '' ? entry : `${relativeDir}/${entry}`;
        const stats = fs.statSync(absoluteEntry);
        if (stats.isDirectory()) {
            addFiles(zip, absoluteEntry, relativeEntry);
            return;
        }
        if (!stats.isFile()) {
            return;
        }
        const entryData = fs.readFileSync(absoluteEntry);
        zip.file(relativeEntry, entryData, {date: new Date(stats.mtime)});
    });
}

/**
 * @param {string} oldZipFile
 * @param {string} newZipFile
 *
 * @returns {boolean}
 */
async function zipFilesAreSame(oldZipFile, newZipFile)
{
    const [oldFiles, newFiles] = await Promise.all([
        loadZip(oldZipFile),
        loadZip(newZipFile),
    ]);
    const oldNames = Object.keys(oldFiles).sort();
    const newNames = Object.keys(newFiles).sort();
    if (oldNames.length !== newNames.length || !oldNames.every((name, index) => name === newNames[index])) {
        return false;
    }
    for (const name of oldNames) {
        if (!oldFiles[name].equals(newFiles[name])) {
            return false;
        }
    }
    return true;
}

/**
 * 
 * @param {string} path 
 * @returns {object}
 */
async function loadZip(path)
{
    const data = fs.readFileSync(path);
    const zip = await JSZip.loadAsync(data);
    const files = {};
    await Promise.all(
      Object.keys(zip.files).map(async (filename) => {
        const file = zip.files[filename];
        if (!file.dir) {
          const content = await file.async('nodebuffer');
          files[filename] = content;
        }
      })
    );
    return files;
  }

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zf-samples-'));
try {
    await createZip('samples/a', 'a.zip', tempDir);
    await createZip('samples/b', 'b.zip', tempDir);
} finally {
    fs.rmSync(tempDir, {recursive: true});
}

