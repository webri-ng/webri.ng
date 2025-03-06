import { NextFunction, Request, Response } from 'express';
import { sessionService, userService } from '../../app';
import { RequestSchema, User } from '../../model';
import { createSessionCookieResponse } from '../createSessionCookieResponse';
import { getRequestMetadata } from '../getRequestMetadata';

/** Register user request schema. */
export const registrationRequestSchema: RequestSchema = {
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
 * User registration API controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function registerController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { username, email, password } = req.body;

		const requestMetadata = getRequestMetadata(req, res);

		/** The newly created user entity. */
		const user = await userService.register(username, email, password, {
			requestMetadata
		});
		// Create an authentication session for the newly created user.
		const session = await sessionService.createSession(user, {
			requestMetadata
		});

		createSessionCookieResponse(res, session).send();
	} catch (err) {
		return next(err);
	}
}
