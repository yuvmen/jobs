import * as express from 'express';
import { getPackageTree } from './package';

/**
 * Bootstrap the application framework
 */
export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/package/:name/:version', getPackageTree);

  return app;
}
