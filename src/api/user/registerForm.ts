import { Schema } from 'ajv';
import { NextFunction, Request, Response } from 'express';
import { createSessionCookieResponse } from '../createSessionCookieResponse';
import { ApiReturnableError } from '../../app/error';
import { registerUserAndCreateNewSession } from './register';
import { newPasswordNotConfirmedCorrectlyError } from '../api-error-response';

export const registerHtmlFormRequestSchema: Schema = {
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
		},
		confirmPassword: {
			type: 'string'
		}
	},
	required: ['username', 'email', 'password', 'confirmPassword'],
	additionalProperties: false
};

/**
 * User registration controller for the front-end HTML form.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export async function registerFormController(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const { username, email, password, confirmPassword } = req.body;

		if (password !== confirmPassword) {
			throw ApiReturnableError.fromApiErrorResponseDetails(
				newPasswordNotConfirmedCorrectlyError
			);
		}

		// Create the new user, and a new login session for them.
		const session = await registerUserAndCreateNewSession(
			username,
			email,
			password,
			res.locals.requestMetadata
		);

		createSessionCookieResponse(res, session).render('success', {
			pageTitle: 'Register',
			contentTitle: 'Welcome to Webri.ng!',
			redirectLink: '/user'
		});
	} catch (error) {
		// In the case of expected errors, re-render the form with the error message.
		if (error instanceof ApiReturnableError) {
			return res.status(error.httpStatus).render('user/register', {
				errorMessage: error.message
			});
		}

		return next(error);
	}
}
