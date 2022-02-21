import * as dayjs from 'dayjs';
import { getRepository } from 'typeorm';
import { Session, UUID } from '../../model';
import { SessionExpiredError, SessionNotFoundError } from '../error';

/**
 * Authenticates an individual session token.
 * Raises exceptions on failure indicating the manner of failure.
 * @param {UUID} sessionId - The id of the session to authenticate.
 * @param {Date} authenticationDate - The date to authenticate the session as of.
 * @returns The authenticated session entity.
 * @throws {SessionNotFoundError} If the provided session token does not correspond to a
 * real session.
 * @throws {SessionExpiredError} If the session is found, but it has expired.
 */
export async function authenticateSession(sessionId: Readonly<UUID>,
	authenticationDate: Readonly<Date> = new Date()): Promise<Session>
{
	const session = await getRepository(Session).findOne(sessionId);
	if (!session) {
		throw new SessionNotFoundError();
	}

	if (dayjs(authenticationDate).isAfter(session?.expiryDate)) {
		throw new SessionExpiredError();
	}

	return session;
}
