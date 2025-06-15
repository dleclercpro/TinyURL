import { NextFunction, Request, Response } from 'express';
import redis, { REDIS_PREFIX_CODE, REDIS_PREFIX_HASH } from '../utils/redis';
import logger from '../utils/logger';
import { DB } from '../utils/db';
import { SHORT_CODE_LENGTH, TTL_IN_MS } from '../config';
import { generateRandomAlphaNumericalString, hashify } from '../utils/string';



const FromUrlToCodeController = async (req: Request, res: Response, next?: NextFunction) => {    
    try {
        const now = new Date();

        // Initialize short code to return
        let code = '';

        // Parse query parameters
        const query = req.query;
        const queryUrl = query.url as string;

        if (!queryUrl) throw new Error('NO_URL_IN_QUERY');



        // Try and find URL mapping in cache
        const cacheKey = `${REDIS_PREFIX_HASH}:${hashify(queryUrl)}`;
        const cacheValue = await redis.get(cacheKey) || '';

        // Parse all URL mappings in hash bucket
        // Bucket format: URL1|Code1,URL2|Code2
        const bucketUrlMappings = cacheValue
            .split(',')
            .filter(x => x !== '')
            .map(x => x.split('|')) as [string, string][];
        
        // If URL exists in hash bucket: store its code in entry
        for (const [mappingUrl, mappingCode] of bucketUrlMappings) {
            if (queryUrl === mappingUrl) {
                code = mappingCode;
            }
        }

        // Couldn't find a corresponding URL entry: create a new one
        if (code === '') {
            logger.info(`Creating tiny URL for: ${queryUrl}`);

            // Create URL entry in database
            while (code === '') {
                code = generateRandomAlphaNumericalString(SHORT_CODE_LENGTH);

                // Ensure both URL ID and short code are unique
                const exists = Boolean(await redis.get(`${REDIS_PREFIX_CODE}:${code}`));

                if (exists) {
                    code = '';
                }
            }

            // Set 'Code -> URL' mapping in cache
            await redis.set(`${REDIS_PREFIX_CODE}:${code}`, queryUrl);

            // Add 'Hash(URL) -> Code' mapping to corresponding bucket in cache
            await redis.set(cacheKey, `${cacheValue === '' ? '' : cacheValue + ','}${queryUrl}|${code}`);
        } else {
            logger.info(`Code already exists for: ${queryUrl}`);  
        }



        // Tiny URL expires 24 hours from last use
        const expiresAt = new Date(Number(now) + TTL_IN_MS);



        // Show in console
        logger.debug(`${queryUrl} -> ${code}`);

        // Send back short code to user immediately
        res.json({ code });



        // Then, update/create URL entry in database
        await DB.url.upsert({
            where: { code },
            create: {
                url: queryUrl,
                code,
                count: 0,
                isActive: true,
                createdAt: now,
                lastUsedAt: now,
                expiresAt,
            },
            update: {
                count: { increment: 1 },
                lastUsedAt: now,
                expiresAt,
            },
        });

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