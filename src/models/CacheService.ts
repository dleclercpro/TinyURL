import redis from '../utils/redis';
import { hashify } from '../utils/string';
import UrlCacheEntry from './UrlCacheEntry';
import UrlEntity from './UrlEntity';
import UrlTransformer from './UrlTransformer';



class CacheService {
    private prefixHash = 'hash';
    private prefixCode = 'code';

    private async findUrlByCode(code: string): Promise<string | null> {
        const url = await redis.get(`${this.prefixCode}:${code}`);

        return url ?? null;
    }

    private async findEntryByUrl(url: string): Promise<UrlCacheEntry | null> {
        const hash = hashify(url);
        const bucket = await redis.get(`${this.prefixHash}:${hash}`);
        if (!bucket) return null;

        const cacheEntries = bucket
            .split('|')
            .filter(e => e !== '')
            .map(e => UrlCacheEntry.fromJSON(e));

        const cacheEntry = cacheEntries.find(e => e.url === url);
        return cacheEntry ?? null;
    }

    async findByCode(code: string): Promise<UrlEntity | null> {
        const cachedUrl = await this.findUrlByCode(code);
        if (!cachedUrl) return null;

        let entity = await this.findByUrl(cachedUrl);
        if (!entity) return null;

        return entity;
    }

    async findByUrl(url: string): Promise<UrlEntity | null> {
        const cachedEntry = await this.findEntryByUrl(url);
        if (!cachedEntry) return null;

        // Warning: incomplete URL entry with default fields returned!
        const entity = UrlTransformer.fromCache(cachedEntry);
        return entity;
    }

    async codeExists(code: string): Promise<boolean> {
        return Boolean(await redis.get(`${this.prefixCode}:${code}`));
    }



    async save(entity: UrlEntity): Promise<void> {
        const cacheEntry = UrlTransformer.toCache(entity);

        // [URL -> Entry]
        await this.storeUrlToEntryMapping(cacheEntry);

        // No need to update [Code -> URL] since it never changes
    }

    async create(entity: UrlEntity): Promise<void> {
        const cacheEntry = UrlTransformer.toCache(entity);

        // [URL -> Entry]
        await this.storeUrlToEntryMapping(cacheEntry);
        
        // [Code -> URL]
        await this.storeCodeToUrlMapping(entity.code, entity.url);
    }



    private async storeCodeToUrlMapping(code: string, url: string): Promise<void> {
        await redis.set(`${this.prefixCode}:${code}`, url);
    }

    private async storeUrlToEntryMapping(cacheEntry: UrlCacheEntry): Promise<void> {
        const hash = hashify(cacheEntry.url);

        const key = `${this.prefixHash}:${hash}`;
        const bucket = await redis.get(key) || '';

        const cacheEntries = bucket
            .split('|')
            .filter(e => e !== '')
            .map(e => UrlCacheEntry.fromJSON(e));

        // Empty? Add new entry.
        // Otherwise, replace old with new one in case it exists.
        const updatedCacheEntries = cacheEntries.length === 0 ? [
            cacheEntry
        ] : cacheEntries.map(e => {
            return e.url === cacheEntry.url ? cacheEntry : e;
        });

        const updatedBucket = updatedCacheEntries
            .map(e => e.toJSON())
            .join('|');
        
        await redis.set(key, updatedBucket);
    }
}

export default CacheService;