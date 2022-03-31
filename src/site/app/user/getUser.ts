import * as uuid from 'uuid';
import { EntityManager, FindConditions, getRepository, IsNull } from 'typeorm';
import { User, UUID } from '../../model';
import { InvalidIdentifierError } from '../error';
import { invalidIdentifierError } from '../../api/api-error-response';


/** Which search field to use when searching for the specified user. */
export enum GetUserSearchField {
	Email,
	UserId,
	Username
}

/** Additional options for the process. */
export type GetUserOptions = {
	/**
	* The entity manager managing the transaction the process will be run in.
	* If this option is specified, then the operation will be run with this manager.
	*/
	transactionalEntityManager?: EntityManager;
}

/**
 * Gets an inidividual User entity.
 * @param {GetUserSearchField} searchField - Which field to be used to find the user.
 * @param {UUID | string} identifier - The identifier to search for in this field.
 * @param {GetUserOptions} [options] - Additional options for the process.
 * @returns the User entity or null if none is found.
 * @throws {InvalidIdentifierError} - If the provided identifier is invalid.
 */
export async function getUser(searchField: Readonly<GetUserSearchField>,
	identifier: Readonly<UUID | string>,
	options: GetUserOptions = {}): Promise<User | null>
{
	/** The search conditions used to get the user entity. */
	const searchConditions: FindConditions<User> = {
		dateDeleted: IsNull()
	};

	// Set the search criteria based on which search field is selected.
	if (searchField === GetUserSearchField.Email) {
		if (!identifier) {
			throw new InvalidIdentifierError('The provided email is invalid',
				invalidIdentifierError.code, invalidIdentifierError.httpStatus);
		}

		searchConditions.email = identifier;
	}

	if (searchField === GetUserSearchField.UserId) {
		if (!uuid.validate(identifier)) {
			throw new InvalidIdentifierError('The provided user id is invalid',
				invalidIdentifierError.code, invalidIdentifierError.httpStatus);
		}

		searchConditions.userId = identifier;
	}

	if (searchField === GetUserSearchField.Username) {
		if (!identifier) {
			throw new InvalidIdentifierError('The provided username is invalid',
				invalidIdentifierError.code, invalidIdentifierError.httpStatus);
		}

		searchConditions.username = identifier;
	}

	let user: User | undefined;
	// If we have been passed a transaction manager, use this.
	if (options.transactionalEntityManager) {
		user = await options.transactionalEntityManager.findOne(User, searchConditions);
	} else {
		user = await getRepository(User).findOne(searchConditions);
	}

	if (!user) {
		return null;
	}

	return user;
}
