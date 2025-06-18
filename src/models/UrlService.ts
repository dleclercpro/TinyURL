import { TTL_MS } from '../config';
import RepositoryService from './RepositoryService';
import CacheService from './CacheService';
import ShortCodeGenerator from './ShortCodeGenerator';
import logger from '../utils/logger';
import UrlEntity from './UrlEntity';

class UrlService {
    private repo = new RepositoryService();
    private cache = new CacheService();
    private generator = new ShortCodeGenerator();

    private async createShortCode(url: string): Promise<string> {
        logger.info(`Creating short code for: ${url}`);

        const now = new Date();
        const expiresAt = new Date(now.getTime() + TTL_MS);
        
        // Create new unique short code
        let code = '';
        do {
            code = this.generator.generate();
        } while (await this.cache.codeExists(code));
        
        // Create new URL entity
        const entity = new UrlEntity(url, code, 1, true, now, now, expiresAt);

        // Store in database only: cache will be warmed up on first read
        await this.repo.create(entity);

        return code;
    }

    async getOrCreateCode(url: string): Promise<string> {
        logger.info(`Getting short code for: ${url}`);

        let entity = await this.cache.findByUrl(url);
        
        if (!entity) {
            logger.info(`Cache is cold for URL: ${url}`);

            entity = await this.repo.findByUrl(url);

            if (!entity) {
                logger.info(`DB is cold for URL: ${url}`);

                const code = await this.createShortCode(url);
                return code;
            }

            // Warm up cache
            await this.cache.create(entity);
        }

        // Update meta data
        await this.visit(entity);

        return entity.code;
    }

    async getUrl(code: string): Promise<string> {
        logger.info(`Creating URL for: ${code}`);

        let entity = await this.cache.findByCode(code);
        
        if (!entity) {
            logger.info(`Cache is cold for code: ${code}`);

            entity = await this.repo.findByCode(code);
            
            if (!entity) throw new Error('INEXISTENT_CODE');
            if (!entity.isUsable()) throw new Error('EXPIRED_OR_INACTIVE');

            // Warm the cache
            await this.cache.create(entity);
            
        } else {
            if (!entity.isUsable()) throw new Error('EXPIRED_OR_INACTIVE');
        }

        // Update meta data
        await this.visit(entity);

        return entity.url;
    }

    async visit(entity: UrlEntity, now: Date = new Date()): Promise<void> {
        entity.touch(now);

        await this.cache.save(entity);
        await this.repo.save(entity);
    }
}

export default UrlService;