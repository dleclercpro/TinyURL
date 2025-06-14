import express from 'express';
import { SERVER_ORIGIN, SERVER_PORT } from './config';
import logging from './middleware/LoggingMiddleware';
import logger from './utils/logger';
import FromUrlToCodeController from './controllers/FromUrlToCodeController';
import FromCodeToUrlController from './controllers/FromCodeToUrlController';

const app = express();



// Logging
app.use(logging);



// API
app.get('/code', FromUrlToCodeController);
app.get('/url', FromCodeToUrlController);



// Start app
app.listen(SERVER_PORT, () => {
  logger.info(`Server listening on ${SERVER_ORIGIN}`);
});