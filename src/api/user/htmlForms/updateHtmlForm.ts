import { NextFunction, Request, Response } from 'express';
import { userService } from '../../../app';
import { ApiReturnableError } from '../../../app/error';

/**
 * Update user controller for the front-end HTML form.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function updateUserHtmlFormController(
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

		res.render('success', {
			pageTitle: 'Update',
			contentTitle: 'Your profile has been updated successfully!',
			redirectLink: '/user'
			// The 'user' variable is already set in the view by the session
			// validation middleware.
		});
	} catch (error) {
		// In the case of expected errors, re-render the form with the error message.
		if (error instanceof ApiReturnableError) {
			return res.status(error.httpStatus).render('user/update', {
				errorMessage: error.message
			});
		}

		return next(error);
	}
}
