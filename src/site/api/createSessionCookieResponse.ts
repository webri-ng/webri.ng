import { Response } from 'express';
import { Session } from '../model';

/**
 * Create the session cookie response used for user login, and registration.
 * Generally the principles here should be adhered to:
 * https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
 * @param {Response} res The Express response object.
 * @param {Session} session The session to create the session cookie from.
 * @returns The response body containing the session cookie.
 */
export function createSessionCookieResponse(res: Response,
	session: Readonly<Session>): Response
{
	return res.cookie('session', session.sessionId, {
		expires: session.expiryDate || undefined,
		httpOnly: true,
		secure: true,
		maxAge: session.secondsRemaining
	});
}
