import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';
import UrlService from '../models/UrlService';



const FromCodeToUrlController = async (req: Request, res: Response, next?: NextFunction) => {    
    try {
        const redirect = (req.query.redirect) === 'true';

        const queryCode = req.query.code as string;
        if (!queryCode) throw new Error('NO_CODE_IN_QUERY');

        const now = new Date();

        const urlService = new UrlService();
        const url = await urlService.getUrl(queryCode);

        // Log code to URL mapping
        logger.debug(`${queryCode} -> ${url}`);

        // Redirect user first
        if (redirect) {
            return res.redirect(url);
        }
        
        // Or simply return the URL
        res.json({ url });

        // Then, update URL entry in database
        await urlService.registerUrl(url, queryCode, now);

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

            res.sendStatus(400);
            return;

        }
        
        res.sendStatus(500);
    }
}

export default FromCodeToUrlController;