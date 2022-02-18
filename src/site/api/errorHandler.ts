/**
 * Error handling middleware for express routes.
 * This module is included in server/index.js as a middleware function
 * to catch all non-specific errors not caught by the individual api routers.
 * @module api/errorHandler
 * @type {Function}
 */

import { NextFunction, Request, Response } from 'express';
import { logger, createErrorReference } from '../app';
import { requestValidationError, unhandledExceptionError } from '../api/api-error-response';
import { loggingConfig } from '../config';
import { ApiReturnableError, RequestValidationError } from '../app/error';


/**
 * Request error handling middleware.
 * All unhandled errors in API-driven services are caught here.
 * Any request validation errors that are unhandled are caught here.
 * Application should not have any unhandled errors that do not terminate here.
 * Any unhandled application errors will send a 500 response.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export default function requestErrorHander(err: Error,
	req: Request,
	res: Response,
	next: NextFunction): Response
{
	if (err instanceof RequestValidationError) {
		if (loggingConfig.logRequestValidation) {
			// If we want to log request validation debug information.
			logger.debug(`Request validation error: ${err.message}`);
		}

		// No need to reveal API specs to frontend in case of error.
		return res.status(requestValidationError.httpStatus).json({
			code: requestValidationError.code,
			error: requestValidationError.message
		});
	}

	// If this is any other instance of an API returnable error.
	if (err instanceof ApiReturnableError) {
		return res.status(err.httpStatus).json({
			code: err.code,
			error: err.message
		});
	}

	// All other unhandled errors.
	// Log stack trace.

	/**
	 * The error 'reference' code to return to the frontend.
	 * This provides a code which can be referenced when talking with support. This makes
	 * finding an error in the logs easier.
	 */
	const errorReference: string = createErrorReference();

	logger.error(`Unhandled error '${errorReference}'`, err);

	return res.status(unhandledExceptionError.httpStatus).json({
		code: unhandledExceptionError.code,
		error: 'An unhandled server error has occurred. ' +
			'If this error persists, please contact support and quote error ' +
			`reference '${errorReference}'`,
		reference: errorReference
	});
}
