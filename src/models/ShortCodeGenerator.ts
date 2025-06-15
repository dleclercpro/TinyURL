import { SHORT_CODE_LENGTH } from '../config';
import { generateRandomAlphaNumericalString } from '../utils/string';

class ShortCodeGenerator {

    generate(length: number = SHORT_CODE_LENGTH): string {
        return generateRandomAlphaNumericalString(length);
    }
}

export default ShortCodeGenerator;