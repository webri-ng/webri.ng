import { Request, Response } from 'express';
import { userService } from '../../app';
import { Schema } from 'ajv';

/** Update password request schema. */
export const updatePasswordRequestSchema: Schema = {
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
 */
export async function updatePasswordController(
	req: Request,
	res: Response
): Promise<void> {
	const { user } = res.locals;
	const { currentPassword, newPassword } = req.body;

	await userService.updatePassword(user.userId!, currentPassword, newPassword, {
		requestMetadata: res.locals.requestMetadata
	});

	res.end();
}
