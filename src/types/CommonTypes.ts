export interface UrlEntry {
    url: string,
    id: string,
    short: string,
    createdAt: Date | null,
    lastUsedAt: Date | null,
    count: number,
    isActive: boolean,
}