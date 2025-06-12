import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

// Log requests
const logging = (req: Request, res: Response, next: NextFunction) => {
    logger.debug(`[${req.method}] ${req.url}`);

    next();
};

export default logging;