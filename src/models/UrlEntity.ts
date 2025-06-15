class UrlEntity {
  constructor(
        readonly url: string,
        readonly code: string,
        readonly count: number,
        readonly isActive: boolean,
        readonly createdAt: Date,
        readonly lastUsedAt: Date,
        readonly expiresAt: Date,
    ) {}

    hasExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    isUsable(): boolean {
        return this.isActive && !this.hasExpired();
    }

    incrementUse(): UrlEntity {
        return new UrlEntity(
            this.url,
            this.code,
            this.count + 1,
            this.isActive,
            this.createdAt,
            new Date(),
            new Date(Date.now() + 24 * 60 * 60 * 1_000)
        );
    }
}

export default UrlEntity;