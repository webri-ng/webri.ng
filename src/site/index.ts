/**
 * Main core application module.
 * Initialise application using this module.
 */

import { Server } from 'net';
import * as Express from 'express';
import * as cookieParser from 'cookie-parser';
import { database, server } from './infra';
import { logger } from './app';
import { api } from './api';
import requestErrorHander from './api/errorHandler';

server.app.set('view engine', 'pug');
server.app.set('views', './api/views');
server.app.use(cookieParser());

server.app.use(api);
// This is the main request error handling middleware.
// All API handleable exceptions are caught by this middleware, and the response sent
// to the client.
server.app.use(requestErrorHander);

// Endpoint to test that app is live.
server.app.get('/', function logController(req: Express.Request,
	res: Express.Response,
	next: Express.NextFunction): Express.Response|void
{
	res.end('webri.ng');
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
	try {
		await database.initialiseConnection();
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
	await database.closeConnection();
	await server.shutdown();
}
