import * as uuid from 'uuid';
import { EntityManager, IsNull } from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { Tag, UUID } from '../../model';
import { InvalidIdentifierError } from '../error';
import { invalidIdentifierError } from '../../api/api-error-response';
import { appDataSource } from '../../infra/database';


/** Which search field to use when searching for the specified user. */
export enum GetTagSearchField {
	Name,
	TagId,
}

/** Additional options for the process. */
export type GetTagOptions = {
	/**
	* The entity manager managing the transaction the process will be run in.
	* If this option is specified, then the operation will be run with this manager.
	*/
	transactionalEntityManager?: EntityManager;
}

/**
 * Gets an inidividual Tag entity.
 * @param {GetTagSearchField} searchField - Which field to be used to find the tag.
 * @param {UUID | string} identifier - The identifier to search for in this field.
 * @param {GetTagOptions} [options] - Additional options for the process.
 * @returns the Tag entity or null if none is found.
 * @throws {InvalidIdentifierError} - If the provided identifier is invalid.
 */
export async function getTag(searchField: GetTagSearchField,
	identifier: UUID | string,
	options: GetTagOptions = {}): Promise<Tag | null>
{
	/** The search conditions used to get the user entity. */
	const searchConditions: FindOptionsWhere<Tag> = {
		dateDeleted: IsNull(),
	};

	// Set the search criteria based on which search field is selected.
	if (searchField === GetTagSearchField.Name) {
		if (!identifier) {
			throw new InvalidIdentifierError('The provided tag name is invalid',
				invalidIdentifierError.code, invalidIdentifierError.httpStatus);
		}

		searchConditions.name = identifier;
	}

	if (searchField === GetTagSearchField.TagId) {
		if (!uuid.validate(identifier)) {
			throw new InvalidIdentifierError('The provided tag id is invalid',
				invalidIdentifierError.code, invalidIdentifierError.httpStatus);
		}

		searchConditions.tagId = identifier;
	}

	// If we have been passed a transaction manager, use this.
	if (options.transactionalEntityManager) {
		return options.transactionalEntityManager.findOneBy(Tag, searchConditions);
	}

	return appDataSource.getRepository(Tag).findOneBy(searchConditions);
}
