import express from 'express';
import { SERVER_ORIGIN, SERVER_PORT } from './config';
import logging from './middleware/LoggingMiddleware';
import logger from './utils/logger';
import FromUrlToCodeController from './controllers/FromUrlToCodeController';
import FromCodeToUrlController from './controllers/FromCodeToUrlController';
import { DB } from './utils/db';

const app = express();



// Logging
app.use(logging);



// API
app.get('/code', FromUrlToCodeController);
app.get('/url', FromCodeToUrlController);



// Start app
app.listen(SERVER_PORT, async () => {
  logger.info(`Server listening on ${SERVER_ORIGIN}`);



  // Show URLs
  const urls = await DB.url.findMany();

  logger.info(`# URLs: ${urls.length}`);
});