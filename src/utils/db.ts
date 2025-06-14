import { UrlEntry } from '../types/CommonTypes';
import redis from './redis';
import { hashify } from './string';
import { v4 as createUUID } from 'uuid';
import { generateRandomAlphaNumericalString } from '../utils/string';
import { SHORT_CODE_LENGTH } from '../config';

export const REDIS_PREFIX_ID = 'id';
export const REDIS_PREFIX_HASH = 'hash';
export const REDIS_PREFIX_CODE = 'code';



export const generateNewUrlEntry = (url: string): UrlEntry => {
    return {
        url,
        id: '',
        hash: hashify(url),
        code: '',
        count: 0,
        isActive: true,
        createdAt: null,
        lastUsedAt: null,
        expiresAt: null,
    };
}



export const getUrlEntry = async (url: string) => {
    let urlEntry = generateNewUrlEntry(url);
    
    const key = `${REDIS_PREFIX_HASH}:${hashify(url)}`;
    const value = await redis.get(key) || '';

    // Look for all URL entries with same hash value in bucket
    const prevUrlsAndCodes = value
        .split('|')
        .filter(x => x !== '')
        .map(x => JSON.parse(x)) as UrlEntry[];
    
    // If URL is already stored under hash bucket, grab it
    prevUrlsAndCodes.forEach(prevUrlEntry => {
        if (prevUrlEntry.url === url) {
            urlEntry = prevUrlEntry;
        }
    });

    // URL entry exists
    if (urlEntry.code !== '') return urlEntry;
}



export const getUrlByCode = async (code: string) => {
    return await redis.get(`${REDIS_PREFIX_CODE}:${code}`) || '';
}



export const createUrlEntry = async (url: string) => {
    const urlEntry = generateNewUrlEntry(url);

    while (urlEntry.code === '') {
        urlEntry.id = createUUID();
        urlEntry.code = generateRandomAlphaNumericalString(SHORT_CODE_LENGTH);

        // Ensure both ID and short code don't already exist
        const idExists = Boolean(await redis.get(`${REDIS_PREFIX_ID}:${urlEntry.id}`));
        const codeExists = Boolean(await redis.get(`${REDIS_PREFIX_CODE}:${urlEntry.code}`));
        
        if (idExists || codeExists) {
            urlEntry.id = '';
            urlEntry.code = '';
        }
    }

    return urlEntry;
}