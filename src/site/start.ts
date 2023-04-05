/**
 * Webri.ng application startup script.
 */

import { initApplication, shutdownApplication } from '.';
import { logger } from './app';

process.once('SIGINT', async function (code) {
	logger.info('SIGINT received');
	await shutdownApplication();
});

process.once('SIGTERM', async function (code) {
	logger.info('SIGTERM received');
	await shutdownApplication();
});

initApplication();
