import { NextFunction, Request, Response } from 'express';
import redis from '../utils/redis';
import logger from '../utils/logger';
import { createUrlEntry, DB, getUrlEntry, REDIS_PREFIX_CODE, REDIS_PREFIX_HASH, REDIS_PREFIX_ID } from '../utils/db';
import { TTL_IN_MS } from '../config';
import { DatabaseUrlEntry } from '../types/CommonTypes';



const FromUrlToCodeController = async (req: Request, res: Response, next?: NextFunction) => {    
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

        // Tiny URL expires 24 hours from last use
        urlEntry.expiresAt = new Date(Number(now) + TTL_IN_MS);

        // Show in console
        logger.debug(JSON.stringify(urlEntry, null, 2));



        // No need to overwrite ID and short code mappings in case they already exist
        if (urlEntry.createdAt === now) {
            await redis.set(`${REDIS_PREFIX_ID}:${urlEntry.id}`, '');
            await redis.set(`${REDIS_PREFIX_CODE}:${urlEntry.code}`, urlEntry.url);

            // Store URL entry in database
            const data: DatabaseUrlEntry = {
                url: urlEntry.url,
                id: urlEntry.id,
                code: urlEntry.code,
                count: urlEntry.count,
                isActive: urlEntry.isActive,
                createdAt: urlEntry.createdAt,
                lastUsedAt: urlEntry.lastUsedAt,
                expiresAt: urlEntry.expiresAt,
            };
            
            await DB.url.create({ data });
        }

        // Store latest update to URL entry in cache
        await redis.set(`${REDIS_PREFIX_HASH}:${urlEntry.hash}`, JSON.stringify(urlEntry));

        // Send back URL short code to user
        res.json({ code: urlEntry.code });

    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);

            if (err.message === 'NO_URL_IN_QUERY') {
                res.status(403);
            }

            res.status(400);

        } else {
            res.sendStatus(500);
        }
    }
}

export default FromUrlToCodeController;