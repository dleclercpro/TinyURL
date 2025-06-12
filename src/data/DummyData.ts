import { UrlEntry } from '../types/CommonTypes';

export const DUMMY_URL_ENTRY: UrlEntry = {
    id: 'dummy',
    url: 'https://www.apple.com',
    short: '',
    createdAt: new Date(0),
    lastUsedAt: new Date(1000),
    count: 10,
    isActive: true,
};