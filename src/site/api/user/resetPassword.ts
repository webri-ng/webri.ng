import { NextFunction, Request, Response } from 'express';
import { logger, userService } from '../../app';
import { UserNotFoundError } from '../../app/error';
import { RequestSchema } from '../../model';

/** Reset password request schema. */
export const resetPasswordRequestSchema: RequestSchema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	type: 'object',
	properties: {
		email: {
			type: 'string'
		}
	},
	required: ['email'],
	additionalProperties: false
};


/**
 * Reset password API controller.
 * This controller returns a 200 status in the case that no matching user record is found.
 * This is designed so that user credentials cannot be sniffed out via malicious use of
 * this method.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function resetPasswordController(req: Request,
	res: Response,
	next: NextFunction): Promise<void> {

	const { email } = req.body;

	try {
		await userService.resetPassword(email);

		res.status(200).end();
	} catch (err) {
		// In the case that the user does not exist, return a 200 response.
		if (err instanceof UserNotFoundError) {
			logger.debug(`Received password reset request for nonexistent user: '${email}'`);

			// Do not leak user information.
			// Display ambiguous message on front-end.
			res.status(200).end();
			return;
		}

		return next(err);
	}
}
