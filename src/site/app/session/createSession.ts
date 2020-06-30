import { EntityManager, getRepository } from 'typeorm';
import { Session, User } from '../../model';

/** Additional options for the process. */
export interface CreateSessionOptions {
	/**
	* The entity manager managing the transaction the process will be run in.
	* If this option is specified, then the operation will be run with this manager.
	*/
	transactionalEntityManager?: EntityManager;
	/** An optional arbitrary expiry date for the user session. */
	expiryDate?: Date;
}

/**
 * Creates a new session for an authenticated user.
 * @param {User} user - The user to create the new session for.
 * @returns The created, and serialised user session.
 * @throws If the provided user has not been properly serialised, and does not have a
 * valid `userId`.
 */
export async function createSession(user: User,
	options: CreateSessionOptions = {}): Promise<Session> {
	if (!user.userId) {
		throw new Error('The provided user has not been properly serialised');
	}

	const newSession = new Session(user.userId, options.expiryDate);

	// If we have been passed a transaction manager, use this to serialise the new entity.
	if (options.transactionalEntityManager) {
		return options.transactionalEntityManager.save(Session, newSession);
	}

	return getRepository(Session).save(newSession);
}
