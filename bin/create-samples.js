import JSZip from 'jszip';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..').replaceAll(path.sep, '/').replace(/\/$/, '');

const SAMPLE_DATE = new Date(Date.UTC(2025, 0, 1, 0, 0, 0, 0));
/**
 * @param {string} relativeSourceDir 
 * @param {string} relativeTargetFile 
 *
 * @returns {Promise<void>}
 */
async function createZip(relativeSourceDir, relativeTargetFile)
{
    process.stdout.write(`Creating zip file from ${relativeSourceDir} to ${relativeTargetFile}... `);
    await new Promise((resolve, reject) => {
        try {
            const absoluteSourceDir = PROJECT_ROOT + '/' + relativeSourceDir;
            const absoluteTargetFile = PROJECT_ROOT + '/' + relativeTargetFile;
            const absoluteTargetDir = path.dirname(absoluteTargetFile);
            if (!fs.existsSync(absoluteTargetDir)) {
                fs.mkdirSync(absoluteTargetDir, { recursive: true });
            }
            const zip = new JSZip();
            addFiles(zip, absoluteSourceDir, '');
            if (fs.existsSync(absoluteTargetFile)) {
                fs.unlinkSync(absoluteTargetFile);
            }
            zip
                .generateNodeStream({type: 'nodebuffer', streamFiles: true, compression: 'DEFLATE', compressionOptions: {level: 9}})
                .pipe(fs.createWriteStream(absoluteTargetFile, {flags: 'w'}))
                .on('finish', () => {
                    resolve();
                })
                .on('error', (error) => {
                    reject(error);
                })
            ;
        } catch (error) {
            reject(error);
        }   
    });
    process.stdout.write('done\n');
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
    fs.readdirSync(absoluteDir, {withFileTypes: true}).forEach(entry => {
        if (entry.name === '.' || entry.name === '..') {
            return;
        }
        const absoluteEntry = path.join(absoluteDir, entry.name);
        const relativeEntry = relativeDir === '' ? entry.name : `${relativeDir}/${entry.name}`;
        if (entry.isDirectory()) {
            addFiles(zip, absoluteEntry, relativeEntry);
            return;
        }
        if (!entry.isFile()) {
            return;
        }
        const entryData = fs.readFileSync(absoluteEntry);
        zip.file(relativeEntry, entryData, {date: SAMPLE_DATE});
    });
}

await createZip('samples/a', 'public/sample-data/a.zip');
await createZip('samples/b', 'public/sample-data/b.zip');

