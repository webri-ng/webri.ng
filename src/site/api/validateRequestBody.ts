import Ajv from 'ajv';
import { NextFunction, Request, Response, RequestHandler } from 'express';
import { RequestValidationError } from '../app/error';
import { RequestSchema } from '../model';
import { logger } from '../app';
import { loggingConfig } from '../config';
import { getRequestMetadata } from './getRequestMetadata';

type RequestBody = Record<string, unknown>;

export function maskSensitiveFieldsInRequestBody(
	body: RequestBody
): RequestBody {
	if (body.password) {
		return {
			...body,
			password: '******'
		};
	}

	return body;
}

function logRequestBody(req: Request, res: Response): void {
	const requestMetadata = getRequestMetadata(req, res);

	logger.debug('Incoming request', {
		path: req.path,
		method: req.method,
		body: maskSensitiveFieldsInRequestBody(req.body),
		...requestMetadata
	});
}

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
		if (req.body && loggingConfig.logIncomingRequests) {
			logRequestBody(req, res);
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
