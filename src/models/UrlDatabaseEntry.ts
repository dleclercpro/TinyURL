import { Prisma, Url as PrismaUrl } from '@prisma/client';
import { TTL_MS } from '../config';

class UrlDatabaseEntry {
    
    constructor(
        public readonly url: string,
        public readonly code: string,
        public count: number,
        public isActive: boolean,
        public readonly createdAt: Date,
        public lastUsedAt: Date,
        public expiresAt: Date,
        public readonly id?: string,
    ) {}

    isExpired(): boolean {
        return new Date().getTime() > this.expiresAt.getTime();
    }

    updateUsage(ttlMs: number = TTL_MS): void {
        this.count += 1;
        this.lastUsedAt = new Date();
        this.expiresAt = new Date(Date.now() + ttlMs);
    }

    static fromPrisma(data: PrismaUrl) {
        return new UrlDatabaseEntry(
            data.url,
            data.code,
            data.count,
            data.isActive,
            data.createdAt,
            data.lastUsedAt,
            data.expiresAt,
            data.id,
        );
    }

    toPrismaUpdateInput(ttlMs: number = TTL_MS): Prisma.UrlUpdateInput {
        return {
            count: { increment: 1 },
            lastUsedAt: this.lastUsedAt,
            expiresAt: new Date(Date.now() + ttlMs),
        };
    }

    toPrismaCreateInput(): Prisma.UrlCreateInput {
        return {
            // Do NOT set `id`, let Prisma auto-generate it
            url: this.url,
            code: this.code,
            count: this.count,
            isActive: this.isActive,
            createdAt: this.createdAt,
            lastUsedAt: this.lastUsedAt,
            expiresAt: this.expiresAt,
        };
    }
}

export default UrlDatabaseEntry;