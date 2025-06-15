import { createClient } from 'redis';
import { REDIS_HOST, REDIS_PORT, REDIS_PROTOCOL } from '../config';
import logger from './logger';



const redis = createClient({
    url: `${REDIS_PROTOCOL}://${REDIS_HOST}:${REDIS_PORT}`,
});



// Error handling
redis.on('error', (err: unknown) => {
    logger.error(`Redis error: ${err}`);
});



// Start database
try {
    await redis.connect();
} catch (err: unknown) {
    logger.error(`Redis error: could not connect!`);
}



export default redis;