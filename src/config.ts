// Services
export const SERVER_PROTOCOL = 'http';
export const SERVER_HOST = 'localhost';
export const SERVER_PORT = process.env.PORT || 8000;
export const SERVER_ORIGIN = `${SERVER_PROTOCOL}://${SERVER_HOST}:${SERVER_PORT}`;

export const REDIS_PROTOCOL = 'redis';
export const REDIS_HOST = 'localhost';
export const REDIS_PORT = 6379;
export const REDIS_ORIGIN = `${REDIS_PROTOCOL}://${REDIS_HOST}:${REDIS_PORT}`;



// Time
export const DAY_MS = 24 * 60 * 60 * 1_000;
export const TTL_MS = DAY_MS;



// App
export const SHORT_CODE_LENGTH = 8;