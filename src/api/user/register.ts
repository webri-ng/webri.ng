import { NextFunction, Request, Response } from 'express';
import { Schema } from 'ajv';
import { sessionService, userService } from '../../app';
import { createSessionCookieResponse } from '../createSessionCookieResponse';
import { RequestMetadata, Session } from '../../model';

/** Register user request schema. */
export const registrationRequestSchema: Schema = {
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

export async function registerUserAndCreateNewSession(
	username: string,
	email: string,
	password: string,
	requestMetadata: RequestMetadata
): Promise<Readonly<Session>> {
	/** The newly created user entity. */
	const user = await userService.register(username, email, password, {
		requestMetadata
	});
	// Create an authentication session for the newly created user.
	const session = await sessionService.createSession(user, {
		requestMetadata
	});

	return session;
}

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

		// Create the new user, and a new login session for them.
		const session = await registerUserAndCreateNewSession(
			username,
			email,
			password,
			res.locals.requestMetadata
		);

		createSessionCookieResponse(res, session).send();
	} catch (err) {
		return next(err);
	}
}
