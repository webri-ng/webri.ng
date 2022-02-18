import { CookieOptions } from 'express';
import { Session } from '../model';

/**
 * Create the session cookie options suitable for creating a session cookie in Express.
 * @param {Session} session The session to create the session cookie from.
 * @returns The session cookie options, usable by express.
 */
export function createSessionCookieOptions(session: Readonly<Session>): CookieOptions {
	return {
		expires: session.expiryDate || undefined,
		httpOnly: true,
		secure: true
	};
}
