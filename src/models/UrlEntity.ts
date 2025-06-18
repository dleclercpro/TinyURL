import { TTL_MS } from "../config";

class UrlEntity {

    constructor(
        public readonly url: string,
        public readonly code: string,
        public count: number,
        public isActive: boolean,
        public readonly createdAt: Date,
        public lastUsedAt: Date,
        public expiresAt: Date,
    ) {}

    isExpired(now: Date = new Date()): boolean {
        return now.getTime() > this.expiresAt.getTime();
    }

    isUsable(): boolean {
        return this.isActive && !this.isExpired();
    }

    touch(now: Date = new Date()): void {
        this.lastUsedAt = now;
        this.expiresAt = new Date(now.getTime() + TTL_MS);
        this.count += 1;
    }
}

export default UrlEntity;