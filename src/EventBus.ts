import mitt from 'mitt';
import type {InputArchive, InputFile} from './InputArchive';
import type {DiffFile} from './Differ';

type Events = {
  viewInputArchive: InputArchive;
  viewInputFile: InputFile;
  viewDiffFile: DiffFile;
};

const EventBus = mitt<Events>();

export default EventBus;
