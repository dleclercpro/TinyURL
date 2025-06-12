import { NextFunction, Request, Response } from 'express';
import redis from '../utils/redis';
import logger from '../utils/logger';
import { UrlEntry } from '../types/CommonTypes';

const CreateUrlEntry = async (req: Request, res: Response, next?: NextFunction) => {
    try {
        const query = req.query;

        // Parse query parameters
        const url = query.url as string;

        if (!url) {
            throw new Error('NO_URL');
        }

        logger.info(`Creating short URL for: ${url}`);

        // Find a unique short code for URL
        const urlEntry: UrlEntry = {
            url,
            id: '',
            short: '',
            createdAt: null,
            lastUsedAt: null,
            count: 0,
            isActive: true,
        };
        
        while (urlEntry.short == '') {
            urlEntry.short = 'TEST';

            // Ensure short code doesn't already already exists
            if (await redis.get(urlEntry.short)) {
                urlEntry.short = '';
            }
        }

        // Store user in DB
        await redis.set(urlEntry.short, JSON.stringify(urlEntry));

        // Send back URL entry to user
        res.json(urlEntry);

    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
        }

        res.sendStatus(500);
    }
}

export default CreateUrlEntry;