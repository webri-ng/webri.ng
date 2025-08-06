import { NextFunction, Request, Response } from 'express';
import { logger, createErrorReference } from '../app';
import { NoAuthenticationError, SessionExpiredError, SessionNotFoundError,
	UserNotFoundError } from '../app/error';
import { unhandledExceptionError } from './api-error-response';
import { removeSessionCookieResponse } from './removeSessionCookieResponse';

/**
 * Renders an error view according to the error received.
 * @param {Error} err The error raised by the previous controller.
 * @param {Request} req Express request body.
 * @param {Response} res Express Response.
 * @param {NextFunction} next Express next middleware handler.
 */
export function viewErrorHandler(err: Error | undefined,
	_req: Request,
	res: Response,
	_next: NextFunction): void
{
	if (err instanceof NoAuthenticationError) {
		return res.status(401).render('error', {
			pageHeading: 'Error',
			errorMessage: 'You are not authorised to access this page!'
		});
	}

	if (err instanceof SessionNotFoundError ||
		err instanceof UserNotFoundError)
	{
		const { session } = res.locals;

		// If there is an invalid session, remove the session cookie.
		return removeSessionCookieResponse(res, session).status(401).render('error', {
			pageHeading: 'Error',
			errorMessage: 'Invalid Session!'
		});
	}

	if (err instanceof SessionExpiredError) {
		const { session } = res.locals;

		return removeSessionCookieResponse(res, session).redirect('/');
	}

	/**
	 * The error 'reference' code to return to the frontend.
	 * This provides a code which can be referenced when talking with support. This makes
	 * finding an error in the logs easier.
	 */
	const errorReference: string = createErrorReference();

	logger.error(`Unhandled error '${errorReference}'`, err);

	return res.status(unhandledExceptionError.httpStatus).render('error', {
		pageHeading: 'Something terrible has happened',
		errorMessage: 'An unhandled server error has occurred. ' +
			'If this error persists, please contact support and quote error ' +
			`reference '${errorReference}'`
	});
}
