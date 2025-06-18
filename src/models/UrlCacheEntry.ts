import UrlEntity from './UrlEntity';

class UrlCacheEntry {
    
    constructor(
        public url: string,
        public code: string,
        public isActive: boolean,
        public expiresAt: Date,
    ) {}

    static fromEntity(entity: UrlEntity): UrlCacheEntry {
        return new UrlCacheEntry(entity.url, entity.code, entity.isActive, entity.expiresAt);
    }

    static fromJSON(json: string): UrlCacheEntry {
        const obj = JSON.parse(json);

        return new UrlCacheEntry(
            obj.url,
            obj.code,
            obj.isActive,
            new Date(obj.expiresAt),
        );
    }

    public toJSON(): string {
        return JSON.stringify({
            url: this.url,
            code: this.code,
            isActive: this.isActive,
            expiresAt: this.expiresAt,
        });
    }
}

export default UrlCacheEntry;