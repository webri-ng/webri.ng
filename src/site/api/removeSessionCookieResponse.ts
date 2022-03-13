import { Response } from 'express';
import { Session } from '../model';

/**
 * Creates a response used to clear the session cookie.
 * @param {Response} res The Express response object.
 * @param {Session} [session] The session to clear the session cookie from.
 * @returns The response body containing the session cookie removal call.
 */
export function removeSessionCookieResponse(res: Response,
	session: Readonly<Session|undefined>): Response
{
	return res.clearCookie('session', {
		expires: session?.expiryDate || undefined,
		httpOnly: true,
		secure: true
	});
}
