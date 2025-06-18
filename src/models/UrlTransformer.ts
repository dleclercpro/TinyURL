import UrlDatabaseEntry from './UrlDatabaseEntry';
import UrlCacheEntry from './UrlCacheEntry';
import UrlEntity from './UrlEntity';

class UrlTransformer {

    // DB → Domain
    static fromDatabase(entry: UrlDatabaseEntry): UrlEntity {
        return new UrlEntity(
            entry.url,
            entry.code,
            entry.count,
            entry.isActive,
            entry.createdAt,
            entry.lastUsedAt,
            entry.expiresAt
        );
    }

    // Domain → DB
    static toDatabase(entity: UrlEntity): UrlDatabaseEntry {
        return new UrlDatabaseEntry(
            entity.url,
            entity.code,
            entity.count,
            entity.isActive,
            entity.createdAt,
            entity.lastUsedAt,
            entity.expiresAt
        );
    }

    // Cache → Domain
    static fromCache(cacheEntry: UrlCacheEntry): UrlEntity {
        return new UrlEntity(
            cacheEntry.url,
            cacheEntry.code,
            0,                   // Missing: default to 0
            cacheEntry.isActive,
            new Date(),          // Missing: default to now
            new Date(),          // Missing: default to now
            cacheEntry.expiresAt,
        );
    }

    // Domain → Cache
    static toCache(entity: UrlEntity): UrlCacheEntry {
        return UrlCacheEntry.fromEntity(entity);
    }
}

export default UrlTransformer;