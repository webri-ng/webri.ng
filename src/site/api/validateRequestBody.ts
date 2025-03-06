import Ajv from 'ajv';
import { NextFunction, Request, Response, RequestHandler } from 'express';
import { RequestValidationError } from '../app/error';
import { RequestSchema } from '../model';
import { logger } from '../app';
import { loggingConfig } from '../config';
import { getRequestMetadata } from './getRequestMetadata';

/**
 * Sets up and returns the Express validation middleware.
 * Validates a request body against a specific request schema.
 * @param {Object} validationSchema The schema to validate the request against.
 * @returns The validation middleware.
 */
export function validateRequestBody(
	validationSchema: Readonly<RequestSchema>
): RequestHandler {
	const ajv = new Ajv();

	return function validate(req: Request, res: Response, next: NextFunction) {
		const requestMetadata = getRequestMetadata(req, res);

		if (req.body && loggingConfig.logIncomingRequests) {
			logger.debug('Incoming request', {
				path: req.path,
				method: req.method,
				body: req.body,
				...requestMetadata
			});
		}

		try {
			ajv.validate(validationSchema, req.body);
			if (ajv.errors) {
				return next(new RequestValidationError(ajv.errors[0].message));
			}

			return next(null);
		} catch (err) {
			logger.error('Error during request body validation', err);

			return next(err);
		}
	};
}
