import { createClient } from 'redis';
import { REDIS_ORIGIN } from '../config';
import logger from './logger';



const redis = createClient({
    url: REDIS_ORIGIN,
});



// Error handling
redis.on('error', (err: unknown) => {
    logger.error(`Redis error: ${err}`);
});



// Start database
try {
    logger.debug(`Connecting to Redis database: ${REDIS_ORIGIN}`);
    await redis.connect();

} catch (err: unknown) {
    logger.error(`Redis error: could not connect!`);
}



export default redis;