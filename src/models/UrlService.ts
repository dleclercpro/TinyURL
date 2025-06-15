import { TTL_IN_MS } from '../config';
import RepositoryService from './RepositoryService';
import CacheService from './CacheService';
import ShortCodeGenerator from './ShortCodeGenerator';
import logger from '../utils/logger';

class UrlService {
    private repo = new RepositoryService();
    private cache = new CacheService();
    private generator = new ShortCodeGenerator();

    async getOrCreateShortCode(url: string): Promise<string> {
        const cached = await this.cache.findCodeByUrl(url);
        if (cached) return cached;

        // Cache is cold: create code for URL
        logger.info(`Creating tiny URL for: ${url}`);

        let code = '';
        do {
            code = this.generator.generate();
        } while (await this.cache.codeExists(code));

        await this.cache.storeCodeToUrlMapping(code, url);
        await this.cache.storeUrlToCodeMapping(url, code);

        return code;
    }

    async getUrl(code: string): Promise<string> {
        const cached = await this.cache.findUrlByCode(code);
        if (cached) return cached;

        // Cache is cold: URL was not tinyfied yet
        logger.error(`Tiny URL doesn't exist for: ${code}`);

        throw new Error('INEXISTENT_CODE');
    }

    async registerUrl(url: string, code: string, now: Date) {
        const expiresAt = new Date(now.getTime() + TTL_IN_MS);

        return this.repo.upsert(code, {
            url,
            code,
            count: 0,
            isActive: true,
            createdAt: now,
            lastUsedAt: now,
            expiresAt,
        }, {
            count: { increment: 1 },
            lastUsedAt: now,
            expiresAt,
        });
    }
}

export default UrlService;