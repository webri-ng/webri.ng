import { Request, Response } from 'express';
import { removeSessionCookieResponse } from '../removeSessionCookieResponse';
import { logger } from '../../app';

/**
 * User logout view controller.
 * @param {Request} _req Express request body.
 * @param {Response} res Express Response.
 * @returns A response object to return to the caller.
 */
export function logoutViewController(_req: Request, res: Response): void {
	const { session } = res.locals;

	logger.debug('Logging out user', {
		userId: session.userId,
		sessionId: session.sessionId,
		...(res.locals.requestMetadata ?? {})
	});

	// Clear the user variable from the response state, so that when the success
	// page is rendered, it doesn't show any logged-in menu items.
	res.locals.user = undefined;

	return removeSessionCookieResponse(res, session).render('success', {
		pageTitle: 'Logout',
		contentTitle: 'You have successfully logged out',
		redirectLink: '/'
	});
}
