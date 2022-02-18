/**
 * @module webring/api
 * Webring API.
 */

import { Router } from 'express';
import { unhandledExceptionViewHandler } from '../renderUnhandledErrorView';
import { getNextSiteController, getPreviousSiteController,
	getRandomSiteController } from './site';

export const webringApi: Router = Router();

webringApi.get('/:webringId/next', getNextSiteController, unhandledExceptionViewHandler);
webringApi.get('/:webringId/previous', getPreviousSiteController, unhandledExceptionViewHandler);
webringApi.get('/:webringId/random', getRandomSiteController, unhandledExceptionViewHandler);