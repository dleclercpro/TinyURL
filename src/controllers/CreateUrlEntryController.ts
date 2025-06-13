import { NextFunction, Request, Response } from 'express';
import redis from '../utils/redis';
import logger from '../utils/logger';
import { createUrlEntry, getUrlEntry, REDIS_PREFIX_CODE, REDIS_PREFIX_HASH, REDIS_PREFIX_ID } from '../utils/db';



const CreateUrlEntryController = async (req: Request, res: Response, next?: NextFunction) => {    
    try {
        const now = new Date();

        // Parse query parameters
        const query = req.query;
        const queryUrl = query.url as string;

        if (!queryUrl) throw new Error('NO_URL_IN_QUERY');

        // Re-construct URL entry
        let urlEntry = await getUrlEntry(queryUrl);

        // Couldn't find a corresponding URL entry: create a new one
        if (!urlEntry) {
            logger.info(`Creating tiny URL for: ${queryUrl}`);

            urlEntry = await createUrlEntry(queryUrl);

            // Define meta data
            urlEntry.createdAt = now;
        }

        // Update meta data
        urlEntry.lastUsedAt = now;
        urlEntry.count += 1;

        // Show in console
        logger.debug(JSON.stringify(urlEntry, null, 2));



        // No need to overwrite ID and short code mappings in case they already exist
        if (urlEntry.createdAt === now) {
            await redis.set(`${REDIS_PREFIX_ID}:${urlEntry.id}`, '');
            await redis.set(`${REDIS_PREFIX_CODE}:${urlEntry.code}`, urlEntry.url);
        }

        // Store latest update to URL entry in DB
        await redis.set(`${REDIS_PREFIX_HASH}:${urlEntry.hash}`, JSON.stringify(urlEntry));

        // Send back URL entry to user
        res.json(urlEntry);

    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
        }

        res.sendStatus(500);
    }
}

export default CreateUrlEntryController;