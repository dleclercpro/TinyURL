import { UrlEntry } from '../types/CommonTypes';

export const DUMMY_URL_ENTRY: UrlEntry = {
    url: 'https://www.apple.com',
    id: 'dummy',
    hash: '',
    code: '',
    count: 10,
    isActive: true,
    createdAt: new Date(0),
    lastUsedAt: new Date(0),
    expiresAt: new Date(0),
};