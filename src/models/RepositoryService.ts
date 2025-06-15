import { PrismaClient } from '@prisma/client';
import UrlEntity from './UrlEntity';
import UrlMapper from './UrlMapper';

class RepositoryService {
    private db = new PrismaClient();

    async findByCode(code: string): Promise<UrlEntity | null> {
        const row = await this.db.url.findUnique({
            where: { code },
        });
        
        return row ? UrlMapper.toEntity(row) : null;
    }

    async findByUrl(url: string): Promise<UrlEntity | null> {
        const row = await this.db.url.findUnique({
            where: { url },
        });
        
        return row ? UrlMapper.toEntity(row) : null;
    }

    async save(entity: UrlEntity): Promise<void> {
        const row = UrlMapper.toRow(entity);

        await this.db.url.update({
            where: { code: entity.code },
            data: row,
        });
    }

    async create(entity: UrlEntity): Promise<void> {
        const row = UrlMapper.toRow(entity);
        
        await this.db.url.create({ data: row });
    }

    async upsert(entity: UrlEntity) {
        const row = UrlMapper.toRow(entity);

        return this.db.url.upsert({
            where: { code: row.code },
            create: row,
            update: {
                count: { increment: 1 },
                lastUsedAt: row.lastUsedAt,
                expiresAt: row.expiresAt,
            },
        });
    }

    async count(): Promise<number> {
        return await this.db.url.count();
    }
}

export default RepositoryService;