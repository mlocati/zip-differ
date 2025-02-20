import mitt from 'mitt';
import { ZipFile } from './ZipArchive';

type Events = {
    viewZipFile: ZipFile,
};

const EventBus = mitt<Events>();

export default EventBus;
