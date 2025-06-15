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

export interface DatabaseUrlEntry {
    url: string,
    id: string,
    code: string,
    count: number,
    isActive: boolean,
    createdAt: Date,
    lastUsedAt: Date,
    expiresAt: Date,
}