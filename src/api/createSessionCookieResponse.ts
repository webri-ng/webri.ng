import { Response } from 'express';
import { Session } from '../model';
import { globalConfig } from '../config';

/**
 * Create the session cookie response used for user login, and registration.
 * Generally the principles here should be adhered to:
 * https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
 * @param {Response} res The Express response object.
 * @param {Session} session The session to create the session cookie from.
 * @returns The response body containing the session cookie.
 */
export function createSessionCookieResponse(
	res: Response,
	session: Readonly<Session>
): Response {
	return res.cookie('session', session.sessionId, {
		expires: session.expiryDate || undefined,
		httpOnly: true,
		// The Secure attribute specifies that the cookie should only be sent over
		// HTTPS. This attribute is conditionally set based on whether the base
		// domain URL starts with 'https://'.
		// This change was because certain browsers (such as Lynx) respect this
		// flag, and won't send the cookie over HTTP if the Secure attribute is
		// set. Breaking local development.
		secure: globalConfig.baseDomainUrl.startsWith('https://'),
		maxAge: session.secondsRemaining,
		sameSite: 'lax'
	});
}
