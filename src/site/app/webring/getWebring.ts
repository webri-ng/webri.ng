import * as uuid from 'uuid';
import { EntityManager, IsNull } from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { UUID, Webring } from '../../model';
import { InvalidIdentifierError } from '../error';
import { invalidIdentifierError } from '../../api/api-error-response';
import { appDataSource } from '../../infra/database';


/** Which search field to use when searching for the specified webring. */
export enum GetWebringSearchField {
	RingId,
	Url
}


/** Additional options for the process. */
export type GetWebringOptions = {
	/**
	* The entity manager managing the transaction the process will be run in.
	* If this option is specified, then the operation will be run with this manager.
	*/
	transactionalEntityManager?: EntityManager;
}

/**
 * Gets an inidividual Webring entity.
 * @param {GetWebringSearchField} searchField - Which field to be used to find the webring.
 * @param {UUID | string} identifier - The identifier to search for in this field.
 * @param {GetWebringOptions} [options] - Additional options for the process.
 * @returns the User entity or null if none is found.
 * @throws {InvalidIdentifierError} - If the provided identifier is invalid.
 */
export async function getWebring(searchField: GetWebringSearchField,
	identifier: UUID | string,
	options: GetWebringOptions = {}): Promise<Webring | null>
{
	/** The search conditions used to get the entity. */
	const searchConditions: FindOptionsWhere<Webring> = {
		dateDeleted: IsNull()
	};

	// Set the search criteria based on which search field is selected.
	if (searchField === GetWebringSearchField.Url) {
		if (!identifier) {
			throw new InvalidIdentifierError('The provided url is invalid',
				invalidIdentifierError.code, invalidIdentifierError.httpStatus);
		}

		searchConditions.url = identifier;
	}

	if (searchField === GetWebringSearchField.RingId) {
		if (!uuid.validate(identifier)) {
			throw new InvalidIdentifierError('The provided webring id is invalid',
				invalidIdentifierError.code, invalidIdentifierError.httpStatus);
		}

		searchConditions.ringId = identifier;
	}

	// If we have been passed a transaction manager, use this.
	if (options.transactionalEntityManager) {
		return options.transactionalEntityManager.findOneBy(Webring, searchConditions);
	}

	return appDataSource.getRepository(Webring).findOneBy(searchConditions);
}
