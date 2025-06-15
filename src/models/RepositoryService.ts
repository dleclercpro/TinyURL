import { PrismaClient } from '@prisma/client';

class RepositoryService {
    private db = new PrismaClient();

    async upsert(code: string, create: any, update: any) {
        return this.db.url.upsert({
            where: { code },
            create,
            update,
        });
    }

    async count(): Promise<number> {
        return await this.db.url.count();
    }
}

export default RepositoryService;