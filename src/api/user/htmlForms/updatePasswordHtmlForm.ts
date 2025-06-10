import { NextFunction, Request, Response } from 'express';
import { ApiReturnableError } from '../../../app/error';
import { userService } from '../../../app';
import { newPasswordNotConfirmedCorrectlyError } from '../../api-error-response';
import { Schema } from 'ajv';

/** Update password request schema. */
export const updatePasswordHtmlFormRequestSchema: Schema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	type: 'object',
	properties: {
		currentPassword: {
			type: 'string'
		},
		newPassword: {
			type: 'string'
		},
		confirmPassword: {
			type: 'string'
		}
	},
	required: ['currentPassword', 'newPassword', 'confirmPassword'],
	additionalProperties: false
};

/**
 * User update password controller for the front-end HTML form.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function updatePasswordHtmlFormController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { currentPassword, newPassword, confirmPassword } = req.body;

		if (newPassword !== confirmPassword) {
			throw ApiReturnableError.fromApiErrorResponseDetails(
				newPasswordNotConfirmedCorrectlyError
			);
		}

		/** The authenticated user entity. */
		const { user } = res.locals;

		await userService.updatePassword(
			user.userId!,
			currentPassword,
			newPassword,
			{
				requestMetadata: res.locals.requestMetadata
			}
		);

		res.render('success', {
			pageTitle: 'Update Password',
			contentTitle: 'Password Update Successful!',
			redirectLink: '/user'
			// The 'user' variable is already set in the view by the session
			// validation middleware.
		});
	} catch (error) {
		// In the case of expected errors, re-render the form with the error message.
		if (error instanceof ApiReturnableError) {
			return res.status(error.httpStatus).render('user/updatePassword', {
				errorMessage: error.message
			});
		}

		return next(error);
	}
}
