import { PrismaClient } from '@prisma/client';
import UrlEntity from './UrlEntity';
import UrlTransformer from './UrlTransformer';
import UrlDatabaseEntry from './UrlDatabaseEntry';

class RepositoryService {
    private db = new PrismaClient();

    async count(): Promise<number> {
        return await this.db.url.count();
    }

    async findByCode(code: string): Promise<UrlEntity | null> {
        const row = await this.db.url.findUnique({
            where: { code },
        });

        const dbEntry = row ? UrlDatabaseEntry.fromPrisma(row) : null;
        return dbEntry ? UrlTransformer.fromDatabase(dbEntry) : null;
    }

    async findByUrl(url: string): Promise<UrlEntity | null> {
        const row = await this.db.url.findUnique({
            where: { url },
        });

        const dbEntry = row ? UrlDatabaseEntry.fromPrisma(row) : null;
        return dbEntry ? UrlTransformer.fromDatabase(dbEntry) : null;
    }

    async save(entity: UrlEntity): Promise<void> {
        const dbEntry = UrlTransformer.toDatabase(entity);
        const row = dbEntry.toPrismaUpdateInput();

        await this.db.url.update({
            where: { code: entity.code },
            data: row,
        });
    }

    async create(entity: UrlEntity): Promise<void> {
        const dbEntry = UrlTransformer.toDatabase(entity);
        const row = dbEntry.toPrismaCreateInput();

        await this.db.url.create({ data: row });
    }

    async upsert(entity: UrlEntity) {
        const dbEntry = UrlTransformer.toDatabase(entity);

        return this.db.url.upsert({
            where: { code: entity.code },
            create: dbEntry.toPrismaCreateInput(),
            update: dbEntry.toPrismaUpdateInput(),
        });
    }
}

export default RepositoryService;