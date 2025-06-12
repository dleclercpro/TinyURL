import { fileURLToPath } from 'url';
import path from 'path';

const getFileName = () => {
    return fileURLToPath(import.meta.url);
}

const getDirName = () => {
    return path.dirname(getFileName());
}

export { getFileName, getDirName };