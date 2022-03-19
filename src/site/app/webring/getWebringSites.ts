import { EntityManager, FindManyOptions, getRepository, IsNull } from 'typeorm';
import { invalidIdentifierError } from '../../api/api-error-response';
import { Site, UUID } from '../../model';
import { InvalidIdentifierError } from '../error';


/** Additional options for the process. */
export type GetSitesOptions = {
	/**
	* The entity manager managing the transaction the process will be run in.
	* If this option is specified, then the operation will be run with this manager.
	*/
	transactionalEntityManager?: EntityManager;
}


/**
 * Gets all the sites associated with a particular webring.
 * Returns the sites in the order they were added.
 * @param {UUID} webringId - The id of the webring to get the sites of.
 * @param {GetSitesOptions} options - Additional options for the process.
 * @returns The array of sites attached to the specified webring.
 */
export async function getWebringSites(webringId: Readonly<UUID>,
	options: Readonly<GetSitesOptions> = {}): Promise<Site[]>
{
	if(!webringId) {
		throw new InvalidIdentifierError('The provided webring id is invalid',
			invalidIdentifierError.code, invalidIdentifierError.httpStatus);
	}

	const searchConditions: FindManyOptions = {
		where: {
			parentWebringId: webringId,
			dateDeleted: IsNull()
		},
		order: {
			dateCreated: 'ASC'
		}
	};

	if (options.transactionalEntityManager) {
		return options.transactionalEntityManager.find(Site, searchConditions);
	}

	return getRepository(Site).find(searchConditions);
}
