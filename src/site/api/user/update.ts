import { NextFunction, Request, Response } from 'express';
import { userService } from '../../app';
import { RequestSchema } from '../../model';

/** Update user request schema. */
export const updateUserRequestSchema: RequestSchema = {
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
export async function updateUserController(req: Request,
	res: Response,
	next: NextFunction): Promise<Response | void> {
	try {
		const { user } = res.locals;
		const { username, email } = req.body;

		await userService.updateUser(user.userId!, username, email);

		return res.end();
	} catch (err) {
		return next(err);
	}
}
