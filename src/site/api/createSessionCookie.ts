import { InvalidSessionError } from '../app/error';
import { Session } from '../model';

/**
 * Creates a session cookie from a session.
 * @param {Session} session - The session to create the session cookie from.
 * @returns The session cookie in string form.
 */
export function createSessionCookie(session: Readonly<Session>): string
{
	// If the provided session hasn't been serialised, raise an exception.
	if (!session.sessionId) {
		throw new InvalidSessionError();
	}

	return `session=${session.sessionId}; HttpOnly; Path=/; Secure`;
}
