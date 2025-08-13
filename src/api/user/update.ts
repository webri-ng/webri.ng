import { NextFunction, Request, Response } from 'express';
import { Schema } from 'ajv';
import { userService } from '../../app';

/** Update user request schema. */
export const updateUserRequestSchema: Schema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	type: 'object',
	properties: {
		username: {
			type: 'string'
		},
		email: {
			type: 'string'
		}
	},
	required: ['username', 'email'],
	additionalProperties: false
};

/**
 * Update user API controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns A response object to return to the caller.
 */
export async function updateUserController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { user } = res.locals;
		const { username, email } = req.body;

		await userService.updateUser(user.userId!, username, email, {
			requestMetadata: res.locals.requestMetadata
		});

		res.end();
	} catch (err) {
		return next(err);
	}
}
