import * as uuid from 'uuid';
import { EntityManager, IsNull } from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { User, UUID } from '../../model';
import { ApiReturnableError } from '../error';
import {
	invalidEmailErrorMessage,
	invalidIdentifierError,
	invalidUserIdErrorMessage,
	invalidUsernameErrorMessage,
	userNotFoundError
} from '../../api/api-error-response';
import { appDataSource } from '../../infra/database';

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
};

/**
 * Gets an individual User entity.
 * @param {GetUserSearchField} searchField - Which field to be used to find the user.
 * @param {UUID | string} identifier - The identifier to search for in this field.
 * @param {GetUserOptions} [options] - Additional options for the process.
 * @returns the User entity or null if none is found.
 * @throws {ApiReturnableError} If the provided identifier is invalid.
 */
export async function getUser(
	searchField: GetUserSearchField,
	identifier: UUID | string,
	options: GetUserOptions = {}
): Promise<User | null> {
	/** The search conditions used to get the user entity. */
	const searchConditions: FindOptionsWhere<User> = {
		dateDeleted: IsNull()
	};

	// Set the search criteria based on which search field is selected.
	if (searchField === GetUserSearchField.Email) {
		if (!identifier) {
			throw new ApiReturnableError(
				invalidEmailErrorMessage,
				invalidIdentifierError.code,
				invalidIdentifierError.httpStatus
			);
		}

		searchConditions.email = identifier;
	}

	if (searchField === GetUserSearchField.UserId) {
		if (!uuid.validate(identifier)) {
			throw new ApiReturnableError(
				invalidUserIdErrorMessage,
				invalidIdentifierError.code,
				invalidIdentifierError.httpStatus
			);
		}

		searchConditions.userId = identifier;
	}

	if (searchField === GetUserSearchField.Username) {
		if (!identifier) {
			throw new ApiReturnableError(
				invalidUsernameErrorMessage,
				invalidIdentifierError.code,
				invalidIdentifierError.httpStatus
			);
		}

		searchConditions.username = identifier;
	}

	// If we have been passed a transaction manager, use this.
	if (options.transactionalEntityManager) {
		return options.transactionalEntityManager.findOneBy(User, searchConditions);
	}

	return appDataSource.getRepository(User).findOneBy(searchConditions);
}

export async function getUserByIdOrFail(
	userId: UUID | string,
	options?: GetUserOptions
): Promise<User> {
	const user = await getUser(GetUserSearchField.UserId, userId, options);
	if (!user) {
		throw ApiReturnableError.fromApiErrorResponseDetails(userNotFoundError);
	}

	return user;
}
