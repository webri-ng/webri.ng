import { NextFunction, Request, Response } from 'express';
import { sessionService, userService } from '../../app';
import { InvalidUserCredentialsError, UserNotFoundError } from '../../app/error';
import { RequestSchema, User } from '../../model';
import { loginFailedError } from '../api-error-response';
import { createSessionCookieResponse } from '../createSessionCookieResponse';

/** User login request schema. */
export const loginRequestSchema: RequestSchema = {
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
 * @returns A response object to return to the caller.
 */
export async function loginController(req: Request,
	res: Response,
	next: NextFunction): Promise<void>
{
	try {
		const { email, password } = req.body;

		/** The authenticated user entity. */
		const user: User | null = await userService.login(email, password);

		const session = await sessionService.createSession(user);

		createSessionCookieResponse(res, session).send();
	} catch (err) {
		// In the case that the user does not exist, return a generic 'login failed' error message.
		if (err instanceof UserNotFoundError) {
			return next(new InvalidUserCredentialsError(loginFailedError.message,
				loginFailedError.code, loginFailedError.httpStatus));
		}

		return next(err);
	}
}
