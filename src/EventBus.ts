import mitt from 'mitt';
import type { ZipFile } from './ZipArchive';
import type { DiffFile } from './Differ';

type Events = {
    viewZipFile: ZipFile,
    viewDiffFile: DiffFile,
};

const EventBus = mitt<Events>();

export default EventBus;
