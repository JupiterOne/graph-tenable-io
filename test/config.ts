import * as dotenv from 'dotenv';
import * as path from 'path';
import { IntegrationConfig } from '../src/config';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}

export const config: IntegrationConfig = {
  accessKey: process.env.ACCESS_KEY || 'accessKey',
  secretKey: process.env.SECRET_KEY || 'secretKey',
};
