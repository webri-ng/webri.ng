import { NextFunction, Request, Response } from 'express';
import { userService } from '../../../app';
import { ApiReturnableError } from '../../../app/error';
import { userNotFoundError } from '../../api-error-response';

/**
 * Reset password controller for the front-end HTML form.
 * This controller returns a 200 status in the case that no matching user record is found.
 * This is designed so that user credentials cannot be sniffed out via malicious use of
 * this method.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function resetPasswordHtmlFormController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	const { email } = req.body;

	try {
		await userService.resetPassword(email, {
			requestMetadata: res.locals.requestMetadata
		});

		res.render('user/htmlForms/forgotPasswordSuccess');
	} catch (error) {
		// In the case that the user does not exist, return a 200 response.
		if (
			error instanceof ApiReturnableError &&
			error.code === userNotFoundError.code
		) {
			// Do not leak user information.
			// Display ambiguous message on front-end.
			res.render('user/htmlForms/forgotPasswordSuccess');
			return;
		}

		// In the case of expected errors, re-render the form with the error message.
		if (error instanceof ApiReturnableError) {
			return res
				.status(error.httpStatus)
				.render('user/htmlForms/forgotPassword', {
					errorMessage: error.message
				});
		}

		return next(error);
	}
}
