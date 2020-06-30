import Ajv from 'ajv';
import { RequestValidationError } from '../error';
import { RequestSchema } from '../../model';

/**
 * Validates a request body against a specific request schema.
 * Does not return a response, raises an exception on validation error.
 * @param {Object} validationSchema - The schema to validate the request against.
 * @param {Object} requestBody - The request body to validate.
 * @throws {RequestValidationError} If the provided request body is not valid. The error
 * message contains the validation error.
 */
export function validateRequestBody(validationSchema: RequestSchema,
	requestBody: Record<string, unknown>): void
{
	const ajv = new Ajv();
	ajv.validate(validationSchema, requestBody);
	if (ajv.errors) {
		throw new RequestValidationError(ajv.errors[0].message);
	}
}
