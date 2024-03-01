import { NextFunction, Request, Response } from 'express';
import { userService } from '../../app';
import { RequestSchema } from '../../model';

/** Update password request schema. */
export const updatePasswordRequestSchema: RequestSchema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	type: 'object',
	properties: {
		currentPassword: {
			type: 'string'
		},
		newPassword: {
			type: 'string'
		}
	},
	required: ['currentPassword', 'newPassword'],
	additionalProperties: false
};


/**
 * Update password API controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 * @returns A response object to return to the caller.
 */
export async function updatePasswordController(req: Request,
	res: Response,
	next: NextFunction): Promise<void> {
	try {
		const { user } = res.locals;
		const { currentPassword, newPassword } = req.body;

		await userService.updatePassword(user.userId!, currentPassword, newPassword);

		res.end();
	} catch (err) {
		return next(err);
	}
}
