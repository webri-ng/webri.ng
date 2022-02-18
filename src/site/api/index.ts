/**
 * API.
 * This is the root module where all individual API endpoints are exposed.
 * @module api
 */

import { Router } from 'express';
import { userApi } from './user';
import { webringApi } from './webring';

export * as requestErrorHander from './errorHandler';

/** API Router for handling admin specific requests. */
export const api = Router();

api.use('/webring', webringApi);
api.use('/user', userApi);
