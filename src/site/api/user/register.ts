import { Connection } from 'typeorm';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { logger, requestValidationService, sessionService, userService } from '../../app';
import { ApiReturnableError, RequestValidationError } from '../../app/error';
import { ApiGatewayHandler } from '..';
import { RequestSchema, User } from '../../model';
import { requestValidationError, unhandledExceptionError } from '../api-error-response';
import { loggingConfig } from '../../config';
import { database } from '../../infra';
import { createSessionCookie } from '../createSessionCookie';

/** Lambda database connection instance. */
let databaseConnection: Connection | undefined;

/** Register user request schema. */
const requestSchema: RequestSchema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	type: 'object',
	properties: {
		username: {
			type: 'string'
		},
		email: {
			type: 'string'
		},
		password: {
			type: 'string'
		}
	},
	required: ['username', 'email', 'password'],
	additionalProperties: false
};

/**
 * User registration event handler.
 * @param event - The triggering AWS Lambda event.
 * @returns A response object to return to the calling API Gateway.
 */
export const registerHandler: ApiGatewayHandler = async (event): Promise<APIGatewayProxyResultV2> =>
{
	try {
		// If the `body` field does not exist on the event, raise a validation exception.
		// This will be caught by the main handler.
		if (!event.body) {
			throw new RequestValidationError();
		}

		/** The parsed event request body. */
		const parsedBody = JSON.parse(event.body);

		// Validate the request body.
		// In the case that request validation fails, an exception will be raised here.
		requestValidationService.validateRequestBody(requestSchema, parsedBody);

		// Ensure database connection is established.
		if (!databaseConnection || !databaseConnection.isConnected) {
			// Initialiase the database connection.
			logger.debug('Initialising database connection...');
			databaseConnection = await database.initialiseConnection();
		} else {
			logger.debug('Database connection already initialised');
		}

		const { username, email, password } = parsedBody;

		/** The newly created user entity. */
		const user: User | null = await userService.register(username, email, password);

		const session = await sessionService.createSession(user);

		return {
			cookies: [
				createSessionCookie(session),
			],
			statusCode: 200,
			body: JSON.stringify({}),
		};
	} catch (err) {
		console.error(err);

		if (err instanceof RequestValidationError) {
			if (loggingConfig.logRequestValidation) {
				logger.debug('Request Validation Error. Request Body: ', event.body);
			}

			return {
				statusCode: requestValidationError.httpStatus,
				body: JSON.stringify({
					code: requestValidationError.code,
					message: requestValidationError.message,
				})
			};
		}

		if (err instanceof ApiReturnableError) {
			return {
				statusCode: err.httpStatus,
				body: JSON.stringify({
					code: err.code,
					message: err.message,
				})
			};
		}

		// In case of an unhandled exception.
		return {
			statusCode: unhandledExceptionError.httpStatus,
			body: JSON.stringify({
				code: unhandledExceptionError.code,
				message: unhandledExceptionError.message,
			})
		};
	}
};
