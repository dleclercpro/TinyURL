import { UrlRow } from '../types/CommonTypes';
import UrlEntity from './UrlEntity';

class UrlMapper {

    static toEntity(row: UrlRow): UrlEntity {
        return new UrlEntity(
            row.url,
            row.code,
            row.count,
            row.isActive,
            row.createdAt,
            row.lastUsedAt,
            row.expiresAt,
        );
    }

    static toRow(entity: UrlEntity): UrlRow {
        return {
            url: entity.url,
            code: entity.code,
            count: entity.count,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            lastUsedAt: entity.lastUsedAt,
            expiresAt: entity.expiresAt,
        };
    }
}

export default UrlMapper;