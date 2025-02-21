import mitt from 'mitt';
import type { InputFile } from './InputArchive';
import type { DiffFile } from './Differ';

type Events = {
    viewInputFile: InputFile,
    viewDiffFile: DiffFile,
};

const EventBus = mitt<Events>();

export default EventBus;
