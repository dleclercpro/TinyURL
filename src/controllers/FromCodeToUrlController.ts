import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';
import { DB } from '../utils/db';
import { TTL_IN_MS } from '../config';
import redis, { REDIS_PREFIX_CODE } from '../utils/redis';



const FromCodeToUrlController = async (req: Request, res: Response, next?: NextFunction) => {    
    try {
        const now = new Date();

        // Parse query parameters
        const query = req.query;
        const queryCode = query.code as string;
        const redirect = (query.redirect) === 'true';

        if (!queryCode) throw new Error('NO_CODE_IN_QUERY');


        // Check for existence of URL in store
        const url = await redis.get(`${REDIS_PREFIX_CODE}:${queryCode}`);

        // Couldn't find a corresponding URL entry: error
        if (!url) {
            logger.error(`Tiny URL doesn't exist for: ${queryCode}`);

            throw new Error('INEXISTENT_CODE');
        }



        // Show in console
        logger.debug(`${queryCode} -> ${url}`);

        // Does user want to be redirected?
        if (redirect) {
            res.redirect(url);
        } else {
            res.json({ url });
        }



        // Update URL metadata in database
        await DB.url.update({
            where: { code: queryCode },
            data: {
                count: { increment: 1 },
                lastUsedAt: now,
                expiresAt: new Date(Number(now) + TTL_IN_MS),
            },
        });

    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);

            if (err.message === 'NO_CODE_IN_QUERY') {
                res.sendStatus(403);
                return;
            }

            if (err.message === 'INEXISTENT_CODE') {
                res.sendStatus(404);
                return;
            }

            res.status(400);
            return;

        }
        
        res.sendStatus(500);
    }
}

export default FromCodeToUrlController;