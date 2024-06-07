/**
 * Main web server module.
 * @module infra/server
 */

import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as cors from 'cors';
import * as Express from 'express';
import { NextFunction, Request, Response } from 'express';
import { Server } from 'net';

import { logger } from '../app/logger';
import { serverConfig } from '../config';
import { badRequestError } from '../api/api-error-response';


/** The main server application instance. */
export const app: Express.Application = Express();

/** The internal server instance. */
export let instance: Server;

/**
 * Express middleware to catch any errors that occur during the parsing of JSON request
 * bodies. This is placed after the bodyParser module in the middleware chain.
 * @param {Error} err Any error resulting from the parsing process.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns The express response.
 */
function bodyParserErrorHandler(err: Error | undefined,
	req: Request,
	res: Response,
	next: NextFunction): void
{
	if (err) {
		// Return a specific error in case of any errors decoding the request body.
		res.status(badRequestError.httpStatus).json({
			code: badRequestError.code,
			error: badRequestError.message
		});

		return;
	}

	return next(null);
}

app.use(bodyParser.json());
app.use(bodyParserErrorHandler);


app.use(compression());
app.use(cors({
	// tslint:disable-next-line
	origin: serverConfig.corsWhitelist || true
}));


/**
 * Initialises the server on the configured port.
 * @async
 * @returns The initialised server instance.
 */
export function initialise(): Promise<Server>
{
	return new Promise((resolve, _reject) => {
		instance = app.listen(serverConfig.port, function handleServerInit() {
			logger.info(`Server live @: http://localhost:${serverConfig.port}`);

			resolve(instance);
		});
	});
}


/**
 * Closes all connections to the server.
 * @async
 * @returns The shudown server instance.
 */
export function shutdown(): Promise<Server>
{
	return new Promise((resolve, reject) => {
		instance?.close(function handleServerShutdown(err?: Error) {
			if (err) {
				logger.error('Error closing server', err);

				return reject(err);
			}

			logger.info(`Server closed`);

			return resolve(instance);
		});
	});
}

