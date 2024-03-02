/**
 * Main core application module.
 * Initialise application using this module.
 */

import { Server } from 'net';
import * as Express from 'express';
import * as cookieParser from 'cookie-parser';
import { database, server } from './infra';
import { logger } from './app';
import { apiRouter, viewRouter } from './api';
import { applicationEnvironment } from './config';

server.app.set('view engine', 'pug');
server.app.set('views', './api/view');
server.app.use('/static', Express.static('static'));
server.app.use(cookieParser());

server.app.use(viewRouter);
server.app.use(apiRouter);

// All requests not explicitly handled by the above routers are handled
// by the 404 controller.
server.app.use((req, res, next) => {
	res.status(404).render('404');
});


// Export for chai-http.
export const app: Express.Application = server.app;

/**
 * Initialises the core server application.
 * Opens the database connection and sets the server up to listen on its configured port.
 * Sets up the main application routers.
 * @async
 * @returns The initialised server instance.
 */
export async function initApplication(): Promise<Server>
{
	logger.info(`\x1b[33mApplication environment: '${applicationEnvironment}'\x1b[0m`);

	try {
		await database.initialiseAppDataSource();
	} catch (err) {
		logger.error('Unable to establish database connection', err);
		logger.warn('If this error is occurring on a first-run, have you remembered to ' +
			'initialise the seed data and application user?');

		process.exit(1);
	}

	try {
		return server.initialise();
	} catch (err) {
		logger.error('Error initialising server', err);

		process.exit(1);
	}
}


/**
 * Closes all connections to the server and shuts down the application.
 * Required for testing purposes.
 * @async
 * @returns The shudown server instance.
 */
export async function shutdownApplication()
{
	await database.destroyAppDataSource();
	await server.shutdown();
}
