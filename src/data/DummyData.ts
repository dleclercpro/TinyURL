import UrlEntity from '../models/UrlEntity';

export const DUMMY_URL_ENTITY: UrlEntity = new UrlEntity(
    'https://www.apple.com',
    '12345678',
    0,
    true,
    new Date(0),
    new Date(0),
    new Date(0),
);