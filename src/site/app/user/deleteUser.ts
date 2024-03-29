import { User, UUID, Webring } from '../../model';
import { EntityManager, IsNull } from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { UserNotFoundError } from '../error';
import { userNotFoundError } from '../../api/api-error-response';
import { getUser, GetUserSearchField } from './getUser';
import { webringService } from '..';
import { appDataSource } from '../../infra/database';


/**
 * Additional options for the process.
 */
export type DeleteUserOptions = {
	/**
	 * The effective date for the deletion.
	 * Defaults to the current date if not specified.
	 */
	deletionDate?: Date;

	/**
	 * The entity manager managing the transaction this will be run in.
	 * If this option is specified, then the operation will be run with this manager.
	 */
	transactionalEntityManager?: EntityManager;
}


/**
 * Soft-deletes a user.
 * Cascades to all the user's rings.
 * @async
 * @param {UUID} userId - The id of the user to delete.
 * @param {DeleteUserOptions} [options] - Additional options for the process.
 * @returns The deleted user.
 * @throws {InvalidIdentifierError} If the supplied id is invalid.
 * @throws {UserNotFoundError} If the specified user cannot be found.
 */
export async function deleteUser(userId: UUID,
	options: DeleteUserOptions = {}): Promise<User>
{
	const user: User | null = await getUser(GetUserSearchField.UserId, userId, {
		transactionalEntityManager: options.transactionalEntityManager || undefined
	});
	if (!user) {
		throw new UserNotFoundError(`User with id '${userId}' cannot be found`,
			userNotFoundError.code, userNotFoundError.httpStatus);
	}

	const deletionDate: Date = options.deletionDate || new Date();

	const searchConditions: FindOptionsWhere<Webring> = {
		createdBy: userId,
		dateDeleted: IsNull()
	};

	let webrings: Webring[];
	if (options.transactionalEntityManager) {
		webrings = await options.transactionalEntityManager.findBy(Webring, searchConditions);
	} else {
		webrings = await appDataSource.getRepository(Webring).findBy(searchConditions);
	}

	for (const webring of webrings) {
		await webringService.deleteWebring(webring.ringId!, {
			deletionDate,
			transactionalEntityManager: options.transactionalEntityManager
		});
	}

	user.dateDeleted = deletionDate;
	user.dateModified = new Date();

	if (options.transactionalEntityManager) {
		return options.transactionalEntityManager.save(user);
	}

	return appDataSource.getRepository(User).save(user);
}
