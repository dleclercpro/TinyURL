import { NextFunction, Request, Response } from 'express';
import redis from '../utils/redis';
import logger from '../utils/logger';
import { getUrlByCode, getUrlEntry, REDIS_PREFIX_HASH } from '../utils/db';
import { UrlEntry } from '../types/CommonTypes';
import { TTL_IN_MS } from '../config';



const GetUrlController = async (req: Request, res: Response, next?: NextFunction) => {    
    try {
        const now = new Date();

        // Parse query parameters
        const query = req.query;
        const queryCode = query.code as string;
        const redirect = (query.redirect) === 'true';

        if (!queryCode) throw new Error('NO_CODE_IN_QUERY');


        // Check for existence of URL in store
        const url = await getUrlByCode(queryCode);

        // Couldn't find a corresponding URL entry: error
        if (!url) {
            logger.error(`Tiny URL doesn't exist for: ${queryCode}`);

            throw new Error('INEXISTENT_CODE');
        }

        // Re-construct URL entry
        const urlEntry = await getUrlEntry(url) as UrlEntry;

        // Update meta data
        urlEntry.lastUsedAt = now;
        urlEntry.count += 1;

        // Tiny URL expires 24 hours from last use
        urlEntry.expiresAt = new Date(Number(now) + TTL_IN_MS);


        
        // Show in console
        logger.debug(JSON.stringify(urlEntry, null, 2));

        // Store latest update to URL entry in DB
        await redis.set(`${REDIS_PREFIX_HASH}:${urlEntry.hash}`, JSON.stringify(urlEntry));



        // Does user want to be redirected?
        if (redirect) {
            res.redirect(urlEntry.url);
            return;
        }
        
        // Send back URL to user
        res.json({ url });

    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);

            if (err.message === 'NO_CODE_IN_QUERY') {
                res.sendStatus(403);
            }

            if (err.message === 'INEXISTENT_CODE') {
                res.sendStatus(404);
            }

            res.status(400);

        } else {
            res.sendStatus(500);
        }
    }
}

export default GetUrlController;