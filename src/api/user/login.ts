import { NextFunction, Request, Response } from 'express';
import { sessionService, userService } from '../../app';
import { Schema } from 'ajv';
import { ApiReturnableError } from '../../app/error';
import { loginFailedError, userNotFoundError } from '../api-error-response';
import { createSessionCookieResponse } from '../createSessionCookieResponse';

/** User login request schema. */
export const loginRequestSchema: Schema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	type: 'object',
	properties: {
		email: {
			type: 'string'
		},
		password: {
			type: 'string'
		}
	},
	required: ['email', 'password'],
	additionalProperties: false
};

/**
 * User login API controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function loginController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { email, password } = req.body;

		/** The authenticated user entity. */
		const user = await userService.login(email, password, {
			requestMetadata: res.locals.requestMetadata
		});

		const session = await sessionService.createSession(user, {
			requestMetadata: res.locals.requestMetadata
		});

		createSessionCookieResponse(res, session).send();
	} catch (err) {
		// In the case that the user does not exist, return a generic 'login failed' error message.
		if (
			err instanceof ApiReturnableError &&
			err.code === userNotFoundError.code
		) {
			return next(
				ApiReturnableError.fromApiErrorResponseDetails(loginFailedError)
			);
		}

		return next(err);
	}
}
