import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';
import UrlService from '../models/UrlService';



const FromUrlToCodeController = async (req: Request, res: Response, next?: NextFunction) => {    
    try {
        const queryUrl = req.query.url as string;
        if (!queryUrl) throw new Error('NO_URL_IN_QUERY');

        const now = new Date();

        const urlService = new UrlService();
        const code = await urlService.getOrCreateShortCode(queryUrl);

        // Log URL to code mapping
        logger.debug(`${queryUrl} -> ${code}`);

        // Return short code to user first
        res.json({ code });

        // Then, update URL entry in database
        await urlService.registerUrl(queryUrl, code, now);

    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);

            if (err.message === 'NO_URL_IN_QUERY') {
                res.sendStatus(403);
                return;
            }

            res.sendStatus(400);

        } else {
            res.sendStatus(500);
        }
    }
}

export default FromUrlToCodeController;