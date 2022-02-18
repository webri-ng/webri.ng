import { NextFunction, Request, Response } from 'express';
import { sessionService, userService } from '../../app';
import { RequestSchema, User } from '../../model';
import { createSessionCookieOptions } from '../createSessionCookieOptions';

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
 * @param {Request} req - Express request body.
 * @param {Response} res - Express Response.
 * @param {NextFunction} next - Express next middleware handler.
 * @returns A response object to return to the caller.
 */
 export async function registerController(req: Request,
	res: Response,
	next: NextFunction): Promise<Response|void>
{
	try {
		const { username, email, password } = req.body;

		/** The newly created user entity. */
		const user: User | null = await userService.register(username, email, password);

		const session = await sessionService.createSession(user);

		return res.cookie('session', session.sessionId, createSessionCookieOptions(session)).json();
	} catch (err) {
		return next(err);
	}
}
