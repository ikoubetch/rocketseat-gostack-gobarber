import express from 'express';
import path from 'path';
import * as Sentry from '@sentry/node';
import 'express-async-errors';
import routes from './routes';
import sentryConfig from './config/sentry';

import './database';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(express.json());

    const dir = path.resolve(__dirname, '..', 'tmp', 'uploads');

    this.server.use('/files', express.static(dir));
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        return res.status(500).json(err);
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    });
  }
}

export default new App().server;
