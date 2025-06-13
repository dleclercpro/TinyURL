export interface UrlEntry {
    url: string,
    id: string,
    hash: string,
    code: string,
    count: number,
    isActive: boolean,
    createdAt: Date | null,
    lastUsedAt: Date | null,
    expiresAt: Date | null,
}