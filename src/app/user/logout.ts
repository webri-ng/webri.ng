import { RequestMetadata, Session } from '../../model';
import { logger } from '../logger';
import { appDataSource } from '../../infra/database';

/**
 * Logs out a user.
 * Throws exceptions on logout failure which will be propagated upwards and
 * handled by the calling logout controller.
 * @param {Session} session - The user's current session.
 * @param options Additional options for the request.
 */
export async function logout(
	session: Session,
	options?: Partial<{
		requestMetadata: RequestMetadata;
	}>
): Promise<void> {
	if (!session.isActive()) {
		// In the case that the session has already expired or ended, log a warning
		// and return the session without any changes.
		// This is an invalid state, but there's no benefit to be gained from
		// propagating an exception back to the API layer.
		// This can naturally occur if a user attempts to logout without realizing
		// their session has expired.
		logger.warn('Attempting to logout with invalid session', {
			userId: session.userId,
			sessionId: session.sessionId,
			sessionEffectiveDate: session.dateCreated,
			sessionExpiryDate: session.expiryDate,
			...(options?.requestMetadata ?? {})
		});

		return;
	}

	logger.debug('Logged out user', {
		userId: session.userId,
		sessionId: session.sessionId,
		...(options?.requestMetadata ?? {})
	});

	session.dateEnded = new Date();

	await appDataSource.getRepository(Session).save(session);
}
