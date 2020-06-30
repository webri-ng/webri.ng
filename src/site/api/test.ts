import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { logger, userService } from '../app';
import { ApiReturnableError, RequestValidationError } from '../app/error';
import { ApiGatewayHandler } from '.';
import { User } from '../model';
import { requestValidationError, unhandledExceptionError } from './api-error-response';
import { loggingConfig } from '../config';
import { database } from '../infra';
import { Connection } from 'typeorm';
import { createRandomEmailAddress, createRandomUsername } from '../app/testUtils';
import { sendEmail } from '../infra/email';


let databaseConnection: Connection | undefined;

/**
 * User registration event handler.
 * @param event - The triggering AWS Lambda event.
 * @returns A response object to return to the calling API Gateway.
 */
export const testHandler: ApiGatewayHandler = async (event): Promise<APIGatewayProxyResultV2> =>
{
	try {
		console.log(databaseConnection);

		// Validate the request body.
		if (!databaseConnection || !databaseConnection.isConnected) {
			// Initialiase the database connection.
			logger.debug('Initialising database connection...');
			databaseConnection = await database.initialiseConnection();
		} else {
			logger.debug('Database connection already initialised');
		}

		/** The newly created user entity. */
		const user: User = await userService.register(createRandomUsername(),
			createRandomEmailAddress(), 'password');

		console.log(user);

		await sendEmail('anthony.richardson@pm.me', 'Hello from webring', 'Hello from webring!!!!');

		return {
			statusCode: 200,
			body: JSON.stringify({})
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
