import { Request, Response } from 'express';
import { removeSessionCookieResponse } from '../removeSessionCookieResponse';
import { userService } from '../../app';

/**
 * User logout view controller.
 * @param {Request} _req Express request body.
 * @param {Response} res Express Response.
 * @returns A response object to return to the caller.
 */
export async function logoutViewController(
	_req: Request,
	res: Response
): Promise<void> {
	// We know we have a valid session from the authenticateSessionController
	// middleware, so we can safely assert that the session variable is present
	// in the response state.
	const { session } = res.locals;

	await userService.logout(session, {
		requestMetadata: res.locals.requestMetadata
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
