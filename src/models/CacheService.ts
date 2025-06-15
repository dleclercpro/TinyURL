import redis from '../utils/redis';
import { hashify } from '../utils/string';



class CacheService {
    private prefixHash = 'hash';
    private prefixCode = 'code';

    async findCodeByUrl(url: string): Promise<string | null> {
        const hash = hashify(url);
        const bucket = await redis.get(`${this.prefixHash}:${hash}`);
        if (!bucket) return null;

        const entries = bucket
            .split(',')
            .filter(e => e !== '')
            .map(e => e.split('|'));

        const found = entries.find(([u]) => u === url);

        return found?.[1] ?? null;
    }

    async findUrlByCode(code: string): Promise<string | null> {
        const url = await redis.get(`${this.prefixCode}:${code}`);

        return url ?? null;
    }

    async codeExists(code: string): Promise<boolean> {
        return Boolean(await redis.get(`${this.prefixCode}:${code}`));
    }

    async storeCodeToUrlMapping(code: string, url: string): Promise<void> {
        await redis.set(`${this.prefixCode}:${code}`, url);
    }

    async storeUrlToCodeMapping(url: string, code: string): Promise<void> {
        const hash = hashify(url);
        
        const key = `${this.prefixHash}:${hash}`;
        const current = await redis.get(key) || '';
        const updated = current === '' ? `${url}|${code}` : `${current},${url}|${code}`;
        
        await redis.set(key, updated);
    }
}

export default CacheService;