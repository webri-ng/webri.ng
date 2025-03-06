import { EntityManager } from 'typeorm';
import { appDataSource } from '../../infra/database';
import { RequestMetadata, Session, User } from '../../model';
import { logger } from '../logger';

/**
 * Wrapper function for serialising the new session.
 * This function just saves a few lines of code in the `createSession` function.
 */
async function createNewSession(
	unsavedSession: Session,
	transactionalEntityManager?: EntityManager
): Promise<Session> {
	// If we have been passed a transaction manager, use this to serialise the new entity.
	if (transactionalEntityManager) {
		return transactionalEntityManager.save(Session, unsavedSession);
	}

	return appDataSource.getRepository(Session).save(unsavedSession);
}

/**
 * Creates a new session for an authenticated user.
 * @param {User} user - The user to create the new session for.
 * @param options Additional options for the request.
 * @returns The created, and serialised user session.
 * @throws If the provided user has not been properly serialised, and does not have a
 * valid `userId`.
 */
export async function createSession(
	user: User,
	options?: Partial<{
		/**
		 * The entity manager managing the transaction the process will be run in.
		 * If this option is specified, then the operation will be run with this manager.
		 */
		transactionalEntityManager: EntityManager;
		/** An optional arbitrary expiry date for the user session. */
		expiryDate: Date;
		requestMetadata: RequestMetadata;
	}>
): Promise<Session> {
	if (!user.userId) {
		throw new Error('The provided user has not been properly serialised');
	}

	const session = await createNewSession(
		new Session(user.userId, options?.expiryDate),
		options?.transactionalEntityManager
	);

	logger.debug('Created new user session', {
		sessionId: session.sessionId,
		userId: user.userId,
		email: user.email,
		...(options?.requestMetadata ?? {})
	});

	return session;
}
