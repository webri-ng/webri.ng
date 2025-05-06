import { NextFunction, Request, Response } from 'express';
import { ApiReturnableError } from '../../app/error';
import { loginFailedError, userNotFoundError } from '../api-error-response';
import { createSessionCookieResponse } from '../createSessionCookieResponse';
import { sessionService, userService } from '../../app';

/**
 * User login controller for the front-end HTML form.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function loginFormController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { email, password } = req.body;

		/** The authenticated user entity. */
		const user = await userService.login(email, password, {
			requestMetadata: res.locals.requestMetadata
		});

		const session = await sessionService.createSession(user, {
			requestMetadata: res.locals.requestMetadata
		});

		// Set the user variable in the response state, so that the rendering of
		// the success page includes the correct navigation links.
		res.locals.user = user;

		createSessionCookieResponse(res, session).render('success', {
			pageTitle: 'Login',
			contentTitle: 'Login Successful!',
			redirectLink: '/user'
		});
	} catch (error) {
		// If the specified user doesn't exist, return a generic 'login failed' error.
		if (
			error instanceof ApiReturnableError &&
			error.code === userNotFoundError.code
		) {
			return res.status(loginFailedError.httpStatus).render('user/login', {
				errorMessage: loginFailedError.message
			});
		}

		// In the case of expected errors, re-render the form with the error message.
		if (error instanceof ApiReturnableError) {
			return res.status(error.httpStatus).render('user/login', {
				errorMessage: error.message
			});
		}

		return next(error);
	}
}
