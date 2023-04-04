import * as uuid from 'uuid';
import * as dayjs from 'dayjs';
import { getRepository, IsNull } from 'typeorm';
import { Session, UUID } from '../../model';
import { InvalidSessionError, SessionExpiredError, SessionNotFoundError } from '../error';


/**
 * Authenticates an individual session token.
 * Raises exceptions on failure indicating the manner of failure.
 * @param {UUID} sessionId - The id of the session to authenticate.
 * @param {Date} authenticationDate - The date to authenticate the session as of.
 * @returns The authenticated session entity.
 * @throws {SessionNotFoundError} If the provided session token does not correspond to a
 * real session.
 * @throws {SessionExpiredError} If the session is found, but it has expired.
 * @throws {invalidSessionError} If the session is found, but has been invalidated.
 */
export async function authenticateSession(sessionId: UUID,
	authenticationDate: Date = new Date()): Promise<Session>
{
	if (!uuid.validate(sessionId)) {
		throw new SessionNotFoundError();
	}

	const session = await getRepository(Session).findOne({
		where: {
			sessionId,
			dateDeleted: IsNull()
		}
	});
	if (!session) {
		throw new SessionNotFoundError();
	}

	// If this session has previous been invalidated.
	if (session.isInvalidated(authenticationDate)) {
		throw new InvalidSessionError();
	}

	if (!session.isActive(authenticationDate)) {
		throw new SessionExpiredError();
	}

	return session;
}
